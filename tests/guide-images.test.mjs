import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const assets=JSON.parse(fs.readFileSync(new URL('../src/content/guide-images.json',import.meta.url)));
const articles=['guides-release.json','guides-series.json'].flatMap(name=>JSON.parse(fs.readFileSync(new URL('../src/content/'+name,import.meta.url))));
let source=fs.readFileSync(new URL('../src/lib/guide-images.ts',import.meta.url),'utf8').replace('import assets from "@/content/guide-images.json";','const assets = '+JSON.stringify(assets)+';');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {getGuideImage,guideImageUrl}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
test('every published and scheduled article has a distinct accessible Cloudinary feature and sharing image',()=>{
 assert.deepEqual(new Set(assets.map(x=>x.slug)),new Set(articles.map(x=>x.slug)));
 assert.equal(new Set(assets.map(x=>x.src)).size,articles.length);
 assert.equal(new Set(assets.map(x=>x.sharingUrl)).size,articles.length);
 assert.equal(new Set(assets.map(x=>x.alt)).size,articles.length);
 for(const article of articles){const image=getGuideImage(article.slug);assert.ok(image,article.slug);assert.ok(image.alt.length>25);assert.equal(image.width,2400);assert.equal(image.height,1350);for(const url of [image.src,image.sharingUrl]){const u=new URL(url);assert.equal(u.protocol,'https:');assert.equal(u.hostname,'res.cloudinary.com');const suffix=u.pathname.split('/smahope/blog/features/'+article.slug+'-flat-')[1];assert.match(suffix || '',/^\d{4}-\d{2}-\d{2}(?:-social)?\.jpg$/);}assert.notEqual(image.src,image.sharingUrl);}
 assert.equal(getGuideImage('a-new-unillustrated-draft'),undefined);
});
test('responsive delivery preserves the versioned asset and caps requested width at the master size',()=>{
 const image=assets[0],u=guideImageUrl(image,640);assert.ok(u.includes('/c_limit,w_640/q_auto/f_auto/'));assert.equal(u.split('/f_auto/')[1],image.src.split('/image/upload/')[1]);assert.ok(guideImageUrl(image,9000).includes('w_2400/'));assert.ok(guideImageUrl(image,0).includes('w_1/'));
});
