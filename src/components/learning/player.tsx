'use client';
import Link from 'next/link';
import Script from 'next/script';
import { useState,useEffect,useRef,useCallback,type FormEvent } from 'react';
import { accountAuth } from '@/lib/auth/client';
import { AccountWorkspaceShell } from '@/components/account/workspace-shell';
import styles from './learning.module.css';
import { LearningEmailPreferences } from './email-preferences';
type Question={id:string;question:string;options:string[]};
type Lesson={slug:string;title:string;summary:string;duration:number;position:number;completed:boolean;latest:{score:number;total:number;passed:boolean}|null;questions:Question[]};
type State={enrolled:boolean;lessons:Lesson[]};
type Result={score:number;total:number;passed:boolean;results:{id:string;correct:boolean;explanation:string}[]};
type Playback={embedUrl:string;expiresAt:string;transcript:string;sources:string};
type StreamPlayer={currentTime:number;addEventListener:(name:string,cb:()=>void)=>void;removeEventListener:(name:string,cb:()=>void)=>void};
declare global{interface Window{Stream?:(el:HTMLIFrameElement)=>StreamPlayer}}
async function api<T>(url:string,body?:unknown,signal?:AbortSignal):Promise<T>{const r=await fetch(url,{cache:'no-store',signal,...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Please try again.');return j;}
function LearningVideo({lesson,onError,onPosition}:{lesson:Lesson;onError:(message:string)=>void;onPosition:(slug:string,position:number)=>void}){
  const [playback,setPlayback]=useState<Playback|null>(null),[sdk,setSdk]=useState(false),[attempt,setAttempt]=useState(0),[error,setError]=useState(''),[startTime,setStartTime]=useState(Math.floor(lesson.position));
  const iframe=useRef<HTMLIFrameElement>(null),position=useRef(lesson.position),last=useRef(0);
  useEffect(()=>{const c=new AbortController();api<Playback>(`/api/learning/playback?lesson=${encodeURIComponent(lesson.slug)}`,undefined,c.signal).then(pb=>{setStartTime(Math.floor(position.current));setPlayback(pb);}).catch(e=>{if(!c.signal.aborted)setError(e.message);});return()=>c.abort();},[lesson.slug,attempt]);
  useEffect(()=>{
    if(!sdk||!playback||!iframe.current||!window.Stream)return;
    const player=window.Stream(iframe.current);
    const seek=()=>{if(position.current>1&&position.current<lesson.duration-2)player.currentTime=position.current;};
    const save=()=>{position.current=player.currentTime;if(!Number.isFinite(position.current))return;api('/api/learning',{action:'progress',lesson:lesson.slug,position:position.current}).then(()=>onPosition(lesson.slug,position.current)).catch(()=>onError('Your playback position could not be saved. Check your connection.'));};
    const tick=()=>{position.current=player.currentTime;if(Date.now()-last.current>15000){last.current=Date.now();save();}};
    const failed=()=>setError('The video could not play. Please reload the video.');
    player.addEventListener('loadedmetadata',seek);player.addEventListener('timeupdate',tick);player.addEventListener('pause',save);player.addEventListener('ended',save);player.addEventListener('error',failed);
    const expires=window.setTimeout(()=>{setPlayback(null);setAttempt(x=>x+1);},Math.max(1000,new Date(playback.expiresAt).getTime()-Date.now()-60000));
    return()=>{clearTimeout(expires);player.removeEventListener('loadedmetadata',seek);player.removeEventListener('timeupdate',tick);player.removeEventListener('pause',save);player.removeEventListener('ended',save);player.removeEventListener('error',failed);if(Number.isFinite(player.currentTime)){onPosition(lesson.slug,player.currentTime);void fetch('/api/learning',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'progress',lesson:lesson.slug,position:player.currentTime}),keepalive:true});}};
  },[sdk,playback,lesson.slug,lesson.duration,onError,onPosition]);
  return <><Script src="https://embed.cloudflarestream.com/embed/sdk.latest.js" onReady={()=>setSdk(true)}/>{error?<div className={styles.videoLoading} role="alert"><div><p>{error}</p><button className="btn btn-secondary" onClick={()=>{setError('');setPlayback(null);setAttempt(x=>x+1);}}>Reload video</button></div></div>:playback?<iframe ref={iframe} className={styles.video} src={`${playback.embedUrl}?primaryColor=%23986c48&letterboxColor=%23173a2b&startTime=${startTime}`} title={lesson.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen/>:<div className={styles.videoLoading} role="status">Preparing your video…</div>}<p className={styles.note}>English captions are available in the player. Your place is saved as you watch.</p>{playback&&<details className={styles.panel}><summary>Read the lesson transcript</summary><div className={styles.transcript}>{playback.transcript}</div><h3>Sources and further reading</h3><div className={styles.sources}>{playback.sources}</div></details>}</>;
}
function Quiz({lesson,completed}:{lesson:Lesson;completed:()=>void}){
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [result,setResult]=useState<Result|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const summary=useRef<HTMLParagraphElement>(null);
  const heading=useRef<HTMLHeadingElement>(null);
  const retryFocus=useRef(false);

  useEffect(()=>{
    // Keep the form mounted so submitting never collapses the page behind the reader.
    const target=result?summary.current:retryFocus.current?heading.current:null;
    if(!target)return;
    retryFocus.current=false;
    target.focus({preventScroll:true});
    target.scrollIntoView({block:'nearest',behavior:'instant'});
  },[result]);

  async function submit(e:FormEvent){
    e.preventDefault();
    if(busy||result)return;
    setBusy(true);setError('');
    try{
      const r=await api<Result>('/api/learning',{action:'quiz',lesson:lesson.slug,answers:lesson.questions.map(q=>answers[q.id])});
      setResult(r);
      if(r.passed)completed();
    }catch(e){setError(e instanceof Error?e.message:'Please try again.');}
    finally{setBusy(false);}
  }
  function retry(){retryFocus.current=true;setAnswers({});setResult(null);setError('');}

  return <section className={`${styles.panel} ${styles.quizPanel}`}>
    <p className={styles.eyebrow}>Put it into practice</p>
    <h2 ref={heading} tabIndex={-1} className={styles.quizFocus}>Check your understanding.</h2>
    <p>Answer three questions after watching. Two correct answers complete the lesson. Read the explanations and try again whenever you need.</p>
    {lesson.latest&&!result&&<p className={styles.note}>Last attempt: {lesson.latest.score} of {lesson.latest.total} correct.</p>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    <form onSubmit={submit} aria-busy={busy}>
      {lesson.questions.map((q,i)=><fieldset key={q.id} disabled={busy||Boolean(result)}>
        <legend>{i+1}. {q.question}</legend>
        {q.options.map((option,j)=><label className={styles.option} key={option}>
          <input type="radio" name={q.id} required value={j} checked={answers[q.id]===j} onChange={()=>setAnswers(a=>({...a,[q.id]:j}))}/>
          <span>{option}</span>
        </label>)}
      </fieldset>)}
      <button type="submit" className="btn btn-primary" disabled={busy||Boolean(result)}>{busy?'Saving answers…':result?'Answers checked':'Check my answers →'}</button>
    </form>
    {result&&<div className={styles.quizFeedback} role="region" aria-label="Your quiz results">
      <p ref={summary} tabIndex={-1} role="status" className={`${styles.success} ${styles.quizFocus}`}><strong>{result.score} of {result.total} correct.</strong> {result.passed?'Lesson completed.':'Review the explanations and try again.'}</p>
      {result.results.map((x,i)=><div className={styles.explanation} key={x.id}><strong>{i+1}. {x.correct?'Correct':'Review this answer'}</strong><p>{x.explanation}</p></div>)}
      <button type="button" className={`btn btn-secondary ${styles.quizRetry}`} onClick={retry}>Try the questions again</button>
    </div>}
  </section>;
}
export function CourseWorkspace(){
  const {data:session,isPending}=accountAuth.useSession(),[state,setState]=useState<State|null>(null),[slug,setSlug]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
  const videoError=useCallback((message:string)=>setError(message),[]);
  const savedPosition=useCallback((slug:string,position:number)=>setState(s=>s?{...s,lessons:s.lessons.map(l=>l.slug===slug?{...l,position}:l)}:s),[]);
  useEffect(()=>{if(!session?.user)return;const c=new AbortController();api<State>('/api/learning',undefined,c.signal).then(s=>{setState(s);const requested=new URLSearchParams(window.location.search).get('lesson');setSlug(current=>current||(s.lessons.some(l=>l.slug===requested)?requested!:null)||s.lessons.find(x=>!x.completed)?.slug||s.lessons[0]?.slug||'');}).catch(e=>{if(!c.signal.aborted)setError(e.message);});return()=>c.abort();},[session?.user,retry]);
  async function enrol(){setBusy(true);setError('');try{await api('/api/learning',{action:'enrol'});setRetry(x=>x+1);}catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
  const lesson=state?.lessons.find(x=>x.slug===slug),done=state?.lessons.filter(x=>x.completed).length||0,index=state?.lessons.findIndex(x=>x.slug===slug)??-1;
  return <AccountWorkspaceShell title="Understanding SMA" subtitle="Recognise the signs. Know the next step." email={session?.user.email||''}><div className={styles.course}>{isPending?<p role="status">Loading your account…</p>:!session?.user?<section className={styles.enrol}><p className={styles.eyebrow}>Understanding SMA</p><h2>Start with a little understanding.</h2><p>Five free video lessons, useful questions and a place to save your progress. No payment details required.</p><div className={styles.actions}><Link href="/account/register" className="btn btn-primary">Create free account ↗</Link><Link href="/account/login?next=/account/learn" className="text-link">Sign in →</Link></div><p className={styles.note}>Already a supporter? Use your existing SMA Hope account.</p></section>:<>{error&&<div className={styles.error} role="alert">{error} <button onClick={()=>{setError('');setRetry(x=>x+1);}} className="text-link">Retry</button></div>}{!state&&!error?<p role="status">Loading your learning space…</p>:state&&!state.enrolled?<section className={styles.enrol}><p className={styles.eyebrow}>A free SMA Hope course</p><h2>Notice the signs.<br/>Know the next step.</h2><p>Learn what SMA is, recognise changes that deserve attention, and prepare for a conversation with a doctor. All five lessons are available at your pace.</p><button onClick={enrol} className="btn btn-primary" disabled={busy}>{busy?'Enrolling…':'Enrol free and start learning →'}</button><p className={styles.note}>We save your enrolment, playback position, quiz answers and lesson completion. No medical information is required. <Link href="/privacy-policy">Privacy notice</Link>.</p></section>:state?.enrolled&&lesson?<><div className={styles.top}><Link href="/learn/understanding-sma" className="text-link">← About this course</Link><span className={styles.courseBadge}>Free SMA Hope course</span></div><div className={styles.workspace}><aside className={styles.sidebar}><div className={styles.courseOverview}><p className={styles.eyebrow}>Your learning path</p><h2>Course progress</h2><div className={styles.progress}><span>{done} of 5 lessons completed</span><strong>{done*20}%</strong></div><progress value={done} max={5} aria-label="Lessons completed"/></div><label className={styles.mobileLessonPicker}>Choose a lesson<select value={slug} onChange={e=>{setSlug(e.target.value);setError('');}}>{state.lessons.map((l,i)=><option key={l.slug} value={l.slug}>{String(i+1).padStart(2,'0')}. {l.title}{l.completed?' — Completed':''}</option>)}</select></label><nav className={styles.lessonList} aria-label="Course lessons">{state.lessons.map((l,i)=><button key={l.slug} aria-current={l.slug===slug} onClick={()=>{setSlug(l.slug);setError('');}}><strong>{l.completed?'✓':String(i+1).padStart(2,'0')}</strong><span>{l.title}<small>{Math.floor(l.duration/60)}:{String(Math.round(l.duration%60)).padStart(2,'0')} · {l.completed?'Completed':l.slug===slug?'Now learning':'Video and questions'}</small></span></button>)}</nav><p className={styles.sidebarNote}>Learn at your pace.<br/>Your progress is saved automatically.</p></aside><article className={styles.content}><header className={styles.lessonHeader}><p className={styles.eyebrow}>Lesson {String(index+1).padStart(2,'0')} of 05 <span>·</span> {Math.floor(lesson.duration/60)}:{String(Math.round(lesson.duration%60)).padStart(2,'0')} video</p><h2 className={styles.lessonTitle}>{lesson.title}</h2><p>{lesson.summary}</p></header><LearningVideo key={lesson.slug} lesson={lesson} onError={videoError} onPosition={savedPosition}/><Quiz key={`quiz-${lesson.slug}`} lesson={lesson} completed={()=>setState(s=>s?{...s,lessons:s.lessons.map(l=>l.slug===slug?{...l,completed:true}:l)}:s)}/><div className={styles.lessonNavigation}>{index>0&&<button className="btn btn-secondary" onClick={()=>setSlug(state.lessons[index-1].slug)}>← Previous lesson</button>}{index<4&&<button className="btn btn-primary" onClick={()=>setSlug(state.lessons[index+1].slug)}>Next lesson →</button>}</div>{done===5&&<section className={styles.completionNotice}><span aria-hidden="true">✓</span><div><h2>You’ve completed Understanding SMA.</h2><p>Thank you for learning with SMA Hope. Keep asking questions, share what you have learned and encourage appropriate medical assessment.</p><div className={styles.actions}><Link href="/account/learn/feedback" className="btn btn-primary">Share your course feedback →</Link><Link href="/book" className="text-link">Meet the family behind SMA Hope →</Link></div></div></section>}<p className={styles.careNote}>This course builds awareness, not a clinical qualification. Persistent weakness or lost skills deserves medical attention. Serious breathing difficulty needs emergency care immediately.</p></article></div></>:null}</>}</div><LearningEmailPreferences /></AccountWorkspaceShell>;
}
