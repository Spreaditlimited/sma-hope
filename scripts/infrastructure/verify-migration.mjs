// Read-only reconciliation. Source data is never printed or written back.
import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import mysql from 'mysql2/promise';
const env={...parseEnv(await readFile('.local/supabase-recovery.env','utf8').catch(()=>'')),...parseEnv(await readFile('.env.local','utf8'))};
const url=new URL(env.SMAHOPE_DATABASE_URL);
const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`};
const tables=['donor_accounts','donations','subscriptions','book_orders','payment_events','admin_users'];
const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
let db;let mismatches=0;
try {
 db=await mysql.createConnection({host:url.hostname,port:Number(url.port),user:url.username,password:decodeURIComponent(url.password),database:'smahope',ssl:{ca:await readFile('certificates/mysql-ca.pem'),rejectUnauthorized:true},timezone:'Z'});
 for(const table of tables){
  let source=[];
  for(let offset=0;;offset+=1000){const response=await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=*&order=id&offset=${offset}&limit=1000`,{headers,signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`Source ${table} HTTP ${response.status}`);const rows=await response.json();source.push(...rows);if(rows.length<1000)break;}
  const [destination]=await db.query(`SELECT * FROM \`${table}\``);const byId=new Map(destination.map(row=>[row.id,row]));let missing=0,changed=0;
  const fields=new Set();
  for(const row of source){const actual=byId.get(row.id);if(!actual){missing++;continue;}
   for(const [key,value] of Object.entries(row)){
    if(table==='admin_users'&&key==='auth_user_id')continue;
    let a=actual[key],b=value;
    if(a===null&&b===null)continue;
    if(typeof b==='boolean'){a=Boolean(a);}
    else if(/_at$|_date$/.test(key)&&b){a=new Date(a).toISOString();b=new Date(b).toISOString();}
    else if(['metadata','payload'].includes(key)){a=JSON.stringify(sort(typeof a==='string'?JSON.parse(a):a));b=JSON.stringify(sort(b));}
    else if(['amount_major','total_ngn'].includes(key)){a=Number(a);b=Number(b);}
    if(String(a??'')!==String(b??'')){changed++;fields.add(key);}
   }
  }
  mismatches+=missing+changed;console.log(JSON.stringify({table,source:source.length,destination:destination.length,missing,changedFields:changed,fields:[...fields]}));
 }
 if(mismatches)throw Error('Source records require reconciliation before cutover');
 console.log('PASS: all Supabase business records are preserved on Hostinger.');
}catch(e){console.error(e.code||e.message);process.exitCode=1;}finally{await db?.end();}
