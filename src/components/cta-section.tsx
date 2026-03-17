"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export function CTASection({
  headline,
  body,
  primary,
  secondary,
}: {
  headline: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!showSuccessModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSuccessModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSuccessModal]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      formStartedAt,
    };

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(json?.error || "Unable to subscribe right now. Please try again.");
        return;
      }

      form.reset();
      setFormStartedAt(Date.now());
      setShowSuccessModal(true);
    } catch {
      setError("Unable to subscribe right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="container card cta-shell">
        <div className="cta-main">
          <h2 className="cta-title">{headline}</h2>
          <p className="cta-body">{body}</p>
          <div className="cta-actions">
            <Link href={primary.href} className="btn cta-btn-primary">
              {primary.label}
            </Link>
            {secondary ? (
              <Link href={secondary.href} className="btn cta-btn-secondary">
                {secondary.label}
              </Link>
            ) : null}
          </div>
        </div>
        <form className="cta-signup-form" onSubmit={handleSubmit} noValidate>
          <h3 className="cta-signup-title">Be part of the mission</h3>
          <p className="cta-signup-copy">
            Join our email list for updates, awareness resources, and ways to stand with families affected by SMA.
          </p>
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="cta-signup-honeypot"
          />
          <label className="cta-signup-label" htmlFor="cta-name">
            Name
          </label>
          <input id="cta-name" name="name" type="text" autoComplete="name" required className="cta-signup-input" />
          <label className="cta-signup-label" htmlFor="cta-email">
            Email
          </label>
          <input id="cta-email" name="email" type="email" autoComplete="email" required className="cta-signup-input" />
          {error ? <p className="cta-signup-error">{error}</p> : null}
          <button type="submit" className="btn cta-signup-btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>

      {showSuccessModal ? (
        <div className="cta-modal-backdrop" role="presentation" onClick={() => setShowSuccessModal(false)}>
          <div
            className="cta-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cta-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="cta-modal-title" className="cta-modal-title">
              Thank you for subscribing.
            </h3>
            <button type="button" className="btn cta-modal-btn" onClick={() => setShowSuccessModal(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
