"use client";

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
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

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

    if (!deliveryArea) {
      setFeedbackModal({
        type: "error",
        title: "Missing Information",
        message: "Please select a delivery zone (Lagos or Outside Lagos) to calculate shipping.",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      quantity,
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      deliveryArea: deliveryArea.trim(),
      note: note.trim(),
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
    return `₦${value.toLocaleString()}`;
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
        title: payerName ? `Thank you, ${payerName}` : "Thank you",
        message: "We are confirming your order. You will be redirected shortly.",
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

  // Shared Premium Styles
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-[#d9e1e6] bg-[#f8f8f6] text-[#102637] placeholder-[#8da2b3] focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium";
  const labelClass = "block text-xs font-bold text-[#42586a] uppercase tracking-wider mb-2 pl-1";

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(16,37,55,0.06)] border border-[#eef3f5] p-6 sm:p-8 md:p-12">
      
      {/* Header & Location Toggle */}
      <div className="mb-10 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#102637] mb-6">Choose Your Purchase Route</h2>
        
        <div className="flex p-1.5 bg-[#f8f8f6] rounded-xl border border-[#eef3f5] max-w-md mx-auto">
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
              location === "nigeria" ? "bg-white text-[#102637] shadow-sm ring-1 ring-black/5" : "text-[#8da2b3] hover:text-[#42586a]"
            }`}
            onClick={() => setLocation("nigeria")}
          >
            Nigeria
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
              location === "international" ? "bg-white text-[#102637] shadow-sm ring-1 ring-black/5" : "text-[#8da2b3] hover:text-[#42586a]"
            }`}
            onClick={() => setLocation("international")}
          >
            International
          </button>
        </div>
      </div>

      {location === "international" ? (
        /* INTERNATIONAL STATE */
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#fdfcf8] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#f5ead2]">
            <svg className="w-8 h-8 text-[var(--accent-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#102637] mb-3">Available globally via Amazon</h3>
          <p className="text-[#42586a] mb-8 max-w-md mx-auto leading-relaxed">
            The international edition will be securely listed on Amazon. Purchasing is not yet open.
          </p>
          
          {hasAmazonUrl ? (
            <a href={amazonUrl} target="_blank" rel="noreferrer" className="btn btn-primary px-8 py-3.5 shadow-md hover:-translate-y-0.5 transition-all">
              Buy on Amazon
            </a>
          ) : (
            <button
              type="button"
              className="btn btn-primary px-8 py-3.5 opacity-60 cursor-not-allowed"
              disabled
            >
              Amazon link coming soon
            </button>
          )}
        </div>
      ) : (
        /* NIGERIA CHECKOUT FORM */
        <form onSubmit={handleNigeriaCheckout} className="space-y-10">
          
          {/* Section 1: Contact Details */}
          <div>
            <h3 className="text-lg font-bold text-[#102637] mb-4 pb-2 border-b border-[#eef3f5]">1. Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label htmlFor="order-fullName" className={labelClass}>Full Name</label>
                <input id="order-fullName" name="fullName" type="text" className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="order-email" className={labelClass}>Email Address</label>
                <input id="order-email" name="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="order-phone" className={labelClass}>Phone Number</label>
                <input id="order-phone" name="phone" type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping */}
          <div>
            <h3 className="text-lg font-bold text-[#102637] mb-4 pb-2 border-b border-[#eef3f5]">2. Shipping Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label htmlFor="order-address" className={labelClass}>Delivery Address</label>
                <input id="order-address" name="address" type="text" className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="order-city" className={labelClass}>City</label>
                <input id="order-city" name="city" type="text" className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="order-state" className={labelClass}>State</label>
                <input id="order-state" name="state" type="text" className={inputClass} value={state} onChange={(e) => setState(e.target.value)} required />
              </div>

              {/* Enhanced Delivery Zone Selector */}
              <div className="md:col-span-2 mt-2">
                <label className={labelClass}>Select Delivery Zone</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryArea === "lagos" ? "border-[var(--primary)] bg-[#f4f9fd]" : "border-[#eef3f5] bg-white hover:border-[#dce8f2]"}`}
                    onClick={() => setDeliveryArea("lagos")}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${deliveryArea === "lagos" ? "text-[var(--primary-strong)]" : "text-[#102637]"}`}>Within Lagos</span>
                      <span className="font-bold text-[#42586a]">{DELIVERY_LAGOS_NGN === 0 ? "Free" : formatNgn(DELIVERY_LAGOS_NGN)}</span>
                    </div>
                    <p className="text-xs text-[#8da2b3]">Local dispatch routing.</p>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryArea === "outside_lagos" ? "border-[var(--primary)] bg-[#f4f9fd]" : "border-[#eef3f5] bg-white hover:border-[#dce8f2]"}`}
                    onClick={() => setDeliveryArea("outside_lagos")}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${deliveryArea === "outside_lagos" ? "text-[var(--primary-strong)]" : "text-[#102637]"}`}>Outside Lagos</span>
                      <span className="font-bold text-[#42586a]">{formatNgn(DELIVERY_OUTSIDE_LAGOS_NGN)}</span>
                    </div>
                    <p className="text-xs text-[#8da2b3]">Inter-state dispatch routing.</p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 mt-2">
                <label htmlFor="order-note" className={labelClass}>Order Note <span className="normal-case text-[#8da2b3]">(Optional)</span></label>
                <input id="order-note" name="note" type="text" className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any special delivery instructions?" />
              </div>
            </div>
          </div>

          {/* Section 3: Order Summary */}
          <div className="bg-[#f8f8f6] rounded-[1.5rem] p-6 sm:p-8 border border-[#eef3f5]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b border-[#dce8f2] gap-4">
              <h3 className="text-lg font-bold text-[#102637]">Order Summary</h3>
              
              {/* Premium Quantity Stepper */}
              <div className="flex items-center bg-white border border-[#dce8f2] rounded-lg overflow-hidden shadow-sm w-fit">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-[#42586a] hover:bg-[#f4f9fd] hover:text-[var(--primary)] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                </button>
                <div className="px-4 py-2 font-bold text-[#102637] min-w-[3rem] text-center bg-[#fcfcfc] border-x border-[#dce8f2]">
                  {quantity}
                </div>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-[#42586a] hover:bg-[#f4f9fd] hover:text-[var(--primary)] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            <div className="space-y-3 text-[0.95rem] text-[#42586a]">
              <div className="flex justify-between items-center">
                <span>When Every Breath Matters (x{quantity})</span>
                <span className="font-medium text-[#102637]">{formatNgn(BOOK_PRICE_NGN * quantity)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>VAT (7.5%)</span>
                <span className="font-medium text-[#102637]">{formatNgn(BOOK_VAT_NGN * quantity)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping {deliveryArea === "lagos" ? "(Lagos)" : deliveryArea === "outside_lagos" ? "(Outside Lagos)" : ""}</span>
                <span className="font-medium text-[#102637]">{deliveryArea ? formatNgn(deliveryFee) : "—"}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#dce8f2] flex justify-between items-center">
              <span className="text-lg font-bold text-[#102637]">Total</span>
              <span className="text-2xl font-extrabold text-[var(--primary-strong)]">{formatNgn(grandTotal)}</span>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-[#102637] hover:bg-[var(--primary-strong)] text-white font-bold text-lg shadow-[0_10px_25px_rgba(16,37,55,0.15)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {isSubmitting ? "Initiating Secure Checkout..." : `Pay ${formatNgn(grandTotal)} securely`}
            </button>
            <div className="mt-4 text-center">
              <p className="text-xs text-[#8da2b3] font-medium uppercase tracking-wider">
                Payments processed securely via Paystack
              </p>
            </div>
          </div>

        </form>
      )}

      {/* Shared Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102637]/40 backdrop-blur-sm p-4 transition-opacity" role="presentation" onClick={() => setFeedbackModal(null)}>
          <div
            className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-[#eef3f5] transform transition-all"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-book-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${feedbackModal.type === "success" ? "bg-[#f4f9fd] text-[var(--primary)]" : "bg-[#fff5f5] text-[#9b1c1c]"}`}>
              {feedbackModal.type === "success" ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              )}
            </div>
            <h3 id="order-book-modal-title" className="text-2xl font-bold text-[#102637] mb-2 text-balance">
              {feedbackModal.title}
            </h3>
            <p className="text-[#42586a] text-sm mb-8 leading-relaxed text-balance">
              {feedbackModal.message}
            </p>
            <button type="button" className={`btn w-full py-3.5 text-white ${feedbackModal.type === "success" ? "bg-[var(--primary)] hover:bg-[var(--primary-strong)]" : "bg-[#102637] hover:bg-black"}`} onClick={() => setFeedbackModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
