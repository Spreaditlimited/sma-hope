import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseEnv} from 'node:util';
import {randomUUID} from 'node:crypto';
import mysql from 'mysql2/promise';
import {hashPassword} from 'better-auth/crypto';
const env=parseEnv(fs.readFileSync('/private/tmp/sma-lms-test.env','utf8')),u=new URL(env.SMAHOPE_TEST_DATABASE_URL);
if(u.host!=='127.0.0.1:33317'||u.pathname!=='/smahope_test')throw Error('Isolated synthetic database required');
const db=await mysql.createConnection({host:u.hostname,port:33317,user:u.username,password:decodeURIComponent(u.password),database:'smahope_test'});
const origin='http://localhost:3041',password='Synthetic-Password-'+randomUUID(),owned=[],caseIds=[],mailFile='/private/tmp/sma-clinician-test-mail.json';let n=0;
const check=s=>console.log('PASS '+(++n)+' '+s);
async function api(path,{method='GET',body,cookie='',captcha='register',site=origin}={}){
 return fetch(origin+path,{method,headers:{Cookie:cookie,...(method==='POST'?{Origin:site,'Content-Type':'application/json','x-captcha-token':captcha}:{})},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});
}
async function post(path,body,status=200,cookie='',captcha='register'){
 const response=await api(path,{method:'POST',body,cookie,captcha});const result=await response.json();assert.equal(response.status,status,JSON.stringify(result));return result;
}
async function identity(scope,role){
 const id=randomUUID(),email='synthetic-'+id+'@example.test';owned.push({id,scope});
 await db.query(`INSERT INTO ${scope}_identity(id,name,email,emailVerified,active,createdAt,updatedAt) VALUES(?,?,?,1,1,NOW(3),NOW(3))`,[id,'Synthetic tester',email]);
 await db.query(`INSERT INTO ${scope}_credential(id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES(?,?,'credential',?,?,NOW(3),NOW(3))`,[randomUUID(),id,id,await hashPassword(password)]);
 if(role)await db.query('INSERT INTO admin_users(id,email,role,active,auth_user_id) VALUES(?,?,?,1,?)',[randomUUID(),email,role,id]);
 return {id,email,cookie:await login(email,password,scope)};
}
async function login(email,password,scope='account'){
 await db.query('DELETE FROM auth_rate_limit');const response=await api(scope==='account'?'/api/auth/sign-in/email':'/api/admin-auth/sign-in/email',{method:'POST',body:{email,password},captcha:scope==='account'?'login':'admin_login'});assert.equal(response.status,200,'Sign in must succeed');return response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
}
function mailLink(email){
 const mails=JSON.parse(fs.readFileSync(mailFile,'utf8'));const raw=[...mails].reverse().find(m=>m.includes(email));assert.ok(raw,'A password email must reach local SMTP');
 const decoded=raw.replace(/=\r\n/g,'').replace(/=([A-F0-9]{2})/gi,(_,h)=>String.fromCharCode(parseInt(h,16)));
 const match=decoded.match(/http:\/\/localhost:3041\/api\/auth\/reset-password\/[^\s<]+/);assert.ok(match,'Email must contain a reset link');return new URL(match[0]);
}
async function setup(email){
 const link=mailLink(email),response=await fetch(link,{redirect:'manual'});assert.equal(response.status,302,'Emailed reset link redirects to password form');
 const callback=new URL(response.headers.get('location'));assert.equal(callback.pathname,'/account/reset-password');assert.equal(callback.searchParams.get('next'),'/account/clinician');
 const token=callback.searchParams.get('token');assert.ok(token);
 await post('/api/auth/reset-password',{token,newPassword:password},200,'','password_update');
 const reuse=await api('/api/auth/reset-password',{method:'POST',body:{token,newPassword:password+'again'},captcha:'password_update'});assert.equal(reuse.status,400);
 return login(email,password);
}
const email='notification-doctor-'+randomUUID()+'@example.test';
const application={email,fullName:'Synthetic Notification Doctor',registrationNumber:'TEST-'+randomUUID(),specialty:'Paediatrics',workplace:'Synthetic workplace',state:'Lagos',phone:'08000000000',availability:'Synthetic availability only',consent:true,terms:true};
async function notification(kind,source){const [[row]]=await db.query('SELECT * FROM diagnostic_notifications WHERE event_key=?',[kind+':'+source]);assert.ok(row,'Notification must be saved');return row;}
async function flush(){const response=await api('/api/cron/diagnostic-notifications',{cookie:''});assert.equal(response.status,401);return fetch(origin+'/api/cron/diagnostic-notifications',{headers:{Authorization:'Bearer synthetic-notification-cron-secret-2026'}});}
async function delivered(kind,source){for(let i=0;i<5;i++){const row=await notification(kind,source);if(row.status==='sent')return row;await flush();}throw Error('Notification did not reach SMTP');}
try{
 await db.query('DELETE FROM auth_rate_limit');await post('/api/clinician-applications',application,202);
 const [[user]]=await db.query('SELECT id FROM account_identity WHERE email=?',[email]);owned.push({id:user.id,scope:'account'});
 const [[pending]]=await db.query('SELECT id FROM diagnostic_public_applications WHERE user_id=?',[user.id]);await delivered('clinician',pending.id);check('Public clinician application sends a durable notification to help@smahope.org');
 await setup(email);let [[count]]=await db.query('SELECT COUNT(*) total FROM diagnostic_notifications WHERE event_key=?',['clinician:'+pending.id]);assert.equal(Number(count.total),1);
 await db.query('DELETE FROM auth_rate_limit');await post('/api/clinician-applications',application,202);[[count]]=await db.query('SELECT COUNT(*) total FROM diagnostic_notifications WHERE event_key=?',['clinician:'+pending.id]);assert.equal(Number(count.total),1);check('Email confirmation and repeated submissions do not produce duplicate notifications');
 const family=await identity('account');
 const report={action:'report',patientName:'Synthetic Private Notification Child',ageMonths:12,relationship:'parent',state:'Lagos',lga:'Ikeja',phone:'08000000000',concerns:'Sensitive synthetic weakness and feeding observations.',consent:true,sharingConsent:true};
 await db.query('UPDATE diagnostic_settings SET intake_open=1,consultation_fee_kobo=2500000 WHERE id=1');
 const c=await post('/api/diagnostics',report,200,family.cookie);caseIds.push(c.id);await delivered('report',c.id);check('A report submitted inside the dashboard sends the same admin notification');
 const doctor=await identity('account');const applied=await post('/api/diagnostics',{...application,action:'apply'},200,doctor.cookie);await delivered('clinician',applied.id);check('A clinician application submitted inside the dashboard also notifies the admin');
 const publicEmail='notification-family-'+randomUUID()+'@example.test';await db.query('DELETE FROM auth_rate_limit');await post('/api/diagnostic-reports',{...report,email:publicEmail,contactName:'Synthetic Parent',terms:true},202);
 const [[publicUser]]=await db.query('SELECT id FROM account_identity WHERE email=?',[publicEmail]);owned.push({id:publicUser.id,scope:'account'});const [[publicReport]]=await db.query('SELECT id FROM diagnostic_public_reports WHERE user_id=?',[publicUser.id]);await delivered('report',publicReport.id);check('Public diagnostic reports notify the admin before email confirmation');
 const raw=JSON.parse(fs.readFileSync(mailFile,'utf8'));const notices=raw.filter(m=>m.includes('To: help@smahope.org'));
 assert.ok(notices.length>=4);for(const message of notices){assert.ok(!message.includes(report.patientName));assert.ok(!message.includes(report.concerns));assert.ok(!message.includes(application.fullName));assert.ok(message.includes('/admin/diagnostics'));}check('Admin notification emails contain private admin links and no submitted medical or applicant details');
 fs.writeFileSync('/private/tmp/sma-clinician-mail-fail','synthetic');let failedCase;
 try{failedCase=await post('/api/diagnostics',{...report,patientName:'Synthetic failed notification'},200,family.cookie);caseIds.push(failedCase.id);}finally{fs.unlinkSync('/private/tmp/sma-clinician-mail-fail');}
 const failed=await notification('report',failedCase.id);assert.equal(failed.status,'pending');assert.ok(failed.attempts>=1);assert.equal(failed.last_error,'Email delivery unavailable');check('Email failure does not lose the report; the notification remains queued with retry evidence');
 await db.query('UPDATE diagnostic_notifications SET next_attempt_at=NOW(3) WHERE id=?',[failed.id]);const retried=await flush();assert.equal(retried.status,200);assert.equal((await notification('report',failedCase.id)).status,'sent');const priorAttempts=(await notification('report',failedCase.id)).attempts;await flush();assert.equal((await notification('report',failedCase.id)).attempts,priorAttempts);check('The authenticated retry job recovers delivery and skips already-sent notifications');
 console.log('PASS all '+n+' notification integration groups; local SMTP only.');
}finally{
 for(const {id,scope} of owned){if(scope==='account')await db.query('DELETE FROM diagnostic_public_reports WHERE user_id=?',[id]);}
 for(const id of caseIds)await db.query('DELETE FROM diagnostic_cases WHERE id=?',[id]);
 for(const {id,scope} of owned){if(scope==='account'){await db.query('DELETE FROM diagnostic_public_applications WHERE user_id=?',[id]);await db.query('DELETE FROM diagnostic_clinicians WHERE user_id=?',[id]);}else await db.query('DELETE FROM admin_users WHERE auth_user_id=?',[id]);await db.query(`DELETE FROM ${scope}_identity WHERE id=?`,[id]);}
 await db.query('UPDATE diagnostic_settings SET consultation_fee_kobo=2500000,intake_open=1,readiness_reference=? WHERE id=1',['Owner-authorised LOCAL SYNTHETIC preview; no live intake or production migration']);await db.end();
}
