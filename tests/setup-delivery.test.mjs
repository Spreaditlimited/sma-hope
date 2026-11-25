import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/auth/setup-delivery.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:createRequire(import.meta.url)});return exports;}
test('setup requests fail when the auth provider hides email failures',async()=>{const d=load();await assert.rejects(d.requireSetupDelivery(async()=>({status:true})),/delivery failed/);await d.requireSetupDelivery(async()=>{d.confirmSetupDelivery();});});
test('a successful concurrent email cannot mark another request as delivered',async()=>{const d=load();let release;const gate=new Promise(resolve=>{release=resolve;});const success=d.requireSetupDelivery(async()=>{await gate;d.confirmSetupDelivery();});const failed=d.requireSetupDelivery(async()=>{release();await new Promise(resolve=>setTimeout(resolve,5));});const results=await Promise.allSettled([success,failed]);assert.equal(results[0].status,'fulfilled');assert.equal(results[1].status,'rejected');});
