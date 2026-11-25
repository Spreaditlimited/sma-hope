import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const compile=p=>ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const valid=(extra={})=>({success:true,score:0.9,action:'register',hostname:'www.smahope.org',challenge_ts:new Date().toISOString(),...extra});
function verifier({env={},fetch=async()=>Response.json(valid())}={}) {
 const exports={};vm.runInNewContext(compile('src/lib/captcha.ts'),{exports,URL,URLSearchParams,Response,AbortSignal,Date,fetch,process:{env:{NODE_ENV:'production',VERCEL:'1',SMAHOPE_CAPTCHA_SITE_KEY:'public-key',SMAHOPE_CAPTCHA_SECRET_KEY:'private-secret',...env}},require:id=>id==='server-only'?{}:require(id)});return exports;
}
const request=(path='/api/auth/sign-up/email',token='fresh-token')=>new Request('https://www.smahope.org'+path,{method:'POST',headers:{...(token?{'x-captcha-token':token}:{}),'x-vercel-forwarded-for':'203.0.113.10'},body:'{}'});
test('CAPTCHA fails closed for missing config or missing/malformed tokens before contacting Google',async()=>{
 let calls=0;const fetch=async()=>{calls++;return Response.json(valid());};
 for(const env of [{SMAHOPE_CAPTCHA_SECRET_KEY:''},{SMAHOPE_CAPTCHA_SITE_KEY:''}])assert.equal((await verifier({env,fetch}).verifyCaptcha(request(),'register')).status,503);
 for(const token of ['', 'has whitespace','x'.repeat(8193)])assert.equal((await verifier({fetch}).verifyCaptcha(request(undefined,token),'register')).status,403);
 assert.equal(calls,0);
});
test('CAPTCHA accepts only recent successful tokens for the correct action, score and SMA Hope hostname',async()=>{
 for(const change of [{success:false},{score:0.49},{score:'0.9'},{score:2},{score:null},{action:'login'},{hostname:'attacker.test'},{hostname:'localhost'},{challenge_ts:'invalid'},{challenge_ts:new Date(Date.now()-121000).toISOString()},{challenge_ts:new Date(Date.now()+31000).toISOString()},{'error-codes':['timeout-or-duplicate']},{'error-codes':['Over free quota.']}]){
  const result=await verifier({fetch:async()=>Response.json(valid(change))}).verifyCaptcha(request(),'register');assert.equal(result?.status,403,JSON.stringify(change));
 }
 assert.equal(await verifier().verifyCaptcha(request(),'register'),null);
 assert.equal(await verifier({fetch:async()=>Response.json(valid({hostname:'smahope.org',score:0.5}))}).verifyCaptcha(request(),'register'),null);
 assert.equal(await verifier({env:{NODE_ENV:'development'},fetch:async()=>Response.json(valid({hostname:'localhost'}))}).verifyCaptcha(request(),'register'),null);
});
test('CAPTCHA uses Google server verification with a private body, validated trusted IP and a timeout; provider failure stays closed',async()=>{
 let call;const m=verifier({fetch:async(url,options)=>{call={url,options};return Response.json(valid());}});
 await m.verifyCaptcha(request(),'register');assert.equal(call.url,'https://www.google.com/recaptcha/api/siteverify');assert.equal(call.options.method,'POST');assert.equal(call.options.cache,'no-store');assert(call.options.signal);
 assert.equal(call.options.body.get('secret'),'private-secret');assert.equal(call.options.body.get('response'),'fresh-token');assert.equal(call.options.body.get('remoteip'),'203.0.113.10');assert(!call.url.includes('private-secret'));
 for(const fetch of [async()=>{throw new Error('private-provider-error');},async()=>new Response('private-provider-error',{status:500}),async()=>new Response('not-json')]){
  const result=await verifier({fetch}).verifyCaptcha(request(),'register');assert.equal(result.status,503);assert(!(await result.text()).includes('private-provider-error'));
 }
});
test('all public and administrator authentication actions, including trailing slashes, are protected without interfering with session reads',()=>{
 const m=verifier();for(const [path,expected] of [['sign-up/email','register'],['sign-in/email','login'],['request-password-reset','password_reset'],['reset-password','password_update']]){
  for(const suffix of ['','/'])assert.equal(m.authCaptchaAction(request('/api/auth/'+path+suffix)),expected);
  const adminExpected=path==='sign-up/email'?'register':'admin_'+expected;assert.equal(m.authCaptchaAction(request('/api/admin-auth/'+path),true),adminExpected);
 }
 assert.equal(m.authCaptchaAction(request('/api/auth/get-session')),null);assert.equal(m.authCaptchaAction(request('/api/auth/sign-out')),null);
});
function route(path,captcha,dependencies={}){
 const authResponse={};vm.runInNewContext(compile('src/lib/auth/response.ts'),{exports:authResponse,Response,console});
 const exports={};vm.runInNewContext(compile(path),{exports,URL,Request,Response,console,require:id=>id==='@/lib/auth/response'?authResponse:id==='@/lib/captcha'?captcha:id==='next/server'?{NextResponse:Response,after:()=>{}}:dependencies[id]||{}});return exports;
}
test('every form endpoint blocks missing/invalid CAPTCHA before authentication, email delivery, subscriptions or CAPI side effects',async()=>{
 const captcha=verifier();let calls=0;const auth={getAuth:()=>({handler:async()=>{calls++;return Response.json({ok:true});}})};
 const cases=[['src/app/api/auth/[...all]/route.ts','/api/auth/sign-up/email'],['src/app/api/auth/[...all]/route.ts','/api/auth/sign-in/email'],['src/app/api/auth/[...all]/route.ts','/api/auth/request-password-reset'],['src/app/api/auth/[...all]/route.ts','/api/auth/reset-password'],['src/app/api/admin-auth/[...all]/route.ts','/api/admin-auth/sign-in/email'],['src/app/api/admin-auth/[...all]/route.ts','/api/admin-auth/request-password-reset'],['src/app/api/admin-auth/[...all]/route.ts','/api/admin-auth/reset-password'],['src/app/api/account/password-reset/request/route.ts','/api/account/password-reset/request'],['src/app/api/contact/route.ts','/api/contact'],['src/app/api/newsletter/route.ts','/api/newsletter']];
 for(const [file,path] of cases){
  const deps={'@/lib/auth/server':auth,'@/lib/email':{sendTransactionalEmail:async()=>calls++},'@/lib/brevo':{upsertBrevoSubscriber:async()=>calls++}};
  const result=await route(file,captcha,deps).POST(request(path,''));assert.equal(result.status,403,path);assert.equal((await result.json()).code,'CAPTCHA_FAILED');
 }
 assert.equal(calls,0);
});
test('verified authentication preserves its response and existing session cookie, while action mismatch is blocked',async()=>{
 let calls=0;const captcha=verifier({fetch:async()=>Response.json(valid({action:'login'}))});
 const handler=route('src/app/api/auth/[...all]/route.ts',captcha,{'@/lib/auth/server':{getAuth:()=>({handler:async()=>{calls++;return Response.json({ok:true},{headers:{'set-cookie':'session=preserved; HttpOnly'}});}})}});
 const ok=await handler.POST(request('/api/auth/sign-in/email'));assert.equal(ok.status,200);assert.equal(ok.headers.get('set-cookie'),'session=preserved; HttpOnly');
 assert.equal((await handler.POST(request('/api/auth/sign-up/email'))).status,403);assert.equal(calls,1);
});
test('public CAPTCHA configuration exposes the site key only and is never cached',async()=>{
 const exports={};vm.runInNewContext(compile('src/app/api/captcha/config/route.ts'),{exports,Response,process:{env:{SMAHOPE_CAPTCHA_SITE_KEY:'public-key',SMAHOPE_CAPTCHA_SECRET_KEY:'private-secret'}}});
 const response=await exports.GET();assert.equal(response.headers.get('cache-control'),'no-store');assert.deepEqual(await response.json(),{siteKey:'public-key'});
});
