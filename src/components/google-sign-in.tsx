'use client';
import Link from 'next/link';
import { useState } from 'react';
import { captchaHeaders } from '@/lib/captcha-client';
import styles from '@/components/learning/registration.module.css';

export function GoogleSignIn({returnTo='/account/learn'}:{returnTo?:string}) {
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  async function start() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/sign-in/social', {method:'POST',headers:{'Content-Type':'application/json',...await captchaHeaders('login')},body:JSON.stringify({provider:'google',callbackURL:returnTo,additionalData:{termsAccepted:true}})});
      const data = await response.json();
      if (!response.ok || typeof data.url !== 'string') throw new Error('Google sign-in is unavailable. Please try again or use your email.');
      const url = new URL(data.url);
      if (url.protocol !== 'https:' || url.hostname !== 'accounts.google.com') throw new Error('Google sign-in is unavailable. Please use your email.');
      window.location.assign(url.href);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to connect to Google. Please try again.');
      setBusy(false);
    }
  }
  return <div className={styles.googleOption}>
    <button type="button" className={styles.googleButton} onClick={start} disabled={busy}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.3 2.9-7.5Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4L15.4 17c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.7A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.8a6 6 0 0 1 0-3.6V7.5H3a10 10 0 0 0 0 9l3.4-2.7Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.5l3.4 2.7C7.2 7.8 9.4 6 12 6Z"/></svg>
      {busy ? 'Connecting to Google…' : 'Continue with Google'}
    </button>
    <p className={styles.googleTerms}>By continuing with Google, you agree to our <Link href="/terms">terms</Link> and <Link href="/privacy-policy">privacy notice</Link>. Course reminder emails stay optional.</p>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.authDivider}><span>or use your email</span></div>
  </div>;
}
