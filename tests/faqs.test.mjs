import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const faqs = JSON.parse(read("../src/content/faqs-release.json"));
const categories = JSON.parse(read("../src/content/faq-categories.json"));
const legacy = JSON.parse(read("../src/content/faqs-legacy.json"));
async function moduleFrom(source) {
  const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
}
const mergeSource = read("../src/lib/faqs.ts").replace('import { fallbackFaqs, faqCategories, legacyFaqs, type FaqItem } from "@/content/faqs";',`const fallbackFaqs = ${JSON.stringify(faqs)}; const faqCategories = ${JSON.stringify(categories)}; const legacyFaqs = ${JSON.stringify(legacy)};`);
const { mergeFaqItems } = await moduleFrom(mergeSource);
const { filterFaqItems } = await moduleFrom(read("../src/lib/faq-search.ts"));
test("FAQ release covers six topics with unique stable answer anchors and current guide links", () => {
  assert.equal(faqs.length,37);
  assert.equal(categories.length,6);
  assert.equal(new Set(faqs.map(item=>item.id)).size,faqs.length);
  assert.equal(new Set(faqs.map(item=>item.question)).size,faqs.length);
  const guides = JSON.parse(read("../src/content/guides-release.json"));
  for (const item of faqs) {
    assert.match(item.id,/^[a-z0-9-]+$/);
    assert.ok(categories.some(category=>category.id===item.category));
    assert.ok(item.answer.length>100 && item.answer.length<1500,item.id);
    for (const link of item.links || []) {
      assert.match(link.href,/^\/(?!\/)/);
      if(link.href.startsWith("/blog/")) assert.ok(guides.some(guide=>link.href===`/blog/${guide.slug}`),`${item.id}: no link to a future article`);
    }
    if(item.source) assert.equal(new URL(item.source.url).protocol,"https:");
  }
  assert.doesNotMatch(JSON.stringify(faqs),/clinical review pending|not yet been reviewed|no clinician review is claimed/i);
});
test("unchanged legacy CMS answers cannot shrink or overwrite the FAQ overhaul", () => {
  assert.deepEqual(mergeFaqItems(legacy),faqs);
  assert.deepEqual(mergeFaqItems([]),faqs);
  const formattingOnly = legacy.map(item=>({...item,answer:item.answer.replaceAll(" ","  ")}));
  assert.deepEqual(mergeFaqItems(formattingOnly),faqs);
});
test("later CMS edits and additional questions survive without stale source attribution", () => {
  const edited={category:"About SMA",question:"What is SMA in simple terms?",answer:"An editor’s updated explanation from the CMS."};
  const extra={category:"For Families",question:"Can I request an accessible event?",answer:"Contact us with the event and the access arrangements you need."};
  const merged=mergeFaqItems([edited,extra,extra]);
  assert.equal(merged.length,38);
  const updated=merged.find(item=>item.id==="what-is-sma");
  assert.equal(updated.answer,edited.answer);
  assert.equal(updated.source,undefined);
  const custom=merged.find(item=>item.question===extra.question);
  assert.equal(custom.category,"everyday-life");
  assert.match(custom.id,/^faq-/);
  assert.equal(mergeFaqItems([extra]).at(-1).id,custom.id);
  assert.equal(mergeFaqItems([{question:"",answer:""},null]).length,37);
});
test("FAQ search handles case, punctuation, multiple terms and useful vocabulary", () => {
  assert.ok(filterFaqItems(faqs,"NEGATIVE carrier").some(item=>item.id==="negative-carrier-test"));
  assert.ok(filterFaqItems(faqs,"2+0").some(item=>item.id==="negative-carrier-test"));
  assert.ok(filterFaqItems(faqs,"Canada").some(item=>item.id==="international-care"));
  assert.ok(filterFaqItems(faqs,"pregnant").some(item=>item.id==="carrier-pregnancy"));
  assert.equal(filterFaqItems(faqs,"zzzx-no-matches").length,0);
  assert.equal(filterFaqItems(faqs,"  ").length,37);
});
