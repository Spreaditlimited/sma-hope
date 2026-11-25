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
const email='public-clinician-'+randomUUID()+'@example.test';
const application={email,fullName:'Synthetic Public Doctor',registrationNumber:'TEST-'+randomUUID(),specialty:'Paediatrics',workplace:'Synthetic practice',state:'Lagos',phone:'08000000000',availability:'Available for synthetic consultations.',consent:true,terms:true};
try{
 const page=await (await api('/clinician-network')).text();assert.ok(page.includes('name="email"'));assert.ok(page.includes('href="#apply"'));check('Public clinician form renders without an account');
 assert.equal((await api('/api/clinician-applications',{method:'POST',body:application,site:'https://foreign.invalid'})).status,403);
 assert.equal((await api('/api/clinician-applications',{method:'POST',body:application,captcha:''})).status,403);
 await post('/api/clinician-applications',{...application,terms:false},400);check('Cross-origin, missing CAPTCHA and missing consent are rejected');
 await db.query('DELETE FROM auth_rate_limit');
 await post('/api/clinician-applications',application,202);
 const [[user]]=await db.query('SELECT id FROM account_identity WHERE email=?',[email]);assert.ok(user);owned.push({id:user.id,scope:'account'});
 let [profile]=await db.query('SELECT id FROM diagnostic_clinicians WHERE user_id=?',[user.id]);assert.equal(profile.length,0);check('Submission creates an account and sends a real SMTP email locally without granting clinician access');
 const admin=await identity('administrator','admin'),family=await identity('account'),outsider=await identity('account');
 let adminData=await (await api('/api/admin/diagnostics',{cookie:admin.cookie})).json();const waiting=adminData.publicApplications.find(p=>p.email===email);assert.ok(waiting);assert.equal(waiting.fullName,application.fullName);
 await post('/api/admin/diagnostics',{action:'verify_clinician',clinicianId:waiting.id,status:'approved',verifiedUntil:'2027-06-01',reference:'Synthetic credential check'},404,admin.cookie);check('Admin sees awaiting-email applications but cannot approve them prematurely');
 const doctorCookie=await setup(email);
 [profile]=await db.query('SELECT * FROM diagnostic_clinicians WHERE user_id=?',[user.id]);assert.equal(profile.length,1);const doctor=profile[0];assert.equal(doctor.status,'pending');
 adminData=await (await api('/api/admin/diagnostics',{cookie:admin.cookie})).json();assert.ok(!adminData.publicApplications.find(p=>p.email===email));assert.ok(adminData.clinicians.find(p=>p.id===doctor.id));check('Emailed link, password setup, single-use token and sign-in hand off the application to admin verification');
 await db.query('DELETE FROM auth_rate_limit');await post('/api/clinician-applications',{...application,fullName:'Untrusted overwrite'},202);
 const [[unchanged]]=await db.query('SELECT full_name FROM diagnostic_clinicians WHERE id=?',[doctor.id]);assert.equal(unchanged.full_name,application.fullName);
 const [[count]]=await db.query('SELECT count(*) total FROM account_identity WHERE email=?',[email]);assert.equal(Number(count.total),1);check('Repeated public submissions never replace an existing profile or create duplicate accounts');
 await post('/api/admin/diagnostics',{action:'verify_clinician',clinicianId:doctor.id,status:'approved',verifiedUntil:'2027-06-01',reference:'Synthetic independent identity and MDCN checks'},200,admin.cookie);
 await post('/api/admin/diagnostics',{action:'settings',feeNaira:'25000',intakeOpen:true,readinessConfirmed:true,readinessReference:'Owner-authorised local synthetic activation; test clinical and privacy process'},200,admin.cookie);
 const report=await post('/api/diagnostics',{action:'report',patientName:'Synthetic reporting patient',ageMonths:12,relationship:'parent',state:'Lagos',lga:'Ikeja',phone:'08000000000',concerns:'Synthetic report for persistent muscle weakness and delayed sitting.',history:'Synthetic assessment only',consent:true,sharingConsent:true},200,family.cookie);caseIds.push(report.id);
 let detail=await (await api('/api/admin/diagnostics?case='+report.id,{cookie:admin.cookie})).json();await post('/api/admin/diagnostics',{action:'assign',caseId:report.id,version:detail.case.version,clinicianId:doctor.id},200,admin.cookie);
 detail=await (await api('/api/diagnostics?case='+report.id,{cookie:doctorCookie})).json();assert.equal(Number(detail.case.fee_kobo),2500000);
 assert.equal((await api('/api/diagnostics?case='+report.id,{cookie:outsider.cookie})).status,404);
 await post('/api/diagnostics',{action:'accept',caseId:report.id,acceptScope:true,version:detail.case.version},200,doctorCookie);check('Admin approval, enabled reporting, patient submission, clinician assignment and consultation acceptance work at ₦25,000');
 await post('/api/admin/diagnostics',{action:'settings',feeNaira:'30000',intakeOpen:true,readinessConfirmed:true,readinessReference:'Synthetic change of future consultation default only'},200,admin.cookie);
 detail=await (await api('/api/diagnostics?case='+report.id,{cookie:doctorCookie})).json();assert.equal(Number(detail.case.fee_kobo),2500000);check('Admin can edit the fee without changing the agreed fee on existing cases');
 const failureEmail='mail-failure-'+randomUUID()+'@example.test';fs.writeFileSync('/private/tmp/sma-clinician-mail-fail','synthetic');await db.query('DELETE FROM auth_rate_limit');
 try{await post('/api/clinician-applications',{...application,email:failureEmail},503);}finally{fs.unlinkSync('/private/tmp/sma-clinician-mail-fail');}
 const [[failedUser]]=await db.query('SELECT id FROM account_identity WHERE email=?',[failureEmail]);owned.push({id:failedUser.id,scope:'account'});
 await db.query('DELETE FROM auth_rate_limit');await post('/api/clinician-applications',{...application,email:failureEmail},202);check('SMTP failure returns an honest error; retry recovers the saved application without duplicates');
 console.log('PASS all '+n+' public clinician integration groups; synthetic data and local SMTP only.');
}finally{
 for(const id of caseIds){await db.query('DELETE FROM diagnostic_cases WHERE id=?',[id]);}
 for(const {id,scope} of owned){if(scope==='account'){await db.query('DELETE FROM diagnostic_public_applications WHERE user_id=?',[id]);await db.query('DELETE FROM diagnostic_clinicians WHERE user_id=?',[id]);}else await db.query('DELETE FROM admin_users WHERE auth_user_id=?',[id]);await db.query(`DELETE FROM ${scope}_identity WHERE id=?`,[id]);}
 await db.query('UPDATE diagnostic_settings SET consultation_fee_kobo=2500000,intake_open=1,readiness_reference=? WHERE id=1',['Owner-authorised LOCAL SYNTHETIC preview; no live intake or production migration']);await db.end();
}
