import { readCookieConsent } from "./cookie-consent";

export const META_PIXEL_ID = "2521801154897796";
const SCRIPT_ID = "smahope-meta-pixel";
type Pixel = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Pixel;
  loaded: boolean;
  version: string;
  disablePushState: boolean;
};
declare global {
  interface Window { fbq?: Pixel; _fbq?: Pixel }
}
let ready = false;
let initialized = false;
let configured = false;
let currentPath: string | null = null;
let lastTrackedPath: string | null = null;

export function isPixelPage(pathname: string): boolean {
  return !["/account", "/admin", "/api", "/contact", "/order-book"].some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

function canTrack(): boolean {
  if (!currentPath || window.location.pathname !== currentPath || !isPixelPage(currentPath) || readCookieConsent() !== "accepted") return false;
  // Never include authentication tokens or personal details from query parameters.
  return !Array.from(new URL(window.location.href).searchParams.keys()).some((key) => /token|password|email|session|code|message/i.test(key));
}

function clearPixelCookies() {
  for (const name of ["_fbp", "_fbc"]) {
    for (const domain of ["", `; Domain=${window.location.hostname}`, "; Domain=.smahope.org"]) {
      try { document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain}`; } catch { /* Cookies may be blocked by the browser. */ }
    }
  }
}

function sendPageView() {
  const pixel = window.fbq;
  if (!pixel || !ready || !canTrack()) return;
  pixel("consent", "grant");
  if (lastTrackedPath !== currentPath) {
    // Basic page views only: no form contents, user details or custom health data.
    pixel("trackSingle", META_PIXEL_ID, "PageView");
    lastTrackedPath = currentPath;
  }
}

function loadPixel() {
  if (initialized) return;
  const pixel: Pixel = window.fbq ?? Object.assign(
    (...args: unknown[]) => {
      if (pixel.callMethod) pixel.callMethod(...args);
      else pixel.queue.push(args);
    },
    { queue: [] as unknown[][], loaded: true, version: "2.0", disablePushState: true },
  ) as Pixel;
  pixel.push = pixel;
  pixel.disablePushState = true;
  window.fbq = pixel;
  window._fbq = pixel;
  // Keep events revoked until the SDK has loaded and consent/route are rechecked.
  if (!configured) {
    pixel("consent", "revoke");
    pixel("set", "autoConfig", false, META_PIXEL_ID);
    pixel("init", META_PIXEL_ID);
    configured = true;
  }
  initialized = true;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.onload = () => { ready = true; sendPageView(); };
  script.onerror = () => {
    // A blocked tracker must not affect the page. Allow retry after a later choice/navigation.
    script.remove();
    initialized = false;
  };
  document.head.appendChild(script);
}

export function syncMetaPixel(pathname: string) {
  if (typeof window === "undefined") return;
  currentPath = pathname;
  if (!canTrack()) {
    window.fbq?.("consent", "revoke");
    lastTrackedPath = null;
    if (readCookieConsent() !== "accepted") clearPixelCookies();
    return;
  }
  if (!initialized) loadPixel();
  else sendPageView();
}
