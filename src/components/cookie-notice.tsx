"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { COOKIE_SETTINGS_EVENT, readCookieConsent, readAnalyticsConsent, readGoogleAdsConsent, saveCookieConsent, type CookieConsent } from "@/lib/cookie-consent";

export function CookieNotice() {
  const [open, setOpen] = useState(false);
  const notice = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(readCookieConsent() === null || readAnalyticsConsent() === null || readGoogleAdsConsent() === null), 0);
    const showSettings = () => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, showSettings);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, showSettings);
    };
  }, []);

  useEffect(() => {
    if (open && opener.current) notice.current?.querySelector("button")?.focus();
  }, [open]);

  function handleChoice(value: CookieConsent) {
    saveCookieConsent(value);
    setOpen(false);
    opener.current?.focus();
    opener.current = null;
  }

  if (!open) return null;
  return (
    <aside ref={notice} className="cookie-notice" role="dialog" aria-live="polite" aria-label="Cookie notice">
      <p className="cookie-notice-title">Cookie Notice</p>
      <p className="cookie-notice-body">
        We use essential cookies to keep this website functional. With your permission, Google Analytics measures visits to public pages, Google Ads links completed learning registrations to ad clicks, and Meta measures our campaigns on Facebook and Instagram. Optional measurement does not include your name, email, medical information or quiz answers.
      </p>
      <div className="cookie-notice-actions">
        <button type="button" className="btn btn-secondary" onClick={() => handleChoice("declined")}>Decline optional</button>
        <button type="button" className="btn btn-primary" onClick={() => handleChoice("accepted")}>Accept all</button>
      </div>
      <p className="cookie-notice-link"><Link href="/privacy-policy#cookies">Read cookie details</Link></p>
    </aside>
  );
}
