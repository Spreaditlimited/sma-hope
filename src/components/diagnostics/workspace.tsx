'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ConsultationPreferenceField } from './consultation-preference';
import { STATUS_LABELS } from '@/lib/diagnostics/domain';
import { ConcernForm, ClinicianForm } from './forms';
import styles from './diagnostics.module.css';
type CaseList = {
    id: string;
    reference: string;
    patient_name: string;
    state: string;
    status: string;
};
type Data = {
    cases: CaseList[];
    assigned: CaseList[];
    profile: {
        status: string;
        fullName: string;
        defaultRemuneration: string;
    } | null;
    settings: {
        intakeOpen: boolean;
    };
};
export function DiagnosticWorkspace({ clinician = false }: {
    clinician?: boolean;
}) {
    const [data, setData] = useState<Data | null>(null), [error, setError] = useState(''), [reload, setReload] = useState(0);
    const [savingPreference,setSavingPreference] = useState(false);
    const load = () => setReload(x => x + 1);
    async function savePreference(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault(); if(savingPreference)return; setSavingPreference(true); setError('');
        try {const response=await fetch('/api/diagnostics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'consultation_preference',remuneration:new FormData(event.currentTarget).get('remuneration')})});const result=await response.json();if(!response.ok)throw new Error(result.error);load();}
        catch(error){setError(error instanceof Error?error.message:'Please try again.');}
        finally{setSavingPreference(false);}
    }
    useEffect(() => { const abort = new AbortController(); fetch('/api/diagnostics', { cache: 'no-store', signal: abort.signal }).then(async (r) => { const v = await r.json(); if (!r.ok)
        throw new Error(v.error); if (!abort.signal.aborted) {
        setData(v);
        setError('');
    } }).catch(e => { if (!abort.signal.aborted)
        setError(e instanceof Error ? e.message : 'Please try again.'); }); return () => abort.abort(); }, [reload]);
    return <div className={styles.page}>{error && <p role="alert">{error} <button className="text-link" onClick={() => void load()}>Try again</button></p>}{!data && !error && <p role="status">Loading your private workspace…</p>}{data && <>
 {clinician ? <><section className={styles.panel}><h2>Your clinician application</h2>{data.profile ? <p><strong>{data.profile.fullName}</strong> · {data.profile.status}. We check your identity and professional registration and agree your consultation responsibilities before you can take on cases.</p> : <ClinicianForm onSaved={() => void load()}/>}{data.profile && <form className={styles.form} onSubmit={savePreference}><ConsultationPreferenceField key={data.profile.defaultRemuneration} name="remuneration" label="Your ongoing consultation preference" defaultValue={data.profile.defaultRemuneration} disabled={savingPreference} help="You can choose differently for each case before accepting it. Changing this preference applies to future assignments and does not change an existing agreement."/><button className="btn btn-secondary" disabled={savingPreference}>{savingPreference?'Saving…':'Save preference'}</button></form>}</section><section className={styles.panel}><h2>Assigned consultations</h2><p>Your assigned cases appear here. Before you accept a consultation, you can review the fee and what it covers. Access depends on your professional verification remaining up to date.</p><Cases cases={data.assigned}/></section></> : <><aside className={styles.alert}><strong>Do not wait for an online response in an emergency.</strong><p>Serious breathing difficulty, choking or inability to swallow needs urgent medical attention. This reporting service does not provide emergency care.</p></aside><section className={styles.panel}><h2>Your reports</h2><Cases cases={data.cases}/></section><section className={styles.panel}><h2>Tell us what you’ve noticed</h2><p>Tell us what has been worrying you so we can help arrange an assessment. After submitting a report, you can add documents, photos or videos privately if you wish.</p><ConcernForm intakeOpen={data.settings.intakeOpen} onSaved={() => void load()}/></section></>}
 </>}</div>;
}
function Cases({ cases }: {
    cases: CaseList[];
}) { return cases.length ? <ul className={styles.list}>{cases.map(c => <li key={c.id}><Link href={'/account/diagnostics/' + c.id}>{c.patient_name}</Link><p className={styles.meta}>{c.reference} · {c.state} · {STATUS_LABELS[c.status] || c.status}</p></li>)}</ul> : <p>No cases to show yet.</p>; }
