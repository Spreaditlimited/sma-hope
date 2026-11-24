import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function browser(saved='',route='/book',host='www.smahope.org') {
 const scripts=[],writes=[],jar=new Map(saved.split('; ').filter(Boolean).map(x=>x.split('='))),cache={};
 const document={title:'SMA Hope',referrer:'https://example.com/private?email=reader@example.test',get cookie(){return [...jar].map(([k,v])=>k+'='+v).join('; ');},set cookie(value){writes.push(value);const [name,v]=value.split(';')[0].split('=');if(value.includes('Max-Age=0'))jar.delete(name);else jar.set(name,v);},createElement(){return {remove(){}};},head:{appendChild(script){scripts.push(script);}}};
 const window={location:new URL(`https://${host}${route}`),dispatchEvent(){}};
 function load(name){if(cache[name])return cache[name];const exports={};cache[name]=exports;vm.runInNewContext(ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:dependency=>load(dependency.replace(/^\.\//,'')),window,document,URL,Event});return exports;}
 const analytics=load('google-analytics'),consent=load('cookie-consent');
 return {window,document,scripts,writes,analytics,consent,navigate(route){window.location=new URL(`https://${host}${route}`);analytics.syncGoogleAnalytics(window.location.pathname);},commands(){return (window.dataLayer||[]).map(args=>Array.from(args));},events(){return this.commands().filter(args=>args[0]==='event');}};
}
const granted='smahope_analytics_consent_v1=accepted';
test('Google does not load without explicit Analytics permission, including earlier Meta-only acceptance',()=>{
 for(const cookie of ['', 'smahope_cookie_consent_v2=accepted','smahope_analytics_consent_v1=declined']){const b=browser(cookie);b.navigate('/book');assert.equal(b.scripts.length,0);assert.equal(b.events().length,0);}
 const b=browser('smahope_cookie_consent_v2=accepted');assert.equal(b.consent.readAnalyticsConsent(),null);b.consent.saveCookieConsent('accepted');b.navigate('/book');assert.equal(b.scripts.length,1);
});
test('Google initializes once with advertising disabled and sends one manual page view per navigation',()=>{
 const b=browser(granted);b.navigate('/book');b.navigate('/book');assert.equal(b.scripts.length,1);assert.equal(b.events().length,0);b.scripts[0].onload();b.navigate('/book');assert.equal(b.events().length,1);
 const config=b.commands().find(args=>args[0]==='config');assert.equal(config[1],'G-T3PKCFSW9V');assert.equal(config[2].send_page_view,false);assert.equal(config[2].allow_google_signals,false);assert.equal(config[2].allow_ad_personalization_signals,false);
 const consent=b.commands().find(args=>args[0]==='consent')[2];assert.equal(consent.ad_storage,'denied');assert.equal(consent.ad_user_data,'denied');assert.equal(consent.ad_personalization,'denied');
 b.navigate('/blog');b.navigate('/book');assert.equal(b.events().length,3);assert.equal(b.commands().filter(args=>args[0]==='config').length,1);
});
test('Analytics excludes private pages and credential-bearing URLs, including delayed SDK load',()=>{
 for(const path of ['/account','/account/learn/feedback','/admin','/api/learning','/contact','/order-book','/learning-emails?token=secret','/book?email=test@example.test']){const b=browser(granted,path);b.navigate(path);assert.equal(b.scripts.length,0);assert.equal(b.window['ga-disable-G-T3PKCFSW9V'],true);}
 const b=browser(granted);b.navigate('/book');b.navigate('/account/login');b.scripts[0].onload();assert.equal(b.events().length,0);assert.equal(b.window['ga-disable-G-T3PKCFSW9V'],true);
});
test('Analytics strips queries, fragments and referring paths from page views',()=>{
 const b=browser(granted);b.navigate('/book?utm_source=facebook&fbclid=opaque#reviews');b.scripts[0].onload();const params=b.events()[0][2];assert.equal(params.page_location,'https://www.smahope.org/book');assert.equal(params.page_referrer,'https://example.com');assert.ok(!JSON.stringify(b.commands()).includes('reader@example.test'));assert.ok(!JSON.stringify(b.commands()).includes('fbclid'));
});
test('withdrawing consent disables delivery, clears Analytics cookies and can resume without duplicate SDKs',()=>{
 const b=browser(granted+'; _ga=one; _ga_T3PKCFSW9V=two');b.navigate('/book');b.scripts[0].onload();b.consent.saveCookieConsent('declined');b.navigate('/blog');assert.equal(b.events().length,1);assert.equal(b.window['ga-disable-G-T3PKCFSW9V'],true);assert.ok(b.writes.some(x=>x.startsWith('_ga=; Max-Age=0')));
 b.consent.saveCookieConsent('accepted');b.navigate('/blog');assert.equal(b.events().length,2);assert.equal(b.scripts.length,1);
});
test('blocked tags can retry and nonproduction hosts never send to the real property',()=>{
 const b=browser(granted);b.navigate('/book');b.scripts[0].onerror();b.navigate('/blog');assert.equal(b.scripts.length,2);b.scripts[1].onload();assert.equal(b.events().length,1);
 for(const host of ['localhost:3021','preview.vercel.app']){const b=browser(granted,'/',host);b.navigate('/');assert.equal(b.scripts.length,0);}
});
test('cookie storage restrictions fail closed but the current-tab explicit choice still works',()=>{
 const b=browser();Object.defineProperty(b.document,'cookie',{get(){throw Error('Blocked');},set(){throw Error('Blocked');}});assert.doesNotThrow(()=>b.navigate('/book'));assert.equal(b.scripts.length,0);b.consent.saveCookieConsent('accepted');b.navigate('/book');assert.equal(b.scripts.length,1);b.consent.saveCookieConsent('declined');b.scripts[0].onload();assert.equal(b.events().length,0);
});
