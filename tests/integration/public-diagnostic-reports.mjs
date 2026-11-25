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
 const callback=new URL(response.headers.get('location'));assert.equal(callback.pathname,'/account/reset-password');assert.equal(callback.searchParams.get('next'),'/account/diagnostics');
 const token=callback.searchParams.get('token');assert.ok(token);
 await post('/api/auth/reset-password',{token,newPassword:password},200,'','password_update');
 const reuse=await api('/api/auth/reset-password',{method:'POST',body:{token,newPassword:password+'again'},captcha:'password_update'});assert.equal(reuse.status,400);
 return login(email,password);
}
const email='public-family-'+randomUUID()+'@example.test';
const report={email,contactName:'Synthetic Parent',patientName:'Synthetic Child '+randomUUID(),ageMonths:18,relationship:'parent',state:'Lagos',lga:'Ikeja',phone:'08000000000',concerns:'Synthetic concerns about weakness and delayed sitting.',history:'Synthetic assessment history.',consent:true,sharingConsent:true,registryConsent:false,terms:true};
try{
 const page=await (await api('/report-a-concern')).text();assert.ok(page.includes('name="contactName"'));assert.ok(page.includes('name="email"'));assert.ok(page.includes('href="#report"'));check('Public diagnostic report form renders without signing in');
 assert.equal((await api('/api/diagnostic-reports',{method:'POST',body:report,site:'https://foreign.invalid'})).status,403);
 assert.equal((await api('/api/diagnostic-reports',{method:'POST',body:report,captcha:''})).status,403);
 await post('/api/diagnostic-reports',{...report,consent:false},400);
 await post('/api/diagnostic-reports',{...report,relationship:'self'},400);check('Origin, CAPTCHA, consent and child guardian controls apply to public reports');
 await db.query('DELETE FROM auth_rate_limit');await db.query('UPDATE diagnostic_settings SET intake_open=0 WHERE id=1');
 await post('/api/diagnostic-reports',report,409);const [[none]]=await db.query('SELECT COUNT(*) total FROM account_identity WHERE email=?',[email]);assert.equal(Number(none.total),0);check('Paused reporting rejects public submissions before creating an account');
 await db.query('UPDATE diagnostic_settings SET intake_open=1 WHERE id=1');await db.query('DELETE FROM auth_rate_limit');await post('/api/diagnostic-reports',report,202);
 const [[user]]=await db.query('SELECT id FROM account_identity WHERE email=?',[email]);owned.push({id:user.id,scope:'account'});
 const [[pending]]=await db.query('SELECT * FROM diagnostic_public_reports WHERE user_id=?',[user.id]);assert.ok(pending);assert.equal(pending.case_id,null);
 const mails=JSON.parse(fs.readFileSync(mailFile,'utf8')).filter(m=>m.includes(email));assert.ok(mails.length);for(const raw of mails){assert.ok(!raw.includes(report.patientName));assert.ok(!raw.includes(report.concerns));assert.ok(!raw.includes(report.history));}
 assert.equal((await api('/api/diagnostics')).status,401);check('Submission creates a private pending report and account; the actual SMTP email contains no clinical details');
 const admin=await identity('administrator','admin'),outsider=await identity('account');
 let adminData=await (await api('/api/admin/diagnostics',{cookie:admin.cookie})).json();assert.ok(adminData.publicReports.find(p=>p.id===pending.id));assert.ok(!JSON.stringify(adminData.publicReports).includes(report.concerns));
 assert.equal((await api('/api/admin/diagnostics?case='+pending.id,{cookie:admin.cookie})).status,404);check('Admin sees the email-confirmation queue without treating an unconfirmed report as an assignable case');
 await db.query('DELETE FROM auth_rate_limit');await post('/api/diagnostic-reports',report,202);const [[duplicates]]=await db.query('SELECT COUNT(*) total FROM diagnostic_public_reports WHERE user_id=?',[user.id]);assert.equal(Number(duplicates.total),1);check('A repeated public submission does not duplicate the report');
 const familyCookie=await setup(email);const [[claimed]]=await db.query('SELECT case_id FROM diagnostic_public_reports WHERE id=?',[pending.id]);assert.ok(claimed.case_id);caseIds.push(claimed.case_id);
 const detail=await (await api('/api/diagnostics?case='+claimed.case_id,{cookie:familyCookie})).json();assert.equal(detail.case.patient_name,report.patientName);assert.equal(detail.case.concerns,report.concerns);
 assert.equal((await api('/api/diagnostics?case='+claimed.case_id,{cookie:outsider.cookie})).status,404);
 adminData=await (await api('/api/admin/diagnostics',{cookie:admin.cookie})).json();assert.ok(adminData.cases.find(c=>c.id===claimed.case_id));check('Password setup confirms ownership, connects the report to the family dashboard and makes it available for admin assignment');
 const existing=await identity('account');const [[credentialBefore]]=await db.query('SELECT password FROM account_credential WHERE userId=?',[existing.id]);
 await db.query('DELETE FROM auth_rate_limit');await post('/api/diagnostic-reports',{...report,email:existing.email,patientName:'Synthetic existing-account child'},202);
 const [[credentialAfter]]=await db.query('SELECT password FROM account_credential WHERE userId=?',[existing.id]);assert.equal(credentialAfter.password,credentialBefore.password);
 const beforeWorkspace=await (await api('/api/diagnostics',{cookie:existing.cookie})).json();assert.equal(beforeWorkspace.cases.length,0);check('An unsigned submission cannot change an existing password or attach an unconfirmed report to an existing dashboard');
 await setup(existing.email);const [[existingCase]]=await db.query('SELECT case_id FROM diagnostic_public_reports WHERE user_id=?',[existing.id]);caseIds.push(existingCase.case_id);assert.ok(existingCase.case_id);
 const familyCases=await (await api('/api/diagnostics',{cookie:familyCookie})).json();assert.equal(familyCases.cases.length,1);check('Existing-account confirmation adds the intended report and preserves isolation between families');
 console.log('PASS all '+n+' public diagnostic integration groups. Synthetic records and local SMTP only.');
}finally{
 for(const {id,scope} of owned){if(scope==='account')await db.query('DELETE FROM diagnostic_public_reports WHERE user_id=?',[id]);}
 for(const id of caseIds){await db.query('DELETE FROM diagnostic_cases WHERE id=?',[id]);}
 for(const {id,scope} of owned){if(scope==='account'){await db.query('DELETE FROM diagnostic_clinicians WHERE user_id=?',[id]);}else await db.query('DELETE FROM admin_users WHERE auth_user_id=?',[id]);await db.query(`DELETE FROM ${scope}_identity WHERE id=?`,[id]);}
 await db.query('UPDATE diagnostic_settings SET consultation_fee_kobo=2500000,intake_open=1,readiness_reference=? WHERE id=1',['Owner-authorised LOCAL SYNTHETIC preview; no live intake or production migration']);await db.end();
}
