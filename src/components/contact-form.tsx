"use client";

import { useState } from "react";

const purposes = [
  { value: "General enquiry", label: "General Enquiries & Guidance" },
  { value: "Family support", label: "Family Care & Support" },
  { value: "Book enquiry", label: "Book Enquiries & Orders" },
  { value: "Partnership / collaboration", label: "Partnerships & Strategic Collaboration" },
  { value: "Donation enquiry", label: "Giving, Sponsorship & Philanthropy" },
  { value: "Media / speaking invitation", label: "Media & Speaking Invitations" },
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
        <label htmlFor="purpose">How can we best support your enquiry?</label>
        <select id="purpose" name="purpose" required defaultValue="" className="contact-purpose-select">
          <option value="" disabled>
            Select an enquiry category
          </option>
          {purposes.map((purpose) => (
            <option value={purpose.value} key={purpose.value}>
              {purpose.label}
            </option>
          ))}
        </select>
        <p className="contact-purpose-hint">Select the category that best matches your request for priority routing.</p>
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
