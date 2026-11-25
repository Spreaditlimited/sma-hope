import 'server-only';
import { randomUUID } from 'node:crypto';
import { GOOGLE_ADS_CONSENT_COOKIE } from './cookie-consent';
export const GOOGLE_ADS_REGISTRATION_HEADER = 'x-smahope-learning-registration';
export function googleAdsRegistrationReceipt(request: Request) {
  const consent = request.headers.get('cookie')?.split(';').map(p => p.trim()).find(p => p.startsWith(GOOGLE_ADS_CONSENT_COOKIE + '='))?.slice(GOOGLE_ADS_CONSENT_COOKIE.length + 1);
  return consent === 'accepted' ? randomUUID() : null;
}
