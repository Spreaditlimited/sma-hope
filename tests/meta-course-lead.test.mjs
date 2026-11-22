import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const compile=path=>ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function moduleFor({env={},fetch=async()=>Response.json({events_received:1})}={}){
 const exports={},logs=[];
 vm.runInNewContext(compile('src/lib/meta-course-lead.ts'),{exports,Request,AbortSignal,fetch,console:{warn:message=>logs.push(message)},process:{env:{NODE_ENV:'production',VERCEL:'1',META_CAPI_ENABLED:'true',SMAHOPE_CAPI_TOKEN:'test-secret',...env}},require:id=>id==='server-only'?{}:id==='./cookie-consent'?{CONSENT_COOKIE:'smahope_cookie_consent_v2'}:require(id)});
 return {...exports,logs};
}
const request=(headers={})=>new Request('https://www.smahope.org/account/register?email=private@example.test&fbclid=private-query',{headers:{'User-Agent':'Test Browser',cookie:'smahope_cookie_consent_v2=accepted; _fbp=fb.1.1795370000000.12345; _fbc=fb.1.1795370000000.test-click','x-vercel-ip-country':'NG','x-vercel-forwarded-for':'203.0.113.10',...headers}});
test('only explicit advertising consent and trusted Nigerian geolocation create a lead',()=>{
 const m=moduleFor();
 for(const cookie of ['', 'smahope_cookie_consent_v2=declined','smahope_cookie_consent=accepted'])assert.equal(m.buildCourseSignupLead(request({cookie}),'user-1'),null);
 for(const country of ['GB','DE','CA','US',''])assert.equal(m.buildCourseSignupLead(request({'x-vercel-ip-country':country}),'user-1'),null);
 assert.equal(moduleFor({env:{VERCEL:''}}).buildCourseSignupLead(request(),'user-1'),null);
 assert.equal(m.buildCourseSignupLead(request({'User-Agent':''}),'user-1'),null);
 assert.ok(m.buildCourseSignupLead(request(),'user-1'));
});
test('lead payload excludes personal, clinical and query data, with a stable opaque deduplication ID',()=>{
 const m=moduleFor(),a=m.buildCourseSignupLead(request(),'user-1'),b=m.buildCourseSignupLead(request(),'user-1'),c=m.buildCourseSignupLead(request(),'user-2');
 assert.equal(a.event_id,b.event_id);assert.notEqual(a.event_id,c.event_id);assert.equal(a.event_name,'Lead');
 assert.deepEqual(Object.keys(a).sort(),['action_source','event_id','event_name','event_source_url','event_time','user_data']);
 assert.equal(a.event_source_url,'https://www.smahope.org/account/register');
 assert.deepEqual(Object.keys(a.user_data).sort(),['client_ip_address','client_user_agent','fbc','fbp']);
 assert.ok(!JSON.stringify(a).includes('private'));assert.ok(!JSON.stringify(a).includes('user-1'));
 const invalid=m.buildCourseSignupLead(request({cookie:'smahope_cookie_consent_v2=accepted; _fbp=arbitrary; _fbc=email@example.test','x-vercel-forwarded-for':'bad-ip'}),'user-1');
 assert.deepEqual(Object.keys(invalid.user_data),['client_user_agent']);
});
test('disabled, missing-token and non-production-without-test configurations never contact Meta',async()=>{
 for(const env of [{META_CAPI_ENABLED:'false'},{SMAHOPE_CAPI_TOKEN:''},{NODE_ENV:'development'},{META_CAPI_GRAPH_VERSION:'bad-version'}]){
  let calls=0;const m=moduleFor({env,fetch:async()=>{calls++;return Response.json({events_received:1});}});
  await m.sendCourseSignupLead(m.buildCourseSignupLead(request(),'user-1'));assert.equal(calls,0);
 }
});
test('Meta receives only Lead on the intended pixel, using bearer auth and a test-only code when configured',async()=>{
 const calls=[];const m=moduleFor({env:{META_CAPI_TEST_EVENT_CODE:'TEST-ONLY'},fetch:async(url,options)=>{calls.push({url,options});return Response.json({events_received:1});}});
 assert.equal((await m.sendCourseSignupLead(m.buildCourseSignupLead(request(),'user-1'))).status,'sent');
 assert.equal(calls.length,1);assert.equal(calls[0].url,'https://graph.facebook.com/v25.0/2521801154897796/events');
 assert.equal(calls[0].options.headers.Authorization,'Bearer test-secret');assert.ok(!calls[0].url.includes('test-secret'));
 const payload=JSON.parse(calls[0].options.body);assert.equal(payload.test_event_code,'TEST-ONLY');assert.equal(payload.data[0].event_name,'Lead');assert.equal(payload.data.length,1);
});
test('transient failures retry with identical event ID and time; permanent rejection never leaks the provider payload',async()=>{
 const calls=[];let m=moduleFor({fetch:async(_url,options)=>{calls.push(options.body);return calls.length===1?new Response('',{status:503}):Response.json({events_received:1});}});
 assert.equal((await m.sendCourseSignupLead(m.buildCourseSignupLead(request(),'user-1'))).status,'sent');assert.equal(calls.length,2);assert.equal(calls[0],calls[1]);
 let attempts=0;m=moduleFor({fetch:async()=>{attempts++;return Response.json({error:'private-provider-detail'},{status:400});}});
 assert.equal((await m.sendCourseSignupLead(m.buildCourseSignupLead(request(),'user-1'))).status,'failed');assert.equal(attempts,1);assert.ok(!m.logs.join('').includes('private-provider-detail'));
});
async function signupRoute({body,status=200,path='/api/auth/sign-up/email',consent=true}){
 const callbacks=[],events=[],m=moduleFor(),exports={};
 const response=Response.json(status===200?{user:{id:'created-user'}}:{error:'Unable to register'},{status,headers:{'set-cookie':'session=preserved; HttpOnly'}});
 vm.runInNewContext(compile('src/app/api/auth/[...all]/route.ts'),{exports,URL,Response,console,require:id=>id==='next/server'?{after:fn=>callbacks.push(fn)}:id==='@/lib/auth/server'?{assertSameOrigin:()=>{},getAuth:()=>({handler:async()=>response})}:{buildCourseSignupLead:m.buildCourseSignupLead,sendCourseSignupLead:async e=>events.push(e)}});
 const r=await exports.POST(new Request('https://www.smahope.org'+path,{method:'POST',headers:{'Content-Type':'application/json','User-Agent':'Test Browser','x-vercel-ip-country':'NG',cookie:consent?'smahope_cookie_consent_v2=accepted':''},body:JSON.stringify(body)}));
 if(r.ok)assert.equal(r.headers.get('set-cookie'),'session=preserved; HttpOnly');
 for(const fn of callbacks)await fn();return {r,events};
}
const fields={name:'Test Learner',email:'private@example.test',password:'Synthetic-password-123',terms:true,signupSource:'learning'};
test('only a successful new course signup queues a lead; invalid, duplicate, unrelated and unconsented requests do not',async()=>{
 assert.equal((await signupRoute({body:fields})).events.length,1);
 for(const params of [{body:fields,status:409},{body:{...fields,terms:false}},{body:{...fields,signupSource:'other'}},{body:fields,consent:false},{body:fields,path:'/api/auth/sign-in/email'}])assert.equal((await signupRoute(params)).events.length,0);
});
