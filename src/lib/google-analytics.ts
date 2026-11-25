import { readAnalyticsConsent } from './cookie-consent';
import { GA_MEASUREMENT_ID, ensureGoogleTag, googleAnalyticsAllowed, loadGoogleTag, syncGoogleTagConsent } from './google-tag';
export { GA_MEASUREMENT_ID } from './google-tag';
let currentPath: string | null = null;
let previousPath: string | null = null;
let configured = false;
function cleanCookies() {
  try {
    const names = document.cookie.split(';').map(part => part.trim().split('=')[0]).filter(name => /^_ga(?:_|$)/.test(name));
    for (const name of names) for (const domain of ['', `; Domain=${window.location.hostname}`, '; Domain=.smahope.org']) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain}`;
  } catch { /* Tracking must not affect the website. */ }
}
function referrer() {
  try { return document.referrer ? new URL(document.referrer).origin : ''; } catch { return ''; }
}
function sendPageView() {
  if (!currentPath || currentPath !== window.location.pathname || !googleAnalyticsAllowed() || previousPath === currentPath) return;
  const params = { page_location: window.location.origin + currentPath, page_referrer: referrer(), page_title: document.title };
  window.gtag?.('set', params);
  window.gtag?.('event', 'page_view', { ...params, send_to: GA_MEASUREMENT_ID });
  previousPath = currentPath;
}
export function syncGoogleAnalytics(pathname: string) {
  if (typeof window === 'undefined') return;
  currentPath = pathname;
  syncGoogleTagConsent();
  if (pathname !== window.location.pathname || !googleAnalyticsAllowed()) {
    previousPath = null;
    if (readAnalyticsConsent() !== 'accepted') cleanCookies();
    return;
  }
  ensureGoogleTag(); syncGoogleTagConsent();
  if (!configured) {
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: window.location.origin + pathname, page_referrer: referrer(), page_title: document.title,
      cookie_expires: 15552000,
    });
    configured = true;
  }
  loadGoogleTag(GA_MEASUREMENT_ID, sendPageView);
}
