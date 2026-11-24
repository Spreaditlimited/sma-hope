'use client';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { useAdminSession } from '@/lib/admin/use-admin-session';
import { adminFetch } from '@/lib/admin/client';
import styles from '@/components/learning/course-feedback.module.css';
type Report = { total: number; average: number | null; page: number; pages: number; responses: { name: string; rating: number; helpful: string; improvement: string; completed: number; updatedAt: string }[] };
const date = (value: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(value));
export default function Page() {
  const session = useAdminSession(), [page, setPage] = useState(1), [retry, setRetry] = useState(0);
  const [loaded, setLoaded] = useState<{ page: number; data: Report } | null>(null), [error, setError] = useState('');
  useEffect(() => {
    if (session.loading) return;
    const abort = new AbortController();
    adminFetch<Report>(`/api/admin/learning/feedback?page=${page}`, { signal: abort.signal }).then(data => { if (!abort.signal.aborted) { setLoaded({ page, data }); setError(''); } }).catch(() => { if (!abort.signal.aborted) setError('Course feedback could not load. Please try again.'); });
    return () => abort.abort();
  }, [session.loading, page, retry]);
  const data = loaded?.page === page ? loaded.data : null;
  return <AdminShell title="Course feedback" subtitle="Listen to learners and use their experience to improve the course." email={session.email} role={session.role}><div className={styles.page}>
    <p className={styles.meta}>Private learner feedback. Ratings reflect people who chose to respond, not all learners. Responses are not published as testimonials.</p>
    {error ? <p role="alert">{error} <button className="text-link" onClick={() => { setError(''); setRetry(value => value + 1); }}>Try again</button></p> : !data ? <p role="status">Loading course feedback…</p> : <>
      <div className={styles.stats}><div><strong>{data.total}</strong><span>Learner responses</span></div><div><strong>{data.average === null ? '—' : `${data.average} / 5`}</strong><span>Average usefulness rating</span></div></div>
      {!data.total && <section className={styles.panel}><h2>Ready to listen.</h2><p>Feedback will appear here when learners submit it from their course dashboard or completion email.</p></section>}
      {data.responses.map((response, index) => <article key={`${page}-${index}`} className={`${styles.panel} ${styles.response}`}><header><div><h2>{response.name}</h2><p className={styles.meta}>{response.rating} / 5 usefulness · {response.completed} of 5 lessons completed now</p></div><time dateTime={response.updatedAt}>{date(response.updatedAt)} UK</time></header><h3>What helped</h3><p className={styles.answer}>{response.helpful || 'No written answer provided.'}</p><h3>What could improve</h3><p className={styles.answer}>{response.improvement || 'No written answer provided.'}</p></article>)}
      {data.total > 0 && <div className={styles.pagination}><p>Page {data.page} of {data.pages}</p><div><button className="btn btn-secondary" disabled={data.page <= 1} onClick={() => setPage(data.page - 1)}>Previous</button><button className="btn btn-secondary" disabled={data.page >= data.pages} onClick={() => setPage(data.page + 1)}>Next</button></div></div>}
    </>}
  </div></AdminShell>;
}
