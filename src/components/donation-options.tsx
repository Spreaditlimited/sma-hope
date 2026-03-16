"use client";

import { useState } from "react";

const nigeriaSuggested = [5000, 10000, 25000, 50000];
const intlSuggested = [20, 50, 100, 500];
type Location = "nigeria" | "international";

export function DonationOptions() {
  const [location, setLocation] = useState<Location>("nigeria");
  const [amount, setAmount] = useState<number>(nigeriaSuggested[1]);
  const [interval, setInterval] = useState<"one_time" | "monthly">("one_time");
  const isNigeria = location === "nigeria";
  const suggested = isNigeria ? nigeriaSuggested : intlSuggested;
  const currency = isNigeria ? "NGN" : "USD";
  const symbol = isNigeria ? "₦" : "$";

  function handleLocationChange(next: Location) {
    setLocation(next);
    setAmount(next === "nigeria" ? nigeriaSuggested[1] : intlSuggested[1]);
  }

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
            onClick={() => handleLocationChange("international")}
          >
            I am outside Nigeria
          </button>
        </div>
      </section>

      <section className="donation-group">
        <p className="donation-provider">
          Available provider: <strong>{isNigeria ? "Paystack" : "Stripe"}</strong>
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
        >
          {isNigeria ? "Continue with Paystack" : "Continue with Stripe"}
        </button>
      </div>

      <p className="donation-footnote">
        {isNigeria
          ? "Payments in Nigeria are processed through Paystack."
          : "International payments and recurring support are processed through Stripe."}
      </p>
    </div>
  );
}
