"use client";

import { useState } from "react";

const purposes = [
  "General enquiry",
  "Family support",
  "Book enquiry",
  "Partnership / collaboration",
  "Donation enquiry",
  "Media / speaking invitation",
] as const;

export function ContactForm() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formStart] = useState(() => Date.now());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      organisation: formData.get("organisation"),
      purpose: formData.get("purpose"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      company: formData.get("company"),
      formStartedAt: formStart,
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (response.ok) {
      event.currentTarget.reset();
      setStatus("Your message has been sent.");
    } else {
      setStatus("We could not send your message right now. Please try again shortly.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: "1rem" }}>
      <div className="grid-2">
        <div>
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" required />
        </div>
        <div>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="phone">Phone number (optional)</label>
          <input id="phone" name="phone" />
        </div>
        <div>
          <label htmlFor="organisation">Organisation name (optional)</label>
          <input id="organisation" name="organisation" />
        </div>
      </div>
      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor="purpose">Purpose of enquiry</label>
        <select id="purpose" name="purpose" required>
          {purposes.map((purpose) => (
            <option value={purpose} key={purpose}>
              {purpose}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor="subject">Subject</label>
        <input id="subject" name="subject" required />
      </div>
      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={7} required />
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
      <button disabled={loading} type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
        {loading ? "Sending..." : "Send Message"}
      </button>
      {status ? <p aria-live="polite">{status}</p> : null}
    </form>
  );
}
