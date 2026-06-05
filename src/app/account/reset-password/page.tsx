"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [canUpdatePassword, setCanUpdatePassword] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;
      setCanUpdatePassword(Boolean(session?.user));
      setCheckingSession(false);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session?.user) {
        setCanUpdatePassword(true);
        setCheckingSession(false);
      }
    });

    checkRecoverySession().catch(() => {
      if (!cancelled) {
        setCanUpdatePassword(false);
        setCheckingSession(false);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSendResetLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPasswordUpdated(false);
    setLoading(true);

    try {
      const response = await fetch("/api/account/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !json?.ok) {
        setError(json?.error || "Unable to send reset link.");
        return;
      }
      setMessage("We sent a secure reset link to your email. Open that link to choose a new password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPasswordUpdated(false);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setPassword("");
      setConfirmPassword("");
      setPasswordUpdated(true);
      setMessage("Password updated successfully.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full px-4 py-8 sm:py-10 flex items-center justify-center bg-gradient-to-br from-slate-50 via-[#e7f2fb] to-white">
      <section className="w-full max-w-lg bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-md">
        <Link href="/account/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-strong)] hover:underline">
          <span aria-hidden>←</span>
          <span>Back to sign in</span>
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            Account access
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {canUpdatePassword
              ? "Choose a new password for your SMA Hope account."
              : "Enter your email and we will send you a secure link. Open the link from your email to set a new password."}
          </p>
        </div>

        <div className="mt-6 flex gap-2" aria-label="Password reset progress">
          <span className="h-2 flex-1 rounded-full bg-[var(--primary)]" />
          <span className={`h-2 flex-1 rounded-full ${canUpdatePassword ? "bg-[var(--primary)]" : "bg-gray-200"}`} />
          <span className={`h-2 flex-1 rounded-full ${passwordUpdated ? "bg-[var(--primary)]" : "bg-gray-200"}`} />
        </div>

        {checkingSession ? (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
            Checking your reset link...
          </div>
        ) : passwordUpdated ? (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <h2 className="text-lg font-bold text-emerald-900">Password updated</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Your password has been changed. Use your new password the next time you sign in.
            </p>
            <Link href="/account/login" className="btn btn-primary mt-5 w-full text-center">
              Go to Sign In
            </Link>
          </div>
        ) : canUpdatePassword ? (
          <form className="mt-6 space-y-4" onSubmit={handleUpdatePassword}>
            <div>
              <label htmlFor="new-password" className="block text-sm font-semibold text-gray-800 mb-1">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-800 mb-1">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSendResetLink}>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-800 mb-1">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {error ? <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {message && !passwordUpdated ? (
          <p className="mt-4 rounded-xl border border-[#c9ddec] bg-[#e7f2fb] px-4 py-3 text-sm text-[#0c4669]">{message}</p>
        ) : null}
      </section>
    </main>
  );
}
