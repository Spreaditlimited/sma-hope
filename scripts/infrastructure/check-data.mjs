import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import mysql from 'mysql2/promise';
const env={...parseEnv(await readFile('.local/supabase-recovery.env','utf8').catch(()=>'')),...parseEnv(await readFile('.env.local','utf8'))};
const url=new URL(env.SMAHOPE_DATABASE_URL);
let db;
try {
 db=await mysql.createConnection({host:url.hostname,port:Number(url.port),user:url.username,password:decodeURIComponent(url.password),database:'smahope',ssl:{ca:await readFile('certificates/mysql-ca.pem'),rejectUnauthorized:true}});
 const [tls]=await db.query("SHOW SESSION STATUS LIKE 'Ssl_cipher'");
 console.log('Hostinger MySQL connection: verified TLS; cipher '+tls[0].Value);
 for(const table of ['donor_accounts','donations','subscriptions','book_orders','payment_events','admin_users']){
  const r=await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=id`,{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,Prefer:'count=exact',Range:'0-0'}});
  console.log(table, 'source HTTP',r.status,'count',r.headers.get('content-range')?.split('/')[1]);
 }
} catch(e){console.error('Check failed',e.code || e.cause?.code || e.name);process.exitCode=1;} finally {await db?.end();}
