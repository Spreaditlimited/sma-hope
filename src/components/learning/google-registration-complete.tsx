'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trackGoogleAdsRegistration } from '@/lib/google-ads';
import { BrandLogo } from '@/components/brand-logo';
import { AccountAuthStory } from './account-auth-story';
import styles from './registration.module.css';
let completion: Promise<void> | undefined;
function finish() {
  return completion ||= (async()=>{
    const response = await fetch('/api/account/google-registration',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store'});
    if (response.status===401) throw new Error('Please sign in to continue.');
    if (!response.ok) return;
    const data = await response.json();
    await trackGoogleAdsRegistration(typeof data.receipt==='string' ? data.receipt : null);
  })().catch(error=>{completion=undefined;throw error;});
}
export function GoogleRegistrationComplete() {
  const router = useRouter();
  const [error,setError] = useState(false);
  useEffect(()=>{let live=true;finish().then(()=>{if(live){router.replace('/account/learn');router.refresh();}}).catch(()=>{if(live)setError(true);});return()=>{live=false;};},[router]);
  return <div className={styles.page}><AccountAuthStory/><main className={styles.formArea}><div className={styles.card}>
    <Link href="/" className={styles.mobileLogo} aria-label="SMA Hope home"><BrandLogo/></Link>
    <p className={styles.eyebrow}>Your SMA Hope account</p>
    <h1>{error ? 'Let’s get you signed in.' : 'Welcome to SMA Hope.'}</h1>
    <p className={styles.intro} role="status">{error ? 'Please sign in again to open your learning space.' : 'Opening your free learning space…'}</p>
    {error && <Link href="/account/login" className="btn btn-primary">Sign in →</Link>}
  </div></main></div>;
}
