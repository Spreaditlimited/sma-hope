import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseEnv} from 'node:util';
import mysql from 'mysql2/promise';
const base=parseEnv(fs.readFileSync('/private/tmp/sma-lms-test.env','utf8')),origin='http://localhost:3042';
const dbUrl=new URL(base.SMAHOPE_TEST_DATABASE_URL);
assert.equal(dbUrl.host,'127.0.0.1:33317');assert.equal(dbUrl.pathname,'/smahope_test');
const db=await mysql.createConnection({host:dbUrl.hostname,port:33317,user:dbUrl.username,password:decodeURIComponent(dbUrl.password),database:'smahope_test'});
const stamp=Date.now(),email=k=>'google-oauth-'+k+'-'+stamp+'@example.test';let ip=101;
const results=[],pass=t=>{results.push(t);console.log('PASS '+t);};
const jar=new Map();
function absorb(response){for(const c of response.headers.getSetCookie()){const [pair]=c.split(';'),i=pair.indexOf('=');jar.set(pair.slice(0,i),pair.slice(i+1));}}
function cookies(){return [...jar].map(([k,v])=>k+'='+v).join('; ');}
async function start(overrides={}){
 const response=await fetch(origin+'/api/auth/sign-in/social',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','x-captcha-token':'login','x-forwarded-for':'198.51.100.'+ip++,Cookie:cookies()},body:JSON.stringify({provider:'google',callbackURL:'/account/learn',additionalData:{termsAccepted:true},...overrides}),redirect:'manual'});
 absorb(response);return response;
}
async function callback(url,kind){const u=new URL(url);const r=await fetch(origin+'/api/auth/callback/google?'+new URLSearchParams({code:kind+'-'+stamp,state:u.searchParams.get('state')}),{headers:{Cookie:cookies(),'x-forwarded-for':'198.51.100.'+ip++},redirect:'manual'});absorb(r);return r;}
try{
 const bad=await start({additionalData:{}});assert.equal(bad.status,400);pass('Google flow requires explicit terms acknowledgement');
 const unsafe=await start({callbackURL:'https://attacker.example/'});assert.equal(unsafe.status,403);pass('External callback destinations are rejected');
 const startResponse=await start({scopes:['https://www.googleapis.com/auth/drive'],additionalData:{termsAccepted:true,smaSignup:{source:'foundation',terms:false}}});
 assert.equal(startResponse.status,200,await startResponse.clone().text());const startData=await startResponse.json(),u=new URL(startData.url);
 assert.equal(u.hostname,'accounts.google.com');assert.equal(u.searchParams.get('redirect_uri'),origin+'/api/auth/callback/google');assert.deepEqual(new Set(u.searchParams.get('scope').split(' ')),new Set(['openid','email','profile']));assert.ok(u.searchParams.get('code_challenge'));pass('OAuth uses PKCE, the fixed callback and basic identity scopes only');
 jar.set('smahope_google_ads_consent_v1','accepted');
 const created=await callback(startData.url,'new');assert.equal(created.status,302,await created.clone().text());assert.equal(created.headers.get('location'),origin+'/account/register?google=complete');assert.ok(jar.has('smahope_google_registration'));assert.ok([...jar.keys()].some(x=>x.includes('smahope_account.session_token')));pass('Real new Google account creates a session and a signed learning-registration handoff');
 const [[row]]=await db.query('SELECT id,emailVerified FROM account_identity WHERE email=?',[email('new')]);assert.ok(row?.emailVerified);pass('Google signup creates exactly the verified learner identity');
 const done=await fetch(origin+'/api/account/google-registration',{method:'POST',headers:{Origin:origin,Cookie:cookies()}});assert.equal(done.status,200,await done.clone().text());const receipt=(await done.json()).receipt;assert.match(receipt,/^[a-f0-9-]{36}$/);absorb(done);pass('Authenticated completion returns an anonymous conversion receipt and clears the handoff cookie');
 const again=await fetch(origin+'/api/account/google-registration',{method:'POST',headers:{Origin:origin,Cookie:cookies()}});assert.equal((await again.json()).receipt,null);pass('Refreshing completion without a handoff cannot create a second conversion');
 jar.clear();const repeatStart=await start();const repeat=await callback((await repeatStart.json()).url,'repeat');assert.equal(repeat.status,302);assert.equal(repeat.headers.get('location'),origin+'/account/learn');assert.ok(!jar.has('smahope_google_registration'));pass('Returning Google sign-in reuses the account and does not create a registration event');
 const [[count]]=await db.query('SELECT COUNT(*) AS n FROM account_identity WHERE email=?',[email('new')]);assert.equal(Number(count.n),1);pass('Returning Google login does not duplicate learner records');
 jar.clear();const privateStart=await start({callbackURL:'/account/diagnostics'});const privateResult=await callback((await privateStart.json()).url,'private');assert.equal(privateResult.status,302);assert.equal(privateResult.headers.get('location'),origin+'/account/diagnostics');assert.ok(!jar.has('smahope_google_registration'));pass('Private foundation Google registrations are excluded from course conversion tracking');
 jar.clear();const unverifiedStart=await start();const unverified=await callback((await unverifiedStart.json()).url,'unverified');assert.ok([302,400].includes(unverified.status));if(unverified.status===302)assert.ok(unverified.headers.get('location').includes('error='));const [[unverifiedCount]]=await db.query('SELECT COUNT(*) AS n FROM account_identity WHERE email=?',[email('unverified')]);assert.equal(Number(unverifiedCount.n),0);pass('Unverified Google email cannot create a learner or session');
 const invalidState=await fetch(origin+'/api/auth/callback/google?code=new-'+stamp+'&state=forged-state',{headers:{Cookie:cookies()},redirect:'manual'});assert.equal(invalidState.status,302);assert.ok(invalidState.headers.get('location').includes('error='));pass('Forged OAuth state is rejected');
 const cross=await fetch(origin+'/api/account/google-registration',{method:'POST',headers:{Origin:'https://attacker.example',Cookie:cookies()}});assert.equal(cross.status,401);pass('Cross-origin completion requests are rejected');
 fs.writeFileSync('/private/tmp/sma-google-sign-in-integration-results.json',JSON.stringify({passed:results.length,checks:results,realGoogleAuthenticationUsed:false,productionDataUsed:false},null,2));
}finally{for(const k of ['new','private','unverified'])await db.query('DELETE FROM account_identity WHERE email=?',[email(k)]);await db.end();}
