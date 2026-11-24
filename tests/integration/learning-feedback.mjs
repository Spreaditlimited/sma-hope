import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseEnv } from 'node:util';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import mysql from 'mysql2/promise';
const require = createRequire(import.meta.url), { hashPassword } = await import(require.resolve('better-auth/crypto'));
const env = parseEnv(fs.readFileSync(process.env.SMAHOPE_TEST_ENV || '/private/tmp/sma-lms-test.env', 'utf8'));
const origin = env.SMAHOPE_AUTH_URL, url = new URL(env.SMAHOPE_TEST_DATABASE_URL);
assert.equal(origin, 'http://localhost:3021'); assert.equal(url.host, '127.0.0.1:33317'); assert.equal(url.pathname, '/smahope_test');
const db = await mysql.createConnection({ host: url.hostname, port: 33317, user: url.username, password: decodeURIComponent(url.password), database: 'smahope_test' });
const ids = [], adminId = randomUUID(), password = 'Feedback-isolated-test-2026!';
let count = 0;
function check(name) { count++; console.log('PASS ' + name); }
async function api(path, { cookie = '', method = 'GET', body, site = origin } = {}) {
  return fetch(origin + path, { method, redirect: 'manual', headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method === 'POST' ? { Origin: site, 'Content-Type': 'application/json', 'x-captcha-token': path.includes('admin-auth') ? 'admin_login' : 'register' } : {}) }, body: body ? JSON.stringify(body) : undefined });
}
const cookies = response => response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
try {
  for (const path of ['/api/learning/feedback', '/api/admin/learning/feedback']) assert.equal((await api(path)).status,401);
  check('Feedback and reports deny anonymous access');
  const response = await api('/api/auth/sign-up/email', { method:'POST', body:{name:'Isolated Feedback Learner',email:'feedback-'+randomUUID()+'@example.test',password,terms:true,signupSource:'learning'} });
  assert.equal(response.status,200); const cookie = cookies(response), user = (await response.json()).user; ids.push(user.id);
  const feedback = { rating:5, helpful:'Clear explanations, especially lesson one.', improvement:'More examples, please.' };
  assert.equal((await api('/api/learning/feedback',{cookie})).status,403);
  assert.equal((await api('/api/learning/feedback',{cookie,method:'POST',body:feedback})).status,403);
  check('An account without active enrolment cannot read or submit course feedback');
  assert.equal((await api('/api/learning',{cookie,method:'POST',body:{action:'enrol'}})).status,200);
  assert.equal((await (await api('/api/learning/feedback',{cookie})).json()).feedback,null);
  assert.equal((await api('/api/learning/feedback',{cookie,method:'POST',body:feedback,site:'https://untrusted.invalid'})).status,403);
  for (const body of [{...feedback,rating:6},{...feedback,rating:'5'},{...feedback,helpful:'a'.repeat(2001)}]) assert.equal((await api('/api/learning/feedback',{cookie,method:'POST',body})).status,400);
  check('CSRF, invalid ratings and oversized comments are rejected');
  let result = await api('/api/learning/feedback',{cookie,method:'POST',body:feedback}); assert.equal(result.status,200);
  assert.equal((await result.json()).feedback.helpful,feedback.helpful);
  const changed = {...feedback,rating:4,helpful:'<script>alert(1)</script> is shown as plain feedback.'};
  assert.equal((await api('/api/learning/feedback',{cookie,method:'POST',body:changed})).status,200);
  assert.equal((await (await api('/api/learning/feedback',{cookie})).json()).feedback.rating,4);
  const [[row]] = await db.query('SELECT COUNT(*) total FROM learning_feedback WHERE user_id=?',[user.id]); assert.equal(row.total,1);
  check('Feedback persists, loads and updates one response per learner without duplicates');
  assert.equal((await api('/api/admin/learning/feedback',{cookie})).status,401);
  check('Learner session cannot read other learners’ feedback');
  const adminEmail = 'feedback-admin-'+randomUUID()+'@example.test';
  await db.query('INSERT INTO administrator_identity(id,name,email,emailVerified,active,createdAt,updatedAt) VALUES(?,?,?,1,1,NOW(3),NOW(3))',[adminId,'Feedback Test Admin',adminEmail]);
  await db.query('INSERT INTO administrator_credential(id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES(?,?,?,?,?,NOW(3),NOW(3))',[randomUUID(),adminId,'credential',adminId,await hashPassword(password)]);
  await db.query('INSERT INTO admin_users(id,email,role,active,auth_user_id) VALUES(?,?,?,1,?)',[randomUUID(),adminEmail,'admin',adminId]);
  const login = await api('/api/admin-auth/sign-in/email',{method:'POST',body:{email:adminEmail,password}}); assert.equal(login.status,200); const adminCookie = cookies(login);
  const report = await (await api('/api/admin/learning/feedback',{cookie:adminCookie})).json();
  assert.ok(report.responses.some(row=>row.helpful===changed.helpful && row.rating===4)); assert.ok(report.total>=1); assert.ok(report.average>=1 && report.average<=5);
  assert.equal((await api('/api/admin/learning/feedback?page=-1',{cookie:adminCookie})).status,400);
  check('Authorised admin sees real responses, aggregate ratings and validated pagination');
  await db.query('UPDATE learning_enrolments SET active=0 WHERE user_id=?',[user.id]);
  assert.equal((await api('/api/learning/feedback',{cookie})).status,403);
  check('Revoked enrolment prevents further feedback access');
  console.log(`PASS all ${count} feedback integration checks; no external email sent.`);
} finally {
  for (const id of ids) await db.query('DELETE FROM account_identity WHERE id=?',[id]);
  await db.query('DELETE FROM admin_users WHERE auth_user_id=?',[adminId]);
  await db.query('DELETE FROM administrator_identity WHERE id=?',[adminId]);
  await db.end();
}
