import 'server-only';
import { randomUUID, createHash } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/database/pool';
import { SMA_COURSE_SLUG, SMA_QUIZ_VERSION, smaCourseLessons, gradeSmaQuiz } from './content';
import assets from './assets.json';

export const lessonAsset = (slug: string) => assets[smaCourseLessons.findIndex(x => x.slug === slug)];
export async function courseSettings() {
  const [rows] = await getPool().promise().query<RowDataPacket[]>('SELECT * FROM learning_courses WHERE slug=?',[SMA_COURSE_SLUG]);
  return rows[0] as {slug:string; title:string; is_free:number; is_published:number} | undefined;
}
export async function requireEnrolment(userId: string) {
  const [rows] = await getPool().promise().query<RowDataPacket[]>('SELECT id FROM learning_enrolments WHERE user_id=? AND course_slug=? AND active=1',[userId,SMA_COURSE_SLUG]);
  if (!rows.length) throw new Error('Enrol first');
}
export async function enrol(userId: string) {
  const db=await getPool().promise().getConnection();
  try {
    await db.beginTransaction();
    const [courses]=await db.query<RowDataPacket[]>('SELECT is_free,is_published FROM learning_courses WHERE slug=? FOR UPDATE',[SMA_COURSE_SLUG]);
    if (!courses[0]?.is_free || !courses[0]?.is_published) throw new Error('Enrolment closed');
    await db.query('INSERT IGNORE INTO learning_enrolments(id,user_id,course_slug) VALUES(?,?,?)',[randomUUID(),userId,SMA_COURSE_SLUG]);
    const [rows]=await db.query<RowDataPacket[]>('SELECT active FROM learning_enrolments WHERE user_id=? AND course_slug=?',[userId,SMA_COURSE_SLUG]);
    if (!rows[0]?.active) throw new Error('Enrolment closed');
    await db.commit();
  } catch(e) {await db.rollback();throw e;} finally {db.release();}
}
export async function learningState(userId:string) {
  const [enrolments]=await getPool().promise().query<RowDataPacket[]>('SELECT active FROM learning_enrolments WHERE user_id=? AND course_slug=?',[userId,SMA_COURSE_SLUG]);
  if (!enrolments[0]?.active) return {enrolled:false,lessons:[]};
  const [progress]=await getPool().promise().query<RowDataPacket[]>('SELECT lesson_slug,position_seconds,completed_at FROM learning_progress WHERE user_id=? AND course_slug=?',[userId,SMA_COURSE_SLUG]);
  const [attempts]=await getPool().promise().query<RowDataPacket[]>('SELECT q.lesson_slug,q.score,q.total,q.passed FROM learning_attempts q JOIN (SELECT lesson_slug,MAX(id) id FROM learning_attempts WHERE user_id=? AND course_slug=? AND quiz_version=? GROUP BY lesson_slug) last ON last.id=q.id',[userId,SMA_COURSE_SLUG,SMA_QUIZ_VERSION]);
  return {enrolled:true,lessons:smaCourseLessons.map((lesson,i)=>{
    const p=progress.find(x=>x.lesson_slug===lesson.slug),a=attempts.find(x=>x.lesson_slug===lesson.slug);
    return {slug:lesson.slug,title:lesson.title,summary:lesson.summary,duration:assets[i].duration,position:Number(p?.position_seconds||0),completed:Boolean(p?.completed_at),latest:a?{score:a.score,total:a.total,passed:Boolean(a.passed)}:null,questions:lesson.questions.map(({id,question,options})=>({id,question,options}))};
  })};
}
export async function savePosition(userId:string,slug:string,position:unknown) {
  const asset=lessonAsset(slug);
  if (!asset || typeof position!=='number' || !Number.isFinite(position) || position<0 || position>asset.duration+2) throw new Error('Invalid progress');
  await requireEnrolment(userId);
  await getPool().promise().query('INSERT INTO learning_progress(user_id,course_slug,lesson_slug,position_seconds) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE position_seconds=VALUES(position_seconds),updated_at=NOW(3)',[userId,SMA_COURSE_SLUG,slug,Math.floor(position)]);
}
export async function submitQuiz(userId:string,slug:string,answers:unknown) {
  await requireEnrolment(userId);
  const result=gradeSmaQuiz(slug,answers);
  const db=await getPool().promise().getConnection();
  try {
    await db.beginTransaction();
    await db.query('INSERT INTO learning_attempts(user_id,course_slug,lesson_slug,quiz_version,answers_json,score,total,passed) VALUES(?,?,?,?,?,?,?,?)',[userId,SMA_COURSE_SLUG,slug,SMA_QUIZ_VERSION,JSON.stringify(answers),result.score,result.total,result.passed]);
    if (result.passed) await db.query('INSERT INTO learning_progress(user_id,course_slug,lesson_slug,completed_at) VALUES(?,?,?,NOW(3)) ON DUPLICATE KEY UPDATE completed_at=COALESCE(completed_at,VALUES(completed_at)),updated_at=NOW(3)',[userId,SMA_COURSE_SLUG,slug]);
    await db.commit();return result;
  } catch(e){await db.rollback();throw e;} finally {db.release();}
}
export async function rateLimit(key:string,max:number,seconds=60) {
  const bucket=Math.floor(Date.now()/(seconds*1000));
  const hashed=createHash('sha256').update('learning:'+key).digest('hex');
  const db=getPool().promise();
  await db.query('INSERT INTO auth_rate_limit(id,`key`,count,lastRequest) VALUES(?,?,1,?) ON DUPLICATE KEY UPDATE count=IF(lastRequest=VALUES(lastRequest),count+1,1),lastRequest=VALUES(lastRequest)',[randomUUID(),hashed,bucket]);
  const [rows]=await db.query<RowDataPacket[]>('SELECT count FROM auth_rate_limit WHERE `key`=?',[hashed]);
  if (Number(rows[0]?.count)>max) throw new Error('Too many attempts');
}
export async function learningReport(month:string) {
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Invalid month');
  const [y,m]=month.split('-').map(Number),start=new Date(Date.UTC(y,m-1,1)),end=new Date(Date.UTC(y,m,1));
  const db=getPool().promise();
  const [learners]=await db.query<RowDataPacket[]>('SELECT e.user_id,e.enrolled_at,(SELECT COUNT(*) FROM learning_progress p WHERE p.user_id=e.user_id AND p.course_slug=e.course_slug AND p.completed_at IS NOT NULL) completed FROM learning_enrolments e WHERE course_slug=? AND active=1 AND enrolled_at>=? AND enrolled_at<? ORDER BY enrolled_at',[SMA_COURSE_SLUG,start,end]);
  const [attempts]=await db.query<RowDataPacket[]>('SELECT q.user_id,q.id,q.score,q.total,s.first_id,s.last_id FROM learning_attempts q JOIN (SELECT user_id,lesson_slug,MIN(id) first_id,MAX(id) last_id FROM learning_attempts WHERE course_slug=? AND quiz_version=? GROUP BY user_id,lesson_slug) s ON q.id=s.first_id OR q.id=s.last_id',[SMA_COURSE_SLUG,SMA_QUIZ_VERSION]);
  const rows=learners.map(l=>{
    const a=attempts.filter(x=>x.user_id===l.user_id);
    return {learner:createHash('sha256').update(l.user_id).digest('hex').slice(0,16),enrolledAt:l.enrolled_at,completedLessons:Number(l.completed),first:a.filter(x=>String(x.id)===String(x.first_id)).reduce((v,x)=>v+Number(x.score),0),latest:a.filter(x=>String(x.id)===String(x.last_id)).reduce((v,x)=>v+Number(x.score),0),questions:a.filter(x=>String(x.id)===String(x.first_id)).reduce((v,x)=>v+Number(x.total),0)};
  });
  return {month,enrolments:rows.length,completions:rows.filter(x=>x.completedLessons===5).length,attempted:rows.filter(x=>x.questions>0).length,rows};
}
