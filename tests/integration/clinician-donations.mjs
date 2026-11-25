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
const email='volunteer-'+randomUUID()+'@example.test';
const application={email,fullName:'Synthetic Volunteer Doctor',registrationNumber:'TEST-'+randomUUID(),specialty:'Paediatrics',workplace:'Synthetic practice',state:'Lagos',phone:'08000000000',availability:'Synthetic consultation availability',consent:true,terms:true,defaultRemuneration:'donated'};
try{
 await db.query('DELETE FROM auth_rate_limit');await post('/api/clinician-applications',application,202);
 const [[user]]=await db.query('SELECT id FROM account_identity WHERE email=?',[email]);owned.push({id:user.id,scope:'account'});const doctorCookie=await setup(email);
 const [[doctor]]=await db.query('SELECT * FROM diagnostic_clinicians WHERE user_id=?',[user.id]);assert.equal(doctor.default_remuneration,'donated');check('The public application and password setup preserve an ongoing donation preference');
 const admin=await identity('administrator','admin'),family=await identity('account'),other=await identity('account');
 await post('/api/admin/diagnostics',{action:'verify_clinician',clinicianId:doctor.id,status:'approved',verifiedUntil:'2027-06-01',reference:'Synthetic independent identity and professional checks'},200,admin.cookie);
 async function settings(fee){await post('/api/admin/diagnostics',{action:'settings',feeNaira:String(fee),intakeOpen:true,readinessConfirmed:true,readinessReference:'Owner-authorised local synthetic programme readiness'},200,admin.cookie);}
 async function detail(id,cookie=doctorCookie){return (await api('/api/diagnostics?case='+id,{cookie})).json();}
 async function report(){const c=await post('/api/diagnostics',{action:'report',patientName:'Synthetic donation patient '+randomUUID(),ageMonths:18,relationship:'parent',state:'Lagos',lga:'Ikeja',phone:'08000000000',concerns:'Synthetic persistent weakness and delayed movement milestones.',consent:true,sharingConsent:true},200,family.cookie);caseIds.push(c.id);const before=await detail(c.id,family.cookie);await post('/api/admin/diagnostics',{action:'assign',caseId:c.id,version:before.case.version,clinicianId:doctor.id},200,admin.cookie);return c.id;}
 async function accept(id,remuneration,status=200,cookie=doctorCookie){const c=await detail(id);return post('/api/diagnostics',{action:'accept',caseId:id,version:c.case.version,acceptScope:true,remuneration},status,cookie);}
 await settings(25000);const first=await report();let c=(await detail(first)).case;assert.equal(Number(c.fee_kobo),0);assert.equal(Number(c.offered_fee_kobo),2500000);assert.equal(c.remuneration,'donated');check('Ongoing donation preferences create zero-fee assignments while retaining the offered programme fee');
 await accept(first,'paid',404,other.cookie);await accept(first,'unsupported',400);await accept(first,'paid');c=(await detail(first)).case;assert.equal(Number(c.fee_kobo),2500000);assert.equal(c.remuneration,'paid');
 const [[stillVolunteer]]=await db.query('SELECT default_remuneration FROM diagnostic_clinicians WHERE id=?',[doctor.id]);assert.equal(stillVolunteer.default_remuneration,'donated');check('The assigned clinician can choose a paid exception without changing their ongoing preference; other users cannot choose for them');
 const second=await report();await accept(second,'donated');c=(await detail(second)).case;assert.equal(Number(c.fee_kobo),0);assert.equal(c.remuneration,'donated');
 await accept(second,'paid',409);check('A donated acceptance records zero fee and cannot be changed by replaying acceptance');
 await post('/api/diagnostics',{action:'consultation_preference',remuneration:'paid'},200,doctorCookie);await post('/api/diagnostics',{action:'consultation_preference',remuneration:'donated'},409,family.cookie);
 c=(await detail(second)).case;assert.equal(Number(c.fee_kobo),0);assert.equal(c.remuneration,'donated');
 const third=await report();c=(await detail(third)).case;assert.equal(Number(c.fee_kobo),2500000);assert.equal(c.remuneration,'paid');await accept(third,'donated');assert.equal(Number((await detail(third)).case.fee_kobo),0);check('Changing the default affects future assignments only; a paid-default clinician can donate an individual case');
 const fourth=await report();await settings(30000);await accept(fourth,'paid');assert.equal(Number((await detail(fourth)).case.fee_kobo),2500000);check('Paid acceptance uses the fee offered on assignment even after the programme default changes');
 c=(await detail(second)).case;await post('/api/diagnostics',{action:'clinical_update',caseId:second,version:c.version,status:'completed',summary:'Synthetic consultation completed with advice for a different clinical referral.',familyMessage:'Synthetic explanation: please follow the referral discussed with your clinician.',outcome:'other_referral'},200,doctorCookie);
 c=(await detail(second)).case;await post('/api/admin/diagnostics',{action:'expense',caseId:second,version:c.version,kind:'consultation',amountNaira:'25000',description:'Synthetic attempted payment for donated service',evidenceReference:'Synthetic completed consultation',donorAllocation:'Synthetic funding'},409,admin.cookie);
 const [[expenses]]=await db.query("SELECT COUNT(*) total FROM diagnostic_finance WHERE case_id=? AND kind='consultation'",[second]);assert.equal(Number(expenses.total),0);
 const [events]=await db.query("SELECT details_json FROM diagnostic_audit WHERE subject_id=? AND action='consultation.accepted'",[second]);const evidence=JSON.parse(events.at(-1).details_json);assert.equal(evidence.remuneration,'donated');assert.equal(evidence.feeKobo,0);check('Donation is audited as zero payable and cannot produce a consultation payment expense');
 console.log('PASS all '+n+' clinician donation integration groups. No payments or external emails.');
}finally{
 for(const id of caseIds){await db.query('DELETE FROM diagnostic_finance WHERE case_id=?',[id]);await db.query('DELETE FROM diagnostic_cases WHERE id=?',[id]);}
 for(const {id,scope} of owned){if(scope==='account'){await db.query('DELETE FROM diagnostic_public_applications WHERE user_id=?',[id]);await db.query('DELETE FROM diagnostic_clinicians WHERE user_id=?',[id]);}else await db.query('DELETE FROM admin_users WHERE auth_user_id=?',[id]);await db.query(`DELETE FROM ${scope}_identity WHERE id=?`,[id]);}
 await db.query('UPDATE diagnostic_settings SET consultation_fee_kobo=2500000,intake_open=1,readiness_reference=? WHERE id=1',['Owner-authorised LOCAL SYNTHETIC preview; no live intake or production migration']);await db.end();
}
