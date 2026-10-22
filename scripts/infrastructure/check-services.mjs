import {readFile} from 'node:fs/promises';import {parseEnv} from 'node:util';import nodemailer from 'nodemailer';
const env=parseEnv(await readFile('.env.local','utf8'));
for(const prefix of ['HELP','PARTNERSHIPS']){
 const mail=nodemailer.createTransport({host:env.SMTP_HOST||'smtp.hostinger.com',port:Number(env.SMTP_PORT||465),secure:Number(env.SMTP_PORT||465)===465,auth:{user:env[prefix+'_EMAIL_ADDRESS'],pass:env[prefix+'_EMAIL_PASSWORD']},connectionTimeout:15000});
 try{await mail.verify();console.log(prefix+' SMTP authentication: PASS');}catch(e){console.log(prefix+' SMTP authentication: FAIL '+(e.code||'connection error'));process.exitCode=1;}finally{mail.close();}
}
for(const [name,url,headers] of [
 ['Paystack','https://api.paystack.co/plan?perPage=1',{Authorization:`Bearer ${env.PAYSTACK_SECRET_KEY}`}],
 ['Brevo','https://api.brevo.com/v3/contacts/lists/'+env.BREVO_LIST_ID,{'api-key':env.BREVO_API_KEY}],
]){try{const r=await fetch(url,{headers,signal:AbortSignal.timeout(15000)});console.log(name+' configuration check: HTTP '+r.status);if(!r.ok)process.exitCode=1;}catch{console.log(name+' configuration check failed');process.exitCode=1;}}
console.log('Read-only checks only: no messages, payments, subscriptions or shipments created.');
