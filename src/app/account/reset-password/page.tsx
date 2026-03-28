"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendResetLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/account/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setMessage("Password reset link sent. Check your email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setMessage("Password updated successfully. You can now sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 md:py-20 max-w-2xl">
      <div className="space-y-6">
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-md">
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-600">Use this if you need a new reset link.</p>
          <form className="mt-5 space-y-4" onSubmit={handleSendResetLink}>
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />
            </div>
            <button type="submit" className="btn btn-secondary w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </section>

        <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
          <p className="mt-2 text-sm text-gray-600">After opening your reset link, set your new password here.</p>
          <form className="mt-5 space-y-4" onSubmit={handleUpdatePassword}>
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="mt-3 text-sm text-[#0c4669]">{message}</p> : null}
        </section>
      </div>
    </main>
  );
}
