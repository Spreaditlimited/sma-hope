"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Icon } from "@/components/icon";
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [started, setStarted] = useState(() => Date.now());
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || "").trim(),
          email: String(data.get("email") || "").trim(),
          company: String(data.get("company") || ""),
          formStartedAt: started,
        }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(json?.error || "We couldn’t subscribe you. Please try again.");
      setSuccess(true);
      form.reset();
      setStarted(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="hope-newsletter">
      <div className="container newsletter-layout">
        <div>
          <p className="eyebrow">There is a place for you in this story</p>
          <h2>{headline}</h2>
          <p>{body}</p>
          <div className="button-row">
            <Link className="btn btn-primary" href={primary.href}>
              {primary.label}
              <Icon name="heart" size={16} />
            </Link>
            {secondary && (
              <Link className="text-link" href={secondary.href}>
                {secondary.label} →
              </Link>
            )}
          </div>
        </div>
        <div className="newsletter-form">
          <p className="eyebrow">Stay connected</p>
          <h3>
            A little more understanding,
            <br />
            in your inbox.
          </h3>
          <p>Receive foundation news, thoughtful guides, and ways to stand with families.</p>
          {success ? (
            <div className="newsletter-success" role="status">
              <Icon name="check" />
              <h4>You’re on the list.</h4>
              <p>Thank you for being part of the SMA Hope community.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <input
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="honeypot"
              />
              <div className="newsletter-fields">
                <label htmlFor="newsletter-name">
                  First name
                  <input
                    id="newsletter-name"
                    name="name"
                    autoComplete="given-name"
                    required
                    placeholder="Your first name"
                  />
                </label>
                <label htmlFor="newsletter-email">
                  Email address
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? "Joining…" : "Join our community"}
                <Icon name="arrow" size={16} />
              </button>
              <p className="newsletter-privacy">
                By subscribing, you agree to receive emails from SMA Hope. Unsubscribe at any time.{" "}
                <Link href="/privacy-policy">Privacy policy</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
