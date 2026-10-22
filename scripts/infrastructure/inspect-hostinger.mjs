import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
const env=parseEnv(await readFile('/Users/tochukwunkwocha/projects/effikos/.env.local','utf8'));
const token=env.EFFIKOS_HOSTINGER_API_TOKEN;
if(!token)throw Error('Hostinger credential unavailable');
try {
 const r=await fetch('https://developers.hostinger.com/api/vps/v1/virtual-machines',{headers:{Authorization:`Bearer ${token}`}});
 if(!r.ok)throw Error(`Hostinger HTTP ${r.status}`);
 const raw=await r.json();const rows=Array.isArray(raw)?raw:raw.data;
 console.log(JSON.stringify(rows.map(v=>({id:v.id,hostname:v.hostname,state:v.state,ipv4:v.ipv4,plan:v.plan})),null,2));
} catch(e){console.error(e.message.includes('HTTP')?e.message:'Hostinger inventory request failed');process.exitCode=1;}
