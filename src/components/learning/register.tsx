'use client';
import { captchaHeaders } from '@/lib/captcha-client';
import { CaptchaNotice } from '@/components/captcha-notice';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { CookieNotice } from '@/components/cookie-notice';
import { CookieSettingsButton } from '@/components/cookie-settings-button';
import { BrandLogo } from '@/components/brand-logo';
import { PasswordInput } from '@/components/password-input';
import { AccountAuthStory } from './account-auth-story';
import styles from './registration.module.css';

export function LearnerRegistration() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...await captchaHeaders('register') },
        body: JSON.stringify({
          name: String(form.get('name') || '').trim(),
          email: String(form.get('email') || '').trim(),
          password: form.get('password'),
          terms: form.get('terms') === 'on',
          signupSource: 'learning',
        }),
      });
      if (!response.ok) {
        throw new Error((response.status === 403 || response.status === 503)
          ? 'Security verification failed. Please try again.'
          : response.status === 429
          ? 'Too many attempts. Please wait and try again.'
          : 'We could not create an account. If you already have one, sign in or reset your password.');
      }
      router.replace('/account/learn');
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <AccountAuthStory />
      <main className={styles.formArea}>
        <div className={styles.card}>
          <Link href="/learn/understanding-sma" className={styles.mobileLogo} aria-label="Back to the SMA Hope course"><BrandLogo /></Link>
          <p className={styles.eyebrow}>Your SMA Hope account</p>
          <h1>Start with <br />understanding.</h1>
          <p className={styles.intro}>Create your free account to save your progress and check what you’ve learned.</p>
          <p className={styles.nextStep}>Next, you’ll enrol in <strong>Understanding SMA</strong>. No payment details required.</p>
          <form onSubmit={submit} aria-busy={busy}>
            <fieldset disabled={busy} className={styles.fields}>
              <legend className={styles.srOnly}>Create your learning account</legend>
              <label htmlFor="learner-name">Full name<input id="learner-name" name="name" required minLength={2} maxLength={180} autoComplete="name" /></label>
              <label htmlFor="learner-email">Email address<input id="learner-email" name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" /></label>
              <label htmlFor="learner-password">Create a password<PasswordInput id="learner-password" name="password" required minLength={12} maxLength={128} autoComplete="new-password" aria-describedby="learner-password-help" /><small id="learner-password-help">Use at least 12 characters.</small></label>
              <label className={styles.consent} htmlFor="learner-consent"><input id="learner-consent" name="terms" type="checkbox" required /><span>I agree to the <Link href="/terms">terms</Link> and <Link href="/privacy-policy">privacy notice</Link>. SMA Hope will store my account, course progress and quiz answers. I do not need to provide medical information.</span></label>
            </fieldset>
            <CaptchaNotice />
            {error && <div className={styles.error} role="alert"><p>{error}</p><Link href="/account/login?next=/account/learn">Sign in</Link><span> · </span><Link href="/account/reset-password">Reset password</Link></div>}
            <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={busy}>{busy ? 'Creating account…' : 'Create free account'}<span aria-hidden="true">↗</span></button>
          </form>
          <p className={styles.measurement}>With optional advertising permission, we tell Meta that a sign-up was completed to measure our campaigns. We do not send your name, email, course details or quiz answers. <CookieSettingsButton /></p>
          <p className={styles.signIn}>Already have an account? <Link href="/account/login?next=/account/learn">Sign in →</Link></p>
          <p className={styles.help}><Link href="/learn/understanding-sma">← Back to the course</Link><span>Need a hand? <Link href="/contact">Contact us</Link></span></p>
        </div>
      </main>
      <CookieNotice />
    </div>
  );
}
