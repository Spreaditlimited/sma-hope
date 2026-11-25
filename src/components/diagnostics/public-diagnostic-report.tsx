'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ConcernForm} from './forms';
import styles from './diagnostics.module.css';
export function PublicDiagnosticReport({intakeOpen}:{intakeOpen:boolean}){
 const [submitted,setSubmitted]=useState(false);
 return <section id="report" className={styles.panel} aria-labelledby="public-report-heading" style={{scrollMarginTop:32}}><h2 id="public-report-heading">Tell us what you’ve noticed</h2>
 {submitted?<div role="status"><h3>Check your email to confirm your report</h3><p>Use the secure link to set your password. This confirms your email and connects your report to your private account. Then sign in to follow the referral or add documents, photos or videos. Tochukwu Daniel Nkwocha reviews confirmed reports within seven business days.</p><p>We have not included any medical information in the email. Please check your spam folder if it does not arrive. Do not wait for an online response if urgent medical care is needed.</p><Link href="/account/login?next=%2Faccount%2Fdiagnostics" className="text-link">Sign in to your private account →</Link></div>:<><p>You can submit this form without signing in. Submitting the form sends you a secure link to set up your private account and confirm your report. Photos and videos are optional and can be added privately afterwards.</p><ConcernForm intakeOpen={intakeOpen} publicReport onSaved={()=>setSubmitted(true)}/></>}
 </section>;
}
