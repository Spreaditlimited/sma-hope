import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/support-catalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,URL,Date,Intl});
const {supportItemInput,supportPreference,supportImageAllowed}=exports;
const seed=JSON.parse(fs.readFileSync('src/content/support-items.json','utf8'));
const valid=()=>({...seed.find(i=>i.id==='patient-hoist')});
test('support catalogue accepts partial funding, unknown prices and future images without inventing costs',()=>{
 for(const item of seed)assert.equal(supportItemInput(item).id,item.id);
 const unknown=supportItemInput({...valid(),costNaira:null,costBasis:'pending',priceDate:'',image:'',imageAlt:''});assert.equal(unknown.costNaira,null);
 assert.equal(supportPreference(unknown).allocation,'preference_not_restriction');
});
test('prices reject wrong types, negative amounts, fractions of a kobo and contradictory pending status',()=>{
 for(const costNaira of ['1200000',-1,0,Infinity,NaN,100000001,1.001])assert.throws(()=>supportItemInput({...valid(),costNaira}));
 assert.throws(()=>supportItemInput({...valid(),costBasis:'pending'}));assert.throws(()=>supportItemInput({...valid(),costNaira:null}));
 assert.throws(()=>supportItemInput({...valid(),priceDate:''}));
});
test('image references reject script URLs, arbitrary remote hosts and traversal',()=>{
 for(const image of ['javascript:alert(1)','https://evil.example/image.jpg','/support/../secret.jpg','https://res.cloudinary.com.evil.example/a/image/upload/b.jpg','https://user@res.cloudinary.com/a/image/upload/b.jpg'])assert.equal(supportImageAllowed(image),false);
 assert.equal(supportImageAllowed('https://res.cloudinary.com/sma/image/upload/v1/hoist.jpg'),true);
 assert.throws(()=>supportItemInput({...valid(),imageAlt:''}));
});
test('private or paused needs cannot become checkout preferences and snapshots preserve the original cost',()=>{
 for(const status of ['draft','paused'])assert.throws(()=>supportPreference({...valid(),status}));
 const item=valid(),snapshot=supportPreference(item);item.costNaira=99;assert.equal(snapshot.costNaira,1200000);assert.equal(snapshot.title,item.title);
});
test('catalogue rejects malformed slugs, categories, revisions and dates',()=>{
 for(const patch of [{id:'../admin'},{category:'unknown'},{revision:-1},{revision:1.5},{status:'published'},{priceDate:'2099-01-01'},{priceDate:'2026-02-30'},{title:''},{sortOrder:NaN}])assert.throws(()=>supportItemInput({...valid(),...patch}));
});

test('supplier details stay internal while public costs and donation preferences remain available',()=>{
 const internal=supportItemInput({...valid(),supplierName:'EveryMedical Nigeria Enterprises'});
 assert.equal(internal.supplierName,'EveryMedical Nigeria Enterprises');
 const publicItem=exports.publicSupportItem(internal);
 assert.equal('supplierName' in publicItem,false);
 assert.equal(publicItem.costNaira,internal.costNaira);
 assert.equal('supplierName' in supportPreference(internal),false);
});

test('education estimates preserve their dollar currency without treating dollars as naira',()=>{
 for(const id of ['course-outreach','course-delivery']) {
  const item=supportItemInput(seed.find(i=>i.id===id));assert.equal(item.costNaira,null);assert.ok(item.costUsd>0);
  assert.match(exports.supportCostLabel(item),/^US\$/);assert.equal(supportPreference(item).costUsd,item.costUsd);
 }
 assert.equal(supportItemInput({...valid(),costNaira:null,costUsd:0.03,costBasis:'planning_estimate'}).costUsd,0.03);
 for(const patch of [{costUsd:100},{costNaira:null,costUsd:-1},{costNaira:null,costUsd:'300'},{costNaira:null,costUsd:0.001},{costNaira:null,costUsd:300,costBasis:'pending'}])assert.throws(()=>supportItemInput({...valid(),...patch}));
});
