import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { requireAccount } from '@/lib/auth/server';
import { requireAdminUser } from '@/lib/admin/server';
import { audit, caseAccess, transaction, type Actor } from '@/lib/diagnostics/server';
import { beginUpload, driveFetch } from '@/lib/diagnostics/storage';
import { DiagnosticError, id, integer, matchesMagic, object, validateFile } from '@/lib/diagnostics/domain';
import { body, failure, input, json, privateHeaders } from '@/lib/diagnostics/http';
import { rateLimit } from '@/lib/learning/server';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
async function actorFor(request: Request): Promise<Actor> {
    if (new URL(request.url).searchParams.get('admin') === '1') {
        const u = await requireAdminUser(request, ['admin']);
        return { userId: u.userId, role: 'admin' };
    }
    const u = await requireAccount(request);
    return { userId: u.id, role: 'account' };
}
export async function POST(request: Request) {
    try {
        const actor = await actorFor(request);
        await rateLimit(actor.userId + ':diagnostic-upload-init', 15, 3600);
        const v = object(await input(request)), file = validateFile(v), caseId = id(v.caseId);
        return json(await transaction(async (db) => {
            const c = await caseAccess(actor, caseId, db);
            if (['completed', 'withdrawn'].includes(c.status))
                throw new DiagnosticError('This case is closed to new uploads.', 409);
            const [total] = await db.query<RowDataPacket[]>(`SELECT COUNT(*) count,COALESCE(SUM(size_bytes),0) bytes FROM diagnostic_attachments WHERE case_id=? AND status<>'deleted'`, [caseId]);
            if (total[0].count >= 20 || Number(total[0].bytes) + file.size > 200 * 1024 * 1024)
                throw new DiagnosticError('Case upload limit reached. Contact the foundation.', 409);
            const fid = randomUUID(), session = await beginUpload(fid, file.mime, file.size);
            await db.query(`INSERT INTO diagnostic_attachments(id,case_id,uploaded_by,name,mime,size_bytes,provider_session) VALUES(?,?,?,?,?,?,?)`, [fid, caseId, actor.userId, file.name, file.mime, file.size, session]);
            await audit(db, actor, 'attachment.started', caseId, { fileId: fid, size: file.size, mime: file.mime });
            return { id: fid, chunkSize: 2 * 1024 * 1024 };
        }));
    }
    catch (e) {
        return failure(e);
    }
}
export async function PUT(request: Request) {
    try {
        const actor = await actorFor(request);
        await rateLimit(actor.userId + ':diagnostic-upload-chunk', 150);
        const url = new URL(request.url), fid = id(url.searchParams.get('id')), offset = integer(Number(url.searchParams.get('offset')), 'upload position', 30 * 1024 * 1024);
        const bytes = await body(request, 2 * 1024 * 1024);
        if (!bytes.length)
            throw new DiagnosticError('Empty upload chunk.');
        return json(await transaction(async (db) => {
            const [files] = await db.query<RowDataPacket[]>(`SELECT * FROM diagnostic_attachments WHERE id=? FOR UPDATE`, [fid]);
            const f = files[0];
            if (!f || f.uploaded_by !== actor.userId)
                throw new DiagnosticError('Upload not found.', 404);
            const c = await caseAccess(actor, f.case_id, db);
            if (['completed', 'withdrawn'].includes(c.status) || f.status !== 'uploading')
                throw new DiagnosticError('Upload is no longer open.', 409);
            if (offset !== Number(f.received_bytes) || offset + bytes.length > Number(f.size_bytes) || (offset + bytes.length < Number(f.size_bytes) && bytes.length % 262144 !== 0))
                throw new DiagnosticError('Upload position changed. Start the upload again.', 409);
            if (offset === 0 && !matchesMagic(bytes, f.mime))
                throw new DiagnosticError('The file contents do not match its format.');
            // Keep the provider session and credentials server-side. No public upload or sharing link is issued.
            const response = await driveFetch(f.provider_session, { method: 'PUT', headers: { 'Content-Type': f.mime, 'Content-Range': `bytes ${offset}-${offset + bytes.length - 1}/${f.size_bytes}` }, body: new Uint8Array(bytes) });
            if (response.status !== 308 && !response.ok)
                throw new DiagnosticError('Upload interrupted. Please try uploading the file again.', 503);
            const final = offset + bytes.length === Number(f.size_bytes);
            let providerId: null | string = null;
            if (final) {
                if (!response.ok)
                    throw new Error('Incomplete provider upload');
                const r = await response.json();
                providerId = typeof r.id === 'string' ? r.id : null;
                if (!providerId)
                    throw new Error('Missing private file reference');
            }
            else {
                const end = Number(response.headers.get('range')?.match(/bytes=0-(\d+)/)?.[1]);
                if (response.status !== 308 || end !== offset + bytes.length - 1)
                    throw new Error('Unexpected private upload offset');
            }
            await db.query(`UPDATE diagnostic_attachments SET received_bytes=?,status=?,provider_id=?,provider_session=? WHERE id=?`, [offset + bytes.length, final ? 'quarantined' : 'uploading', providerId, final ? null : f.provider_session, fid]);
            if (final)
                await audit(db, actor, 'attachment.uploaded', f.case_id, { fileId: fid, reviewRequired: true });
            return { received: offset + bytes.length, complete: final };
        }));
    }
    catch (e) {
        return failure(e);
    }
}
export async function GET(request: Request) {
    try {
        const actor = await actorFor(request), url = new URL(request.url), fid = id(url.searchParams.get('id'));
        const file = await transaction(async (db) => {
            const [files] = await db.query<RowDataPacket[]>(`SELECT * FROM diagnostic_attachments WHERE id=?`, [fid]);
            const f = files[0];
            if (!f)
                throw new DiagnosticError('File not found.', 404);
            await caseAccess(actor, f.case_id, db);
            if (!f.provider_id || !(f.status === 'ready' || actor.role === 'admin' && f.status === 'quarantined'))
                throw new DiagnosticError('File is awaiting a private safety review.', 409);
            await audit(db, actor, 'attachment.downloaded', f.case_id, { fileId: fid });
            return f;
        });
        const offset = integer(Number(url.searchParams.get('offset') || 0), 'download position', Number(file.size_bytes) - 1);
        const end = Math.min(offset + 2 * 1024 * 1024 - 1, Number(file.size_bytes) - 1);
        const response = await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.provider_id)}?alt=media&supportsAllDrives=true`, { headers: { Range: `bytes=${offset}-${end}` } });
        if (!response.ok || !response.body)
            throw new Error('Private download unavailable');
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength !== end - offset + 1)
            throw new Error('Unexpected private download size');
        return new Response(bytes, { headers: { ...privateHeaders, 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="document"; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g, '%27')}`, 'Content-Security-Policy': "default-src 'none'; sandbox" } });
    }
    catch (e) {
        return failure(e);
    }
}
