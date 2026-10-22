import {readFile,writeFile} from 'node:fs/promises';import {parseEnv} from 'node:util';import {randomBytes} from 'node:crypto';import {spawnSync} from 'node:child_process';
const env=parseEnv(await readFile('.env.local','utf8'));
const file='.local/production-env.json';let entries;
try{entries=JSON.parse(await readFile(file,'utf8'));}catch{
 entries=[{key:'SMAHOPE_DATABASE_URL',value:env.SMAHOPE_DATABASE_URL},{key:'SMAHOPE_AUTH_SECRET',value:randomBytes(32).toString('hex')},{key:'SMAHOPE_ADMIN_AUTH_SECRET',value:randomBytes(32).toString('hex')}].map(r=>({...r,type:'sensitive',target:['production']}));
 await writeFile(file,JSON.stringify(entries),{mode:0o600});
}
// The CLI consumes a private input file; no secret appears in argv or output.
const cli='/Users/tochukwunkwocha/.npm/_npx/69f9afb961c37556/node_modules/vercel/dist/vc.js';
for(const entry of entries){
 const input='.local/vercel-env-input.json';await writeFile(input,JSON.stringify(entry),{mode:0o600});
 const result=spawnSync(process.execPath,[cli,'api','/v10/projects/prj_3ARS5ReSfpq8pfmiWtFJcO5ALYez/env?teamId=team_dXMk2WoyygCeflKqvhZ0Uio4','--method','POST','--input',input],{encoding:'utf8'});
 if(result.status!==0){console.error('Failed to configure '+entry.key+'; provider output withheld.');process.exit(1);}
 console.log('Configured production secret: '+entry.key);
}
