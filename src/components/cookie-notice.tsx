"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_COOKIE = "smahope_cookie_consent";
const CONSENT_AGE_SECONDS = 60 * 60 * 24 * 180;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookieValue(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${CONSENT_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

export function CookieNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = getCookieValue(CONSENT_COOKIE);
    const timer = window.setTimeout(() => setOpen(!saved), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleChoice(value: "accepted" | "declined") {
    setCookieValue(CONSENT_COOKIE, value);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <aside className="cookie-notice" role="dialog" aria-live="polite" aria-label="Cookie notice">
      <p className="cookie-notice-title">Cookie Notice</p>
      <p className="cookie-notice-body">
        We use essential cookies to keep this website functional. We would also like to use optional cookies to improve experience.
      </p>
      <div className="cookie-notice-actions">
        <button type="button" className="btn btn-secondary" onClick={() => handleChoice("declined")}>
          Decline optional
        </button>
        <button type="button" className="btn btn-primary" onClick={() => handleChoice("accepted")}>
          Accept all
        </button>
      </div>
      <p className="cookie-notice-link">
        <Link href="/privacy-policy#cookies">Read cookie details</Link>
      </p>
    </aside>
  );
}
