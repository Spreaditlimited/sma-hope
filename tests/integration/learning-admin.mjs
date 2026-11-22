import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseEnv} from 'node:util';
import {randomUUID,createHmac} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),mysql=require('mysql2/promise');
const env=parseEnv(fs.readFileSync('/private/tmp/sma-lms-test.env','utf8')),u=new URL(env.SMAHOPE_TEST_DATABASE_URL),origin=env.SMAHOPE_AUTH_URL;
assert.equal(u.host,'127.0.0.1:33317');assert.equal(u.pathname,'/smahope_test');assert.equal(origin,'http://localhost:3021');
const db=await mysql.createConnection({host:u.hostname,port:Number(u.port),user:u.username,password:decodeURIComponent(u.password),database:'smahope_test',timezone:'Z'});
const ts=require('typescript'),exports={};new Function('exports',ts.transpileModule(fs.readFileSync('src/lib/learning/content.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(exports);
const lessons=exports.smaCourseLessons,version=exports.SMA_QUIZ_VERSION,course=exports.SMA_COURSE_SLUG;
const run='adminqa-'+randomUUID().slice(0,8),ids=[],admins=[],checks=[];
const check=s=>{checks.push(s);console.log('PASS '+s);};
const sign=(token,secret)=>encodeURIComponent(token+'.'+createHmac('sha256',secret).update(token).digest('base64'));
async function api(query='',cookie='',method='GET',body,site=origin){return fetch(origin+'/api/admin/learning'+query,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(method==='POST'?{'Content-Type':'application/json',Origin:site}:{})},body:body?JSON.stringify(body):undefined});}
async function identity(table,name,email){const id=randomUUID();await db.query(`INSERT INTO ${table}(id,name,email,emailVerified,createdAt,updatedAt,active) VALUES(?,?,?,1,NOW(3),NOW(3),1)`,[id,name,email]);return id;}
async function admin(role){const id=await identity('administrator_identity',run+' '+role,run+'-'+role+'@example.test');admins.push(id);await db.query('INSERT INTO admin_users(id,auth_user_id,email,role,active) VALUES(?,?,?,?,1)',[randomUUID(),id,run+'-'+role+'@example.test',role]);const token=randomUUID();await db.query('INSERT INTO administrator_session(id,token,userId,expiresAt,createdAt,updatedAt) VALUES(?,?,?,DATE_ADD(NOW(3),INTERVAL 8 HOUR),NOW(3),NOW(3))',[randomUUID(),token,id]);return 'smahope_admin.session_token='+sign(token,env.SMAHOPE_ADMIN_AUTH_SECRET);}
let initial;
try{
 const adminCookie=await admin('admin'),opsCookie=await admin('ops');
 const baseline=await api('?month=all',adminCookie);assert.equal(baseline.status,200,await baseline.clone().text());const before=await baseline.json();initial=before.course;
 for(let i=0;i<25;i++){
  const name=run+' '+(i===0?'Completed parent':i===1?'Returning learner':i===2?'Quiet learner':i===3?'100%_literal':'Learner '+String(i).padStart(2,'0'));
  const id=await identity('account_identity',name,run+'-'+i+'@example.test');ids.push(id);
  await db.query('INSERT INTO learning_enrolments(id,user_id,course_slug,enrolled_at) VALUES(?,?,?,DATE_SUB(NOW(3),INTERVAL 10 DAY))',[randomUUID(),id,course]);
 }
 for(const l of lessons){
  await db.query('INSERT INTO learning_progress(user_id,course_slug,lesson_slug,position_seconds,completed_at) VALUES(?,?,?,37,NOW(3))',[ids[0],course,l.slug]);
  for(const [score,passed] of [[0,0],[3,1]])await db.query('INSERT INTO learning_attempts(user_id,course_slug,lesson_slug,quiz_version,answers_json,score,total,passed) VALUES(?,?,?,?,?, ?,3,?)',[ids[0],course,l.slug,version,'[0,0,0]',score,passed]);
 }
 await db.query('INSERT INTO learning_progress(user_id,course_slug,lesson_slug,position_seconds,completed_at) VALUES(?,?,?,60,NOW(3))',[ids[1],course,lessons[0].slug]);
 await db.query('INSERT INTO learning_attempts(user_id,course_slug,lesson_slug,quiz_version,answers_json,score,total,passed) VALUES(?,?,?,?,?,0,3,0)',[ids[1],course,lessons[0].slug,version,'[0,0,0]']);
 // Out-of-order engagement must not be presented as a sequential funnel.
 await db.query('INSERT INTO learning_progress(user_id,course_slug,lesson_slug,position_seconds,updated_at) VALUES(?,?,?,40,DATE_SUB(NOW(3),INTERVAL 8 DAY))',[ids[2],course,lessons[4].slug]);
 const cookieToken=randomUUID();await db.query('INSERT INTO account_session(id,token,userId,expiresAt,createdAt,updatedAt) VALUES(?,?,?,DATE_ADD(NOW(3),INTERVAL 1 HOUR),NOW(3),NOW(3))',[randomUUID(),cookieToken,ids[0]]);const learnerCookie='smahope_account.session_token='+sign(cookieToken,env.SMAHOPE_AUTH_SECRET);
 assert.equal((await api()).status,401);assert.equal((await api('?learner='+ids[0])).status,401);assert.equal((await api('?format=csv')).status,401);assert.equal((await api('',learnerCookie)).status,401);check('Anonymous and learner sessions cannot read overview, learner details or exports');
 const data=await(await api('?month=all',adminCookie)).json();assert.equal(data.metrics.enrolled,before.metrics.enrolled+25);assert.equal(data.metrics.started,before.metrics.started+3);assert.equal(data.metrics.completed,before.metrics.completed+1);assert.equal(data.metrics.notStarted,before.metrics.notStarted+22);assert.equal(data.metrics.inactive,before.metrics.inactive+23);assert.equal(data.lessons[0].reached,before.lessons[0].reached+2);assert.equal(data.lessons[4].reached,before.lessons[4].reached+2);check('Counts are deduplicated across repeated quiz attempts and recognise out-of-order lesson activity');
 const searched=await(await api('?search='+encodeURIComponent(run),adminCookie)).json();assert.equal(searched.pagination.total,25);assert.equal(searched.learners.length,20);const second=await(await api('?search='+encodeURIComponent(run)+'&page=2',adminCookie)).json();assert.equal(second.learners.length,5);assert(!second.learners.some(l=>searched.learners.some(x=>x.id===l.id)));check('Search and server pagination return every matching learner without duplicates');
 for(const [status,count] of [['completed',1],['in_progress',2],['not_started',22],['inactive',23]]){const filtered=await(await api('?search='+run+'&status='+status,adminCookie)).json();assert.equal(filtered.pagination.total,count,status);assert.equal(filtered.metrics.enrolled,data.metrics.enrolled);}
 const literal=await(await api('?search='+encodeURIComponent(run+' 100%_literal'),adminCookie)).json();assert.equal(literal.pagination.total,1);check('Status filters are accurate, search treats SQL wildcard characters literally and metrics remain cohort-wide');
 // Move one not-started fixture across a month boundary to verify cohort scope in every aggregate.
 const now=new Date(),previousMonthStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,15)),previousMonth=previousMonthStart.toISOString().slice(0,7),thisMonth=now.toISOString().slice(0,7);
 await db.query('UPDATE learning_enrolments SET enrolled_at=? WHERE user_id=? AND course_slug=?',[previousMonthStart,ids[24],course]);
 const previous=await(await api('?month='+previousMonth+'&search='+run,adminCookie)).json();assert.equal(previous.pagination.total,1);assert.equal(previous.metrics.enrolled,1);assert(previous.lessons.every(l=>l.reached===0&&l.completed===0));
 const current=await(await api('?month='+thisMonth+'&search='+run,adminCookie)).json();assert.equal(current.pagination.total,24);assert.equal(current.metrics.enrolled,data.metrics.enrolled-1);assert.equal(current.lessons[0].reached,data.lessons[0].reached);check('Monthly cohorts scope both the directory and lesson aggregates across enrolment boundaries');
 const ref=searched.learners[0].reference;assert.equal((await(await api('?search='+ref,adminCookie)).json()).pagination.total,1);
 const detailRes=await api('?learner='+ids[0],adminCookie),detail=await detailRes.json();assert.equal(detailRes.headers.get('cache-control'),'private, no-store');assert.equal(detail.learner.name,run+' Completed parent');assert.equal(detail.lessons.length,5);assert(detail.lessons.every(l=>l.attempts===2&&l.firstScore===0&&l.latestScore===3&&l.completedAt));assert(!JSON.stringify(detail).includes('answers_json'));check('Individual view shows accurate first/latest scores, resume points and passed lessons without raw answer payloads');
 const returning=await(await api('?learner='+ids[1],adminCookie)).json();assert(returning.lessons[0].completedAt);assert.equal(returning.lessons[0].latestPassed,false);assert.equal(returning.learner.completedLessons,1);check('A later failed attempt does not erase a previously completed lesson');
 const csvResponse=await api('?month=all&format=csv',adminCookie),csv=await csvResponse.text();assert.equal(csvResponse.status,200);assert(csv.includes(ref));assert(!csv.includes('@example.test'));assert(!csv.includes(run));check('Anonymous CSV excludes names, emails and raw account IDs');
 for(const query of ['?month=2026-13','?status=made-up','?page=0','?learner='+encodeURIComponent("' OR 1=1")])assert.equal((await api(query,adminCookie)).status,400,query);assert.equal((await api('?learner=missing-record',adminCookie)).status,404);assert.equal((await(await api('?month=2020-01',adminCookie)).json()).metrics.enrolled,0);check('Invalid filters are rejected and unknown/empty cohorts return correct states');
 assert.equal((await api('',opsCookie)).status,200);assert.equal((await api('?learner='+ids[0],opsCookie)).status,200);assert.equal((await api('',opsCookie,'POST',{isFree:false,isPublished:false})).status,403);assert.equal((await api('',adminCookie,'POST',{isFree:false,isPublished:false},'https://untrusted.invalid')).status,403);check('Operations access is read-only for course settings; cross-origin changes are rejected');
 assert.equal((await api('',adminCookie,'POST',{isFree:initial.isFree,isPublished:initial.isPublished})).status,200);check('Administrator can save existing course settings without altering learner access');
 const output={run,adminCookie,opsCookie,learnerIds:ids,adminIds:admins,origin,checks};fs.writeFileSync('/private/tmp/sma-admin-qa-session.json',JSON.stringify(output),{mode:0o600});
 console.log('ALL ADMIN LEARNING INTEGRATION CHECKS PASSED');
 if(process.env.SMA_ADMIN_QA_KEEP==='1'){console.log('Retained isolated synthetic fixtures for browser review.');ids.length=0;admins.length=0;}
}finally{
 for(const id of ids)await db.query('DELETE FROM account_identity WHERE id=?',[id]);
 for(const id of admins){await db.query('DELETE FROM admin_users WHERE auth_user_id=?',[id]);await db.query('DELETE FROM administrator_identity WHERE id=?',[id]);}
 await db.end();
}
