"use client";

import { useEffect, useState } from "react";

const purposes = [
  { value: "General enquiry", label: "General Enquiries & Guidance" },
  { value: "Family support", label: "Family Care & Support" },
  { value: "Book enquiry", label: "Book Enquiries & Orders" },
  { value: "Partnership / collaboration", label: "Partnerships & Strategic Collaboration" },
  { value: "Donation enquiry", label: "Giving, Sponsorship & Philanthropy" },
  { value: "Media / speaking invitation", label: "Media & Speaking Invitations" },
] as const;

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [formStart] = useState(() => Date.now());
  const [feedbackModal, setFeedbackModal] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!feedbackModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFeedbackModal(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedbackModal]);

  function getFriendlyErrorMessage(raw?: string) {
    if (!raw) return "We could not send your message right now. Please try again shortly.";
    if (raw.toLowerCase().includes("submission blocked")) {
      return "Your request could not be submitted yet. Please wait a moment and try again.";
    }
    if (raw.toLowerCase().includes("missing required")) {
      return "Please complete all required fields and try again.";
    }
    if (raw.toLowerCase().includes("invalid email")) {
      return "Please enter a valid email address and try again.";
    }
    return raw;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedbackModal(null);
    const form = event.currentTarget;

    const formData = new FormData(form);
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

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await response.json().catch(() => null)) as { error?: string } | null;

      if (response.ok) {
        form.reset();
        setFeedbackModal({
          type: "success",
          title: "Message sent",
          message: "Thank you for reaching out. Your message has been sent successfully.",
        });
      } else {
        setFeedbackModal({
          type: "error",
          title: "Unable to send message",
          message: getFriendlyErrorMessage(json?.error),
        });
      }
    } catch (error) {
      const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
      const errorMessage = error instanceof Error ? error.message : "";
      setFeedbackModal({
        type: "error",
        title: "Unable to send message",
        message: isOffline
          ? "You appear to be offline. Please reconnect to the internet and try again."
          : errorMessage.toLowerCase().includes("failed to fetch")
            ? "We could not reach our contact service right now. Please refresh the page and try again in a moment."
            : "Something went wrong while sending your message. Please try again shortly.",
      });
    } finally {
      setLoading(false);
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

      {feedbackModal ? (
        <div className="cta-modal-backdrop" role="presentation" onClick={() => setFeedbackModal(null)}>
          <div
            className="cta-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            onClick={(modalEvent) => modalEvent.stopPropagation()}
          >
            <h3 id="contact-modal-title" className="cta-modal-title">
              {feedbackModal.title}
            </h3>
            <p style={{ margin: "0.65rem 0 0", color: "var(--text-soft)" }}>{feedbackModal.message}</p>
            <button type="button" className="btn cta-modal-btn" onClick={() => setFeedbackModal(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
