import 'server-only';
import { createHash } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/database/pool';
import { SMA_COURSE_SLUG, SMA_QUIZ_VERSION, smaCourseLessons } from './content';
import assets from './assets.json';
import type { CourseStatus, LearningOverview, LearnerDetail, LearnerSummary } from './report-types';

const PAGE_SIZE=20;
const slugs=smaCourseLessons.map(l=>l.slug);
const placeholders=slugs.map(()=>'?').join(',');
export function parseLearningQuery(params:URLSearchParams) {
  const month=params.get('month')||'all',status=params.get('status')||'all',search=(params.get('search')||'').trim(),rawPage=params.get('page')||'1';
  if(month!=='all'&&!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))throw new Error('Invalid filters');
  if(!['all','not_started','in_progress','completed','inactive'].includes(status)||search.length>180||!/^\d{1,6}$/.test(rawPage)||Number(rawPage)<1)throw new Error('Invalid filters');
  return {month,status,search,page:Number(rawPage)};
}
export function learnerReference(id:string){return createHash('sha256').update(id).digest('hex').slice(0,16);}
export function learnerStatus(completed:number,started:boolean):CourseStatus{return completed===slugs.length?'completed':started?'in_progress':'not_started';}
export function csvCohort(rows:Pick<LearnerSummary,'reference'|'enrolledAt'|'completedLessons'|'firstScore'|'latestScore'|'questions'>[]) {
  return ['learner,enrolled_at,completed_lessons,first_score,latest_score,questions_attempted',...rows.map(x=>[x.reference,x.enrolledAt,x.completedLessons,x.firstScore,x.latestScore,x.questions].join(','))].join('\r\n');
}
function cohort(month:string,alias='e') {
  if(month==='all')return {sql:'',values:[] as Date[]};
  const [y,m]=month.split('-').map(Number);
  return {sql:` AND ${alias}.enrolled_at>=? AND ${alias}.enrolled_at<?`,values:[new Date(Date.UTC(y,m-1,1)),new Date(Date.UTC(y,m,1))]};
}
function base(month:string) {
  const period=cohort(month);
  // Aggregate each activity table before joining so attempts cannot multiply enrolment counts.
  return {sql:`SELECT e.user_id,u.name,u.email,u.active account_active,e.enrolled_at,
    COALESCE(p.completed,0) completed,
    (COALESCE(p.started,0)>0 OR COALESCE(a.attempts,0)>0) started,
    GREATEST(e.enrolled_at,COALESCE(p.last_activity,e.enrolled_at),COALESCE(a.last_activity,e.enrolled_at)) last_activity
    FROM learning_enrolments e JOIN account_identity u ON u.id=e.user_id
    LEFT JOIN (SELECT user_id,SUM(completed_at IS NOT NULL) completed,SUM(position_seconds>0 OR completed_at IS NOT NULL) started,MAX(updated_at) last_activity
      FROM learning_progress WHERE course_slug=? AND lesson_slug IN (${placeholders}) GROUP BY user_id) p ON p.user_id=e.user_id
    LEFT JOIN (SELECT user_id,COUNT(*) attempts,MAX(created_at) last_activity
      FROM learning_attempts WHERE course_slug=? AND lesson_slug IN (${placeholders}) GROUP BY user_id) a ON a.user_id=e.user_id
    WHERE e.course_slug=? AND e.active=1${period.sql}`,
    values:[SMA_COURSE_SLUG,...slugs,SMA_COURSE_SLUG,...slugs,SMA_COURSE_SLUG,...period.values]};
}
const iso=(value:string|Date)=>new Date(value).toISOString();
function summary(r:RowDataPacket):LearnerSummary {
  return {id:r.user_id,reference:learnerReference(r.user_id),name:r.name,email:r.email,accountActive:Boolean(r.account_active),enrolledAt:iso(r.enrolled_at),lastActivityAt:iso(r.last_activity),completedLessons:Number(r.completed),status:learnerStatus(Number(r.completed),Boolean(r.started)),inactive:Number(r.completed)<slugs.length&&new Date(r.last_activity).getTime()<=Date.now()-7*86400000,firstScore:Number(r.first_score||0),latestScore:Number(r.latest_score||0),questions:Number(r.questions||0)};
}
function scoreSql() {
  return `SELECT s.user_id,SUM(f.score) first_score,SUM(l.score) latest_score,SUM(f.total) questions
    FROM (SELECT user_id,lesson_slug,MIN(id) first_id,MAX(id) last_id FROM learning_attempts WHERE course_slug=? AND quiz_version=? AND lesson_slug IN (${placeholders}) GROUP BY user_id,lesson_slug) s
    JOIN learning_attempts f ON f.id=s.first_id JOIN learning_attempts l ON l.id=s.last_id GROUP BY s.user_id`;
}
export async function learningOverview(params:URLSearchParams):Promise<LearningOverview> {
  const query=parseLearningQuery(params),b=base(query.month),db=getPool().promise();
  const statusSql:Record<string,string>={all:'',not_started:' AND started=0',in_progress:` AND started=1 AND completed<${slugs.length}`,completed:` AND completed=${slugs.length}`,inactive:` AND completed<${slugs.length} AND last_activity<=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 7 DAY)`};
  let filter=statusSql[query.status];const filterValues:string[]=[];
  if(query.search){const term='%'+query.search.toLowerCase().replace(/[!%_]/g,c=>'!'+c)+'%';filter+=" AND (LOWER(name) LIKE ? ESCAPE '!' OR LOWER(email) LIKE ? ESCAPE '!' OR LEFT(SHA2(learners.user_id,256),16) LIKE ? ESCAPE '!')";filterValues.push(term,term,term);}
  const where=`FROM (${b.sql}) learners WHERE 1=1${filter}`;
  const [[metrics],[counts],[courses]]=await Promise.all([
    db.query<RowDataPacket[]>(`SELECT COUNT(*) enrolled,COALESCE(SUM(started=1),0) started,COALESCE(SUM(completed=${slugs.length}),0) completed,COALESCE(SUM(started=0),0) not_started,COALESCE(SUM(completed<${slugs.length} AND last_activity<=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 7 DAY)),0) inactive FROM (${b.sql}) learners`,b.values),
    db.query<RowDataPacket[]>(`SELECT COUNT(*) total ${where}`,[...b.values,...filterValues]),
    db.query<RowDataPacket[]>('SELECT slug,title,is_free,is_published FROM learning_courses WHERE slug=?',[SMA_COURSE_SLUG]),
  ]);
  const total=Number(counts[0].total),pages=Math.max(1,Math.ceil(total/PAGE_SIZE)),page=Math.min(query.page,pages);
  const [records]=await db.query<RowDataPacket[]>(`SELECT learners.*,COALESCE(scores.first_score,0) first_score,COALESCE(scores.latest_score,0) latest_score,COALESCE(scores.questions,0) questions
    FROM (${b.sql}) learners LEFT JOIN (${scoreSql()}) scores ON scores.user_id=learners.user_id WHERE 1=1${filter} ORDER BY enrolled_at DESC,learners.user_id ASC LIMIT ? OFFSET ?`,[...b.values,SMA_COURSE_SLUG,SMA_QUIZ_VERSION,...slugs,...filterValues,PAGE_SIZE,(page-1)*PAGE_SIZE]);
  const period=cohort(query.month);
  const [engagement]=await db.query<RowDataPacket[]>(`SELECT lesson_slug,COUNT(*) reached,SUM(completed) completed,SUM(attempted) attempted FROM (
    SELECT user_id,lesson_slug,MAX(completed) completed,MAX(attempted) attempted FROM (
      SELECT p.user_id,p.lesson_slug,(p.completed_at IS NOT NULL) completed,0 attempted FROM learning_progress p JOIN learning_enrolments e ON e.user_id=p.user_id AND e.course_slug=p.course_slug WHERE p.course_slug=? AND e.active=1${period.sql} AND (p.position_seconds>0 OR p.completed_at IS NOT NULL)
      UNION ALL SELECT q.user_id,q.lesson_slug,0 completed,1 attempted FROM learning_attempts q JOIN learning_enrolments e ON e.user_id=q.user_id AND e.course_slug=q.course_slug WHERE q.course_slug=? AND e.active=1${period.sql}
    ) events WHERE lesson_slug IN (${placeholders}) GROUP BY user_id,lesson_slug
  ) activity GROUP BY lesson_slug`,[SMA_COURSE_SLUG,...period.values,SMA_COURSE_SLUG,...period.values,...slugs]);
  const m=metrics[0],enrolled=Number(m.enrolled),completed=Number(m.completed);
  return {month:query.month,generatedAt:new Date().toISOString(),metrics:{enrolled,started:Number(m.started),completed,notStarted:Number(m.not_started),inactive:Number(m.inactive),completionRate:enrolled?Math.round(completed/enrolled*100):0},lessons:smaCourseLessons.map(l=>{const a=engagement.find(x=>x.lesson_slug===l.slug);return {slug:l.slug,title:l.title,reached:Number(a?.reached||0),attempted:Number(a?.attempted||0),completed:Number(a?.completed||0)};}),learners:records.map(summary),pagination:{page,pages,total,pageSize:PAGE_SIZE},course:courses[0]?{title:courses[0].title,isFree:Boolean(courses[0].is_free),isPublished:Boolean(courses[0].is_published)}:null};
}
export async function learningCohortCsv(month:string) {
  parseLearningQuery(new URLSearchParams({month}));const b=base(month),db=getPool().promise();
  const [rows]=await db.query<RowDataPacket[]>(`SELECT learners.*,scores.first_score,scores.latest_score,scores.questions FROM (${b.sql}) learners LEFT JOIN (${scoreSql()}) scores ON scores.user_id=learners.user_id ORDER BY enrolled_at,learners.user_id`,[...b.values,SMA_COURSE_SLUG,SMA_QUIZ_VERSION,...slugs]);
  return csvCohort(rows.map(summary));
}
export async function learnerDetail(userId:string):Promise<LearnerDetail|null> {
  if(!/^[A-Za-z0-9_-]{1,64}$/.test(userId))throw new Error('Invalid learner');
  const b=base('all'),db=getPool().promise();
  const [users]=await db.query<RowDataPacket[]>(`SELECT * FROM (${b.sql}) learners WHERE user_id=?`,[...b.values,userId]);
  if(!users.length)return null;
  const [[progress],[attempts]]=await Promise.all([
    db.query<RowDataPacket[]>('SELECT lesson_slug,position_seconds,completed_at FROM learning_progress WHERE user_id=? AND course_slug=?',[userId,SMA_COURSE_SLUG]),
    db.query<RowDataPacket[]>(`SELECT s.lesson_slug,s.attempts,f.score first_score,l.score latest_score,l.total,l.passed FROM (SELECT lesson_slug,COUNT(*) attempts,MIN(id) first_id,MAX(id) last_id FROM learning_attempts WHERE user_id=? AND course_slug=? AND quiz_version=? GROUP BY lesson_slug) s JOIN learning_attempts f ON f.id=s.first_id JOIN learning_attempts l ON l.id=s.last_id`,[userId,SMA_COURSE_SLUG,SMA_QUIZ_VERSION]),
  ]);
  const lessons=smaCourseLessons.map((l,i)=>{const p=progress.find(x=>x.lesson_slug===l.slug),a=attempts.find(x=>x.lesson_slug===l.slug);return {slug:l.slug,title:l.title,duration:assets[i].duration,position:Number(p?.position_seconds||0),completedAt:p?.completed_at?iso(p.completed_at):null,attempts:Number(a?.attempts||0),firstScore:a?Number(a.first_score):null,latestScore:a?Number(a.latest_score):null,totalQuestions:l.questions.length,latestPassed:a?Boolean(a.passed):null};});
  return {learner:summary(users[0]),lessons};
}
