"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BuyerLocation = "nigeria" | "international";

type Props = {
  amazonUrl?: string;
};

export function OrderBookFlow({ amazonUrl }: Props) {
  const [location, setLocation] = useState<BuyerLocation>("nigeria");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  async function handleNigeriaCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackModal(null);
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      fullName: String(formData.get("fullName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      quantity: Number(formData.get("quantity") || 1),
      city: String(formData.get("city") || "").trim(),
      state: String(formData.get("state") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      deliveryArea: String(formData.get("deliveryArea") || "").trim(),
      note: String(formData.get("note") || "").trim(),
    };

    try {
      const response = await fetch("/api/payments/book/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;
      if (!response.ok) {
        setFeedbackModal({
          type: "error",
          title: "Unable to continue",
          message: json?.error || "We could not start checkout right now. Please try again shortly.",
        });
        return;
      }

      setFeedbackModal({
        type: "success",
        title: "Checkout Initialized",
        message:
          json?.message ||
          "Your book order checkout has been initialized. You will be guided to complete payment securely.",
      });
      form.reset();
    } catch {
      setFeedbackModal({
        type: "error",
        title: "Unable to continue",
        message: "We could not reach checkout right now. Please refresh the page and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasAmazonUrl = Boolean(amazonUrl && amazonUrl.trim());

  return (
    <div className="order-book-shell">
      <section className="about-panel prose">
        <h2 className="section-heading-strong">Choose Your Purchase Route</h2>
        <p>
          International readers can purchase on Amazon. Nigerian buyers can place a hard-copy order for dispatch from our Lagos office.
        </p>
        <div className="order-book-location-grid donation-interval-picker order-book-route-picker" role="radiogroup" aria-label="Buyer location">
          <button
            type="button"
            role="radio"
            aria-checked={location === "nigeria"}
            className={`donation-interval-option order-book-route-option ${location === "nigeria" ? "is-active" : ""}`}
            onClick={() => setLocation("nigeria")}
          >
            <span className="order-book-route-title">Nigeria</span>
            <span className="order-book-route-subtitle">Pay in naira, local dispatch</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={location === "international"}
            className={`donation-interval-option order-book-route-option ${location === "international" ? "is-active" : ""}`}
            onClick={() => setLocation("international")}
          >
            <span className="order-book-route-title">Outside Nigeria</span>
            <span className="order-book-route-subtitle">Buy securely on Amazon</span>
          </button>
        </div>
      </section>

      {location === "international" ? (
        <section className="about-panel prose">
          <h2 className="section-heading-strong">International Purchase</h2>
          <p>
            The international edition is listed on Amazon. Use the button below to complete your purchase securely on Amazon.
          </p>
          <p className="order-book-note">
            <strong>Price:</strong> $20
          </p>
          {hasAmazonUrl ? (
            <a href={amazonUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              Buy on Amazon
            </a>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                setFeedbackModal({
                  type: "success",
                  title: "Coming soon",
                  message: "Amazon purchase will be available soon. Please check back shortly.",
                })
              }
            >
              Buy on Amazon
            </button>
          )}
        </section>
      ) : (
        <section className="about-panel prose">
          <h2 className="section-heading-strong">Nigeria Hard-Copy Order</h2>
          <p>
            Hard copies are dispatched from our Lagos office. General delivery timeline is <strong>2 to 5 business days</strong>. Fulfillment will be handled with <strong>Fez Delivery</strong>.
          </p>
          <p className="order-book-note">
            <strong>Price:</strong> N15,000
          </p>
          <form className="order-book-form" onSubmit={handleNigeriaCheckout}>
            <div className="grid-2">
              <div>
                <label htmlFor="order-fullName">Full name</label>
                <input id="order-fullName" name="fullName" required />
              </div>
              <div>
                <label htmlFor="order-email">Email address</label>
                <input id="order-email" name="email" type="email" required />
              </div>
              <div>
                <label htmlFor="order-phone">Phone number</label>
                <input id="order-phone" name="phone" required />
              </div>
              <div>
                <label htmlFor="order-quantity">Quantity</label>
                <input id="order-quantity" name="quantity" type="number" min={1} defaultValue={1} required />
              </div>
              <div>
                <label htmlFor="order-city">City</label>
                <input id="order-city" name="city" required />
              </div>
              <div>
                <label htmlFor="order-state">State</label>
                <input id="order-state" name="state" required />
              </div>
            </div>

            <div style={{ marginTop: "0.8rem" }}>
              <label htmlFor="order-address">Delivery address</label>
              <textarea id="order-address" name="address" rows={3} required />
            </div>

            <div className="grid-2" style={{ marginTop: "0.8rem" }}>
              <div>
                <label htmlFor="order-deliveryArea">Delivery zone</label>
                <select id="order-deliveryArea" name="deliveryArea" required defaultValue="" className="contact-purpose-select">
                  <option value="" disabled>
                    Select delivery zone
                  </option>
                  <option value="lagos">Within Lagos</option>
                  <option value="outside_lagos">Outside Lagos</option>
                </select>
              </div>
              <div>
                <label htmlFor="order-note">Order note (optional)</label>
                <input id="order-note" name="note" />
              </div>
            </div>

            <div className="section-actions order-book-actions" style={{ marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Starting Checkout..." : "Continue with Paystack"}
              </button>
              <Link href="/contact" className="btn btn-secondary">
                Need Help Ordering?
              </Link>
            </div>
          </form>
        </section>
      )}

      {feedbackModal ? (
        <div className="cta-modal-backdrop" role="presentation" onClick={() => setFeedbackModal(null)}>
          <div
            className="cta-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-book-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="order-book-modal-title" className="cta-modal-title">
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
