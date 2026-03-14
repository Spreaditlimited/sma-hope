"use client";

import { useState } from "react";

const suggested = [5000, 10000, 25000, 50000];

export function DonationOptions() {
  const [amount, setAmount] = useState<number>(10000);
  const [interval, setInterval] = useState<"one_time" | "monthly">("one_time");

  return (
    <div className="card" style={{ padding: "1.1rem" }}>
      <h3 style={{ marginTop: 0 }}>Choose your support amount</h3>
      <p style={{ color: "var(--text-soft)" }}>Suggested amounts are in NGN. You can enter a custom amount.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.8rem" }}>
        {suggested.map((value) => (
          <button
            key={value}
            type="button"
            className="btn btn-secondary"
            onClick={() => setAmount(value)}
            style={amount === value ? { borderColor: "var(--primary)", color: "var(--primary)" } : undefined}
          >
            ₦{value.toLocaleString()}
          </button>
        ))}
      </div>
      <label htmlFor="amount">Custom amount (NGN)</label>
      <input id="amount" type="number" min={1000} step={500} value={amount} onChange={(event) => setAmount(Number(event.target.value || 0))} />
      <div style={{ marginTop: "0.8rem", marginBottom: "0.8rem" }}>
        <label htmlFor="interval">Donation type</label>
        <select id="interval" value={interval} onChange={(event) => setInterval(event.target.value as "one_time" | "monthly") }>
          <option value="one_time">One-time support</option>
          <option value="monthly">Recurring monthly support</option>
        </select>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
        <button type="button" className="btn btn-primary">Donate from Nigeria (Paystack)</button>
        <button type="button" className="btn btn-secondary">Donate Internationally (Stripe)</button>
      </div>
      <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: 0 }}>
        Payment integrations are scaffolded for live keys via environment variables.
      </p>
    </div>
  );
}
