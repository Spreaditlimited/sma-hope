'use client';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { formatNaira, STATUS_LABELS } from '@/lib/diagnostics/domain';
import styles from './diagnostics.module.css';
type Clinician = {
    id: string;
    full_name: string;
    registration_number: string;
    default_remuneration: string;
    specialty: string;
    workplace: string;
    state: string;
    phone: string;
    availability: string;
    status: string;
    verified_until: string | null;
    verification_reference: string;
};
type Finance = {
    id: string;
    reference: string;
    kind: string;
    amount_kobo: number;
    description: string;
    evidence_reference: string;
    donor_allocation: string;
    created_by: string;
    approved_by: string | null;
    status: string;
    paid_reference: string | null;
};
type Data = {
    notificationStats: {pending:number;sent:number};
    publicReports: {id:string;email:string;email_confirmed_at:string|null}[];
    publicApplications: {id:string;email:string;fullName:string;specialty:string;workplace:string;state:string}[];
    settings: {
        intake_open: boolean;
        consultation_fee_kobo: number | null;
        readiness_reference: string;
        storageConfigured: boolean;
    };
    cases: {
        id: string;
        reference: string;
        patient_name: string;
        state: string;
        status: string;
        clinician_name: string | null;
        remuneration: string;
        accepted_at: string | null;
    }[];
    clinicians: Clinician[];
    finance: Finance[];
    counts: {
        total: number;
        completed: number;
        confirmed: number;
    };
    totals: {
        paid_kobo: number;
        committed_kobo: number;
    };
    history: {
        id: number;
        actor_id: string;
        action: string;
        subject_id: string;
        details_json: string;
        event_hash: string;
        previous_hash: string;
        created_at: string;
    }[];
};
export function DiagnosticAdmin() {
    const [data, setData] = useState<Data | null>(null), [tab, setTab] = useState('cases'), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [reload, setReload] = useState(0), [page, setPage] = useState(1);
    useEffect(() => { const abort = new AbortController(); fetch('/api/admin/diagnostics?page=' + page, { cache: 'no-store', signal: abort.signal }).then(async (r) => { const v = await r.json(); if (!r.ok)
        throw new Error(v.error); if (!abort.signal.aborted) {
        setData(v);
        setError('');
    } }).catch(e => { if (!abort.signal.aborted)
        setError(e.message); }); return () => abort.abort(); }, [reload, page]);
    async function save(values: Record<string, unknown>) { if (busy)
        return; setBusy(true); setError(''); setNotice(''); try {
        const r = await fetch('/api/admin/diagnostics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
        const v = await r.json();
        if (!r.ok)
            throw new Error(v.error);
        setNotice('Saved with an audit record.');
        setReload(x => x + 1);
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Please try again.');
    }
    finally {
        setBusy(false);
    } }
    function fields(e: FormEvent<HTMLFormElement>) { e.preventDefault(); return Object.fromEntries(new FormData(e.currentTarget)); }
    return <div className={styles.page}>{error && <p role="alert" className={styles.alert}>{error} <button className="text-link" onClick={() => setReload(x => x + 1)}>Retry</button></p>}{notice && <p role="status">{notice}</p>}{!data && !error && <p role="status">Loading diagnostic access…</p>}{data && <>
 <div className={styles.stats}><div><strong>{Number(data.counts.total)}</strong><span>Reports received</span></div><div><strong>{Number(data.counts.completed || 0)}</strong><span>Consultations completed</span></div><div><strong>{Number(data.counts.confirmed || 0)}</strong><span>Clinician-recorded SMA confirmations</span></div></div>
 <p className={styles.meta}>Email notifications to help@smahope.org: {Number(data.notificationStats?.sent || 0)} sent · {Number(data.notificationStats?.pending || 0)} awaiting delivery. Failed sends retry automatically.</p><p className={styles.meta}>Private operational figures. Reports are not diagnoses. This database is not a population prevalence study. Approved but unpaid: {formatNaira(Number(data.totals.committed_kobo))}. Recorded external payments: {formatNaira(Number(data.totals.paid_kobo))}.</p>
 <nav className={styles.tabs} aria-label="Diagnostic management">{[['cases', 'Patient cases'], ['clinicians', 'Clinician network'], ['finance', 'Funding and payments'], ['settings', 'Programme settings'], ['audit', 'Audit history']].map(([key, label]) => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>{label}</button>)}</nav>
 {tab === 'cases' && <section className={styles.panel}><h2>Patient cases</h2>{data.publicReports?.map(p=><aside key={p.id} className={styles.alert}><strong>{p.email_confirmed_at ? "Email confirmed — report awaiting processing" : "Report awaiting email confirmation"}</strong><p>{p.email}</p><p>{p.email_confirmed_at ? "The report will be added to the case list when reporting is open and the family signs in." : "The person needs to set their password using the emailed link before this report can be assigned."}</p></aside>)}{!data.cases.length ? <p>No confirmed patient reports yet.</p> : <ul className={styles.list}>{data.cases.map(c => <li key={c.id}><Link href={'/admin/diagnostics/' + c.id}>{c.patient_name}</Link><p>{c.reference} · {c.state} · {STATUS_LABELS[c.status]}{c.clinician_name ? ' · ' + c.clinician_name : ''}{c.clinician_name && c.remuneration === 'donated' ? c.accepted_at ? ' · Consultation donated' : ' · Donation preference selected' : ''}</p></li>)}</ul>}<div className={styles.actions}><button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(x => x - 1)}>Previous</button><span>Page {page}</span><button className="btn btn-secondary" disabled={page * 30 >= Number(data.counts.total)} onClick={() => setPage(x => x + 1)}>Next</button></div></section>}
 {tab === 'clinicians' && <><p className={styles.meta}>Latest 100 applications. Check MDCN registration, current practising status and identity through an independent workplace contact. Record evidence and a review date; do not approve solely on the submitted form.</p>{data.publicApplications?.map(p => <section className={styles.panel} key={p.id}><h2>{p.fullName}</h2><p>{p.specialty} · {p.workplace} · {p.state}</p><p>{p.email}</p><span className={styles.badge}>Awaiting email confirmation</span><p>The applicant needs to use their emailed link to set a password. Their application will then appear below for professional verification and approval.</p></section>)}{!data.clinicians.length && !data.publicApplications?.length && <section className={styles.panel}><p>No applications yet.</p></section>}{data.clinicians.map(c => <section className={styles.panel} key={c.id}><h2>{c.full_name}</h2><p>{c.specialty} · {c.workplace} · {c.state}</p><p>MDCN: {c.registration_number} · {c.phone}</p><p className={styles.answer}>{c.availability}</p><span className={styles.badge}>{c.status}</span><span className={styles.badge}>{c.default_remuneration === "donated" ? "Donates consultations by default" : "Receives the agreed fee by default"}</span>{c.verification_reference && <p className={styles.meta}>Verification: {c.verification_reference}</p>}<form className={styles.form} onSubmit={e => void save({ action: 'verify_clinician', clinicianId: c.id, ...fields(e) })}><label>Decision<select className="contact-purpose-select" name="status" defaultValue="approved"><option value="approved">Approve verified clinician</option><option value="suspended">Suspend access</option><option value="declined">Decline application</option></select></label><label>Verification review date<input type="date" name="verifiedUntil"/></label><label>Verification evidence or decision reason<textarea name="reference" required minLength={15} maxLength={500}/><small>Reference the checks and evidence held securely, not a public patient document link.</small></label><button className="btn btn-primary" disabled={busy}>Record verification decision</button></form></section>)}</>}
 {tab === 'finance' && <><aside className={styles.alert}>Propose expenses from the patient’s case. Another administrator must approve each expense before an external payment can be recorded. This system records payment evidence; it does not transfer money.</aside>{!data.finance.length && <section className={styles.panel}><p>No expenses yet.</p></section>}{data.finance.map(f => <section className={styles.panel} key={f.id}><h2>{formatNaira(Number(f.amount_kobo))}</h2><p>{f.reference} · {f.kind} · {f.status}</p><p>{f.description}</p><p className={styles.meta}>Allocation: {f.donor_allocation}<br />Evidence: {f.evidence_reference}<br />Prepared by: {f.created_by}<br />Approved by: {f.approved_by || 'Awaiting independent approval'}</p>{f.status === 'proposed' && <button className="btn btn-primary" disabled={busy} onClick={() => void save({ action: 'approve_expense', financeId: f.id })}>Approve expense independently</button>}{f.status === 'approved' && <form className={styles.form} onSubmit={e => void save({ action: 'record_payment', financeId: f.id, ...fields(e) })}><label>External payment reference<input name="paymentReference" required minLength={5} maxLength={180}/></label><button className="btn btn-primary" disabled={busy}>Record payment made externally</button></form>}{f.paid_reference && <p>Payment reference: {f.paid_reference}</p>}</section>)}</>}
 {tab === 'settings' && <section className={styles.panel}><h2>Consultation fee and service readiness</h2><p>One fee covers each patient’s agreed consultation pathway. Assignments preserve the fee and scope that applied at the time. Laboratory tests, transport and equipment are separate costs.</p><p className={styles.meta}>Private storage credentials: {data.settings.storageConfigured ? 'Present — live permissions checked when opening intake' : 'Not configured'}. Intake: {data.settings.intake_open ? 'Open' : 'Closed'}.</p><form key={reload} className={styles.form} onSubmit={e => { const v = fields(e); void save({ action: 'settings', ...v, intakeOpen: v.intakeOpen === 'on', readinessConfirmed: v.readinessConfirmed === 'on' }); }}><label>End-to-end consultation fee in naira<input name="feeNaira" inputMode="decimal" required pattern="[0-9]+([.][0-9]{1,2})?" defaultValue={data.settings.consultation_fee_kobo === null ? '' : String(Number(data.settings.consultation_fee_kobo) / 100)}/></label><label>Readiness approval reference<textarea name="readinessReference" maxLength={500} defaultValue={data.settings.readiness_reference}/><small>Record the report reviewer, response time, retention policy, privacy arrangements and storage check. Verify clinical and laboratory arrangements before making referrals.</small></label><label className={`${styles.check} editor-checkbox`}><input name="readinessConfirmed" type="checkbox"/><span>I confirm the report-review, consent, privacy and safeguarding arrangements are approved, and private storage has restricted membership. Clinical work is assigned only to verified clinicians. This confirmation is recorded in the audit history.</span></label><label className={`${styles.check} editor-checkbox`}><input name="intakeOpen" type="checkbox" defaultChecked={Boolean(data.settings.intake_open)}/><span>Open family reporting. Opening requires the readiness confirmation and a successful private-storage permission check.</span></label><button className="btn btn-primary" disabled={busy}>Save programme settings</button></form></section>}
 {tab === 'audit' && <section className={styles.panel}><h2>Audit history</h2><p>Latest 100 events, including access to case records. Financial and workflow changes are recorded with the responsible account. Hashes form a tamper-evident chain; independent signed backups are required for protection against a privileged database administrator rewriting history.</p><ul className={styles.list}>{data.history.map(h => <li key={h.id}><strong>#{h.id} · {h.action}</strong><p className={styles.meta}>{String(h.created_at)} · {h.actor_id}<br />Reference: {h.subject_id}</p><details><summary>Event evidence</summary><pre className={styles.code}>{h.details_json}</pre><p className={styles.code}>Previous: {h.previous_hash}<br />Event: {h.event_hash}</p></details></li>)}</ul></section>}
 </>}</div>;
}
