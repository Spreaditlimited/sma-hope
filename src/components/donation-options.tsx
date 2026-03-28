"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const nigeriaSuggested = [5000, 10000, 25000, 50000];
const intlSuggested = [20, 50, 100, 500];
type Location = "nigeria" | "international";
const internationalDonationsEnabled = process.env.NEXT_PUBLIC_ENABLE_INTERNATIONAL_DONATIONS === "true";

export function DonationOptions() {
  const searchParams = useSearchParams();
  const [location, setLocation] = useState<Location>("nigeria");
  const [amount, setAmount] = useState<number>(nigeriaSuggested[1]);
  const [interval, setInterval] = useState<"one_time" | "monthly">("one_time");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const [feedbackModal, setFeedbackModal] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const isNigeria = location === "nigeria";
  const suggested = isNigeria ? nigeriaSuggested : intlSuggested;
  const currency: "NGN" | "USD" = isNigeria ? "NGN" : "USD";
  const symbol = isNigeria ? "₦" : "$";

  function handleLocationChange(next: Location) {
    setLocation(next);
    setAmount(next === "nigeria" ? nigeriaSuggested[1] : intlSuggested[1]);
  }

  async function handleCheckout() {
    setErrorMessage("");
    if (!internationalDonationsEnabled && location === "international") {
      setErrorMessage("International donations in USD are coming soon. Please check back shortly.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }
    if (!amount || amount <= 0) {
      setErrorMessage("Enter a valid donation amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/payments/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          location,
          interval,
          amount,
          currency,
        }),
      });

      const json = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; authorizationUrl?: string }
        | null;

      if (!response.ok || !json?.ok || !json.authorizationUrl) {
        setErrorMessage(json?.error || "Unable to start checkout right now. Please try again.");
        return;
      }

      window.location.assign(json.authorizationUrl);
    } catch {
      setErrorMessage("Unable to reach checkout right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const status = searchParams.get("status");
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (status !== "success" || !reference) return;

    let cancelled = false;

    async function completePayment() {
      const response = await fetch("/api/payments/paystack/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const json = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; result?: { recurring?: boolean; accountCreated?: boolean; fullName?: string } }
        | null;

      if (cancelled) return;

      if (!response.ok || !json?.ok) {
        setPaymentNotice("Thank you. Your payment was received and is being confirmed.");
        return;
      }

      const payerName = String(json.result?.fullName || "").trim();
      setFeedbackModal({
        title: payerName ? `Thank you ${payerName}` : json.result?.recurring ? "Recurring donation activated" : "Thank you",
        message: "We are creating your donor account. You will be redirected shortly.",
      });

      const redirectUrl = json.result?.accountCreated ? "/account/login?setup=1" : "/account/login";
      window.setTimeout(() => {
        if (!cancelled) window.location.assign(redirectUrl);
      }, 2200);
    }

    completePayment().catch(() => {
      if (!cancelled) {
        setPaymentNotice("Thank you. Your payment was received and is being confirmed.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="donation-card">
      <h3 className="donation-title">Choose how you wish to support</h3>
      <p className="donation-intro">
        Select your location first. We will show the right currency, suggested amounts, and payment provider.
      </p>

      <section className="donation-group">
        <p className="donation-label">Location</p>
        <div className="donation-location-grid">
          <button
            type="button"
            className={`btn btn-secondary donation-chip ${isNigeria ? "is-active" : ""}`}
            onClick={() => handleLocationChange("nigeria")}
          >
            I am in Nigeria
          </button>
          <button
            type="button"
            className={`btn btn-secondary donation-chip ${!isNigeria ? "is-active" : ""}`}
            onClick={() => {
              if (!internationalDonationsEnabled) {
                setErrorMessage("International donations in USD are coming soon. Please check back shortly.");
                return;
              }
              handleLocationChange("international");
            }}
            disabled={!internationalDonationsEnabled}
          >
            I am outside Nigeria {!internationalDonationsEnabled ? "(Coming soon)" : ""}
          </button>
        </div>
      </section>

      <section className="donation-group">
        <p className="donation-provider">
          Available provider: <strong>Paystack</strong>
        </p>
        <p className="donation-currency-note">Suggested amounts in {currency}</p>

        <div className="donation-amount-grid">
          {suggested.map((value) => (
            <button
              key={value}
              type="button"
              className={`btn btn-secondary donation-chip ${amount === value ? "is-active" : ""}`}
              onClick={() => setAmount(value)}
            >
              {symbol}
              {value.toLocaleString()}
            </button>
          ))}
        </div>
      </section>

      <section className="donation-group">
        <label htmlFor="amount" className="donation-label">
          Custom amount ({currency})
        </label>
        <input
          id="amount"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={String(amount)}
          onChange={(event) => {
            const digitsOnly = event.target.value.replace(/[^\d]/g, "");
            setAmount(Number(digitsOnly || 0));
          }}
        />
      </section>

      <section className="donation-group">
        <label htmlFor="donation-name" className="donation-label">
          Full name (optional)
        </label>
        <input
          id="donation-name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
        />
      </section>

      <section className="donation-group">
        <label htmlFor="donation-email" className="donation-label">
          Email address
        </label>
        <input
          id="donation-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </section>

      <section className="donation-group">
        <p className="donation-label">Donation type</p>
        <div className="donation-interval-picker" role="radiogroup" aria-label="Donation type">
          <button
            type="button"
            role="radio"
            aria-checked={interval === "one_time"}
            className={`donation-interval-option ${interval === "one_time" ? "is-active" : ""}`}
            onClick={() => setInterval("one_time")}
          >
            One-time support
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={interval === "monthly"}
            className={`donation-interval-option ${interval === "monthly" ? "is-active" : ""}`}
            onClick={() => setInterval("monthly")}
          >
            Recurring monthly support
          </button>
        </div>
      </section>

      <div className="donation-actions">
        <button
          type="button"
          className="btn btn-primary donation-submit"
          onClick={handleCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Starting Checkout..." : "Continue with Paystack"}
        </button>
      </div>

      {paymentNotice ? <p className="donation-footnote" style={{ color: "#0c4669" }}>{paymentNotice}</p> : null}
      {errorMessage ? <p className="donation-footnote" style={{ color: "#9b1c1c" }}>{errorMessage}</p> : null}

      <div style={{ textAlign: "center" }}>
        <p className="donation-footnote">Payments in Nigeria are processed in NGN through Paystack.</p>
        <p className="donation-footnote">Secure payments powered by Paystack.</p>
      </div>

      {feedbackModal ? (
        <div className="cta-modal-backdrop" role="presentation" onClick={() => setFeedbackModal(null)}>
          <div
            className="cta-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="donation-modal-title" className="cta-modal-title">
              {feedbackModal.title}
            </h3>
            <p style={{ margin: "0.65rem 0 0", color: "var(--text-soft)" }}>{feedbackModal.message}</p>
            <button type="button" className="btn cta-modal-btn" onClick={() => setFeedbackModal(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
