'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import type { CourseFeedback } from '@/lib/learning/feedback-input';
import styles from './course-feedback.module.css';
type SavedFeedback = CourseFeedback & { updatedAt: string };
export function CourseFeedbackForm() {
  const [loaded, setLoaded] = useState(false), [eligible, setEligible] = useState(true);
  const [saved, setSaved] = useState<SavedFeedback | null>(null), [rating, setRating] = useState(0);
  const [helpful, setHelpful] = useState(''), [improvement, setImprovement] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/learning/feedback', { cache: 'no-store', signal: abort.signal }).then(async response => {
      if (response.status === 403) { setEligible(false); setLoaded(true); return; }
      if (!response.ok) throw Error();
      const data: { feedback: SavedFeedback | null } = await response.json();
      if (abort.signal.aborted) return;
      setSaved(data.feedback); setRating(data.feedback?.rating || 0);
      setHelpful(data.feedback?.helpful || ''); setImprovement(data.feedback?.improvement || '');
      setLoaded(true); setError('');
    }).catch(() => { if (!abort.signal.aborted) setError('We could not load your feedback. Please try again.'); });
    return () => abort.abort();
  }, [retry]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/learning/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating, helpful, improvement }) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Please try again shortly.');
      setSaved(data.feedback); setNotice('Thank you. Your feedback has been saved and will help us improve the course.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Please try again shortly.'); }
    finally { setBusy(false); }
  }
  return <div className={styles.page}><section className={styles.panel} aria-labelledby="course-feedback-heading">
    <h2 id="course-feedback-heading">How was the course for you?</h2>
    <p>Your feedback helps us improve Understanding SMA. You can update it later. Only the foundation can read it.</p>
    {error && <p role="alert">{error} {!loaded && <button className="text-link" onClick={() => setRetry(value => value + 1)}>Try again</button>}</p>}
    {!loaded ? !error && <p role="status">Loading your feedback…</p> : !eligible ? <p>Enrol in the free course before sharing feedback. <Link href="/account/learn" className="text-link">Go to the course →</Link></p> : <form onSubmit={submit}>
      <fieldset disabled={busy}><legend>How would you rate the course so far?</legend><span className={styles.hint}>1 = not useful · 5 = very useful</span><div className={styles.ratings}>{[1, 2, 3, 4, 5].map(value => <label key={value}><input type="radio" name="course-rating" value={value} checked={rating === value} onChange={() => { setRating(value); setNotice(''); }} required /><span>{value}<span className="sr-only"> out of 5</span></span></label>)}</div></fieldset>
      <label className={styles.field}>What helped you most? <span className={styles.hint}>Optional · up to 2,000 characters</span><textarea value={helpful} onChange={event => { setHelpful(event.target.value); setNotice(''); }} maxLength={2000} disabled={busy} /></label>
      <label className={styles.field}>What could we explain or do better? <span className={styles.hint}>Optional · up to 2,000 characters. Please focus on the course and avoid personal medical details.</span><textarea value={improvement} onChange={event => { setImprovement(event.target.value); setNotice(''); }} maxLength={2000} disabled={busy} /></label>
      <div className={styles.actions}><button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving your feedback…' : saved ? 'Update my feedback' : 'Send my feedback'}</button><Link href="/account/learn" className="text-link">Back to learning →</Link></div>
      {notice && <p role="status">{notice}</p>}
      {saved && <p className={styles.meta}>Last saved {new Date(saved.updatedAt).toLocaleDateString('en-GB')}. One response per learner; saving again updates your feedback.</p>}
    </form>}
  </section></div>;
}
