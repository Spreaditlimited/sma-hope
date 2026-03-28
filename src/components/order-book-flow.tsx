"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type BuyerLocation = "nigeria" | "international";

type Props = {
  amazonUrl?: string;
  pricing?: {
    unitPriceNgn: number;
    vatPerUnitNgn: number;
    deliveryLagosNgn: number;
    deliveryOutsideLagosNgn: number;
  };
};

export function OrderBookFlow({ amazonUrl, pricing }: Props) {
  const BOOK_PRICE_NGN = Number(pricing?.unitPriceNgn || 15000);
  const BOOK_VAT_NGN = Number(pricing?.vatPerUnitNgn || 1125);
  const DELIVERY_LAGOS_NGN = Number(pricing?.deliveryLagosNgn || 0);
  const DELIVERY_OUTSIDE_LAGOS_NGN = Number(pricing?.deliveryOutsideLagosNgn || 3000);

  const searchParams = useSearchParams();
  const [location, setLocation] = useState<BuyerLocation>("nigeria");
  const [quantity, setQuantity] = useState(1);
  const [deliveryArea, setDeliveryArea] = useState<"" | "lagos" | "outside_lagos">("");
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
      const json = (await response.json().catch(() => null)) as
        | { message?: string; error?: string; authorizationUrl?: string }
        | null;
      if (!response.ok) {
        setFeedbackModal({
          type: "error",
          title: "Unable to continue",
          message: json?.error || "We could not start checkout right now. Please try again shortly.",
        });
        return;
      }

      if (!json?.authorizationUrl) {
        setFeedbackModal({
          type: "error",
          title: "Unable to continue",
          message: "Checkout was initialized, but no payment link was returned. Please try again.",
        });
        return;
      }

      window.location.assign(json.authorizationUrl);
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
  const unitTotal = BOOK_PRICE_NGN + BOOK_VAT_NGN;
  const booksTotal = unitTotal * quantity;
  const deliveryFee =
    deliveryArea === "outside_lagos"
      ? DELIVERY_OUTSIDE_LAGOS_NGN
      : deliveryArea === "lagos"
        ? DELIVERY_LAGOS_NGN
        : 0;
  const grandTotal = booksTotal + deliveryFee;

  function formatNgn(value: number) {
    return `N${value.toLocaleString()}`;
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
        | { ok?: boolean; error?: string; result?: { accountCreated?: boolean; fullName?: string } }
        | null;
      if (cancelled) return;

      if (!response.ok || !json?.ok) {
        setFeedbackModal({
          type: "success",
          title: "Thank you",
          message: "Your payment was received and is being confirmed. We will notify you shortly.",
        });
        return;
      }

      const payerName = String(json.result?.fullName || "").trim();
      setFeedbackModal({
        type: "success",
        title: payerName ? `Thank you ${payerName}` : "Thank you",
        message: "We are creating your account. You will be redirected shortly.",
      });
      const redirectUrl = json.result?.accountCreated ? "/account/login?setup=1" : "/account/login";
      window.setTimeout(() => {
        if (!cancelled) window.location.assign(redirectUrl);
      }, 2200);
    }

    completePayment().catch(() => {
      if (!cancelled) {
        setFeedbackModal({
          type: "success",
          title: "Thank you",
          message: "Your payment was received and is being confirmed. We will notify you shortly.",
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="order-book-shell">
      <section className="about-panel prose">
        <h2 className="section-heading-strong">Choose Your Purchase Route</h2>
        <p>
          Nigerian buyers can place a hard-copy pre-order now. International Amazon purchase will be enabled soon.
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
            aria-disabled="true"
            disabled
            className="donation-interval-option order-book-route-option opacity-60 cursor-not-allowed"
          >
            <span className="order-book-route-title">Outside Nigeria</span>
            <span className="order-book-route-subtitle">Coming soon on Amazon</span>
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
            Pre-ordered books will be dispatched from our Lagos office once the book is released on July 31, 2026.
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
                <input
                  id="order-quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                  required
                />
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
                <select
                  id="order-deliveryArea"
                  name="deliveryArea"
                  required
                  value={deliveryArea}
                  onChange={(event) => setDeliveryArea(event.target.value as "" | "lagos" | "outside_lagos")}
                  className="contact-purpose-select"
                >
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

            <div className="rounded-xl border border-[#d4e4ef] bg-[#edf5fb] p-4" style={{ marginTop: "1rem" }}>
              <h3 style={{ margin: 0, color: "#13384f", fontSize: "0.95rem", fontWeight: 700 }}>Price breakdown</h3>
              <div style={{ marginTop: "0.55rem", display: "grid", gap: "0.35rem", color: "#21465d", fontSize: "0.95rem" }}>
                <p style={{ margin: 0 }}><strong>Book Price:</strong> {formatNgn(BOOK_PRICE_NGN)} x {quantity}</p>
                <p style={{ margin: 0 }}><strong>VAT:</strong> {formatNgn(BOOK_VAT_NGN)} x {quantity}</p>
                <p style={{ margin: 0 }}><strong>Delivery:</strong> {deliveryArea === "outside_lagos" ? formatNgn(DELIVERY_OUTSIDE_LAGOS_NGN) : "N0"}</p>
                <p style={{ margin: "0.2rem 0 0", fontWeight: 800, color: "#0f557f" }}><strong>Total:</strong> {formatNgn(grandTotal)}</p>
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
