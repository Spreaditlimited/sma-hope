import 'server-only';
import { randomUUID, createHash } from 'node:crypto';
import type { PoolConnection } from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/database/pool';
import { CONSULTATION_SCOPE, CONSENT_VERSION, DiagnosticError, assertTransition, caseInput, clinicianInput, choice, id, integer, moneyKobo, object, OUTCOMES, text } from './domain';
import { queueDiagnosticNotification } from './notifications';
import { storageConfigured, verifyStorage } from './storage';
export type Actor = {
    userId: string;
    role: 'account' | 'admin';
};
export async function rows(sql: string, values: unknown[] = [], db = getPool().promise()) { const [result] = await db.query<RowDataPacket[]>(sql, values); return result; }
export async function transaction<T>(fn: (db: PoolConnection) => Promise<T>) { const db = await getPool().promise().getConnection(); try {
    await db.beginTransaction();
    await db.query(`SELECT id FROM diagnostic_settings WHERE id=1 FOR UPDATE`);
    const result = await fn(db);
    await db.commit();
    return result;
}
catch (e) {
    await db.rollback();
    throw e;
}
finally {
    db.release();
} }
export async function audit(db: PoolConnection, actor: Actor, action: string, subject: string, details: Record<string, unknown> = {}) {
    const [last] = await db.query<RowDataPacket[]>(`SELECT event_hash FROM diagnostic_audit ORDER BY id DESC LIMIT 1`);
    const previous = last[0]?.event_hash || '0'.repeat(64), json = JSON.stringify(details);
    const hash = createHash('sha256').update(JSON.stringify([previous, actor.userId, actor.role, action, subject, json])).digest('hex');
    await db.query(`INSERT INTO diagnostic_audit(actor_id,actor_role,action,subject_id,details_json,previous_hash,event_hash) VALUES(?,?,?,?,?,?,?)`, [actor.userId, actor.role, action, subject, json, previous, hash]);
}
export async function settings() { const [s] = await rows(`SELECT intake_open,consultation_fee_kobo,readiness_reference,updated_at FROM diagnostic_settings WHERE id=1`); if (!s)
    throw new DiagnosticError('Programme setup is incomplete.', 503); return s; }
export async function clinician(userId: string) { return (await rows(`SELECT * FROM diagnostic_clinicians WHERE user_id=?`, [userId]))[0]; }
export function isVerified(c: RowDataPacket | undefined) { return c?.status === 'approved' && c.verified_until && new Date(c.verified_until).getTime() >= Date.now(); }
export async function caseAccess(actor: Actor, caseId: string, db?: PoolConnection) {
    const query = `SELECT c.*,d.full_name clinician_name,d.user_id clinician_user_id,d.status clinician_status,d.verified_until FROM diagnostic_cases c LEFT JOIN diagnostic_clinicians d ON d.id=c.clinician_id WHERE c.id=?` + (db ? ' FOR UPDATE' : '');
    const [list] = await (db || getPool().promise()).query<RowDataPacket[]>(query, [id(caseId)]);
    const c = list[0];
    if (!c || (actor.role !== 'admin' && c.user_id !== actor.userId && !(c.clinician_user_id === actor.userId && c.clinician_status === 'approved' && c.verified_until && new Date(c.verified_until).getTime() >= Date.now() && c.sharing_consent && c.status !== 'withdrawn')))
        throw new DiagnosticError('Case not found.', 404);
    return c;
}
export async function workspace(actor: Actor, caseId?: string) {
    if (caseId)
        return transaction(async (db) => {
            const c = await caseAccess(actor, caseId, db);
            await audit(db, actor, 'case.viewed', c.id);
            const [files] = await db.query<RowDataPacket[]>(`SELECT id,name,mime,size_bytes,status,created_at FROM diagnostic_attachments WHERE case_id=? AND status<>'deleted' ORDER BY created_at`, [c.id]);
            const { clinician_user_id: _, clinician_status: __, verified_until: ___, ...safe } = c;
            void _;
            void __;
            void ___;
            const [eligible] = actor.role === 'admin' ? await db.query<RowDataPacket[]>("SELECT id,full_name,default_remuneration FROM diagnostic_clinicians WHERE status='approved' AND verified_until>NOW() AND user_id<>? ORDER BY full_name", [c.user_id]) : [[]];
            return { case: safe, files, clinicians: eligible, isAssignedClinician: actor.role === 'account' && c.clinician_user_id === actor.userId && c.user_id !== actor.userId };
        });
    const profile = await clinician(actor.userId);
    const verified = isVerified(profile);
    const cases = await rows(`SELECT id,reference,patient_name,state,status,created_at FROM diagnostic_cases WHERE user_id=? ORDER BY created_at DESC LIMIT 100`, [actor.userId]);
    const assigned = verified ? await rows(`SELECT id,reference,patient_name,state,status,fee_kobo,accepted_at FROM diagnostic_cases WHERE clinician_id=? AND user_id<>? AND sharing_consent=1 AND status<>'withdrawn' ORDER BY created_at DESC LIMIT 100`, [profile.id, actor.userId]) : [];
    return { cases, assigned, profile: profile ? { id: profile.id, status: profile.status, fullName: profile.full_name, defaultRemuneration: profile.default_remuneration } : null, settings: { intakeOpen: Boolean((await settings()).intake_open), uploadsAvailable: storageConfigured() } };
}
export async function reportCase(actor: Actor, raw: unknown, notificationSource?: string) {
    const input = caseInput(raw);
    return transaction(async (db) => {
        const [s] = await db.query<RowDataPacket[]>(`SELECT intake_open FROM diagnostic_settings WHERE id=1`);
        if (!s[0]?.intake_open)
            throw new DiagnosticError('Reporting will open once the clinical service is ready.', 409);
        const [existing] = await db.query<RowDataPacket[]>(`SELECT id FROM diagnostic_cases WHERE user_id=? AND patient_name=? AND age_months=? AND status<>'withdrawn'`, [actor.userId, input.patientName, input.ageMonths]);
        if (existing.length)
            throw new DiagnosticError('A matching report already exists in your account. Please open it rather than submit again.', 409);
        const caseId = randomUUID(), ref = 'SH-' + randomUUID().slice(0, 8).toUpperCase();
        await db.query(`INSERT INTO diagnostic_cases(id,reference,user_id,patient_name,age_months,state,lga,phone,relationship,concerns,history,consent_version,sharing_consent,registry_consent) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1,?)`, [caseId, ref, actor.userId, input.patientName, input.ageMonths, input.state, input.lga, input.phone, input.relationship, input.concerns, input.history, CONSENT_VERSION, input.registryConsent]);
        await queueDiagnosticNotification(db,'report',notificationSource || caseId);
        await audit(db, actor, 'case.reported', caseId, { consentVersion: CONSENT_VERSION, registryConsent: input.registryConsent });
        return { id: caseId, reference: ref };
    });
}
export async function applyClinician(actor: Actor, raw: unknown, notificationSource?: string) {
    const v = clinicianInput(raw);
    return transaction(async (db) => {
        const [existing] = await db.query<RowDataPacket[]>(`SELECT id FROM diagnostic_clinicians WHERE user_id=?`, [actor.userId]);
        if (existing.length)
            throw new DiagnosticError('Your application is already on file.', 409);
        const cid = randomUUID();
        await db.query(`INSERT INTO diagnostic_clinicians(id,user_id,full_name,registration_number,specialty,workplace,state,phone,availability,default_remuneration) VALUES(?,?,?,?,?,?,?,?,?,?)`, [cid, actor.userId, v.fullName, v.registrationNumber, v.specialty, v.workplace, v.state, v.phone, v.availability, v.defaultRemuneration]);
        await queueDiagnosticNotification(db,'clinician',notificationSource || cid);
        await audit(db, actor, 'clinician.applied', cid);
        return { id: cid };
    });
}
export async function accountAction(actor: Actor, raw: unknown) {
    const v = object(raw), action = text(v.action, 'action', 40);
    if (action === 'report')
        return reportCase(actor, v);
    if (action === 'apply')
        return applyClinician(actor, v);
    if (action === 'consultation_preference') {
        const preference = choice(v.remuneration, ['paid','donated'], 'consultation preference');
        return transaction(async db => {
            const [profile] = await db.query<RowDataPacket[]>('SELECT id FROM diagnostic_clinicians WHERE user_id=?', [actor.userId]);
            if (!profile[0]) throw new DiagnosticError('Submit your clinician application first.', 409);
            await db.query('UPDATE diagnostic_clinicians SET default_remuneration=? WHERE user_id=?', [preference,actor.userId]);
            await audit(db,actor,'clinician.consultation_preference_changed',profile[0].id,{remuneration:preference});
            return {ok:true};
        });
    }
    return transaction(async (db) => {
        const c = await caseAccess(actor, id(v.caseId), db);
        integer(v.version, 'case version', 2147483647, 1);
        if (v.version !== c.version)
            throw new DiagnosticError('This case changed. Reload before continuing.', 409);
        if (action === 'withdraw') {
            if (c.user_id !== actor.userId || c.status === 'withdrawn')
                throw new DiagnosticError('This action is unavailable.', 403);
            await db.query(`UPDATE diagnostic_cases SET status='withdrawn',sharing_consent=0,version=version+1,updated_at=NOW(3) WHERE id=?`, [c.id]);
            await audit(db, actor, 'case.withdrawn', c.id);
            return { ok: true };
        }
        if (c.clinician_user_id !== actor.userId || c.user_id === actor.userId || !c.sharing_consent || c.status === 'withdrawn')
            throw new DiagnosticError('Only the assigned independent clinician can do this.', 403);
        if (action === 'accept') {
            if (c.status !== 'assigned' || c.accepted_at || v.acceptScope !== true)
                throw new DiagnosticError('Please accept the consultation fee and scope.', 409);
            const remuneration = choice(v.remuneration ?? c.remuneration, ['paid','donated'], 'consultation choice');
            const offeredFee = Number(c.offered_fee_kobo ?? c.fee_kobo);
            if (!Number.isSafeInteger(offeredFee) || offeredFee <= 0) throw new DiagnosticError('The offered consultation fee is missing. Ask the foundation to review this assignment.',409);
            const agreedFee = remuneration === 'donated' ? 0 : offeredFee;
            await db.query(`UPDATE diagnostic_cases SET status='assessment',accepted_at=NOW(3),remuneration=?,fee_kobo=?,version=version+1,updated_at=NOW(3) WHERE id=?`, [remuneration,agreedFee,c.id]);
            await audit(db, actor, 'consultation.accepted', c.id, { feeKobo: agreedFee, offeredFeeKobo:offeredFee, remuneration });
            return { ok: true };
        }
        if (action !== 'clinical_update' || !c.accepted_at)
            throw new DiagnosticError('Accept the assigned consultation before recording clinical work.', 409);
        const status = choice(v.status, ['testing_recommended', 'completed'], 'next stage');
        assertTransition(c.status, status, 'clinician');
        const summary = text(v.summary, 'clinical summary', 6000, 40), message = text(v.familyMessage, 'explanation for the family', 4000, 30);
        const outcome = status === 'completed' ? choice(v.outcome, OUTCOMES, 'clinical outcome') : null;
        if (outcome === 'sma_confirmed') {
            const [reports] = await db.query<RowDataPacket[]>(`SELECT id FROM diagnostic_attachments WHERE case_id=? AND status='ready' AND mime='application/pdf'`, [c.id]);
            if (!reports.length)
                throw new DiagnosticError('Add and verify the laboratory report before recording genetically confirmed SMA.');
        }
        await db.query(`UPDATE diagnostic_cases SET status=?,clinical_summary=?,family_message=?,outcome=?,completed_at=?,version=version+1,updated_at=NOW(3) WHERE id=?`, [status, summary, message, outcome, status === 'completed' ? new Date() : null, c.id]);
        await audit(db, actor, 'clinical.' + status, c.id, { outcome });
        return { ok: true };
    });
}
export async function adminWorkspace(actor: Actor, caseId?: string, page = 1) {
    if (actor.role !== 'admin')
        throw new DiagnosticError('Forbidden', 403);
    if (caseId)
        return workspace(actor, caseId);
    const offset = (integer(page, 'page', 100000, 1) - 1) * 30;
    return transaction(async (db) => {
        const query = async (sql: string, args: unknown[] = []) => (await db.query<RowDataPacket[]>(sql, args))[0];
        const cases = await query(`SELECT c.id,c.reference,c.patient_name,c.state,c.status,c.remuneration,c.accepted_at,c.created_at,d.full_name clinician_name FROM diagnostic_cases c LEFT JOIN diagnostic_clinicians d ON d.id=c.clinician_id ORDER BY c.created_at DESC LIMIT 30 OFFSET ?`, [offset]);
        const clinicians = await query(`SELECT id,full_name,registration_number,specialty,workplace,state,phone,availability,default_remuneration,status,verified_until,verification_reference FROM diagnostic_clinicians ORDER BY created_at DESC LIMIT 100`);
        const [notificationStats] = await query(`SELECT SUM(status='pending') pending,SUM(status='sent') sent FROM diagnostic_notifications`);
        const publicReports = await query(`SELECT p.id,p.email_confirmed_at,i.email FROM diagnostic_public_reports p JOIN account_identity i ON i.id=p.user_id WHERE p.case_id IS NULL ORDER BY p.created_at DESC LIMIT 100`);
        const publicApplications = await query(`SELECT p.id,p.profile_json,p.created_at,i.email FROM diagnostic_public_applications p JOIN account_identity i ON i.id=p.user_id WHERE p.claimed_at IS NULL ORDER BY p.created_at DESC LIMIT 100`);
        const finance = await query(`SELECT f.*,c.reference FROM diagnostic_finance f JOIN diagnostic_cases c ON c.id=f.case_id ORDER BY f.created_at DESC LIMIT 100`);
        const history = await query(`SELECT id,actor_id,actor_role,action,subject_id,details_json,event_hash,previous_hash,created_at FROM diagnostic_audit ORDER BY id DESC LIMIT 100`);
        const [counts] = await query(`SELECT COUNT(*) total,SUM(status='completed') completed,SUM(outcome='sma_confirmed') confirmed FROM diagnostic_cases`);
        const [totals] = await query(`SELECT COALESCE(SUM(IF(status='paid',amount_kobo,0)),0) paid_kobo,COALESCE(SUM(IF(status='approved',amount_kobo,0)),0) committed_kobo FROM diagnostic_finance`);
        const [s] = await query(`SELECT * FROM diagnostic_settings WHERE id=1`);
        await audit(db, actor, 'programme.workspace_viewed', 'programme', { page });
        return { cases, clinicians, notificationStats, publicReports, publicApplications: publicApplications.map(p => ({id:p.id,email:p.email,...JSON.parse(p.profile_json)})), finance, history, counts, totals, settings: { ...s, storageConfigured: storageConfigured() }, page };
    });
}
export async function adminAction(actor: Actor, raw: unknown) {
    if (actor.role !== 'admin')
        throw new DiagnosticError('Forbidden', 403);
    const v = object(raw), action = text(v.action, 'action', 40);
    if (action === 'settings' && v.intakeOpen === true) {
        if (v.readinessConfirmed !== true)
            throw new DiagnosticError('Confirm report-review, consent and privacy readiness first.');
        await verifyStorage();
    }
    return transaction(async (db) => {
        if (action === 'settings') {
            const fee = moneyKobo(v.feeNaira);
            const ref = text(v.readinessReference ?? '', 'readiness reference', 500, v.intakeOpen === true ? 20 : 0);
            await db.query(`UPDATE diagnostic_settings SET consultation_fee_kobo=?,intake_open=?,readiness_reference=?,updated_at=NOW(3) WHERE id=1`, [fee, v.intakeOpen === true, ref]);
            await audit(db, actor, 'settings.changed', 'programme', { feeKobo: fee, intakeOpen: v.intakeOpen === true, readinessReference: ref });
            return { ok: true };
        }
        if (action === 'verify_clinician') {
            const cid = id(v.clinicianId), status = choice(v.status, ['approved', 'suspended', 'declined'], 'verification status'), ref = text(v.reference, 'verification evidence', 500, 15);
            const until = status === 'approved' ? text(v.verifiedUntil, 'verification expiry', 10) : null;
            if (until && (!/^20\d{2}-\d{2}-\d{2}$/.test(until) || !Number.isFinite(Date.parse(until)) || new Date(until).getTime() <= Date.now() || new Date(until).getTime() > Date.now() + 367 * 86400000))
                throw new DiagnosticError('Set a valid future verification review date within one year.');
            const [c] = await db.query<RowDataPacket[]>(`SELECT id FROM diagnostic_clinicians WHERE id=?`, [cid]);
            if (!c.length)
                throw new DiagnosticError('Application not found.', 404);
            await db.query(`UPDATE diagnostic_clinicians SET status=?,verification_reference=?,verified_until=?,verified_by=? WHERE id=?`, [status, ref, until, actor.userId, cid]);
            await audit(db, actor, 'clinician.' + status, cid, { reference: ref, verifiedUntil: until });
            return { ok: true };
        }
        if (action === 'approve_expense' || action === 'record_payment') {
            const fid = id(v.financeId);
            const [r] = await db.query<RowDataPacket[]>(`SELECT * FROM diagnostic_finance WHERE id=? FOR UPDATE`, [fid]);
            const f = r[0];
            if (!f)
                throw new DiagnosticError('Expense not found.', 404);
            if (action === 'approve_expense') {
                if (f.status !== 'proposed' || f.created_by === actor.userId)
                    throw new DiagnosticError('Another administrator must approve this expense.', 409);
                await db.query(`UPDATE diagnostic_finance SET status='approved',approved_by=? WHERE id=?`, [actor.userId, fid]);
            }
            else {
                if (f.status !== 'approved')
                    throw new DiagnosticError('Only an independently approved expense can be recorded as paid.', 409);
                const reference = text(v.paymentReference, 'external payment reference', 180, 5);
                await db.query(`UPDATE diagnostic_finance SET status='paid',paid_reference=?,paid_by=? WHERE id=?`, [reference, actor.userId, fid]);
            }
            await audit(db, actor, action, fid, { caseId: f.case_id, amountKobo: f.amount_kobo, ...(action === 'record_payment' ? { paymentReference: v.paymentReference } : {}) });
            return { ok: true };
        }
        const c = await caseAccess(actor, id(v.caseId), db);
        if (action === 'review_attachment') {
            const fid = id(v.fileId), ref = text(v.reference, 'file review evidence', 500, 10);
            const [a] = await db.query<RowDataPacket[]>(`SELECT id FROM diagnostic_attachments WHERE id=? AND case_id=? AND status='quarantined' AND provider_id IS NOT NULL`, [fid, c.id]);
            if (!a.length)
                throw new DiagnosticError('Upload is not ready for review.', 409);
            await db.query(`UPDATE diagnostic_attachments SET status='ready' WHERE id=?`, [fid]);
            await audit(db, actor, 'attachment.reviewed', c.id, { fileId: fid, reference: ref });
            return { ok: true };
        }
        if (action === 'expense') {
            if (c.status === 'withdrawn')
                throw new DiagnosticError('Review the withdrawn case before creating costs.', 409);
            const kind = choice(v.kind, ['consultation', 'laboratory', 'transport', 'other'], 'expense type'), amount = moneyKobo(v.amountNaira), description = text(v.description, 'description', 500, 10), evidence = text(v.evidenceReference, 'evidence reference', 500, 10), allocation = text(v.donorAllocation, 'funding allocation', 180, 3);
            if (kind === 'consultation') {
                if (c.remuneration === 'donated') throw new DiagnosticError('This clinician donated the consultation. No consultation payment is due.',409);
                if (c.status !== 'completed' || !c.completed_at || amount !== Number(c.fee_kobo))
                    throw new DiagnosticError('Consultation payment must match the agreed fee and completed work.', 409);
                const [f] = await db.query<RowDataPacket[]>(`SELECT id FROM diagnostic_finance WHERE case_id=? AND kind='consultation'`, [c.id]);
                if (f.length)
                    throw new DiagnosticError('This consultation already has an expense record.', 409);
            }
            const fid = randomUUID();
            await db.query(`INSERT INTO diagnostic_finance(id,case_id,kind,amount_kobo,description,evidence_reference,created_by,donor_allocation) VALUES(?,?,?,?,?,?,?,?)`, [fid, c.id, kind, amount, description, evidence, actor.userId, allocation]);
            await audit(db, actor, 'expense.proposed', fid, { caseId: c.id, kind, amountKobo: amount, allocation });
            return { ok: true };
        }
        integer(v.version, 'case version', 2147483647, 1);
        if (v.version !== c.version)
            throw new DiagnosticError('This case changed. Reload before continuing.', 409);
        if (action === 'assign') {
            if (c.status !== 'reported' || c.clinician_id)
                throw new DiagnosticError('This case already has an assignment. Reassignment needs a separate case review.', 409);
            const cid = id(v.clinicianId);
            const [d] = await db.query<RowDataPacket[]>(`SELECT * FROM diagnostic_clinicians WHERE id=?`, [cid]);
            if (!isVerified(d[0]) || d[0].user_id === c.user_id)
                throw new DiagnosticError('Choose a verified, independent clinician.');
            const [s] = await db.query<RowDataPacket[]>(`SELECT consultation_fee_kobo FROM diagnostic_settings WHERE id=1`);
            if (!s[0]?.consultation_fee_kobo)
                throw new DiagnosticError('Set the programme consultation fee first.', 409);
            const remuneration = d[0].default_remuneration === 'donated' ? 'donated' : 'paid';
            const offeredFee = Number(s[0].consultation_fee_kobo), agreedFee = remuneration === 'donated' ? 0 : offeredFee;
            await db.query(`UPDATE diagnostic_cases SET clinician_id=?,fee_kobo=?,offered_fee_kobo=?,remuneration=?,fee_scope=?,status='assigned',version=version+1,updated_at=NOW(3) WHERE id=?`, [cid,agreedFee,offeredFee,remuneration,CONSULTATION_SCOPE,c.id]);
            await audit(db, actor, 'case.assigned', c.id, { clinicianId: cid, feeKobo: agreedFee, offeredFeeKobo:offeredFee, remuneration, scope: CONSULTATION_SCOPE });
            return { ok: true };
        }
        if (action === 'arrange_testing') {
            assertTransition(c.status, 'testing_arranged', 'admin');
            const ref = text(v.reference, 'collection and laboratory arrangement', 500, 15);
            await db.query(`UPDATE diagnostic_cases SET status='testing_arranged',version=version+1,updated_at=NOW(3) WHERE id=?`, [c.id]);
            await audit(db, actor, 'testing.arranged', c.id, { reference: ref });
            return { ok: true };
        }
        throw new DiagnosticError('Unknown action.');
    });
}
