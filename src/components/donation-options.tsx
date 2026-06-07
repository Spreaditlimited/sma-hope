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
  const [customAmount, setCustomAmount] = useState("");
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
    if (!internationalDonationsEnabled && next === "international") {
      setErrorMessage("International donations in USD are coming soon. Please check back shortly.");
      return;
    }
    setLocation(next);
    setAmount(next === "nigeria" ? nigeriaSuggested[1] : intlSuggested[1]);
    setCustomAmount("");
    setErrorMessage("");
  }

  async function handleCheckout() {
    setErrorMessage("");
    if (!fullName.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email address is required for your receipt.");
      return;
    }
    if (!amount || amount <= 0) {
      setErrorMessage("Please enter a valid donation amount.");
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
        title: payerName ? `Thank you, ${payerName}` : json.result?.recurring ? "Recurring donation activated" : "Thank you",
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

  // Premium Input Styling
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all shadow-sm font-medium";

  return (
    <div className="w-full pb-8 flex flex-col space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          Make a Donation
        </h2>
        <p className="text-gray-600 text-sm">
          Select your location to see the correct currency and options.
        </p>
      </div>

      {/* Row 1: Segmented Controls (Location & Interval) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Location
          </label>
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                isNigeria ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleLocationChange("nigeria")}
            >
              Nigeria
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                !isNigeria ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              } ${!internationalDonationsEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleLocationChange("international")}
            >
              Intl {!internationalDonationsEnabled ? "(Soon)" : ""}
            </button>
          </div>
        </div>

        {/* Interval */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Donation Type
          </label>
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                interval === "one_time" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setInterval("one_time")}
            >
              One-time
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                interval === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setInterval("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Amount Grid */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800">
          Select Amount ({currency})
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {suggested.map((value) => (
            <button
              key={value}
              type="button"
              className={`py-3 rounded-xl font-bold text-lg transition-all border ${
                !customAmount && amount === value
                  ? "bg-[#eaf4fb] border-[var(--primary)] text-[var(--primary-strong)] ring-1 ring-[var(--primary)]"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
              }`}
              onClick={() => {
                setAmount(value);
                setCustomAmount("");
              }}
            >
              {symbol}{value.toLocaleString()}
            </button>
          ))}
        </div>
        
        {/* Custom Amount */}
        <div className="relative mt-2">
          <span className="absolute left-4 top-1/2 flex w-6 -translate-y-1/2 items-center justify-center text-gray-500 font-bold text-lg pointer-events-none">
            {symbol}
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`${inputClass} !pl-14`}
            placeholder="Other amount"
            value={customAmount}
            onChange={(event) => {
              const digitsOnly = event.target.value.replace(/[^\d]/g, "");
              setCustomAmount(digitsOnly);
              setAmount(Number(digitsOnly || 0));
            }}
          />
        </div>
      </div>

      {/* Row 3: Personal Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="donation-name" className="block text-sm font-semibold text-gray-800">
              Name <span className="text-[var(--accent-rose)]">*</span>
            </label>
            <input
              id="donation-name"
              type="text"
              className={inputClass}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="donation-email" className="block text-sm font-semibold text-gray-800">
              Email <span className="text-[var(--accent-rose)]">*</span>
            </label>
            <input
              id="donation-email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>
      </div>

      {/* Notices */}
      {(paymentNotice || errorMessage) && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${
          errorMessage ? "bg-red-50 border-red-200 text-red-700" : "bg-[#eaf4fb] border-[#dce8f2] text-[#0c4669]"
        }`}>
          {errorMessage || paymentNotice}
        </div>
      )}

      {/* Submit Section */}
      <div className="pt-2">
        <button
          type="button"
          className="w-full py-4 rounded-xl btn-primary text-white font-bold text-lg shadow-[0_8px_20px_rgba(15,85,127,0.2)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Starting Checkout..." : `Donate ${symbol}${(amount || 0).toLocaleString()}`}
        </button>
        
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure payments processed by Paystack
        </div>
      </div>

      {/* Success Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 transition-opacity" role="presentation" onClick={() => setFeedbackModal(null)}>
          <div
            className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-100 transform transition-all scale-100 opacity-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-16 h-16 bg-[#eaf4fb] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 id="modal-title" className="text-2xl font-extrabold text-gray-900 mb-2">
              {feedbackModal.title}
            </h3>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              {feedbackModal.message}
            </p>
            <button type="button" className="btn btn-primary w-full py-3" onClick={() => setFeedbackModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
