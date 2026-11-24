import { readAnalyticsConsent } from './cookie-consent';
import { isPixelPage } from './meta-pixel';

export const GA_MEASUREMENT_ID = 'G-T3PKCFSW9V';
const scriptId = 'smahope-google-analytics';
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag; 'ga-disable-G-T3PKCFSW9V'?: boolean }
}
let currentPath: string | null = null;
let previousPath: string | null = null;
let loading = false;
let ready = false;
let configured = false;

function allowed() {
  if (!currentPath || currentPath !== window.location.pathname || !isPixelPage(currentPath)) return false;
  if (!['smahope.org', 'www.smahope.org'].includes(window.location.hostname)) return false;
  if (readAnalyticsConsent() !== 'accepted') return false;
  return !Array.from(new URL(window.location.href).searchParams.keys()).some(key => /token|password|email|session|code|message/i.test(key));
}
function cleanCookies() {
  try {
    const names = document.cookie.split(';').map(part => part.trim().split('=')[0]).filter(name => /^_ga(?:_|$)/.test(name));
    for (const name of names) for (const domain of ['', `; Domain=${window.location.hostname}`, '; Domain=.smahope.org']) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain}`;
    }
  } catch { /* Restricting cookies must not break the website. */ }
}
function referrer() {
  try { return document.referrer ? new URL(document.referrer).origin : ''; } catch { return ''; }
}
function sendPageView() {
  if (!ready || !allowed() || !window.gtag || previousPath === currentPath) return;
  const location = window.location.origin + currentPath;
  const params = { page_location: location, page_referrer: referrer(), page_title: document.title };
  // These defaults also prevent automatic engagement events from using raw URLs.
  window.gtag('set', params);
  window.gtag('event', 'page_view', { ...params, send_to: GA_MEASUREMENT_ID });
  previousPath = currentPath;
}
export function syncGoogleAnalytics(pathname: string) {
  if (typeof window === 'undefined') return;
  currentPath = pathname;
  const permitted = allowed();
  window['ga-disable-G-T3PKCFSW9V'] = !permitted;
  if (!permitted) {
    previousPath = null;
    if (readAnalyticsConsent() !== 'accepted') cleanCookies();
    return;
  }
  if (ready) { sendPageView(); return; }
  if (loading) return;
  if (!configured) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      // gtag consumes Arguments objects, not arrays of rest parameters.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: window.location.origin + pathname, page_referrer: referrer(), page_title: document.title,
      cookie_expires: 15552000,
    });
    configured = true;
  }
  loading = true;
  const script = document.createElement('script');
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.onload = () => { ready = true; loading = false; sendPageView(); };
  script.onerror = () => { loading = false; script.remove(); };
  document.head.appendChild(script);
}
