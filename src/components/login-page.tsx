"use client";
import { captchaHeaders } from '@/lib/captcha-client';
import { CaptchaNotice } from '@/components/captcha-notice';
import { BrandLogo } from "@/components/brand-logo";

import Link from "next/link";
import { AccountAuthStory } from "@/components/learning/account-auth-story";
import styles from "@/components/learning/registration.module.css";
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
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const result = await (admin ? adminAuth : accountAuth).signIn.email({email:email.trim(),password},{headers:await captchaHeaders(admin?"admin_login":"login")});
      if (result.error) {setError(result.error.message || "Unable to sign in.");return;}
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(admin ? "/admin" : next && ["/account", "/account/learn", "/account/orders", "/account/donations", "/account/subscriptions", "/account/email-preferences", "/account/learn/feedback"].includes(next) ? next : "/account");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error && failure.message.startsWith("Security verification") ? failure.message : "Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <AccountAuthStory />
      <main className={styles.formArea}>
        <div className={styles.card}>
          <Link href="/learn/understanding-sma" className={styles.mobileLogo} aria-label="Back to the SMA Hope course"><BrandLogo /></Link>
          <p className={styles.eyebrow}>{admin ? "SMA Hope administration" : "Your SMA Hope account"}</p>
          <h1>Welcome back.</h1>
          <p className={styles.intro}>{admin ? "Sign in to manage the foundation’s content, supporters, and operations." : "Sign in to continue learning, view your giving and keep track of your orders."}</p>
          {setup && (
            <p className={styles.nextStep}>
              Your account was created after payment. Use the secure link sent to your email to choose your password.
            </p>
          )}
          <form onSubmit={handleSubmit} aria-busy={loading} className={styles.loginForm}>
            <fieldset disabled={loading} className={styles.fields}>
              <legend className={styles.srOnly}>Sign in to your {admin ? "administrator" : "SMA Hope"} account</legend>
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
            </fieldset>
            <Link href={admin ? "/admin/reset-password" : "/account/reset-password"} className={styles.reset}>
              Forgot your password?
            </Link>
            <CaptchaNotice />
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              <Icon name="arrow" size={17} />
            </button>
          </form>
          <div className={styles.accountNote}>
            <strong>{admin ? "Administrator access" : "New to SMA Hope?"}</strong>
            <p>{admin ? "This is a separate administrator account. Use Forgot your password to set up access after an invitation." : "Create a free learning account, or use the same account created after a donation or book purchase."}</p>
            {!admin && <Link href="/account/register">Create a free learning account →</Link>}
          </div>
          <p className={styles.help}><Link href="/learn/understanding-sma">← Back to the course</Link><span>Need a hand? <Link href="/contact">Contact us</Link></span></p>
          <p className={styles.privacy}><Link href="/privacy-policy">Privacy</Link><span aria-hidden="true"> · </span><Link href="/terms">Terms</Link><span> · SMA Hope Foundation Nigeria</span></p>
        </div>
      </main>
    </div>
  );
}

export default function AccountLoginPage() {return <LoginPage />;}
