import 'server-only';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/database/pool';
import { sendTransactionalEmail, renderEmailTemplate } from '@/lib/email';
import { env } from '@/lib/env';
import type { EmailDesign } from '@/lib/email-template';
function learningDesign(message: ReturnType<typeof reminderMessage>): EmailDesign {
 return { variant:'learning', heading:message.heading, copy:message.copy.replace(/([.!?]) /,'$1\n\n'), action:{label:message.label,url:message.url}, links:{unsubscribe:message.unsubscribe,preferences:new URL('/account/email-preferences',authOrigin()).href,share:message.share} };
}
import { authOrigin } from '@/lib/auth/server';
import { smaCourseLessons, SMA_COURSE_SLUG } from './content';
import { nextReminder, reminderMessage, type Journey, type Delivery } from './reminder-policy';
const stamp=(v:unknown)=>v ? new Date(v as string).getTime() : 0;
export function cronAuthorised(header: string | null) {
 const secret=process.env.CRON_SECRET;
 if(!secret || secret.length<32 || !header)return false;
 const a=Buffer.from(header),b=Buffer.from(`Bearer ${secret}`);
 return a.length===b.length && timingSafeEqual(a,b);
}
export async function preferences(userId:string) {
 const [r]=await getPool().promise().query<RowDataPacket[]>('SELECT enabled,paused_until FROM learning_email_preferences WHERE user_id=?',[userId]);
 return {enabled:Boolean(r[0]?.enabled),pausedUntil:r[0]?.paused_until?new Date(r[0].paused_until).toISOString():null};
}
export async function savePreferences(userId:string,enabled:boolean,pauseDays:number,source='account') {
 if(![0,7,30].includes(pauseDays))throw new Error('Invalid pause');
 const db=await getPool().promise().getConnection();
 try{
  await db.beginTransaction();
  await db.query(`INSERT INTO learning_email_preferences(user_id,enabled,paused_until,token,source) VALUES(?,?,?, ?,?)
   ON DUPLICATE KEY UPDATE enabled_at=IF(enabled=0 AND VALUES(enabled)=1,NOW(3),enabled_at),token=IF(enabled=0 AND VALUES(enabled)=1,VALUES(token),token),enabled=VALUES(enabled),paused_until=VALUES(paused_until),source=VALUES(source),updated_at=NOW(3)`,[userId,enabled,pauseDays?new Date(Date.now()+pauseDays*86400000):null,randomBytes(32).toString('hex'),source]);
  await db.query('INSERT INTO learning_email_audit(actor_id,action) VALUES(?,?)',[userId,enabled?pauseDays?'preferences_paused':'preferences_enabled':'preferences_disabled']);
  await db.commit();
 }catch(e){await db.rollback();throw e;}finally{db.release();}
}
export async function unsubscribe(token:string) {
 if(!/^[a-f0-9]{64}$/.test(token))return false;
 const db=await getPool().promise().getConnection();
 try{
  await db.beginTransaction();
  const [r]=await db.query<RowDataPacket[]>('SELECT user_id FROM learning_email_preferences WHERE token=? FOR UPDATE',[token]);
  if(!r.length){await db.rollback();return false;}
  await db.query('UPDATE learning_email_preferences SET enabled=0,paused_until=NULL,updated_at=NOW(3) WHERE token=?',[token]);
  await db.query("INSERT INTO learning_email_audit(actor_id,action) VALUES(?,'unsubscribe')",[r[0].user_id]);
  await db.commit();return true;
 }catch(e){await db.rollback();throw e;}finally{db.release();}
}
export async function candidates(userId?:string) {
 const [rows]=await getPool().promise().query<RowDataPacket[]>(`SELECT u.id,u.email,u.active,u.createdAt,p.enabled,p.enabled_at,p.paused_until,p.token,
 e.enrolled_at,e.active enrolment_active,
 (SELECT MAX(updated_at) FROM learning_progress WHERE user_id=u.id AND course_slug=?) progress_at,
 (SELECT MAX(created_at) FROM learning_attempts WHERE user_id=u.id AND course_slug=?) attempt_at
 FROM learning_email_preferences p JOIN account_identity u ON u.id=p.user_id
 LEFT JOIN learning_enrolments e ON e.user_id=u.id AND e.course_slug=?
 WHERE p.enabled=1 AND u.active=1 AND (p.paused_until IS NULL OR p.paused_until<=NOW(3)) ${userId?'AND u.id=?':''}`,[SMA_COURSE_SLUG,SMA_COURSE_SLUG,SMA_COURSE_SLUG,...(userId?[userId]:[])]);
 // Batch all progress and delivery state, not one query per learner.
 const [progress]=await getPool().promise().query<RowDataPacket[]>(`SELECT user_id,lesson_slug,position_seconds,completed_at FROM learning_progress WHERE course_slug=? ${userId?'AND user_id=?':''}`,[SMA_COURSE_SLUG,...(userId?[userId]:[])]);
 const [sent]=await getPool().promise().query<RowDataPacket[]>(`SELECT user_id,message_key,status,created_at FROM learning_email_deliveries ${userId?'WHERE user_id=?':''}`,userId?[userId]:[]);
 const progressByUser=new Map<string,RowDataPacket[]>(),sentByUser=new Map<string,Delivery[]>();
 for(const r of progress){const a=progressByUser.get(r.user_id)||[];a.push(r);progressByUser.set(r.user_id,a);}
 for(const r of sent){const a=sentByUser.get(r.user_id)||[];a.push({key:r.message_key,at:stamp(r.created_at),status:r.status});sentByUser.set(r.user_id,a);}
 return rows.map(r=>{
  const ps=progressByUser.get(r.id)||[];
  const completed=ps.filter(x=>x.completed_at && smaCourseLessons.some(l=>l.slug===x.lesson_slug));
  const journey:Journey={enabled:!!r.enabled,active:!!r.active && r.enrolment_active!==0,pausedUntil:stamp(r.paused_until),optedAt:stamp(r.enabled_at),createdAt:stamp(r.createdAt),enrolledAt:r.enrolled_at?stamp(r.enrolled_at):null,lastActivity:Math.max(stamp(r.progress_at),stamp(r.attempt_at)),started:ps.some(x=>x.position_seconds>0)||!!r.attempt_at,completed:completed.length,completedAt:Math.max(0,...completed.map(x=>stamp(x.completed_at))),nextLesson:smaCourseLessons.find(l=>!completed.some(x=>x.lesson_slug===l.slug))?.slug||'',deliveries:sentByUser.get(r.id)||[]};
  return {userId:r.id as string,email:r.email as string,token:r.token as string,journey};
 });
}
export async function reminderOverview() {
 const db=getPool().promise();
 const [[settings],[stats],[recent],[audit]]=await Promise.all([
 db.query<RowDataPacket[]>('SELECT enabled,updated_at FROM learning_email_settings WHERE id=1'),
 db.query<RowDataPacket[]>('SELECT status,COUNT(*) count FROM learning_email_deliveries GROUP BY status'),
 db.query<RowDataPacket[]>('SELECT message_key,status,created_at,sent_at FROM learning_email_deliveries ORDER BY created_at DESC LIMIT 30'),
 db.query<RowDataPacket[]>('SELECT action,created_at FROM learning_email_audit ORDER BY id DESC LIMIT 20')]);
 const learners=await candidates(),due:Record<string,number>={};
 for(const l of learners){const key=nextReminder(l.journey,Date.now());if(key)due[key]=(due[key]||0)+1;}
 return {enabled:!!settings[0]?.enabled,senderConfigured:!!env.helpEmailAddress && !!env.helpEmailPassword, schedulerConfigured:!!process.env.CRON_SECRET && process.env.CRON_SECRET.length>=32,optedIn:learners.length,due,stats,recent,audit,templates:['welcome','enrol','start','resume','finish','final','complete'].map(k=>{const m=reminderMessage(k as Parameters<typeof reminderMessage>[0],authOrigin(),'PREVIEW');return {...m,html:renderEmailTemplate({subject:m.subject,text:m.text,siteUrl:authOrigin(),design:learningDesign(m)})};})};
}
export async function setReminderSwitch(enabled:boolean,actor:string) {
 const db=await getPool().promise().getConnection();
 try{await db.beginTransaction();await db.query('UPDATE learning_email_settings SET enabled=?,updated_at=NOW(3),updated_by=? WHERE id=1',[enabled,actor]);await db.query('INSERT INTO learning_email_audit(actor_id,action) VALUES(?,?)',[actor,enabled?'journeys_activated':'journeys_paused']);await db.commit();}catch(e){await db.rollback();throw e;}finally{db.release();}
}
export async function runReminders() {
 const db=await getPool().promise().getConnection();
 let accepted=0,uncertain=0;
 try {
  const [lock]=await db.query<RowDataPacket[]>("SELECT GET_LOCK('smahope_learning_emails',0) acquired");
  if(!lock[0]?.acquired)return {status:'busy',accepted,uncertain};
  const [settings]=await db.query<RowDataPacket[]>('SELECT enabled FROM learning_email_settings WHERE id=1');
  if(!settings[0]?.enabled)return {status:'paused',accepted,uncertain};
  const initial=await candidates();
  const due=initial.filter(l=>nextReminder(l.journey,Date.now())).slice(0,20);
  const started=Date.now();
  for(const old of due){
   if(Date.now()-started>40000)break;
   // Refresh all predicates immediately before dispatch, including opt-out and completion.
   const l=(await candidates(old.userId)).find(x=>x.userId===old.userId);
   const key=l&&nextReminder(l.journey,Date.now());if(!l||!key)continue;
   const [on]=await db.query<RowDataPacket[]>('SELECT enabled FROM learning_email_settings WHERE id=1');if(!on[0]?.enabled)break;
   const id=randomUUID();
   await db.query('INSERT INTO learning_email_deliveries(id,user_id,message_key,status) VALUES(?,?,?,?)',[id,l.userId,key,'reserved']);
   const m=reminderMessage(key,authOrigin(),l.token,l.journey.nextLesson);
   const unsubscribeUrl=new URL('/api/learning/emails/unsubscribe',authOrigin());unsubscribeUrl.searchParams.set('token',l.token);
   try{
    const result=await sendTransactionalEmail({to:l.email,subject:m.subject,text:m.text,design:learningDesign(m),headers:{'List-Unsubscribe':`<${unsubscribeUrl.href}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'},messageId:`<learning-${id}@smahope.org>`});
    if(result.skipped){await db.query("UPDATE learning_email_deliveries SET status='skipped' WHERE id=?",[id]);continue;}
    await db.query("UPDATE learning_email_deliveries SET status='accepted',sent_at=NOW(3) WHERE id=?",[id]);accepted++;
   }catch(failure){
    const rejection=failure as {code?:string;responseCode?:number};
    if(rejection.code==='EENVELOPE' && [550,551,553].includes(rejection.responseCode||0)){
     await db.query("UPDATE learning_email_deliveries SET status='rejected' WHERE id=?",[id]);
     await db.query("UPDATE learning_email_preferences SET enabled=0,source='hard-bounce',updated_at=NOW(3) WHERE user_id=?",[l.userId]);
     await db.query("INSERT INTO learning_email_audit(actor_id,action) VALUES(?,'recipient_rejected')",[l.userId]);
     continue;
    }
    // A timeout may follow successful SMTP acceptance. Manual reconciliation, never automatic resend.
    await db.query("UPDATE learning_email_deliveries SET status='uncertain' WHERE id=?",[id]);uncertain++;
   }
  }
  return {status:'processed',accepted,uncertain};
 }finally{await db.query("SELECT RELEASE_LOCK('smahope_learning_emails')").catch(()=>{});db.release();}
}
