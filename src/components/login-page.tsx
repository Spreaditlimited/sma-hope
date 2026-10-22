"use client";
import { BrandLogo } from "@/components/brand-logo";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { PasswordInput } from "@/components/password-input";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { accountAuth, adminAuth } from "@/lib/auth/client";

export function LoginPage({admin = false, setup = false}: {admin?:boolean;setup?:boolean}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await (admin ? adminAuth : accountAuth).signIn.email({email:email.trim(),password});
      if (result.error) {setError(result.error.message || "Unable to sign in.");return;}
      router.push(admin ? "/admin" : "/account");
      router.refresh();
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Link href="/" className="auth-logo">
          <BrandLogo />
        </Link>
        <div>
          <p className="eyebrow">A shared purpose</p>
          <h2>
            Small acts of care.
            <br />
            <em>Lasting connections.</em>
          </h2>
          <p>
            Your account brings your donations, recurring giving, and book orders together in one
            place.
          </p>
          <Image
            className="auth-family"
            src="/family.jpg"
            alt="The family behind SMA Hope Foundation"
            width={600}
            height={505}
            sizes="(max-width: 800px) 0px, 45vw"
          />
        </div>
        <Link href="/" className="text-link">
          ← Back to the foundation
        </Link>
      </aside>
      <main className="auth-form-side">
        <Link className="auth-mobile-home text-link" href="/">
          ← SMA Hope Foundation
        </Link>
        <div className="auth-form-card">
          <span className="auth-lock">
            <Icon name="shield" size={25} />
          </span>
          <p className="eyebrow">{admin ? "SMA Hope administration" : "Your SMA Hope account"}</p>
          <h1>Welcome back.</h1>
          <p>{admin ? "Sign in to manage the foundation’s content, supporters, and operations." : "Sign in to view your giving and keep track of your orders."}</p>
          {setup && (
            <div className="auth-note">
              Your account was created after payment. Use the secure link sent to your email to choose your password.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <label htmlFor="account-email">
              Email address
              <input
                id="account-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
            <label htmlFor="account-password">
              Password
              <PasswordInput
                id="account-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <Link href={admin ? "/admin/reset-password" : "/account/reset-password"} className="auth-reset">
              Forgot your password?
            </Link>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              <Icon name="arrow" size={17} />
            </button>
          </form>
          <div className="auth-account-note">
            <strong>{admin ? "Administrator access" : "New to SMA Hope?"}</strong>
            <p>
              {admin ? "This is a separate administrator account. Use Forgot your password to set up access after an invitation." : "Supporter accounts are created after a donation or book purchase. Use the same email address to keep your records together."}
            </p>
            <Link href="/contact">Need help accessing your account? →</Link>
          </div>
        </div>
        <p className="auth-privacy">
          <Link href="/privacy-policy">Privacy</Link> · <Link href="/terms">Terms</Link> · SMA Hope
          Foundation Nigeria
        </p>
      </main>
    </div>
  );
}

export default function AccountLoginPage() {return <LoginPage />;}
