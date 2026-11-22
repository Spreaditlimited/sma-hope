import fs from 'node:fs';
import mysql from 'mysql2/promise';
const url=new URL(process.env.SMAHOPE_DATABASE_URL||'mysql://invalid');
if(url.username!=='smahope_app'||url.pathname!=='/smahope'||!['195.35.29.41:3308','127.0.0.1:13309'].includes(url.host))throw new Error('Expected the dedicated SMA Hope database');
if(!process.argv.includes('--draft'))throw new Error('Use --draft; publication is a separate approved release step');
const db=await mysql.createConnection({host:url.hostname,port:Number(url.port),user:url.username,password:decodeURIComponent(url.password),database:'smahope',multipleStatements:true,ssl:{ca:fs.readFileSync('certificates/mysql-ca.pem'),rejectUnauthorized:true}});
try{
  await db.query(fs.readFileSync('database/003-learning.sql','utf8'));
  const [rows]=await db.query('SELECT slug,is_free,is_published FROM learning_courses');
  console.log(JSON.stringify({learningCourses:rows},null,2));
}finally{await db.end();}
