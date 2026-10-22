import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {hashPassword} from 'better-auth/crypto';
import mysql from 'mysql2/promise';
const env=parseEnv(await readFile('.env.local','utf8'));
const origin=env.SMAHOPE_AUTH_URL;assert.equal(origin,'http://localhost:3002','Integration test is local only');
const u=new URL(env.SMAHOPE_DATABASE_URL);
const db=await mysql.createConnection({host:u.hostname,port:Number(u.port),user:u.username,password:decodeURIComponent(u.password),database:'smahope',ssl:{ca:await readFile('certificates/mysql-ca.pem'),rejectUnauthorized:true}});
const created=[];const slug='test-guide-'+randomBytes(5).toString('hex');
async function api(path,{cookie='',method='GET',body,site=origin}={}){
 return fetch(origin+path,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(method!=='GET'?{'Content-Type':'application/json',Origin:site}: {})},body:body?JSON.stringify(body):undefined,redirect:'manual'});
}
async function identity(scope,role){
 const id=randomUUID(),email=`test-${id}@example.invalid`,password=randomBytes(24).toString('base64url');
 created.push({id,scope});
 await db.query(`INSERT INTO ${scope}_identity (id,name,email,emailVerified,createdAt,updatedAt) VALUES (?,'Integration test',?,true,NOW(3),NOW(3))`,[id,email]);
 await db.query(`INSERT INTO ${scope}_credential (id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES (?,?,'credential',?,?,NOW(3),NOW(3))`,[randomUUID(),id,id,await hashPassword(password)]);
 if(scope==='administrator')await db.query('INSERT INTO admin_users (id,auth_user_id,email,role,active) VALUES (?,?,?,?,true)',[id,id,email,role]);
 else await db.query('INSERT INTO donor_accounts (id,auth_user_id,email,full_name) VALUES (?,?,?,?)',[id,id,email,'Integration test']);
 const r=await api(scope==='administrator'?'/api/admin-auth/sign-in/email':'/api/auth/sign-in/email',{method:'POST',body:{email,password}});
 assert.equal(r.status,200,'Sign-in should succeed');
 const cookie=r.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ');assert.ok(cookie);return {id,email,cookie};
}
try {
 assert.equal((await api('/api/auth/ok')).status,200);
 assert.equal((await api('/api/admin/dashboard')).status,401);
 assert.equal((await api('/api/account/records')).status,401);
 const a=await identity('account'),b=await identity('account'),admin=await identity('administrator','admin'),ops=await identity('administrator','ops');
 for(const user of [a,b])await db.query("INSERT INTO donations (id,donor_account_id,email,paystack_reference,amount_major,currency,status) VALUES (?,?,?,?,100,'NGN','success')",[randomUUID(),user.id,user.email,'test-'+user.id]);
 const data=await (await api('/api/account/records',{cookie:a.cookie})).json();assert.equal(data.donations.length,1);
 const [own]=await db.query('SELECT id FROM donations WHERE donor_account_id=?',[a.id]);assert.equal(data.donations[0].id,own[0].id);
 assert.equal((await api('/api/admin/dashboard',{cookie:a.cookie})).status,401,'Supporter cannot access admin');
 assert.equal((await api('/api/account/records',{cookie:admin.cookie})).status,401,'Admin session does not grant supporter session');
 assert.equal((await api('/api/admin/dashboard',{cookie:admin.cookie})).status,200);
 assert.equal((await api('/api/admin/content',{cookie:ops.cookie,method:'POST',body:{}})).status,403,'Ops cannot publish');
 assert.equal((await api('/api/admin/content',{cookie:admin.cookie,method:'POST',site:'https://untrusted.invalid',body:{}})).status,403,'Cross-origin mutation denied');
 const content={slug,title:'Integration test guide',excerpt:'A temporary test guide for verifying publication isolation.',category:'Understanding SMA',summary:['Test summary'],sections:[{title:'Test section',paragraphs:['A test paragraph.']}],checklist:['Test checklist'],related:[],clinical:false,updatedAt:'2026-10-22'};
 const draft=await api('/api/admin/content',{cookie:admin.cookie,method:'POST',body:{content,status:'draft',revision:0}});assert.equal(draft.status,200);
 assert.equal((await api('/blog/'+slug)).status,404,'Draft must not be public');
 const stale=await api('/api/admin/content',{cookie:admin.cookie,method:'POST',body:{content,status:'published',revision:0}});assert.equal(stale.status,409,'Conflicting edit rejected');
 const published=await api('/api/admin/content',{cookie:admin.cookie,method:'POST',body:{content,status:'published',revision:1}});assert.equal(published.status,200);
 assert.equal((await api('/blog/'+slug)).status,200,'Published guide must render');
 const sitemap=await (await api('/sitemap.xml')).text();assert.ok(sitemap.includes(slug),'Published article in sitemap');
 const unpublish=await api('/api/admin/content',{cookie:admin.cookie,method:'POST',body:{content,status:'draft',revision:2}});assert.equal(unpublish.status,200);
 assert.equal((await api('/blog/'+slug)).status,404,'Unpublished article hidden');
 const combined=a.cookie+'; '+admin.cookie;
 assert.equal((await api('/api/admin-auth/sign-out',{cookie:combined,method:'POST',body:{}})).status,200);
 assert.equal((await api('/api/admin/dashboard',{cookie:admin.cookie})).status,401,'Admin logout revokes session');
 assert.equal((await api('/api/account/records',{cookie:a.cookie})).status,200,'Admin logout preserves supporter session');
 const noSignup=await api('/api/admin-auth/sign-up/email',{method:'POST',body:{email:'nobody@example.invalid',password:randomBytes(20).toString('hex'),name:'Test'}});assert.ok(noSignup.status>=400);
 console.log('PASS: separate sessions, logout, unauthenticated denial, supporter ownership, role restrictions, CSRF, draft/publication/sitemap, and edit conflicts.');
} catch(e){console.error('FAIL:',e.message);process.exitCode=1;}finally{
 await db.query('DELETE FROM articles WHERE slug=?',[slug]);await db.query('DELETE FROM audit_events WHERE target_id=?',[slug]);
 for(const {id,scope} of created){if(scope==='account'){await db.query('DELETE FROM donations WHERE donor_account_id=?',[id]);await db.query('DELETE FROM donor_accounts WHERE id=?',[id]);}else await db.query('DELETE FROM admin_users WHERE id=?',[id]);await db.query(`DELETE FROM ${scope}_identity WHERE id=?`,[id]);}
 await db.end();console.log('Temporary test records removed. No emails, charges, or shipments created.');
}
