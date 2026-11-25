'use client';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { ConsultationPreferenceField } from './consultation-preference';
import { formatNaira, STATUS_LABELS } from '@/lib/diagnostics/domain';
import styles from './diagnostics.module.css';
type PatientCase = {
    id: string;
    reference: string;
    patient_name: string;
    age_months: number;
    state: string;
    lga: string;
    phone: string;
    relationship: string;
    concerns: string;
    history: string;
    status: string;
    version: number;
    fee_kobo: number | null;
    fee_scope: string | null;
    offered_fee_kobo: number | null;
    remuneration: string;
    clinician_name: string | null;
    accepted_at: string | null;
    family_message: string | null;
    clinical_summary: string | null;
    outcome: string | null;
};
type Attachment = {
    id: string;
    name: string;
    mime: string;
    status: string;
    size_bytes: number;
};
export function CaseDetail({ caseId, admin = false }: {
    caseId: string;
    admin?: boolean;
}) {
    const endpoint = admin ? '/api/admin/diagnostics' : '/api/diagnostics';
    const [data, setData] = useState<{
        case: PatientCase;
        files: Attachment[];
        isAssignedClinician: boolean;
        clinicians?: {
            id: string;
            full_name: string;
            default_remuneration: string;
        }[];
    } | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [reload, setReload] = useState(0), [notice, setNotice] = useState('');
    useEffect(() => { const abort = new AbortController(); fetch(endpoint + '?case=' + encodeURIComponent(caseId), { cache: 'no-store', signal: abort.signal }).then(async (r) => { const v = await r.json(); if (!r.ok)
        throw new Error(v.error); if (!abort.signal.aborted) {
        setData(v);
        setError('');
    } }).catch(e => { if (!abort.signal.aborted)
        setError(e.message); }); return () => abort.abort(); }, [caseId, endpoint, reload]);
    async function action(values: Record<string, unknown>) { if (busy || !data)
        return; setBusy(true); setError(''); setNotice(''); try {
        const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseId, version: data.case.version, ...values }) });
        const v = await r.json();
        if (!r.ok)
            throw new Error(v.error);
        setNotice('Saved.');
        setReload(x => x + 1);
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Please try again.');
    }
    finally {
        setBusy(false);
    } }
    async function download(file: Attachment) { if (busy)
        return; setBusy(true); setError(''); try {
        const chunks: Blob[] = [];
        for (let offset = 0; offset < file.size_bytes; offset += 2 * 1024 * 1024) {
            const r = await fetch('/api/diagnostics/uploads?id=' + file.id + '&offset=' + offset + (admin ? '&admin=1' : ''), { cache: 'no-store' });
            if (!r.ok) {
                const v = await r.json();
                throw new Error(v.error);
            }
            chunks.push(await r.blob());
        }
        const url = URL.createObjectURL(new Blob(chunks, { type: 'application/octet-stream' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Download failed.');
    }
    finally {
        setBusy(false);
    } }
    async function upload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy)
            return;
        const form = event.currentTarget, file = new FormData(form).get('file');
        if (!(file instanceof File) || !file.size)
            return;
        setBusy(true);
        setError('');
        setNotice('');
        const base = '/api/diagnostics/uploads' + (admin ? '?admin=1' : '');
        try {
            const r = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseId, name: file.name, mime: file.type, size: file.size }) });
            const init = await r.json();
            if (!r.ok)
                throw new Error(init.error);
            for (let offset = 0; offset < file.size; offset += init.chunkSize) {
                setNotice(`Uploading… ${Math.round(offset / file.size * 100)}%`);
                const response = await fetch(base + (admin ? '&' : '?') + 'id=' + init.id + '&offset=' + offset, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: file.slice(offset, offset + init.chunkSize) });
                const result = await response.json();
                if (!response.ok)
                    throw new Error(result.error);
            }
            form.reset();
            setNotice('Uploaded privately. A safety review is required before it is made available to the assigned clinician.');
            setReload(x => x + 1);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Upload failed.');
            setNotice('');
        }
        finally {
            setBusy(false);
        }
    }
    if (!data)
        return <div className={styles.page}>{error ? <p role="alert">{error}</p> : <p role="status">Loading private case…</p>}</div>;
    const c = data.case, doctor = data.isAssignedClinician, closed = ['completed', 'withdrawn'].includes(c.status);
    return <div className={styles.page}><Link className="text-link" href={admin ? '/admin/diagnostics' : doctor ? '/account/clinician' : '/account/diagnostics'}>← Back to workspace</Link>{error && <p className={styles.alert} role="alert">{error}</p>}{notice && <p role="status" className={styles.alert}>{notice}</p>}
 <section className={styles.panel}><span className={styles.badge}>{STATUS_LABELS[c.status]}</span><p className={styles.meta}>{c.reference}</p><h2>{c.patient_name}</h2><p>{c.age_months} months old · {c.lga}, {c.state}</p><h3>Reported concerns</h3><p className={styles.answer}>{c.concerns}</p>{c.history && <><h3>Previous assessment</h3><p className={styles.answer}>{c.history}</p></>}{(admin || doctor) && <p>Patient contact: {c.phone}</p>}</section>
 {c.clinician_name && <section className={styles.panel}><h2>Your consultation</h2><p>Assigned clinician: <strong>{c.clinician_name}</strong></p>{c.remuneration === 'donated' ? <p><strong>{c.accepted_at ? 'Consultation donated' : 'Donation preference selected'}</strong> · No consultation fee is payable{c.accepted_at ? '.' : ' if the clinician accepts this as a donated consultation.'}</p> : <p>{c.accepted_at ? 'Agreed consultation fee' : 'Offered consultation fee'}: <strong>{formatNaira(c.fee_kobo === null ? null : Number(c.fee_kobo))}</strong>. The foundation pays this fee. It is not a bill for the family.</p>}<p>{c.fee_scope}</p>{doctor && !c.accepted_at && c.status === 'assigned' && <form className={styles.form} onSubmit={e => { e.preventDefault(); void action({ action: 'accept', acceptScope: true, remuneration: new FormData(e.currentTarget).get('remuneration') }); }}><ConsultationPreferenceField name="remuneration" label="For this patient" defaultValue={c.remuneration} disabled={busy} paidLabel={"Receive the offered fee — " + formatNaira(Number(c.offered_fee_kobo ?? c.fee_kobo))} donatedLabel="Donate this consultation — no fee" help="Your choice is recorded when you accept. It applies only to this case; your ongoing preference stays unchanged."/><label className={`${styles.check} editor-checkbox`}><input type="checkbox" required/><span>I accept the full consultation responsibilities and the payment or donation choice selected above.</span></label><button className="btn btn-primary" disabled={busy}>Accept consultation</button></form>}</section>}
 {c.family_message && <section className={styles.panel}><h2>Explanation and next steps</h2><p className={styles.answer}>{c.family_message}</p>{c.outcome && <p className={styles.meta}>Recorded outcome: {c.outcome.replaceAll('_', ' ')}</p>}<details><summary>Clinical summary</summary><p className={styles.answer}>{c.clinical_summary}</p></details></section>}
 <section className={styles.panel}><h2>Private documents, photos and videos</h2><p>Optional. Use clear, relevant files and avoid showing anyone else. Accepted: JPEG, PNG, PDF (up to 8 MB); MP4 or MOV (up to 30 MB). Files are never published.</p><ul className={styles.list}>{data.files.map(f => <li key={f.id}><strong>{f.name}</strong><p className={styles.meta}>{f.status === 'quarantined' ? 'Awaiting safety review' : f.status === 'uploading' ? 'Upload incomplete' : f.status}</p>{(f.status === 'ready' || admin && f.status === 'quarantined') && <button className="text-link" disabled={busy} onClick={() => void download(f)}>Download privately</button>}{admin && f.status === 'quarantined' && <form className={styles.form} onSubmit={e => { e.preventDefault(); void action({ action: 'review_attachment', fileId: f.id, reference: new FormData(e.currentTarget).get('reference') }); }}><label>Safety review evidence<input name="reference" required minLength={10} maxLength={500}/></label><button className="btn btn-secondary" disabled={busy}>Record safety review</button></form>}</li>)}</ul>{!closed && <form onSubmit={upload} className={styles.form}><label>Choose a file<input name="file" type="file" accept="image/jpeg,image/png,video/mp4,video/quicktime,application/pdf" required/></label><button className="btn btn-secondary" disabled={busy}>Upload privately</button></form>}</section>
 {doctor && c.accepted_at && !closed && <section className={styles.panel}><h2>Record clinical assessment</h2><form className={styles.form} onSubmit={e => { e.preventDefault(); void action({ action: 'clinical_update', ...Object.fromEntries(new FormData(e.currentTarget)) }); }}><label>Next stage<select className="contact-purpose-select" name="status"><option value="testing_recommended">Testing recommended</option><option value="completed">Consultation completed</option></select></label><label>Clinical summary<textarea name="summary" required minLength={40} maxLength={6000}/></label><label>Clear explanation and next steps for the family<textarea name="familyMessage" required minLength={30} maxLength={4000}/></label><label>Outcome if completing this consultation<select className="contact-purpose-select" name="outcome" defaultValue=""><option value="">Choose an outcome</option><option value="sma_confirmed">Genetically confirmed SMA</option><option value="sma_not_confirmed">SMA not confirmed</option><option value="inconclusive">Inconclusive — explain onward assessment</option><option value="other_referral">Other clinical referral</option></select></label><p className={styles.meta}>Record confirmation only after reviewing the laboratory report. Do not close a testing-dependent pathway before reviewing the available results and explaining next steps.</p><button className="btn btn-primary" disabled={busy}>Save clinical update</button></form></section>}
 {admin && <section className={styles.panel}><h2>Case coordination and funding</h2>{c.status === 'reported' && <form className={styles.form} onSubmit={e => { e.preventDefault(); void action({ action: 'assign', ...Object.fromEntries(new FormData(e.currentTarget)) }); }}><label>Verified clinician<select className="contact-purpose-select" name="clinicianId" required defaultValue=""><option value="" disabled>Select a clinician</option>{data.clinicians?.map(d => <option key={d.id} value={d.id}>{d.full_name}{d.default_remuneration === "donated" ? " — donates by default" : " — agreed fee by default"}</option>)}</select></label><p className={styles.meta}>Assignment preserves the current default fee and scope. The clinician must accept before beginning work.</p><button className="btn btn-primary" disabled={busy}>Assign consultation</button></form>}{c.status === 'testing_recommended' && <form className={styles.form} onSubmit={e => { e.preventDefault(); void action({ action: 'arrange_testing', ...Object.fromEntries(new FormData(e.currentTarget)) }); }}><label>Laboratory and collection arrangement reference<textarea name="reference" required minLength={15} maxLength={500}/></label><button className="btn btn-primary" disabled={busy}>Record testing arrangements</button></form>}{c.status !== 'withdrawn' && <><h3>Propose a programme expense</h3><form className={styles.form} onSubmit={e => { e.preventDefault(); void action({ action: 'expense', ...Object.fromEntries(new FormData(e.currentTarget)) }); }}><div className={styles.grid}><label>Expense type<select className="contact-purpose-select" name="kind"><option value="laboratory">Laboratory</option>{c.remuneration !== "donated" && <option value="consultation">Completed consultation</option>}<option value="transport">Transport</option><option value="other">Other</option></select></label><label>Amount in naira<input name="amountNaira" inputMode="decimal" required pattern="[0-9]+([.][0-9]{1,2})?"/></label></div><label>Description<input name="description" required minLength={10} maxLength={500}/></label><label>Invoice or evidence reference<input name="evidenceReference" required minLength={10} maxLength={500}/></label><label>Donor or funding allocation<input name="donorAllocation" required minLength={3} maxLength={180}/></label><p className={styles.meta}>A different administrator must approve this expense. A consultation expense must match the accepted fee and completed clinical work.</p><button className="btn btn-primary" disabled={busy}>Propose expense</button></form></>}</section>}
 {!admin && !doctor && c.status !== 'withdrawn' && <section className={styles.panel}><h2>Your choices</h2><p>You can withdraw this case from the service. The assigned clinician will no longer be able to open it through the portal. This does not automatically delete your records. Contact us if you want to ask about your information or request its deletion.</p><form className={styles.form} onSubmit={e => { e.preventDefault(); void action({ action: 'withdraw' }); }}><label className={`${styles.check} editor-checkbox`}><input type="checkbox" required/><span>I want to withdraw this case from the service.</span></label><button className="btn btn-secondary" disabled={busy}>Withdraw this case</button></form></section>}
 </div>;
}
