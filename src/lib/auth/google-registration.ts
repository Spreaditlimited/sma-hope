import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const GOOGLE_REGISTRATION_COOKIE = 'smahope_google_registration';
export const GOOGLE_REGISTRATION_PATH = '/api/account/google-registration';
export const GOOGLE_NEW_LEARNER_PATH = '/account/register?google=complete';
const destinations = ['/account','/account/learn','/account/orders','/account/donations','/account/subscriptions','/account/email-preferences','/account/learn/feedback','/account/diagnostics','/account/clinician'];
export function googleSignInEnabled() {
  return Boolean(process.env.SMAHOPE_GOOGLE_CLIENT_ID?.trim() && process.env.SMAHOPE_GOOGLE_CLIENT_SECRET?.trim());
}
export function googleSignInDestination(value: unknown) {
  return typeof value === 'string' && destinations.includes(value) ? value : '/account/learn';
}
export function googleLearningDestination(value: string) {
  return value === '/account/learn';
}
export function validGoogleContext(value: unknown): value is {source:'learning'|'foundation'; terms:true} {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string,unknown>;
  return v.terms === true && ['learning','foundation'].includes(String(v.source));
}
function signingKey() {
  const key = process.env.SMAHOPE_AUTH_SECRET;
  if (!key || key.length < 32) throw new Error('Authentication is not configured.');
  return key;
}
export function issueGoogleRegistration(userId: string) {
  const payload = Buffer.from(JSON.stringify({userId, receipt:randomUUID(), expires:Date.now()+120000})).toString('base64url');
  const signature = createHmac('sha256',signingKey()).update('google-registration:'+payload).digest('base64url');
  return payload+'.'+signature;
}
export function readGoogleRegistration(value: string|undefined, userId: string) {
  try {
    if (!value || value.length > 1024) return null;
    const [payload,signature,...extra] = value.split('.');
    if (extra.length || !payload || !signature || !/^[A-Za-z0-9_-]+$/.test(signature)) return null;
    const expected = createHmac('sha256',signingKey()).update('google-registration:'+payload).digest();
    const actual = Buffer.from(signature,'base64url');
    if (expected.length !== actual.length || !timingSafeEqual(expected,actual)) return null;
    const data = JSON.parse(Buffer.from(payload,'base64url').toString());
    if (data.userId !== userId || !Number.isFinite(data.expires) || data.expires <= Date.now() || data.expires > Date.now()+120000 || typeof data.receipt !== 'string' || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(data.receipt)) return null;
    return data.receipt as string;
  } catch { return null; }
}
