export const CONSENT_COOKIE = "smahope_cookie_consent_v2";
export const CONSENT_CHANGED_EVENT = "smahope:consent-changed";
export const COOKIE_SETTINGS_EVENT = "smahope:cookie-settings";
export type CookieConsent = "accepted" | "declined";
let volatileChoice: CookieConsent | null = null;

export function readCookieConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  if (volatileChoice) return volatileChoice;
  let cookies: string;
  try { cookies = document.cookie; } catch { return null; }
  const value = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${CONSENT_COOKIE}=`))?.slice(CONSENT_COOKIE.length + 1);
  if (value === "accepted" || value === "declined") return value;
  // Respect an existing rejection; old generic acceptance did not mention advertising.
  return cookies.split(";").some((part) => part.trim() === "smahope_cookie_consent=declined") ? "declined" : null;
}

export function saveCookieConsent(value: CookieConsent) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  volatileChoice = null;
  try {
    document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;
    if (readCookieConsent() !== value) volatileChoice = value;
  } catch {
    // Honour the choice for this tab if persistent cookies are unavailable.
    volatileChoice = value;
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}
