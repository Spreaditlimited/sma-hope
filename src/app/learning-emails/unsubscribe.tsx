"use client";
import { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { ThemePicker } from '@/components/theme-provider';
import styles from './page.module.css';
export function UnsubscribeLearningEmails({token}:{token:string}){
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 async function stop(){setBusy(true);setStatus('');try{const r=await fetch('/api/learning/emails/unsubscribe?token='+encodeURIComponent(token),{method:'POST'});const data=await r.json();if(r.ok){setDone(true);setStatus('Your preference has been saved. You will no longer receive learning reminders or course completion emails.');}else setStatus(data.error);}catch{setStatus('Unable to save this change. Please try again.');}finally{setBusy(false);}}
 return <div className={styles.page}><header className={styles.header}><Link href="/" className={styles.brand} aria-label="SMA Hope home"><BrandLogo/></Link><ThemePicker/></header><section className={styles.card}><p className={styles.eyebrow}>Your email preferences</p><h1>{done?'Learning emails switched off.':'A little less in your inbox.'}</h1><p className={styles.copy}>{done?'Your account, free course access and saved progress are still here whenever you need them.':'You can stop course reminders and completion emails here. Your account, free course access and saved progress will stay available.'}</p>{!done&&<button type="button" className="btn btn-primary" disabled={busy||!token} onClick={()=>void stop()}>{busy?'Saving your preference…':'Stop learning emails'}</button>}{status&&<p className={styles.status} role="status">{status}</p>}{!token&&<p className={styles.status}>Open the link in your learning email, or manage preferences in your account below.</p>}<div className={styles.footer}><Link href="/account/email-preferences">Manage or pause reminders in your account →</Link><Link href="/account/learn">Return to your course →</Link><p className={styles.note}>This changes learning emails only. Account security messages and donation receipts are unaffected.</p></div></section></div>;
}
