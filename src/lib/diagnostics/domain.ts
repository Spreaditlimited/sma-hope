export const CONSENT_VERSION = 'diagnostic-2026-11-25-v1';
export const CONSULTATION_SCOPE = 'One patient pathway: clinical assessment, appropriate testing advice, review and explanation of available results, written summary, next steps and reasonable follow-up for this referral. Laboratory tests, travel and equipment are separate. Testing-dependent work remains open until results are reviewed or an explicit closure is agreed.';
export const STATES = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];
export class DiagnosticError extends Error {
    constructor(message: string, public status = 400) { super(message); }
}
export function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new DiagnosticError('Invalid request.'); return value as Record<string, unknown>; }
export function text(value: unknown, label: string, max: number, min = 1): string { if (typeof value !== 'string' || value.trim().length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))
    throw new DiagnosticError(`Check ${label}.`); return value.trim(); }
export function integer(value: unknown, label: string, max: number, min = 0): number { if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max)
    throw new DiagnosticError(`Check ${label}.`); return value; }
export function id(value: unknown): string { const v = text(value, 'reference', 36); if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v))
    throw new DiagnosticError('Invalid reference.'); return v; }
export function choice(value: unknown, values: readonly string[], label: string): string { if (typeof value !== 'string' || !values.includes(value))
    throw new DiagnosticError(`Check ${label}.`); return value; }
export function caseInput(raw: unknown) {
    const v = object(raw);
    const ageMonths = integer(v.ageMonths, 'age in months', 1440);
    const relationship = choice(v.relationship, ['self', 'parent', 'guardian'], 'your relationship');
    if (ageMonths < 216 && relationship === 'self')
        throw new DiagnosticError('A parent or legal guardian must submit a child’s report.');
    if (ageMonths >= 216 && relationship !== 'self')
        throw new DiagnosticError('Adult patients should submit their own report. Contact us for assistance with authorised representation.');
    if (v.consent !== true || v.sharingConsent !== true)
        throw new DiagnosticError('Please confirm consent to hold this record and share it with the assigned clinician.');
    return { patientName: text(v.patientName, 'patient name', 180, 2), ageMonths, state: choice(v.state, STATES, 'state'), lga: text(v.lga, 'LGA', 100), phone: text(v.phone, 'contact number', 30, 7), relationship, concerns: text(v.concerns, 'your concerns', 4000, 20), history: text(v.history ?? '', 'previous assessment', 4000, 0), registryConsent: v.registryConsent === true };
}
export function clinicianInput(raw: unknown) { const v = object(raw); if (v.consent !== true)
    throw new DiagnosticError('Please agree to verification and private case handling.'); return { defaultRemuneration: choice(v.defaultRemuneration ?? 'paid', ['paid', 'donated'], 'consultation preference'), fullName: text(v.fullName, 'full name', 180, 2), registrationNumber: text(v.registrationNumber, 'MDCN registration', 80), specialty: text(v.specialty, 'specialty', 180), workplace: text(v.workplace, 'workplace', 240), state: choice(v.state, STATES, 'state'), phone: text(v.phone, 'phone', 30, 7), availability: text(v.availability, 'availability', 1000, 10) }; }
export function moneyKobo(raw: unknown) { const value = text(raw, 'amount in naira', 15); if (!/^\d{1,9}(?:\.\d{1,2})?$/.test(value))
    throw new DiagnosticError('Enter a naira amount with at most two decimal places.'); const [n, f = ''] = value.split('.'); const result = Number(n) * 100 + Number(f.padEnd(2, '0')); return integer(result, 'amount', 99999999999, 1); }
export function formatNaira(kobo: number | null) { return kobo === null ? 'Not set' : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(kobo / 100); }
export const OUTCOMES = ['sma_confirmed', 'sma_not_confirmed', 'inconclusive', 'other_referral'] as const;
export const STATUS_LABELS: Record<string, string> = { reported: 'Report received', assigned: 'Clinician assigned', assessment: 'Clinical assessment', testing_recommended: 'Testing recommended', testing_arranged: 'Testing arranged', completed: 'Consultation completed', withdrawn: 'Withdrawn' };
export function assertTransition(from: string, to: string, role: string) {
    const allowed: Record<string, string[]> = role === 'clinician' ? { assessment: ['testing_recommended', 'completed'], testing_recommended: ['completed'], testing_arranged: ['completed'] } : { testing_recommended: ['testing_arranged'] };
    if (!allowed[from]?.includes(to))
        throw new DiagnosticError('That change is not available at this stage.', 409);
}
export function validateFile(raw: unknown) { const v = object(raw); const mime = choice(v.mime, ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'application/pdf'], 'file format'); const size = integer(v.size, 'file size', mime.startsWith('video/') ? 30 * 1024 * 1024 : 8 * 1024 * 1024, 1); return { name: text(v.name, 'file name', 180).replace(/[\/\\]/g, '_'), mime, size }; }
export function matchesMagic(data: Uint8Array, mime: string) { const a = Array.from(data.slice(0, 12)); const ascii = (start: number, end: number) => String.fromCharCode(...a.slice(start, end)); if (mime === 'image/jpeg')
    return a[0] === 255 && a[1] === 216 && a[2] === 255; if (mime === 'image/png')
    return a.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10'; if (mime === 'application/pdf')
    return ascii(0, 5) === '%PDF-'; return ascii(4, 8) === 'ftyp'; }
