import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url),compile=p=>ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function reporting(){const exports={};vm.runInNewContext(compile('src/lib/learning/reporting.ts'),{exports,URLSearchParams,Date,Response,require:id=>id==='server-only'?{}:id==='@/lib/database/pool'?{}:id==='./content'?{SMA_COURSE_SLUG:'understanding-sma',SMA_QUIZ_VERSION:'v1',smaCourseLessons:Array.from({length:5},(_,i)=>({slug:'lesson-'+i}))}:id==='./assets.json'?[]:require(id)});return exports;}
test('admin report filters reject invalid periods, status, paging and oversized search',()=>{
 const m=reporting();assert.equal(m.parseLearningQuery(new URLSearchParams()).month,'all');assert.equal(m.parseLearningQuery(new URLSearchParams('month=2026-11')).month,'2026-11');
 for(const q of ['month=2026-13','month=2026-00','month=bad','page=0','page=-1','page=1.5','page=1000000','status=unknown','search='+'x'.repeat(181)])assert.throws(()=>m.parseLearningQuery(new URLSearchParams(q)),/Invalid filters/);
});
test('completion status requires all lessons; funding CSV contains only anonymous references and numeric results',()=>{
 const m=reporting();assert.equal(m.learnerStatus(0,false),'not_started');assert.equal(m.learnerStatus(1,true),'in_progress');assert.equal(m.learnerStatus(5,true),'completed');
 const ref=m.learnerReference('private-account-id');assert.match(ref,/^[a-f0-9]{16}$/);assert.equal(m.learnerReference('private-account-id'),ref);
 const csv=m.csvCohort([{id:'private-account-id',name:'Private Name',email:'private@example.test',reference:ref,enrolledAt:'2026-11-22T00:00:00.000Z',completedLessons:5,firstScore:0,latestScore:15,questions:15}]);assert(csv.includes(ref));assert(!/Private|private/.test(csv));assert(csv.endsWith(',5,0,15,15'));
});
test('learning APIs require administrator access before any overview, individual record or export data is queried',async()=>{
 let reads=0;const exports={};vm.runInNewContext(compile('src/app/api/admin/learning/route.ts'),{exports,URL,Response,Error,SyntaxError,require:id=>id==='@/lib/admin/server'?{requireAdminUser:async()=>{throw new Error('Unauthorized');}}:id==='@/lib/learning/reporting'?{learningOverview:async()=>reads++,learningCohortCsv:async()=>reads++,learnerDetail:async()=>reads++}:{getPool:()=>{reads++;}}});
 for(const q of ['','?learner=test','?format=csv']){const r=await exports.GET(new Request('https://www.smahope.org/api/admin/learning'+q));assert.equal(r.status,401);assert.equal(r.headers.get('cache-control'),'private, no-store');}
 assert.equal((await exports.POST(new Request('https://www.smahope.org/api/admin/learning',{method:'POST'}))).status,401);assert.equal(reads,0);
});
