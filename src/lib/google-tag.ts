import { readAnalyticsConsent, readGoogleAdsConsent } from './cookie-consent';
import { isPixelPage } from './meta-pixel';
export const GA_MEASUREMENT_ID = 'G-T3PKCFSW9V';
export const GOOGLE_ADS_ID = 'AW-18595577422';
type Gtag = (...args: unknown[]) => void;
declare global { interface Window { dataLayer?: unknown[]; gtag?: Gtag; 'ga-disable-G-T3PKCFSW9V'?: boolean } }
let initialized = false, loading = false, ready = false;
const callbacks = new Set<() => void>();
export function safeGooglePage() {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:' || !['smahope.org', 'www.smahope.org'].includes(window.location.hostname)) return false;
  return !Array.from(new URL(window.location.href).searchParams.keys()).some(key => /token|password|email|session|code|message/i.test(key));
}
export function googleAnalyticsAllowed() {
  return safeGooglePage() && isPixelPage(window.location.pathname) && readAnalyticsConsent() === 'accepted';
}
export function googleAdsAllowed() {
  if (!safeGooglePage() || readGoogleAdsConsent() !== 'accepted') return false;
  const url = new URL(window.location.href);
  return isPixelPage(url.pathname) || (url.pathname === '/account/register' && !url.searchParams.has('next'));
}
export function ensureGoogleTag() {
  if (initialized) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    // Google consumes Arguments objects rather than arrays.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('set', 'url_passthrough', false);
  window.gtag('js', new Date());
  initialized = true;
}
export function syncGoogleTagConsent() {
  if (typeof window === 'undefined') return;
  window['ga-disable-G-T3PKCFSW9V'] = !googleAnalyticsAllowed();
  if (!initialized) return;
  const ads = googleAdsAllowed();
  window.gtag?.('consent', 'update', { analytics_storage: googleAnalyticsAllowed() ? 'granted' : 'denied', ad_storage: ads ? 'granted' : 'denied', ad_user_data: ads ? 'granted' : 'denied', ad_personalization: 'denied' });
  if (!googleAnalyticsAllowed() && !ads) window.gtag?.('set', { page_location: window.location.origin + '/', page_referrer: '', page_title: 'SMA Hope' });
}
export function loadGoogleTag(id: string, onReady: () => void) {
  if (ready) { onReady(); return; }
  callbacks.add(onReady);
  if (loading) return;
  loading = true;
  const script = document.createElement('script');
  script.id = 'smahope-google-tag'; script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  script.onload = () => {
    ready = true; loading = false; syncGoogleTagConsent();
    callbacks.forEach(callback => callback());
    callbacks.clear();
  };
  script.onerror = () => { loading = false; callbacks.clear(); script.remove(); };
  document.head.appendChild(script);
}
