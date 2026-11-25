import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),exports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/auth/response.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,Response,console:{error(){}}});
const {handleAuthRequest}=exports;
test('Auth responses retain OAuth cookies, redirects and error status unchanged',async()=>{
 for(const response of [new Response(null,{status:302,headers:{Location:'https://accounts.google.com/','Set-Cookie':'oauth-state=opaque; HttpOnly'}}),Response.json({url:'https://accounts.google.com/'}) ,Response.json({error:'Too many requests'},{status:429})]){
  assert.equal(await handleAuthRequest(new Request('https://www.smahope.org/api/auth/sign-in/social'),async()=>response),response);
 }
});
test('Database failure returns private, retryable JSON without replaying account creation or exposing secrets',async()=>{
 let calls=0;
 const response=await handleAuthRequest(new Request('https://www.smahope.org/api/auth/sign-up/email'),async()=>{calls++;throw new Error('mysql://private-password@private-host');});
 assert.equal(calls,1);assert.equal(response.status,503);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(response.headers.get('Retry-After'),'30');
 assert.match(response.headers.get('Content-Type'),/application\/json/);const data=await response.json();assert.match(data.error,/temporarily unavailable/);assert.ok(!JSON.stringify(data).includes('private-password'));
});
