import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {randomBytes,randomUUID,createCipheriv,createHash} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';
import mysql from 'mysql2/promise';
const env={...parseEnv(await readFile('.local/supabase-recovery.env','utf8').catch(()=>'')),...parseEnv(await readFile('.env.local','utf8'))};
const tables=['donor_accounts','donations','subscriptions','book_orders','payment_events','admin_users'];
const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`};
const source={};let db;
try {
 for(const table of tables){source[table]=[];for(let offset=0;;offset+=1000){
  const r=await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=*&order=id&offset=${offset}&limit=1000`,{headers});
  if(!r.ok)throw Error('Source read failed '+table+' HTTP '+r.status);
  const rows=await r.json();source[table].push(...rows);if(rows.length<1000)break;
 }}
 source.authUsers=[];
 for(let page=1;;page++){
  const r=await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`,{headers});
  if(!r.ok)throw Error('Source identity read failed HTTP '+r.status);
  const data=await r.json();source.authUsers.push(...data.users);if(data.users.length<1000)break;
 }
 await mkdir('.local/backups',{recursive:true,mode:0o700});
 const bytes=Buffer.from(JSON.stringify(source));const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
 const encrypted=Buffer.concat([iv,cipher.update(bytes),cipher.final(),cipher.getAuthTag()]);
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 await writeFile(`.local/backups/supabase-${stamp}.enc`,encrypted,{mode:0o600});
 await writeFile(`.local/backups/supabase-${stamp}.key`,key,{mode:0o600});
 const url=new URL(env.SMAHOPE_DATABASE_URL);
 db=await mysql.createConnection({host:url.hostname,port:Number(url.port),user:url.username,password:decodeURIComponent(url.password),database:'smahope',ssl:{ca:await readFile('certificates/mysql-ca.pem'),rejectUnauthorized:true},timezone:'Z'});
 for(const table of [...tables,'account_identity','administrator_identity']){
  const [rows]=await db.query(`SELECT COUNT(*) AS n FROM \`${table}\``);if(rows[0].n)throw Error('Destination is not empty: '+table+'; refusing to overwrite.');
 }
 // Enforce schema compatibility before writing any record.
 for(const table of tables){
  const [columns]=await db.query(`SHOW COLUMNS FROM \`${table}\``);const allowed=new Set(columns.map(c=>c.Field));
  if(source[table].some(row=>Object.keys(row).some(k=>!allowed.has(k))))throw Error('Unmapped source columns in '+table);
 }
 await db.beginTransaction();
 for(const user of source.authUsers){
  const email=user.email?.trim().toLowerCase();if(!email)throw Error('Unsupported source identity without email');
  await db.query('INSERT INTO account_identity (id,name,email,emailVerified,createdAt,updatedAt,active) VALUES (?,?,?,?,?,?,?)',[user.id,user.user_metadata?.full_name||email,email,Boolean(user.email_confirmed_at),new Date(user.created_at),new Date(),true]);
  await db.query("INSERT INTO account_credential (id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES (?,?,'credential',?,?,NOW(3),NOW(3))",[randomUUID(),user.id,user.id,await hashPassword(randomBytes(48).toString('base64url'))]);
 }
 for(const table of tables){for(const original of source[table]){
  const row={...original};
  if(table==='admin_users'){
   const id=randomUUID();row.auth_user_id=id;
   await db.query('INSERT INTO administrator_identity (id,name,email,emailVerified,createdAt,updatedAt,active) VALUES (?,?,?,true,NOW(3),NOW(3),?)',[id,row.email,row.email.toLowerCase(),row.active]);
   await db.query("INSERT INTO administrator_credential (id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES (?,?,'credential',?,?,NOW(3),NOW(3))",[randomUUID(),id,id,await hashPassword(randomBytes(48).toString('base64url'))]);
  }
  const keys=Object.keys(row);const values=keys.map(k=>row[k]===null?null:['metadata','payload'].includes(k)?JSON.stringify(row[k]):/_at$|_date$/.test(k)?new Date(row[k]):row[k]);
  await db.query(`INSERT INTO \`${table}\` (${keys.map(k=>'`'+k+'`').join(',')}) VALUES (${keys.map(()=>'?').join(',')})`,values);
 }}
 const report={verifiedAt:new Date().toISOString(),sourceBackupSha256:createHash('sha256').update(encrypted).digest('hex'),tables:{},identityCount:source.authUsers.length,passwordResetRequired:true};
 for(const table of tables){
  const [rows]=await db.query(`SELECT * FROM \`${table}\` ORDER BY id`);
  if(rows.length!==source[table].length)throw Error('Count mismatch '+table);
  const expected=new Map(source[table].map(r=>[r.id,r]));
  for(const row of rows){const before=expected.get(row.id);if(!before)throw Error('ID mismatch '+table);
   for(const k of Object.keys(before)){
    if(k==='auth_user_id'&&table==='admin_users')continue;
    const normalize=v=>v instanceof Date?v.toISOString():typeof v==='object'&&v!==null?JSON.stringify(v):String(v??'');
    const v=/_at$|_date$/.test(k)&&before[k]?new Date(before[k]):before[k];
    const actual=['metadata','payload'].includes(k)&&typeof row[k]==='string'?JSON.parse(row[k]):row[k];
    if(typeof before[k]==='boolean'){if(Boolean(row[k])!==before[k])throw Error('Boolean mismatch '+table);}
    else if(['amount_major','total_ngn'].includes(k)){if(Number(actual)!==Number(v))throw Error('Amount mismatch '+table);}
    else if(['metadata','payload'].includes(k)){if(JSON.stringify(sortObject(actual))!==JSON.stringify(sortObject(v)))throw Error('JSON mismatch '+table);}
    else if(normalize(actual)!==normalize(v))throw Error('Value mismatch '+table+' '+k);
   }
  }
  report.tables[table]=rows.length;
 }
 await db.commit();
 await writeFile('.local/migration-report.json',JSON.stringify(report,null,2),{mode:0o600});
 console.log(JSON.stringify(report,null,2));
 console.log('Import committed after field-by-field comparison. Existing sessions and password hashes were not imported. No emails sent.');
}catch(e){await db?.rollback();console.error('Migration stopped:',e.code||e.message);process.exitCode=1;}finally{await db?.end();}
function sortObject(v){return Array.isArray(v)?v.map(sortObject):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sortObject(v[k])])):v;}
