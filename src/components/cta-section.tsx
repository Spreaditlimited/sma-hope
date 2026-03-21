"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ctaBgByPath: Record<string, string> = {
  "/": "/home/home-final-cta.png",
  "/about": "/home/home-who-we-are.png",
  "/what-is-sma": "/home/home-what-is-sma.png",
  "/our-story": "/home/home-our-story.png",
  "/support-for-families": "/home/home-support-families.png",
  "/book": "/home/home-ways-to-help.png",
  "/donate": "/home/home-ways-to-help.png",
  "/contact": "/home/home-latest-updates.png",
  "/updates": "/home/home-final-cta.png",
  "/transparency": "/home/home-trust-transparency.png",
  "/privacy-policy": "/home/home-what-is-sma.png",
  "/terms": "/home/home-our-story.png",
};

export function CTASection({
  headline,
  body,
  primary,
  secondary,
}: {
  headline: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  const pathname = usePathname();
  const ctaBackgroundImage = ctaBgByPath[pathname] || "/home/home-final-cta.png";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!showSuccessModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSuccessModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSuccessModal]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      formStartedAt,
    };

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(json?.error || "Unable to subscribe right now. Please try again.");
        return;
      }

      form.reset();
      setFormStartedAt(Date.now());
      setShowSuccessModal(true);
    } catch {
      setError("Unable to subscribe right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="relative w-full py-16 md:py-24 bg-cover bg-center bg-no-repeat overflow-hidden border-t border-blue-100"
      style={{
        // Preserving your exact blue gradient overlay
        backgroundImage: `linear-gradient(120deg, rgba(246, 251, 255, 0.78) 0%, rgba(246, 251, 255, 0.7) 45%, rgba(246, 251, 255, 0.76) 100%), url(${ctaBackgroundImage})`,
      }}
    >
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Main CTA Text Area */}
          <div className="lg:col-span-5 text-left space-y-5">
            <h2 className="text-3xl md:text-4xl lg:text-[2.8rem] font-extrabold text-gray-900 tracking-tight">
              {headline}
            </h2>
            <p className="text-lg md:text-[1.15rem] text-gray-700 leading-relaxed max-w-2xl mx-0">
              {body}
            </p>
            
            {/* Action Buttons (Native classes strictly maintained) */}
            <div className="flex flex-wrap justify-start gap-4 mt-8">
              <Link href={primary.href} className="btn cta-btn-primary">
                {primary.label}
              </Link>
              {secondary ? (
                <Link href={secondary.href} className="btn cta-btn-secondary">
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          </div>

          {/* Newsletter Form Card */}
          <div className="lg:col-span-7 w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
            <form 
              className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl" 
              onSubmit={handleSubmit} 
              noValidate
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Be part of the mission</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Join our email list for updates, awareness resources, and ways to stand with families affected by SMA.
              </p>
              
              {/* Honeypot field disguised from humans */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] w-0 h-0 opacity-0"
              />
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1" htmlFor="cta-name">
                    Name
                  </label>
                  <input 
                    id="cta-name" 
                    name="name" 
                    type="text" 
                    autoComplete="name" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white/70 focus:bg-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1" htmlFor="cta-email">
                    Email
                  </label>
                  <input 
                    id="cta-email" 
                    name="email" 
                    type="email" 
                    autoComplete="email" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white/70 focus:bg-white" 
                  />
                </div>
              </div>

              {error ? (
                <p className="text-red-600 text-sm mt-4 font-medium px-1">{error}</p>
              ) : null}
              
              <div className="mt-6">
                <button type="submit" className="btn cta-signup-btn w-full block text-center" disabled={isSubmitting}>
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal ? (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 transition-opacity" 
          role="presentation" 
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-100 transform transition-all scale-100 opacity-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cta-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 id="cta-modal-title" className="text-2xl font-bold text-gray-900 mb-8">
              Thank you for subscribing.
            </h3>
            <button type="button" className="btn cta-modal-btn w-full" onClick={() => setShowSuccessModal(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
