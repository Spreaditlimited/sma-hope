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
    <section className="relative w-full py-12 md:py-16 bg-[var(--bg)] border-t border-[#e0e8ed]">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* The Premium Split Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(16,37,55,0.06)] border border-[#eef3f5] overflow-hidden flex flex-col lg:flex-row items-stretch">
          
          {/* Left Column: Messaging */}
          <div className="lg:w-[55%] relative p-8 md:p-10 lg:p-12 xl:p-14 bg-gradient-to-br from-[#f8fcff] to-[#eef5fb] flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#e0e8ed]">
            {/* Subtle contextual background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.04] mix-blend-multiply pointer-events-none"
              style={{ backgroundImage: `url(${ctaBackgroundImage})` }}
            />
            
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <div className="w-10 h-1 bg-[var(--accent-gold)] rounded-full mb-6 mx-auto"></div>
              
              <h2 className="text-3xl md:text-4xl lg:text-[2.35rem] xl:text-[2.6rem] font-extrabold text-[#102637] tracking-tight mb-5 text-balance leading-[1.12]">
                {headline}
              </h2>
              
              <p className="text-base md:text-lg text-[#42586a] leading-relaxed mb-8 max-w-xl mx-auto text-balance">
                {body}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href={primary.href} className="btn btn-primary px-8 py-3.5 shadow-[0_8px_20px_rgba(15,85,127,0.15)] hover:-translate-y-0.5 transition-transform">
                  {primary.label}
                </Link>
                {secondary && (
                  <Link href={secondary.href} className="btn btn-secondary bg-white px-8 py-3.5 border-[#d9e1e6] hover:border-[var(--primary)] hover:-translate-y-0.5 transition-all">
                    {secondary.label}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:w-[45%] p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-center bg-white">
            <form 
              className="w-full max-w-md mx-auto" 
              onSubmit={handleSubmit} 
              noValidate
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-[#102637] mb-3">Be part of the mission</h3>
                <p className="text-[#42586a] text-sm md:text-base leading-relaxed">
                  Join our email list for updates, awareness resources, and ways to stand with families affected by SMA.
                </p>
              </div>
              
              {/* Honeypot field */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] w-0 h-0 opacity-0"
              />
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#102637] uppercase tracking-wide mb-2" htmlFor="cta-name">
                    First Name
                  </label>
                  <input 
                    id="cta-name" 
                    name="name" 
                    type="text" 
                    autoComplete="name" 
                    required 
                    className="w-full px-4 py-3.5 rounded-xl border border-[#d9e1e6] bg-[#f8f8f6] text-[#102637] placeholder-[#8da2b3] focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#102637] uppercase tracking-wide mb-2" htmlFor="cta-email">
                    Email Address
                  </label>
                  <input 
                    id="cta-email" 
                    name="email" 
                    type="email" 
                    autoComplete="email" 
                    required 
                    className="w-full px-4 py-3.5 rounded-xl border border-[#d9e1e6] bg-[#f8f8f6] text-[#102637] placeholder-[#8da2b3] focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all" 
                  />
                </div>
              </div>

              {error && (
                <p className="text-[#931a63] text-sm mt-4 font-medium bg-[#931a63]/5 p-3 rounded-lg border border-[#931a63]/20">
                  {error}
                </p>
              )}
              
              <div className="mt-8">
                <button 
                  type="submit" 
                  className="btn w-full block text-center bg-[#102637] hover:bg-[var(--primary-strong)] text-white border-transparent py-4 text-[0.95rem] shadow-[0_8px_20px_rgba(16,37,55,0.15)] disabled:opacity-70 disabled:cursor-not-allowed transition-all" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102637]/40 backdrop-blur-sm p-4 transition-opacity" 
          role="presentation" 
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-[#eef3f5] transform transition-all"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cta-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-16 h-16 bg-[#eef5fb] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 id="cta-modal-title" className="text-2xl font-bold text-[#102637] mb-2 text-balance">
              Thank you for subscribing.
            </h3>
            <p className="text-[#42586a] text-sm mb-8">
              You&apos;ve successfully joined our community list.
            </p>
            <button 
              type="button" 
              className="btn btn-primary w-full py-3.5" 
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
