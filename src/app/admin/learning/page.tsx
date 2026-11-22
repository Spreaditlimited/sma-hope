'use client';
import { useEffect,useRef,useState, type FormEvent } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { useAdminSession } from '@/lib/admin/use-admin-session';
import { adminFetch } from '@/lib/admin/client';
import type { LearnerDetail,LearningOverview,CourseStatus } from '@/lib/learning/report-types';
import styles from './page.module.css';

const statusLabels:Record<CourseStatus,string>={not_started:'Not started',in_progress:'In progress',completed:'Completed'};
const date=(value:string)=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/London'}).format(new Date(value));
const timestamp=(value:string)=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Europe/London'}).format(new Date(value));
const time=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
const currentMonth=()=>{const parts=new Intl.DateTimeFormat('en-GB',{year:'numeric',month:'2-digit',timeZone:'Europe/London'}).formatToParts(new Date());return parts.find(p=>p.type==='year')!.value+'-'+parts.find(p=>p.type==='month')!.value;};

function LearnerProgress({id,onClose}:{id:string;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null),[data,setData]=useState<LearnerDetail|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{dialog.current?.showModal();},[]);
  useEffect(()=>{
    const abort=new AbortController();
    adminFetch<LearnerDetail>(`/api/admin/learning?learner=${encodeURIComponent(id)}`,{cache:'no-store',signal:abort.signal})
      .then(result=>{if(!abort.signal.aborted){setData(result);setError('');}})
      .catch(()=>{if(!abort.signal.aborted)setError('Unable to load this learner. Please try again.');});
    return()=>abort.abort();
  },[id,retry]);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="learner-progress-title" onClose={onClose}>
    <div className={styles.dialogHeader}><div><p className={styles.eyebrow}>Individual progress</p><h2 id="learner-progress-title">{data?.learner.name||'Learner record'}</h2></div><button type="button" className={styles.close} onClick={()=>dialog.current?.close()} autoFocus aria-label="Close learner progress">Close ×</button></div>
    {error?<div className={styles.error} role="alert">{error} <button type="button" className="text-link" onClick={()=>setRetry(x=>x+1)}>Retry</button></div>:!data?<p className={styles.loading} role="status">Loading learner progress…</p>:<>
      <div className={styles.identity}><a href={`mailto:${data.learner.email}`}>{data.learner.email}</a><span>Reference {data.learner.reference}</span></div>
      <dl className={styles.detailStats}><div><dt>Enrolled</dt><dd>{date(data.learner.enrolledAt)}</dd></div><div><dt>Last course activity</dt><dd>{timestamp(data.learner.lastActivityAt)} UK</dd></div><div><dt>Lessons completed</dt><dd>{data.learner.completedLessons} / 5</dd></div><div><dt>Status</dt><dd>{statusLabels[data.learner.status]}</dd></div></dl>
      {!data.learner.accountActive&&<p className={styles.warning}>This learning account is inactive.</p>}
      {data.learner.inactive&&<p className={styles.warning}>This learner has not completed the course and has no recorded course activity in the last seven days.</p>}
      <div className={styles.detailLessons}>{data.lessons.map((l,i)=><article key={l.slug}><div className={styles.lessonTitle}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{l.title}</h3><p>{l.completedAt?`Completed ${date(l.completedAt)}`:l.attempts?'Questions attempted':l.position>0?'Video progress saved':'No activity recorded'}</p></div><span className={`${styles.badge} ${l.completedAt?styles.completed:''}`}>{l.completedAt?'Passed':'Not complete'}</span></div><dl className={styles.lessonDetails}><div><dt>Saved playback position</dt><dd>{time(l.position)} / {time(l.duration)}</dd></div><div><dt>Quiz attempts</dt><dd>{l.attempts}</dd></div><div><dt>First score</dt><dd>{l.firstScore===null?'—':`${l.firstScore} / ${l.totalQuestions}`}</dd></div><div><dt>Latest score</dt><dd>{l.latestScore===null?'—':`${l.latestScore} / ${l.totalQuestions}`}{l.latestPassed===false?' · Not passed':''}</dd></div></dl></article>)}</div>
      <p className={styles.note}>Playback position is a resume point, not verified watch time. Completion means a lesson check was passed. Quiz counts and scores refer to the current question version; completed lessons remain complete after later attempts.</p>
    </>}
  </dialog>;
}

export default function LearningAdmin() {
  const {loading,email,role}=useAdminSession();
  const [period,setPeriod]=useState('all'),[month,setMonth]=useState(currentMonth),[search,setSearch]=useState(''),[term,setTerm]=useState(''),[status,setStatus]=useState('all'),[page,setPage]=useState(1),[refresh,setRefresh]=useState(0);
  const [loaded,setLoaded]=useState<{key:string;data:LearningOverview}|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[saving,setSaving]=useState(false),[selected,setSelected]=useState<string|null>(null);
  const cohort=period==='all'?'all':month;
  const query=new URLSearchParams({month:cohort,search:term,status,page:String(page)}).toString(),key=query+'#'+refresh;
  useEffect(()=>{
    if(loading)return;
    const abort=new AbortController();
    adminFetch<LearningOverview>('/api/admin/learning?'+query,{cache:'no-store',signal:abort.signal})
      .then(data=>{if(!abort.signal.aborted){setLoaded({key,data});setError('');}})
      .catch(()=>{if(!abort.signal.aborted)setError('Unable to load learning data. Please try again.');});
    return()=>abort.abort();
  },[loading,query,key]);
  const data=loaded?.data||null,pending=loaded?.key!==key;
  const displayCohort=data?.month||cohort;
  function reload(){setError('');setRefresh(x=>x+1);}
  function filterChange(){setPage(1);setError('');setSelected(null);}
  function searchLearners(event:FormEvent<HTMLFormElement>){event.preventDefault();setTerm(search.trim());filterChange();}
  async function save(isFree:boolean,isPublished:boolean){
    if(saving)return;setSaving(true);setNotice('');
    try{await adminFetch('/api/admin/learning',{method:'POST',body:JSON.stringify({isFree,isPublished})});setNotice('Course settings saved. Existing learners keep access.');reload();}
    catch{setNotice('Course settings could not be saved. Please try again.');}
    finally{setSaving(false);}
  }
  return <AdminShell title="Learning overview" subtitle="See who you reach, how they progress and where they need support." email={email} role={role}>
    <div className={styles.page} aria-busy={pending&&!error}>
      <div className={styles.toolbar}><div className={styles.period}><label>Enrolment period<select value={period} onChange={e=>{setPeriod(e.target.value);filterChange();}}><option value="all">All time</option><option value="month">Choose a month</option></select></label>{period==='month'&&<label>Joined in<input type="month" value={month} required min="2020-01" max="2099-12" onChange={e=>{if(e.target.value){setMonth(e.target.value);filterChange();}}}/></label>}</div><div className={styles.toolbarActions}><button type="button" className="text-link" onClick={reload} disabled={pending&&!error}>{pending&&!error?'Refreshing…':'Refresh ↻'}</button><a className={`btn btn-secondary ${styles.export}`} href={`/api/admin/learning?month=${cohort}&format=csv`}>Export anonymous report ↓</a></div></div>
      <p className={styles.scope}>Figures cover {displayCohort==='all'?'all enrolled learners':'learners who joined in '+new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(displayCohort+'-01T00:00:00Z'))}. Progress is shown as it stands now. Search and status filters apply only to the learner list.</p>
      {error&&<div className={styles.error} role="alert">{error}{data?' Showing the last successfully loaded report.':''} <button className="text-link" onClick={reload}>Retry</button></div>}
      {notice&&<p className={styles.notice} role="status">{notice}</p>}
      {!data&&!error&&<div className={styles.loading} role="status">Loading course performance…</div>}
      {data&&<>
        <section className={styles.metrics} aria-label="Course performance">
          {[{title:'Enrolled learners',value:data.metrics.enrolled,sub:'Unique active course enrolments'},{title:'Started learning',value:data.metrics.started,sub:'Saved video progress or a quiz attempt'},{title:'Completed all five',value:data.metrics.completed,sub:data.metrics.enrolled?`${data.metrics.completionRate}% of enrolled learners`:'Completion rate appears after enrolment'},{title:'Not started yet',value:data.metrics.notStarted,sub:'Enrolled, with no recorded lesson activity'}].map(m=><article key={m.title}><p>{m.title}</p><strong>{m.value.toLocaleString('en-GB')}</strong><span>{m.sub}</span></article>)}
        </section>
        <div className={styles.attention}><div><span className={styles.attentionNumber}>{data.metrics.inactive}</span><div><h2>No activity in seven days</h2><p>Incomplete learners whose last recorded course activity or enrolment was at least seven days ago.</p></div></div><button type="button" className="text-link" onClick={()=>{setStatus('inactive');setTerm('');setSearch('');filterChange();document.getElementById('learner-directory')?.scrollIntoView({behavior:'auto',block:'start'});}}>View learners →</button></div>
        <section className={styles.panel} aria-labelledby="engagement-title"><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Where people continue</p><h2 id="engagement-title">Lesson engagement</h2></div><span className={styles.subtle}>{data.metrics.enrolled} enrolled</span></div><p className={styles.note}>Compare the number reaching each lesson with the number passing its questions. Lessons can be taken out of order, so a difference between rows is not a confirmed drop-out.</p><div className={styles.engagement}>{data.lessons.map((l,i)=><article key={l.slug}><div className={styles.lessonHeading}><span>{String(i+1).padStart(2,'0')}</span><h3>{l.title}</h3></div><div className={styles.bars}><div><span>Reached</span><div className={styles.track}><div style={{width:`${data.metrics.enrolled?l.reached/data.metrics.enrolled*100:0}%`}}/></div><strong>{l.reached}</strong></div><div><span>Completed</span><div className={styles.track}><div className={styles.passedBar} style={{width:`${data.metrics.enrolled?l.completed/data.metrics.enrolled*100:0}%`}}/></div><strong>{l.completed}</strong></div></div><p>{l.attempted} attempted the questions · {Math.max(0,l.reached-l.completed)} reached, not yet complete</p></article>)}</div><p className={styles.note}>“Reached” means saved playback above zero, a quiz attempt or a passed lesson check. This is engagement evidence, not a measure of verified watch time.</p></section>
        <section className={styles.panel} id="learner-directory" aria-labelledby="learners-title"><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>People behind the numbers</p><h2 id="learners-title">Learner directory</h2></div><span className={styles.subtle}>{data.pagination.total} matching learners</span></div><form className={styles.filters} onSubmit={searchLearners}><label className={styles.search}>Find a learner<input type="search" value={search} maxLength={180} onChange={e=>setSearch(e.target.value)} placeholder="Name, email or learner reference"/></label><button type="submit" className="btn btn-primary">Search</button><label>Progress<select value={status} onChange={e=>{setStatus(e.target.value);filterChange();}}><option value="all">All learners</option><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="inactive">No activity in 7 days</option></select></label>{(term||status!=='all')&&<button type="button" className="text-link" onClick={()=>{setTerm('');setSearch('');setStatus('all');filterChange();}}>Clear filters</button>}</form>
          <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Learner progress table"><table><thead><tr><th scope="col">Learner</th><th scope="col">Joined</th><th scope="col">Progress</th><th scope="col">Quiz scores</th><th scope="col">Last activity</th><th scope="col"><span className={styles.srOnly}>View details</span></th></tr></thead><tbody>{data.learners.map(l=><tr key={l.id}><td><strong>{l.name}</strong><span>{l.email}</span><small>{l.reference}</small></td><td data-label="Joined">{date(l.enrolledAt)}</td><td data-label="Progress"><span className={`${styles.badge} ${l.status==='completed'?styles.completed:''}`}>{statusLabels[l.status]}</span><span>{l.completedLessons} of 5 lessons{!l.accountActive?' · Account inactive':''}</span></td><td data-label="Quiz scores">{l.questions?<><strong>Latest {l.latestScore}/{l.questions}</strong><span>First {l.firstScore}/{l.questions}</span></>:<span>Not attempted</span>}</td><td data-label="Last activity">{date(l.lastActivityAt)}{l.inactive&&<span className={styles.quiet}>No activity in 7 days</span>}</td><td><button type="button" className="text-link" aria-label={`View progress for ${l.name}`} onClick={()=>setSelected(l.id)}>View progress ↗</button></td></tr>)}</tbody></table></div>
          {!data.learners.length&&<div className={styles.empty}><h3>{term||status!=='all'?'No matching learners':'No enrolments in this period'}</h3><p>{term||status!=='all'?'Try another search or clear the filters.':'Learners will appear here after they enrol in the course.'}</p></div>}
          <div className={styles.pagination}><p>{data.pagination.total?`${(data.pagination.page-1)*data.pagination.pageSize+1}–${Math.min(data.pagination.page*data.pagination.pageSize,data.pagination.total)} of ${data.pagination.total}`:'0 learners'}</p><div><button type="button" className="btn btn-secondary" disabled={data.pagination.page<=1} onClick={()=>{setPage(data.pagination.page-1);setError('');}}>Previous</button><span>Page {data.pagination.page} of {data.pagination.pages}</span><button type="button" className="btn btn-secondary" disabled={data.pagination.page>=data.pagination.pages} onClick={()=>{setPage(data.pagination.page+1);setError('');}}>Next</button></div></div>
          <p className={styles.note}>Names and email addresses are for authorised foundation staff. Exports contain anonymous learner references and cover the entire selected enrolment period, regardless of directory filters. Quiz scores compare first and latest attempts, not a pre-course and post-course assessment.</p>
        </section>
        {data.course&&role==='admin'&&<section className={styles.panel}><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Course availability</p><h2>Understanding SMA</h2></div><span className={`${styles.badge} ${data.course.isPublished&&data.course.isFree?styles.completed:''}`}>{data.course.isPublished&&data.course.isFree?'Open for enrolment':'New enrolment closed'}</span></div><div className={styles.settings}><label><input type="checkbox" role="switch" checked={data.course.isFree} disabled={saving} onChange={e=>save(e.target.checked,data.course!.isPublished)}/><span>Free enrolment<small>No payment is required to join.</small></span></label><label><input type="checkbox" role="switch" checked={data.course.isPublished} disabled={saving} onChange={e=>save(data.course!.isFree,e.target.checked)}/><span>Published<small>The course is available to new learners.</small></span></label></div><p className={styles.note}>Turning either setting off closes new enrolment. Existing enrolled learners keep access. No paid checkout is enabled.</p></section>}
        <p className={styles.updated}>Updated {timestamp(data.generatedAt)} UK time · Refresh to retrieve the latest records.</p>
      </>}
    </div>
    {selected&&<LearnerProgress key={selected} id={selected} onClose={()=>setSelected(null)}/>}
  </AdminShell>;
}
