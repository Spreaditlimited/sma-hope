import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseEnv} from 'node:util';
import mysql from 'mysql2/promise';
const env=parseEnv(fs.readFileSync('/private/tmp/sma-lms-test.env','utf8')),url=new URL(env.SMAHOPE_TEST_DATABASE_URL),origin='http://localhost:3042';
assert.equal(url.host,'127.0.0.1:33317');assert.equal(url.pathname,'/smahope_test');
const db=await mysql.createConnection({host:url.hostname,port:33317,user:url.username,password:decodeURIComponent(url.password),database:'smahope_test'});
const emails=[],stamp=Date.now();let ip=10;const results=[];
const pass=x=>{results.push(x);console.log('PASS '+x);};
async function register({consent=true,source='learning',email='google-ads-test-'+stamp+'-'+ip+'@example.test',terms=true,token='register',path='/api/auth/sign-up/email'}={}){
 emails.push(email);
 return fetch(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','x-captcha-token':token,'x-forwarded-for':'198.51.100.'+(ip++),...(consent?{Cookie:'smahope_google_ads_consent_v1=accepted'}:{})},body:JSON.stringify({name:'Synthetic Ads Test',email,password:'Local-Google-Ads-Test-2026!',terms,signupSource:source,learningEmails:false})});
}
try{
 assert.equal((await fetch(origin+'/api/auth/ok')).status,200);pass('Isolated test authentication server is available');
 const email='google-ads-test-'+stamp+'-success@example.test';
 const response=await register({email});assert.equal(response.status,200,await response.clone().text());const receipt=response.headers.get('x-smahope-learning-registration');assert.match(receipt,/^[a-f0-9-]{36}$/);assert.ok(response.headers.getSetCookie().some(x=>x.startsWith('smahope_account')));const payload=await response.json();assert.ok(payload.user.id);assert.notEqual(receipt,payload.user.id);pass('Real successful course signup returns a random receipt and preserves the authentication session');
 const [rows]=await db.query('SELECT id,email FROM account_identity WHERE email=?',[email]);assert.equal(rows.length,1);assert.equal(rows[0].id,payload.user.id);pass('Successful response corresponds to exactly one account in the isolated database');
 const duplicate=await register({email});assert.ok(duplicate.status>=400);assert.equal(duplicate.headers.get('x-smahope-learning-registration'),null);pass('Duplicate registration fails without a conversion receipt');
 const declined=await register({consent:false});assert.equal(declined.status,200,await declined.clone().text());assert.equal(declined.headers.get('x-smahope-learning-registration'),null);pass('Registration succeeds without advertising consent and returns no receipt');
 const privateSignup=await register({source:'foundation'});assert.equal(privateSignup.status,200,await privateSignup.clone().text());assert.equal(privateSignup.headers.get('x-smahope-learning-registration'),null);pass('Private foundation registration is excluded from advertising measurement');
 const invalid=await register({terms:false});assert.equal(invalid.status,400);assert.equal(invalid.headers.get('x-smahope-learning-registration'),null);pass('Validation errors do not create conversion receipts');
 const blocked=await register({token:''});assert.equal(blocked.status,403);assert.equal(blocked.headers.get('x-smahope-learning-registration'),null);pass('Captcha rejection remains enforced and produces no conversion receipt');
 const login=await register({path:'/api/auth/sign-in/email',email,token:'login'});assert.equal(login.status,200,await login.clone().text());assert.equal(login.headers.get('x-smahope-learning-registration'),null);pass('Existing-user sign-in does not create a registration conversion');
 fs.writeFileSync('/private/tmp/sma-google-ads-integration-results.json',JSON.stringify({passed:results.length,checks:results,providerEventsSent:0,productionDataUsed:false},null,2));
}finally{
 // Remove only synthetic accounts created by this run; foreign-key cascades remove their sessions.
 for(const email of new Set(emails))await db.query('DELETE FROM account_identity WHERE email=? AND email LIKE ?',[email,'google-ads-test-'+stamp+'-%@example.test']);
 await db.end();
}
