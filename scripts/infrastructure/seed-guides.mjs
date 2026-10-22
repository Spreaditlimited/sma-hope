import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import mysql from 'mysql2/promise';
const guideModule={exports:{}};
vm.runInNewContext(ts.transpileModule(await readFile('src/content/guides.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:guideModule.exports});
const env=parseEnv(await readFile('.env.local','utf8'));const u=new URL(env.SMAHOPE_DATABASE_URL);
const db=await mysql.createConnection({host:u.hostname,port:Number(u.port),user:u.username,password:decodeURIComponent(u.password),database:'smahope',ssl:{ca:await readFile('certificates/mysql-ca.pem'),rejectUnauthorized:true}});
try{await db.beginTransaction();let added=0;
 for(const guide of guideModule.exports.guides){const [r]=await db.query("INSERT IGNORE INTO articles (id,slug,title,status,content,revision) VALUES (?,?,?,'published',?,1)",[randomUUID(),guide.slug,guide.title,JSON.stringify(guide)]);added+=r.affectedRows;}
 await db.commit();console.log(`Seeded ${added} guides; existing editorial changes were preserved.`);
} catch(e){await db.rollback();console.error(e.code||'Guide seed failed');process.exitCode=1;}finally{await db.end();}
