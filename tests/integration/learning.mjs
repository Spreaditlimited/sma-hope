import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {parseEnv} from 'node:util';
import mysql from 'mysql2/promise';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {hashPassword}=await import(require.resolve('better-auth/crypto'));
const env=parseEnv(fs.readFileSync(process.env.SMAHOPE_TEST_ENV || '/private/tmp/sma-lms-test.env','utf8')),origin=env.SMAHOPE_AUTH_URL,u=new URL(env.SMAHOPE_TEST_DATABASE_URL);
assert.equal(origin,'http://localhost:3021');assert.equal(u.pathname,'/smahope_test');
const db=await mysql.createConnection({host:u.hostname,port:Number(u.port),user:u.username,password:decodeURIComponent(u.password),database:'smahope_test'});
assert.equal(u.host,'127.0.0.1:33317');
const checks=[];function check(name){checks.push(name);console.log('PASS '+name);}
async function api(route,{cookie='',method='GET',body,site=origin}={}){return fetch(origin+route,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(method==='POST'?{'Content-Type':'application/json',Origin:site}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual'});}
const cookies=r=>r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
try{
 assert.equal((await api('/api/auth/ok')).status,200);assert.equal((await api('/api/learning')).status,401);assert.equal((await api('/api/admin/learning')).status,401);check('Anonymous access denied');
 const html=await(await api('/learn/understanding-sma')).text();assert.ok(html.includes('Notice the signs.'));assert.ok(html.includes('Start learning'));check('Public course landing page renders');
 const email='sma-browser-'+Date.now()+'@example.test',password='Local-SMA-Learning-2026!';
 const signup=await api('/api/auth/sign-up/email',{method:'POST',body:{name:'SMA Test Learner',email,password,terms:true}});
 assert.equal(signup.status,200,await signup.clone().text());const cookie=cookies(signup);assert.ok(cookie);const user=(await signup.json()).user;
 fs.writeFileSync('/private/tmp/sma-lms-browser-test.json',JSON.stringify({email,password,userId:user.id}),{mode:0o600});
 assert.equal((await api('/api/learning/playback?lesson=what-sma-is',{cookie})).status,403);check('Registration works; unenrolled playback denied');
 const cross=await api('/api/learning',{cookie,method:'POST',body:{action:'enrol'},site:'https://untrusted.invalid'});assert.equal(cross.status,403);check('Cross-origin enrolment denied');
 for(let i=0;i<2;i++)assert.equal((await api('/api/learning',{cookie,method:'POST',body:{action:'enrol'}})).status,200);
 const [grants]=await db.query('SELECT COUNT(*) total FROM learning_enrolments WHERE user_id=?',[user.id]);assert.equal(grants[0].total,1);check('Repeated enrolment produces one grant');
 const state=await(await api('/api/learning',{cookie})).json();assert.equal(state.lessons.length,5);assert.ok(state.lessons.every(l=>l.questions.length===3&&!('correct' in l.questions[0])));check('All five lessons and questions load without answer keys');
 // Resolve answer keys directly from server source for this isolated integration test.
 const ts=require('typescript'),source=fs.readFileSync('src/lib/learning/content.ts','utf8'),compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,mod={exports:{}};
 new Function('exports',compiled)(mod.exports);
 for(const [i,lesson] of state.lessons.entries()){
   const pb=await(await api('/api/learning/playback?lesson='+lesson.slug,{cookie})).json();assert.ok(pb.embedUrl&&pb.transcript&&pb.sources);
   const signed=new URL(pb.embedUrl);const token=signed.pathname.split('/')[1];
   const signedManifest=`https://${signed.host}/${token}/manifest/video.m3u8`;
   const sr=await fetch(signedManifest,{headers:{Referer:origin+'/account/learn'}});assert.equal(sr.status,200);assert.ok((await sr.text()).startsWith('#EXTM3U'));
   const unsigned=JSON.parse(fs.readFileSync('src/lib/learning/assets.json'))[i].playback.hls;
   assert.notEqual((await fetch(unsigned,{headers:{Referer:origin+'/account/learn'}})).status,200);
   assert.equal((await api('/api/learning',{cookie,method:'POST',body:{action:'progress',lesson:lesson.slug,position:37}})).status,200);
   const q=mod.exports.smaCourseLessons[i];
   const wrong=q.questions.map(x=>(x.correct+1)%3),correct=q.questions.map(x=>x.correct);
   const failed=await(await api('/api/learning',{cookie,method:'POST',body:{action:'quiz',lesson:lesson.slug,answers:wrong}})).json();assert.equal(failed.passed,false);
   const passed=await(await api('/api/learning',{cookie,method:'POST',body:{action:'quiz',lesson:lesson.slug,answers:correct}})).json();assert.equal(passed.passed,true);assert.equal(passed.score,3);
   check(`Lesson ${i+1}: protected streaming, transcript, resume and quiz pass/fail`);
 }
 const end=await(await api('/api/learning',{cookie})).json();assert.equal(end.lessons.filter(x=>x.completed).length,5);assert.ok(end.lessons.every(x=>x.position===37));check('Progress survives reload; five lessons complete');
 assert.equal((await api('/api/admin/learning',{cookie})).status,401);check('Learner cannot read administrator report');
 const adminId=randomUUID(),adminEmail='sma-admin-'+Date.now()+'@example.test';
 await db.query('INSERT INTO administrator_identity(id,name,email,emailVerified,createdAt,updatedAt) VALUES(?,?,?,true,NOW(3),NOW(3))',[adminId,'SMA Test Admin',adminEmail]);
 await db.query("INSERT INTO administrator_credential(id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES(?,?,'credential',?,?,NOW(3),NOW(3))",[randomUUID(),adminId,adminId,await hashPassword(password)]);
 await db.query("INSERT INTO admin_users(id,auth_user_id,email,role,active) VALUES(?,?,?,'admin',true)",[randomUUID(),adminId,adminEmail]);
 const signIn=await api('/api/admin-auth/sign-in/email',{method:'POST',body:{email:adminEmail,password}});assert.equal(signIn.status,200);const adminCookie=cookies(signIn);
 const report=await(await api('/api/admin/learning',{cookie:adminCookie})).json();assert.ok(report.completions>=1);const own=report.rows.find(x=>x.learner===createHash('sha256').update(user.id).digest('hex').slice(0,16));assert.equal(own.first,0);assert.equal(own.latest,15);assert.equal(own.questions,15);assert.ok(!JSON.stringify(report).includes(email));check('Private cohort report verifies first/latest scores and completion without names or emails');
 const csv=await api('/api/admin/learning?format=csv',{cookie:adminCookie});assert.equal(csv.status,200);assert.ok((await csv.text()).includes('latest_score'));check('Administrator CSV export works');
 assert.equal((await api('/api/admin/learning',{cookie:adminCookie,method:'POST',body:{isFree:false,isPublished:true}})).status,200);
 assert.equal((await api('/api/learning',{cookie,method:'POST',body:{action:'enrol'}})).status,409);
 assert.equal((await api('/api/learning/playback?lesson=what-sma-is',{cookie})).status,200);
 assert.equal((await api('/api/admin/learning',{cookie:adminCookie,method:'POST',body:{isFree:true,isPublished:true}})).status,200);check('Free toggle closes new grants and preserves existing access');
 fs.writeFileSync('/private/tmp/sma-lms-integration-results.json',JSON.stringify({testedAt:new Date().toISOString(),environment:'isolated local SMA Hope database',checks},null,2));
 console.log('ALL LMS INTEGRATION CHECKS PASSED');
}finally{await db.end();}
