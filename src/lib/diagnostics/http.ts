import { DiagnosticError } from './domain';
export const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
export function json(value: unknown, status = 200) { return Response.json(value, { status, headers: privateHeaders }); }
export function failure(error: unknown) { const message = error instanceof Error ? error.message : ''; const status = error instanceof DiagnosticError ? error.status : message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : message === 'Too many attempts' ? 429 : error instanceof SyntaxError ? 400 : 503; return json({ error: status === 503 ? 'This service is temporarily unavailable. Please try again later.' : message || 'Invalid request.' }, status); }
export async function body(request: Request, max = 20000) { const reader = request.body?.getReader(); if (!reader)
    throw new DiagnosticError('Request body required.'); const chunks: Uint8Array[] = []; let n = 0; for (;;) {
    const { done, value } = await reader.read();
    if (done)
        break;
    n += value.length;
    if (n > max) {
        await reader.cancel();
        throw new DiagnosticError('Request is too large.', 413);
    }
    chunks.push(value);
} return Buffer.concat(chunks); }
export async function input(request: Request) { return JSON.parse((await body(request)).toString('utf8')); }
