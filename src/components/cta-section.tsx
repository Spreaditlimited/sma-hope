"use client";
import { captchaHeaders } from '@/lib/captcha-client';
import { CaptchaNotice } from '@/components/captcha-notice';
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
        headers: { "Content-Type": "application/json", ...await captchaHeaders("newsletter") },
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
    <section className="hope-newsletter" aria-labelledby="newsletter-heading">
      <div className="container newsletter-layout">
        <div>
          <p className="eyebrow">The SMA Hope newsletter</p>
          <h2 id="newsletter-heading">{headline}</h2>
          <p>{body}</p>
          <ul className="newsletter-benefits">
            <li><span className="newsletter-benefit-icon"><Icon name="book" size={21} /></span><div><h3>Guidance for everyday questions</h3><p>New guides on understanding SMA, care and family life.</p></div></li>
            <li><span className="newsletter-benefit-icon"><Icon name="file" size={21} /></span><div><h3>More ways to learn</h3><p>Free course updates and resources to read, watch and share.</p></div></li>
            <li><span className="newsletter-benefit-icon"><Icon name="people" size={21} /></span><div><h3>A closer connection to our work</h3><p>Foundation news and opportunities to support families in Nigeria.</p></div></li>
          </ul>
          <div className="newsletter-other-ways">
            <Link className="text-link" href={primary.href}>
              {primary.label}
              <Icon name="arrow" size={16} />
            </Link>
            {secondary && (
              <Link className="text-link" href={secondary.href}>
                {secondary.label} →
              </Link>
            )}
          </div>
        </div>
        <div className="newsletter-form">
          <div className="newsletter-form-top"><span className="newsletter-form-symbol"><Icon name="heart" size={23} /></span><span>Free to subscribe</span></div>
          <h3>Join the SMA Hope newsletter.</h3>
          <p>Leave your name and email, and we’ll keep you connected to useful information and the work ahead.</p>
          {success ? (
            <div className="newsletter-success" role="status">
              <Icon name="check" />
              <h4>You’re on the list.</h4>
              <p>Thank you for being part of the SMA Hope community.</p>
            </div>
          ) : (
            <form onSubmit={submit} aria-label="Subscribe to the SMA Hope newsletter" aria-busy={busy}>
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
                {busy ? "Subscribing…" : "Subscribe to the newsletter"}
                <Icon name="arrow" size={16} />
              </button>
              <p className="newsletter-privacy">
                By subscribing, you agree to receive emails from SMA Hope. Unsubscribe at any time.{" "}
                <Link href="/privacy-policy">Privacy policy</Link>
              </p>
              <CaptchaNotice />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
