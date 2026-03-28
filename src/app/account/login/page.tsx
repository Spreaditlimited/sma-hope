"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSetup(params.get("setup") === "1");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token || "";
      if (token) {
        const adminCheck = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (adminCheck.ok) {
          router.push("/admin");
          router.refresh();
          return;
        }
      }

      router.push("/account");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full px-4 py-8 sm:py-10 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-strong)] hover:underline">
            <span aria-hidden>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      <section className="w-full max-w-lg bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Sign in to your account</h1>
        {setup ? (
          <p className="mt-3 text-sm text-[#0c4669]">
            Your donor account was created after payment. Please sign in with the temporary password sent to your email, then reset your password.
          </p>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="account-email" className="block text-sm font-semibold text-gray-800 mb-1">
              Email
            </label>
            <input
              id="account-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
            />
          </div>
          <div>
            <label htmlFor="account-password" className="block text-sm font-semibold text-gray-800 mb-1">
              Password
            </label>
            <input
              id="account-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4">
          <Link href="/account/reset-password" className="text-sm text-[var(--primary)] hover:underline">
            Reset password
          </Link>
        </div>
      </section>
      </div>
    </main>
  );
}
