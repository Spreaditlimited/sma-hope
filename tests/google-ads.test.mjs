import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const compile=path=>ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const adsConsent='smahope_google_ads_consent_v1=accepted';
const receipt='11111111-2222-4333-8444-555555555555';
function browser({cookie='',route='/learn/understanding-sma',host='www.smahope.org',storageBlocked=false}={}){
 const scripts=[],writes=[],jar=new Map(cookie.split('; ').filter(Boolean).map(x=>{const i=x.indexOf('=');return[x.slice(0,i),x.slice(i+1)];})),storage=new Map(),cache={},timers=new Map();let nextTimer=1;
 const document={title:'PRIVATE USER NAME MUST NOT APPEAR',referrer:'https://referrer.test/private?email=private@example.test',get cookie(){if(storageBlocked)throw Error('blocked');return [...jar].map(([k,v])=>k+'='+v).join('; ');},set cookie(value){if(storageBlocked)throw Error('blocked');writes.push(value);const raw=value.split(';')[0],i=raw.indexOf('=');if(value.includes('Max-Age=0'))jar.delete(raw.slice(0,i));else jar.set(raw.slice(0,i),raw.slice(i+1));},createElement(){return{remove(){}};},head:{appendChild(s){scripts.push(s);}}};
 const window={location:new URL('https://'+host+route),dispatchEvent(){},setTimeout(fn){const id=nextTimer++;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},sessionStorage:{getItem(k){if(storageBlocked)throw Error('blocked');return storage.get(k)||null;},setItem(k,v){if(storageBlocked)throw Error('blocked');storage.set(k,v);}}};
 function load(name){if(cache[name])return cache[name];const exports={};cache[name]=exports;vm.runInNewContext(compile('src/lib/'+name+'.ts'),{exports,Date,Set,URL,Event,window,document,require:id=>load(id.replace(/^\.\//,''))});return exports;}
 const ads=load('google-ads'),consent=load('cookie-consent'),ga=load('google-analytics');
 return {ads,ga,consent,window,document,scripts,writes,jar,storage,load,commands(){return(window.dataLayer||[]).map(x=>Array.from(x));},events(){return this.commands().filter(x=>x[0]==='event'&&x[1]==='conversion');},navigate(path){window.location=new URL('https://'+host+path);ads.syncGoogleAds(window.location.pathname);ga.syncGoogleAnalytics(window.location.pathname);},ready(){for(const s of [...scripts])s.onload();},finish(){for(const e of this.events())e[2].event_callback();},expire(){for(const fn of [...timers.values()])fn();timers.clear();}};
}
test('earlier Meta/Analytics permission never grants Google Ads permission or stores a click',()=>{
 for(const cookie of ['', 'smahope_cookie_consent_v2=accepted; smahope_analytics_consent_v1=accepted','smahope_google_ads_consent_v1=declined']){const b=browser({cookie,route:'/learn/understanding-sma?gclid=TestClick_123456'});b.ads.syncGoogleAds(b.window.location.pathname);assert.equal(b.scripts.length,0);assert.ok(!b.document.cookie.includes('smahope_google_ad_click'));assert.equal(b.events().length,0);}
 const b=browser();b.consent.saveCookieConsent('accepted');assert.equal(b.consent.readGoogleAdsConsent(),'accepted');
});
test('allowed click IDs survive landing-to-registration navigation and are the only query data sent',async()=>{
 for(const kind of ['gclid','gbraid','wbraid']){
  const b=browser({cookie:adsConsent,route:'/learn/understanding-sma?'+kind+'=TestClick_123456&utm_source=google&arbitrary=private#fragment'});b.ads.syncGoogleAds(b.window.location.pathname);assert.equal(b.scripts.length,1);assert.ok(b.writes.some(x=>x.includes('Max-Age=2592000')&&x.includes('Secure')));b.ready();b.navigate('/account/register');
  const pending=b.ads.trackGoogleAdsRegistration(receipt);assert.equal(b.events().length,1);const payload=b.events()[0][2];assert.equal(payload.send_to,'AW-18595577422/28PsCNvRrL8dEM78h6NF');assert.equal(payload.transaction_id,receipt);assert.equal(payload.page_location,'https://www.smahope.org/account/register?'+kind+'=TestClick_123456');assert.ok(!JSON.stringify(b.commands()).includes('private'));assert.ok(!JSON.stringify(b.commands()).includes('PRIVATE USER NAME'));b.finish();await pending;
 }
});
test('page views, form visits and malformed/missing registration receipts never count as conversions',async()=>{
 const b=browser({cookie:adsConsent});b.navigate('/learn/understanding-sma');b.ready();b.navigate('/account/register');for(const id of [null,'','user-123','private@example.test'])await b.ads.trackGoogleAdsRegistration(id);assert.equal(b.events().length,0);
});
test('one receipt is counted once across repeated calls, concurrent requests and a fresh module context',async()=>{
 const b=browser({cookie:adsConsent,route:'/account/register'});b.ads.syncGoogleAds('/account/register');const one=b.ads.trackGoogleAdsRegistration(receipt),two=b.ads.trackGoogleAdsRegistration(receipt);b.ready();b.finish();await Promise.all([one,two]);await b.ads.trackGoogleAdsRegistration(receipt);assert.equal(b.events().length,1);
 const next=browser({cookie:adsConsent,route:'/account/register'});next.storage.set('smahope:google-registration:'+receipt,'1');await next.ads.trackGoogleAdsRegistration(receipt);assert.equal(next.events().length,0);
});
test('expired, future, malformed and duplicate click identifiers do not enter attribution payloads',()=>{
 const cookieName='smahope_google_ad_click_v1=';
 for(const click of [{kind:'gclid',value:'private@example.test',time:Date.now()},{kind:'gclid',value:'TestClick_123456',time:Date.now()-31*86400000},{kind:'gclid',value:'TestClick_123456',time:Date.now()+86400000},{kind:'email',value:'TestClick_123456',time:Date.now()}]){const b=browser({cookie:adsConsent+'; '+cookieName+encodeURIComponent(JSON.stringify(click))});b.ads.syncGoogleAds(b.window.location.pathname);const c=b.commands().find(x=>x[0]==='config');assert.ok(!c[2].page_location.includes('?'));}
 for(const query of ['gclid=short','gclid=a%40b.test','gclid=TestClick_123456&gclid=OtherClick_12345']){const b=browser({cookie:adsConsent,route:'/book?'+query});b.ads.syncGoogleAds('/book');assert.ok(!b.writes.some(x=>x.startsWith(cookieName)));}
});
test('the same click does not silently restart its 30-day lifetime',()=>{
 const original={kind:'gclid',value:'TestClick_123456',time:Date.now()-86400000};const b=browser({cookie:adsConsent+'; smahope_google_ad_click_v1='+encodeURIComponent(JSON.stringify(original)),route:'/book?gclid=TestClick_123456'});b.ads.syncGoogleAds('/book');assert.equal(b.writes.length,0);
});
test('private pages, diagnostic/clinician routes and credential-bearing URLs stay untracked',async()=>{
 for(const route of ['/account','/account/learn','/account/login','/account/diagnostics','/admin','/report-a-concern','/clinician-network','/account/register?next=%2Faccount%2Fdiagnostics','/book?email=private@example.test','/book?token=secret']){const b=browser({cookie:adsConsent,route});b.ads.syncGoogleAds(b.window.location.pathname);await b.ads.trackGoogleAdsRegistration(receipt);assert.equal(b.scripts.length,0,route);assert.equal(b.events().length,0,route);}
 for(const host of ['localhost','preview.vercel.app','smahope.org.attacker.test']){const b=browser({cookie:adsConsent,host});b.ads.syncGoogleAds(b.window.location.pathname);assert.equal(b.scripts.length,0);}
});
test('withdrawal removes attribution cookies, denies advertising storage and blocks a delayed event',async()=>{
 const b=browser({cookie:adsConsent+'; _gcl_aw=old; _gac_abc=old; smahope_google_ad_click_v1=bad',route:'/account/register'});const pending=b.ads.trackGoogleAdsRegistration(receipt);b.consent.saveCookieConsent('declined');b.ads.syncGoogleAds('/account/register');b.ready();await pending;assert.equal(b.events().length,0);assert.ok(!b.document.cookie.includes('_gcl_'));assert.ok(!b.document.cookie.includes('_gac_'));assert.ok(!b.document.cookie.includes('smahope_google_ad_click'));const update=b.commands().filter(x=>x[0]==='consent').at(-1)[2];assert.equal(update.ad_storage,'denied');assert.equal(update.ad_user_data,'denied');
});
test('route changes before a delayed SDK load never emit a private-page conversion',async()=>{
 const b=browser({cookie:adsConsent,route:'/account/register'});const p=b.ads.trackGoogleAdsRegistration(receipt);b.navigate('/account/diagnostics');b.ready();await p;assert.equal(b.events().length,0);assert.ok(!JSON.stringify(b.commands()).includes('/account/diagnostics'));
});
test('a blocked/slow Google tag cannot keep registration waiting or send a late conversion',async()=>{
 const b=browser({cookie:adsConsent,route:'/account/register'});const p=b.ads.trackGoogleAdsRegistration(receipt);b.expire();await p;b.ready();assert.equal(b.events().length,0);
});
test('Analytics and Ads share one SDK without resetting advertising consent or enabling personalisation',()=>{
 const b=browser({cookie:adsConsent+'; smahope_analytics_consent_v1=accepted'});b.navigate('/learn/understanding-sma');b.ready();assert.equal(b.scripts.length,1);assert.equal(b.commands().filter(x=>x[0]==='config').length,2);const update=b.commands().filter(x=>x[0]==='consent').at(-1)[2];assert.equal(update.ad_storage,'granted');assert.equal(update.ad_user_data,'granted');assert.equal(update.ad_personalization,'denied');assert.equal(update.analytics_storage,'granted');assert.ok(b.commands().filter(x=>x[0]==='config').every(x=>x[2].send_page_view===false));
});
test('blocked cookie/session storage never breaks the signup measurement call',async()=>{
 const b=browser({storageBlocked:true,route:'/account/register'});b.consent.saveCookieConsent('accepted');const p=b.ads.trackGoogleAdsRegistration(receipt);b.ready();b.finish();await p;assert.equal(b.events().length,1);
});
async function signupRoute({status=200,body={name:'Synthetic Learner',email:'synthetic@example.test',password:'Test-password-123',terms:true,signupSource:'learning'},cookie=adsConsent,user={id:'private-user-id',email:'private@example.test'},path='/api/auth/sign-up/email',captchaBlocked=false}={}){
 const registration={},exports={};vm.runInNewContext(compile('src/lib/google-ads-registration.ts'),{exports:registration,require:id=>id==='server-only'?{}:id==='node:crypto'?require(id):{GOOGLE_ADS_CONSENT_COOKIE:'smahope_google_ads_consent_v1'}});
 const authResponse={};vm.runInNewContext(compile('src/lib/auth/response.ts'),{exports:authResponse,Response,console});
 vm.runInNewContext(compile('src/app/api/auth/[...all]/route.ts'),{exports,URL,Response,console:{warn(){}},require:id=>id==='@/lib/auth/response'?authResponse:id==='@/lib/google-ads-registration'?registration:id==='@/lib/captcha'?{authCaptchaAction:()=>captchaBlocked?'register':null,verifyCaptcha:async()=>Response.json({error:'blocked'},{status:403})}:id==='@/lib/learning/reminders'?{savePreferences:async()=>{}}:id==='next/server'?{after:()=>{}}:id==='@/lib/auth/server'?{assertSameOrigin(){},getAuth:()=>({handler:async()=>Response.json(status===200?{user}:{error:'failed'},{status,headers:{'set-cookie':'session=preserved; HttpOnly'}})})}:{buildCourseSignupLead:()=>null,sendCourseSignupLead:async()=>{}}});
 return exports.POST(new Request('https://www.smahope.org'+path,{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify(body)}));
}
test('only a successful new learning registration gets an opaque receipt and auth cookies are preserved',async()=>{
 const r=await signupRoute();assert.equal(r.status,200);const id=r.headers.get('x-smahope-learning-registration');assert.match(id,/^[a-f0-9-]{36}$/);assert.ok(!id.includes('private'));assert.equal(r.headers.get('set-cookie'),'session=preserved; HttpOnly');assert.ok(!JSON.stringify(await r.json()).includes('gclid'));
 for(const opts of [{status:409},{status:422},{captchaBlocked:true},{cookie:''},{cookie:'smahope_cookie_consent_v2=accepted'},{user:{}},{path:'/api/auth/sign-in/email'},{body:{terms:true,name:'Test Learner',password:'Test-password-123',signupSource:'foundation'}}])assert.equal((await signupRoute(opts)).headers.get('x-smahope-learning-registration'),null,JSON.stringify(opts));
});
test('registration component measures the server receipt only after success and before navigating',()=>{
 const source=fs.readFileSync('src/components/learning/register.tsx','utf8');assert.ok(source.indexOf('if (!response.ok)')<source.indexOf('await trackGoogleAdsRegistration'));assert.ok(source.indexOf('await trackGoogleAdsRegistration')<source.indexOf('router.replace'));assert.ok(source.includes('if (!privateReturn) await trackGoogleAdsRegistration'));assert.ok(!source.includes('trackGoogleAdsRegistration(form'));
});
