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
    if (next === "nigeria") setInterval("one_time");
  }

  return (
    <div className="card" style={{ padding: "1.1rem" }}>
      <h3 style={{ marginTop: 0, marginBottom: "0.6rem" }}>Choose how you wish to support</h3>
      <p style={{ color: "var(--text-soft)", marginBottom: "0.7rem" }}>
        Select your location first. We will show the right currency, suggested amounts, and payment provider.
      </p>

      <div style={{ display: "grid", gap: "0.55rem", marginBottom: "0.9rem" }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleLocationChange("nigeria")}
          style={isNigeria ? { borderColor: "var(--primary)", color: "var(--primary)" } : undefined}
        >
          I am in Nigeria
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleLocationChange("international")}
          style={!isNigeria ? { borderColor: "var(--primary)", color: "var(--primary)" } : undefined}
        >
          I am outside Nigeria
        </button>
      </div>

      <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>
        Available provider: {isNigeria ? "Paystack" : "Stripe"}
      </p>
      <p style={{ color: "var(--text-soft)", marginBottom: "0.7rem" }}>
        Suggested amounts in {currency}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.8rem" }}>
        {suggested.map((value) => (
          <button
            key={value}
            type="button"
            className="btn btn-secondary"
            onClick={() => setAmount(value)}
            style={amount === value ? { borderColor: "var(--primary)", color: "var(--primary)" } : undefined}
          >
            {symbol}
            {value.toLocaleString()}
          </button>
        ))}
      </div>

      <label htmlFor="amount">Custom amount ({currency})</label>
      <input
        id="amount"
        type="number"
        min={isNigeria ? 1000 : 5}
        step={isNigeria ? 500 : 5}
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value || 0))}
      />

      <div style={{ marginTop: "0.8rem", marginBottom: "0.8rem" }}>
        <label htmlFor="interval">Donation type</label>
        <select
          id="interval"
          value={interval}
          onChange={(event) => setInterval(event.target.value as "one_time" | "monthly")}
          disabled={isNigeria}
        >
          <option value="one_time">One-time support</option>
          <option value="monthly">Recurring monthly support</option>
        </select>
        {isNigeria ? (
          <p style={{ marginTop: "0.45rem", fontSize: "0.84rem", color: "var(--text-soft)" }}>
            Recurring support will be enabled for Nigeria in a future update.
          </p>
        ) : null}
      </div>

      <button type="button" className="btn btn-primary">
        {isNigeria ? "Continue with Paystack" : "Continue with Stripe"}
      </button>

      <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: 0 }}>
        {isNigeria
          ? "Payments in Nigeria are processed through Paystack."
          : "International payments and recurring support are processed through Stripe."}
      </p>
    </div>
  );
}
