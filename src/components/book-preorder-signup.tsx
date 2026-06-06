"use client";

import { FormEvent, useEffect, useState } from "react";

type Props = {
  buttonLabel?: string;
  buttonClassName?: string;
  disabledButtonLabel?: string;
  disabledButtonClassName?: string;
  disabledButtonFullWidth?: boolean;
};

export function BookPreorderSignup({
  buttonLabel = "Join our email list",
  buttonClassName = "font-semibold text-[#0f557f] underline decoration-[#0f557f]/35 underline-offset-4 hover:text-[#13384f]",
  disabledButtonLabel,
  disabledButtonClassName = "btn w-full sm:w-auto cursor-not-allowed border border-gray-300 bg-gray-200 text-gray-500 shadow-none hover:bg-gray-200",
  disabledButtonFullWidth = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
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
        setError(json?.error || "Unable to join the email list right now.");
        return;
      }

      form.reset();
      setFormStartedAt(Date.now());
      setSuccess(true);
    } catch {
      setError("Unable to join the email list right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {disabledButtonLabel ? (
        <button
          type="button"
          className={`${disabledButtonClassName} ${disabledButtonFullWidth ? "w-full" : ""}`}
          onClick={() => setIsOpen(true)}
        >
          {disabledButtonLabel}
        </button>
      ) : (
        <button type="button" className={buttonClassName} onClick={() => setIsOpen(true)}>
          {buttonLabel}
        </button>
      )}

      {isOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 pb-6 pt-32 backdrop-blur-sm sm:items-center sm:py-8"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-preorder-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-[#0f557f] px-6 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-100">Book updates</p>
              <h2 id="book-preorder-modal-title" className="mt-2 text-2xl font-bold tracking-tight !text-white">
                Get notified when pre-order opens
              </h2>
            </div>

            <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit} noValidate>
              <p className="text-sm leading-6 text-slate-600">
                Leave your name and email address. We will let you know when pre-order opens for
                <span className="font-semibold text-slate-900"> When Every Breath Matters</span>.
              </p>

              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div>
                <input
                  id="book-preorder-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  aria-label="Name"
                  placeholder="Name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-[#0f557f] focus:ring-2 focus:ring-[#0f557f]/20"
                />
              </div>

              <div>
                <input
                  id="book-preorder-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-label="Email address"
                  placeholder="Email address"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-[#0f557f] focus:ring-2 focus:ring-[#0f557f]/20"
                />
              </div>

              {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
              {success ? (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  Thank you. We will notify you when pre-order opens.
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Notify Me"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
