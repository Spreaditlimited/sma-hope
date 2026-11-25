'use client';
import Link from 'next/link';
import { captchaHeaders } from '@/lib/captcha-client';
import { ConsultationPreferenceField, DiagnosticSelectField } from './consultation-preference';
import { CaptchaNotice } from '@/components/captcha-notice';
import { useState, type FormEvent } from 'react';
import { STATES } from '@/lib/diagnostics/domain';
import styles from './diagnostics.module.css';
export function StateField() { return <DiagnosticSelectField name="state" label="State or FCT" required defaultValue="" placeholder="Select your state or FCT" options={STATES.map(state => ({value:state,label:state}))}/>; }
export function ConcernForm({ intakeOpen, onSaved, publicReport = false }: {
    publicReport?: boolean;
    intakeOpen: boolean;
    onSaved: () => void;
}) {
    const [busy, setBusy] = useState(false), [error, setError] = useState('');
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy)
            return;
        setBusy(true);
        setError('');
        const form = event.currentTarget, d = new FormData(form);
        try {
            const response = await fetch(publicReport ? '/api/diagnostic-reports' : '/api/diagnostics', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(publicReport ? await captchaHeaders('register') : {}) }, body: JSON.stringify({ action: 'report', ...Object.fromEntries(d), ageMonths: Number(d.get('ageMonths')), consent: d.has('consent'), sharingConsent: d.has('sharingConsent'), registryConsent: d.has('registryConsent'), terms: d.has('terms') }) });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.error);
            form.reset();
            onSaved();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Please try again.');
        }
        finally {
            setBusy(false);
        }
    }
    if (!intakeOpen)
        return <div className={styles.alert}><strong>Reporting is currently paused.</strong><p>If you are worried about possible symptoms, please speak to a doctor now. Do not wait for reporting to resume.</p></div>;
    return <form className={styles.form} onSubmit={submit}><fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: 'contents' }}><legend className={styles.srOnly}>Report a concern</legend>{publicReport && <div className={styles.grid}><label>Your name<input name="contactName" required minLength={2} maxLength={180} autoComplete="name"/></label><label>Your email address<input name="email" type="email" autoComplete="email" required maxLength={254}/><small>Your secure password setup link is sent here.</small></label></div>}
 <div className={styles.grid}><label>Patient’s name<input name="patientName" required minLength={2} maxLength={180}/></label><label>Age in months<input name="ageMonths" type="number" required min={0} max={1440}/><small>For example, a two-year-old is 24 months.</small></label><StateField /><label>Local government area<input name="lga" required maxLength={100}/></label><label>Contact phone number<input name="phone" type="tel" required minLength={7} maxLength={30}/></label><label>Your relationship<select className="contact-purpose-select" name="relationship" defaultValue="parent"><option value="parent">Parent of a child</option><option value="guardian">Legal guardian of a child</option><option value="self">Adult patient — myself</option></select></label></div>
 <label>What have you noticed?<textarea name="concerns" required minLength={20} maxLength={4000}/><small>Describe the changes, when they began and any difficulties with movement, feeding or breathing.</small></label>
 <label>Previous assessment or tests<textarea name="history" maxLength={4000}/><small>Optional. Tell us about existing referrals or assessments. You can add documents privately after submitting.</small></label>
 <label className={`${styles.check} editor-checkbox`}><input name="consent" type="checkbox" required/><span>I am the adult patient or the child’s parent/legal guardian. I authorise SMA Hope to hold this health record and contact me about this referral. I have read the <Link href="/report-a-concern/privacy">case privacy notice</Link>.</span></label>
 <label className={`${styles.check} editor-checkbox`}><input name="sharingConsent" type="checkbox" required/><span>I authorise relevant information to be shared privately with the clinician assigned to this case. I understand this report is not a diagnosis or a promise of funded testing.</span></label>
 <label className={`${styles.check} editor-checkbox`}><input name="registryConsent" type="checkbox"/><span>You may contact me about joining a future SMA registry. Optional. This does not enrol me in research or authorise publication of my information.</span></label>
 {publicReport && <label className={`${styles.check} editor-checkbox`}><input name="terms" type="checkbox" required/><span>I agree to the <Link href="/terms">terms</Link> and <Link href="/privacy-policy">privacy notice</Link>. Submitting this form creates my private SMA Hope account and sends me a secure password setup link.</span></label>}{publicReport && <CaptchaNotice />}<button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving your report…' : 'Submit concern securely'}</button></fieldset>{error && <p role="alert">{error}</p>}</form>;
}
export function ClinicianForm({ onSaved, publicApplication = false }: {
    publicApplication?: boolean;
    onSaved: () => void;
}) {
    const [busy, setBusy] = useState(false), [error, setError] = useState('');
    async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (busy)
        return; setBusy(true); setError(''); const d = new FormData(e.currentTarget); try {
        const r = await fetch(publicApplication ? '/api/clinician-applications' : '/api/diagnostics', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(publicApplication ? await captchaHeaders('register') : {}) }, body: JSON.stringify({ action: 'apply', ...Object.fromEntries(d), consent: d.has('consent'), terms: d.has('terms') }) });
        const v = await r.json();
        if (!r.ok)
            throw new Error(v.error);
        onSaved();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Please try again.');
    }
    finally {
        setBusy(false);
    } }
    return <form className={styles.form} onSubmit={submit}><fieldset disabled={busy} style={{border:0,padding:0,margin:0,minWidth:0,display:'contents'}}><legend className={styles.srOnly}>Clinician application</legend><div className={styles.grid}>{publicApplication && <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254}/><small>Your password setup link is sent here.</small></label>}<label>Full professional name<input name="fullName" required maxLength={180}/></label><label>MDCN registration number<input name="registrationNumber" required maxLength={80}/></label><label>Specialty<input name="specialty" required maxLength={180}/></label><label>Hospital or practice<input name="workplace" required maxLength={240}/></label><StateField /><label>Contact number<input name="phone" type="tel" required minLength={7} maxLength={30}/></label></div><ConsultationPreferenceField name="defaultRemuneration" label="Consultation preference" defaultValue="paid" disabled={busy} help="This is your ongoing preference. You can change it in your account or choose differently for an individual case before accepting it."/><label>Your availability and proposed role<textarea name="availability" required minLength={10} maxLength={1000}/></label><label className={`${styles.check} editor-checkbox`}><input name="consent" type="checkbox" required/><span>I agree to professional credential and identity verification, private case handling and a written consultation scope before accepting work. I understand applying does not grant access to patient records.</span></label>{publicApplication && <label className={`${styles.check} editor-checkbox`}><input name="terms" type="checkbox" required/><span>I agree to the <Link href="/terms">terms</Link> and <Link href="/privacy-policy">privacy notice</Link>. Submitting this form creates my SMA Hope account and sends me a secure password setup link.</span></label>}{publicApplication && <CaptchaNotice />}<button className="btn btn-primary" disabled={busy}>{busy ? 'Sending application…' : 'Apply to the clinician network'}</button></fieldset>{error && <p role="alert">{error}</p>}</form>;
}
