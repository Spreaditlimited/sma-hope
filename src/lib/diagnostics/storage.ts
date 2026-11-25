import 'server-only';
import { headers } from 'next/headers';
import { DiagnosticError } from './domain';
import { exchangeGoogleIdentity,googleIdentityConfig } from './google-identity';
let cached:{token:string;expires:number}|undefined;
export function storageConfigured(){return Boolean(googleIdentityConfig(process.env)&&process.env.SMAHOPE_DIAGNOSTIC_DRIVE_FOLDER_ID);}
export async function driveToken(){
 const config=googleIdentityConfig(process.env);
 if(!config||!storageConfigured())throw new DiagnosticError('Private uploads are not configured yet.',503);
 if(cached&&cached.expires>Date.now()+60000)return cached.token;
 const token=process.env.VERCEL ? (await headers()).get('x-vercel-oidc-token') : process.env.VERCEL_OIDC_TOKEN;
 if(!token)throw new DiagnosticError('A current application identity is required for private uploads.',503);
 cached=await exchangeGoogleIdentity(token,config);return cached.token;
}
export async function driveFetch(url: string, init: RequestInit = {}) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.googleapis.com' || !['/drive/v3/', '/upload/drive/v3/'].some(p => parsed.pathname.startsWith(p)))
        throw new Error('Invalid private storage endpoint');
    return fetch(url, { ...init, headers: { ...init.headers, Authorization: 'Bearer ' + await driveToken() }, redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(25000) });
}
export async function verifyStorage() {
    const folder = process.env.SMAHOPE_DIAGNOSTIC_DRIVE_FOLDER_ID;
    if (!folder || !/^[a-zA-Z0-9_-]+$/.test(folder))
        throw new DiagnosticError('Configure a restricted organisational Shared Drive folder first.', 503);
    const response = await driveFetch(`https://www.googleapis.com/drive/v3/files/${folder}?supportsAllDrives=true&fields=id,mimeType,driveId`);
    if (!response.ok)
        throw new DiagnosticError('Private storage could not be verified.', 503);
    const data = await response.json();
    if (!data.driveId || data.mimeType !== 'application/vnd.google-apps.folder')
        throw new DiagnosticError('Use an organisational Shared Drive folder.', 503);
    for (const target of new Set([folder, data.driveId])) {
        const result = await driveFetch(`https://www.googleapis.com/drive/v3/files/${target}/permissions?supportsAllDrives=true&fields=permissions(type,role),nextPageToken&pageSize=100`);
        if (!result.ok)
            throw new DiagnosticError('Storage permissions could not be checked.', 503);
        const permissions = await result.json();
        if (permissions.nextPageToken || !Array.isArray(permissions.permissions) || permissions.permissions.some((p: {
            type: string;
        }) => ['anyone', 'domain'].includes(p.type)))
            throw new DiagnosticError('Remove public or domain-wide sharing before enabling reports.', 503);
    }
}
export async function beginUpload(name: string, mime: string, size: number) {
    await verifyStorage();
    const response = await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(size) }, body: JSON.stringify({ name, mimeType: mime, parents: [process.env.SMAHOPE_DIAGNOSTIC_DRIVE_FOLDER_ID] }) });
    const location = response.headers.get('location');
    if (!response.ok || !location)
        throw new Error('Private upload could not start');
    const url = new URL(location);
    if (url.hostname !== 'www.googleapis.com')
        throw new Error('Invalid upload endpoint');
    return location;
}
