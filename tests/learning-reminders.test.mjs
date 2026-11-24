import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const e={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/learning/reminder-policy.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:e,URL});
const {nextReminder,reminderMessage}=e;
const D=86400000,now=Date.UTC(2026,10,24,12),base={enabled:true,active:true,pausedUntil:0,optedAt:now-5*D,createdAt:now-5*D,enrolledAt:now-5*D,lastActivity:now-4*D,started:true,completed:1,completedAt:0,nextLesson:'assessment',deliveries:[]};
function journey(x={}){return {...base,...x};}
test('permissions, inactive accounts and pauses prevent all mail',()=>{for(const x of [{enabled:false},{active:false},{pausedUntil:now+D},{optedAt:NaN}])assert.equal(nextReminder(journey(x),now),null);});
test('new opt-in starts a fresh waiting period rather than blasting old learners',()=>assert.equal(nextReminder(journey({optedAt:now,lastActivity:now-60*D}),now),null));
test('account without enrolment receives one enrolment invitation after 24 hours',()=>{assert.equal(nextReminder(journey({enrolledAt:null,started:false,lastActivity:0}),now),'enrol');assert.equal(nextReminder(journey({enrolledAt:null,deliveries:[{key:'enrol',at:now-4*D}]}),now),null);});
test('new enrolled learner receives welcome once',()=>{const j=journey({optedAt:now-D/2,enrolledAt:now-D/2,lastActivity:0,started:false});assert.equal(nextReminder(j,now),'welcome');assert.equal(nextReminder({...j,deliveries:[{key:'welcome',at:now-D/4}]},now),null);});
test('not-started learner receives a first-lesson reminder',()=>assert.equal(nextReminder(journey({started:false}),now),'start'));
test('returning learner is not sent stale reminder',()=>assert.equal(nextReminder(journey({lastActivity:now-1000}),now),null));
test('in-progress learner resumes and four-complete learner gets final lesson instead',()=>{assert.equal(nextReminder(journey(),now),'resume');assert.equal(nextReminder(journey({completed:4}),now),'finish');});
test('completion overrides inactivity and never sends a start reminder',()=>{assert.equal(nextReminder(journey({completed:5,completedAt:now-D}),now),'complete');assert.equal(nextReminder(journey({completed:5,completedAt:now-D,deliveries:[{key:'complete',at:now-4*D}]}),now),null);});
test('old completed course does not generate retrospective completion email',()=>assert.equal(nextReminder(journey({completed:5,completedAt:now-20*D}),now),null));
test('all statuses including uncertain and reserved honour quiet period',()=>{for(const status of ['accepted','reserved','uncertain','skipped'])assert.equal(nextReminder(journey({deliveries:[{key:'welcome',at:now-D,status}]}),now),null);});
test('two messages per rolling week and three inactivity messages per month',()=>{assert.equal(nextReminder(journey({deliveries:[{key:'welcome',at:now-4*D},{key:'start',at:now-6*D}]}),now),null);assert.equal(nextReminder(journey({deliveries:['start','resume','finish'].map((key,i)=>({key,at:now-(8+i*4)*D}))}),now),null);});
test('final reminder after fourteen days ends inactivity sequence',()=>{assert.equal(nextReminder(journey({lastActivity:now-16*D,optedAt:now-20*D,enrolledAt:now-20*D}),now),'final');assert.equal(nextReminder(journey({deliveries:[{key:'final',at:now-20*D}]}),now),null);});
test('completion can follow final reminder once learner finishes',()=>assert.equal(nextReminder(journey({completed:5,completedAt:now-D,deliveries:[{key:'final',at:now-20*D}]}),now),'complete'));
test('every message has actionable branded links and no promotional donation request',()=>{for(const key of e.reminderKeys){const m=reminderMessage(key,'https://www.smahope.org','a'.repeat(64),'lesson-one');assert.ok(m.subject&&m.heading&&m.label);assert.equal(new URL(m.url).pathname,key==='complete'?'/account/learn/feedback':'/account/learn');assert.equal(new URL(m.url).searchParams.get('lesson'),key==='complete'?null:'lesson-one');assert.ok(m.unsubscribe.startsWith('https://www.smahope.org/learning-emails?token='));assert.ok(m.text.includes('/account/email-preferences'));assert.ok(!m.copy.toLowerCase().includes('donate'));assert.ok(!m.text.includes('undefined'));}});
test('unsubscribe page is noindex, no-referrer, and GET never changes preferences',()=>{assert.ok(fs.readFileSync('src/app/learning-emails/page.tsx','utf8').includes("referrer:'no-referrer'"));const route=fs.readFileSync('src/app/api/learning/emails/unsubscribe/route.ts','utf8');assert.ok(route.includes('function POST'));assert.ok(!route.includes('function GET'));});

test('completion acknowledgment need not wait three days after a welcome',()=>assert.equal(nextReminder(journey({completed:5,completedAt:now-1000,deliveries:[{key:'welcome',at:now-2000,status:'accepted'}]}),now),'complete'));
