import { readGoogleAdsConsent } from './cookie-consent';
import { GOOGLE_ADS_ID, ensureGoogleTag, googleAdsAllowed, loadGoogleTag, syncGoogleTagConsent } from './google-tag';
export const GOOGLE_ADS_SIGNUP_DESTINATION = GOOGLE_ADS_ID + '/28PsCNvRrL8dEM78h6NF';
export const GOOGLE_AD_CLICK_COOKIE = 'smahope_google_ad_click_v1';
const clickLifetime = 30 * 24 * 60 * 60 * 1000;
type Click = { kind: 'gclid' | 'gbraid' | 'wbraid'; value: string; time: number };
let configuredFor: string | null = null;
const delivered = new Set<string>();
const onTagReady = () => {};
function validClick(value: unknown): value is Click {
  if (!value || typeof value !== 'object') return false;
  const c = value as Click;
  return ['gclid', 'gbraid', 'wbraid'].includes(c.kind) && typeof c.value === 'string' && /^[A-Za-z0-9_-]{10,256}$/.test(c.value) && typeof c.time === 'number' && Number.isFinite(c.time) && c.time <= Date.now() && Date.now() - c.time < clickLifetime;
}
function savedClick(): Click | null {
  try {
    const raw = document.cookie.split(';').map(p => p.trim()).find(p => p.startsWith(GOOGLE_AD_CLICK_COOKIE + '='))?.slice(GOOGLE_AD_CLICK_COOKIE.length + 1);
    const click: unknown = raw ? JSON.parse(decodeURIComponent(raw)) : null;
    return validClick(click) ? click : null;
  } catch { return null; }
}
function clearAdCookies() {
  try {
    const names = document.cookie.split(';').map(p => p.trim().split('=')[0]).filter(name => name === GOOGLE_AD_CLICK_COOKIE || /^_gcl_|^_gac_/.test(name));
    for (const name of names) for (const domain of ['', `; Domain=${window.location.hostname}`, '; Domain=.smahope.org']) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain}`;
  } catch { /* Cookie restrictions must not break registration. */ }
}
function captureClick() {
  const url = new URL(window.location.href), previous = savedClick();
  for (const kind of ['gclid', 'gbraid', 'wbraid'] as const) {
    const values = url.searchParams.getAll(kind);
    if (values.length !== 1 || !/^[A-Za-z0-9_-]{10,256}$/.test(values[0])) continue;
    if (previous?.kind === kind && previous.value === values[0]) return previous;
    const click: Click = { kind, value: values[0], time: Date.now() };
    try { document.cookie = `${GOOGLE_AD_CLICK_COOKIE}=${encodeURIComponent(JSON.stringify(click))}; Max-Age=${clickLifetime / 1000}; Path=/; SameSite=Lax; Secure`; } catch { /* No registration failure if cookies are blocked. */ }
    return click;
  }
  return previous;
}
function locationWithClick(click: Click | null, pathname = window.location.pathname) {
  const url = new URL(window.location.origin + pathname);
  if (click) url.searchParams.set(click.kind, click.value);
  return url.href;
}
export function syncGoogleAds(pathname: string) {
  if (typeof window === 'undefined') return;
  syncGoogleTagConsent();
  if (readGoogleAdsConsent() !== 'accepted') { clearAdCookies(); return; }
  if (pathname !== window.location.pathname || !googleAdsAllowed()) return;
  const click = captureClick();
  ensureGoogleTag(); syncGoogleTagConsent();
  const attribution = click ? click.kind + ':' + click.value : '';
  if (configuredFor !== attribution) {
    window.gtag?.('config', GOOGLE_ADS_ID, { send_page_view: false, allow_ad_personalization_signals: false, allow_enhanced_conversions: false, page_location: locationWithClick(click), page_referrer: '', page_title: 'SMA Hope' });
    configuredFor = attribution;
  }
  loadGoogleTag(GOOGLE_ADS_ID, onTagReady);
}
/** Called only after the server acknowledges a new learning registration, never on a click/page view. */
export async function trackGoogleAdsRegistration(receipt: string | null): Promise<void> {
  try {
    if (!receipt || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(receipt) || window.location.pathname !== '/account/register' || !googleAdsAllowed() || delivered.has(receipt)) return;
    const key = 'smahope:google-registration:' + receipt;
    try { if (window.sessionStorage.getItem(key)) return; } catch { /* In-memory and provider deduplication remain available. */ }
    syncGoogleAds('/account/register');
    // Bound the optional SDK/callback wait; never hold up access to the course.
    let active = true;
    await new Promise<void>(resolve => {
      const timeout = window.setTimeout(() => { active = false; resolve(); }, 800);
      loadGoogleTag(GOOGLE_ADS_ID, () => {
        if (!active) return;
        if (!googleAdsAllowed() || window.location.pathname !== '/account/register' || delivered.has(receipt)) { active = false; window.clearTimeout(timeout); resolve(); return; }
        delivered.add(receipt);
        try { window.sessionStorage.setItem(key, '1'); } catch { /* Storage blocking must not fail signup. */ }
        window.gtag?.('event', 'conversion', {
          send_to: GOOGLE_ADS_SIGNUP_DESTINATION, transaction_id: receipt,
          page_location: locationWithClick(savedClick(), '/account/register'), page_referrer: '', page_title: 'Free learning registration',
          allow_ad_personalization_signals: false, event_timeout: 650,
          event_callback: () => { active = false; window.clearTimeout(timeout); resolve(); },
        });
      });
    });
  } catch { /* Optional measurement must never change a successful registration. */ }
}
