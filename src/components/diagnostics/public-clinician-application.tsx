'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ClinicianForm } from './forms';
import styles from './diagnostics.module.css';
export function PublicClinicianApplication() {
  const [submitted, setSubmitted] = useState(false);
  return <section id="apply" className={styles.panel} aria-labelledby="clinician-application-heading" style={{scrollMarginTop:32}}>
    <h2 id="clinician-application-heading">Apply to join the clinician network</h2>
    {submitted ? <div role="status"><h3>Check your email</h3><p>Use the secure link to set your password, then sign in to review your application. We check your identity and professional registration before you can take on cases.</p><p>If you have already applied, your existing application stays unchanged. Check your spam folder if the email does not arrive.</p><Link href="/account/login?next=%2Faccount%2Fclinician" className="text-link">Sign in to your clinician account →</Link></div> : <><p>You can apply here without signing in. Submitting the form creates your account and sends a secure link for you to set your password. Please use an email address you can access.</p><ClinicianForm publicApplication onSaved={() => setSubmitted(true)} /></>}
  </section>;
}
