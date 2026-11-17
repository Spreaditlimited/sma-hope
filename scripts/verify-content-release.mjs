import assert from "node:assert/strict";
import fs from "node:fs";
const base = (process.env.PREVIEW_URL || "http://127.0.0.1:3014").replace(/\/$/, "");
const guides = JSON.parse(fs.readFileSync(new URL("../src/content/guides-release.json", import.meta.url)));
const scheduled = JSON.parse(fs.readFileSync(new URL("../src/content/guides-series.json", import.meta.url)));
const results = [];
for (const guide of guides) {
  const path = `/blog/${guide.slug}`;
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${path}: one H1`);
  assert.ok(html.includes(guide.title.replaceAll("&", "&amp;")), `${path}: refreshed CMS title`);
  assert.ok(html.includes('id="questions"'), `${path}: FAQs are server-rendered`);
  assert.equal((html.match(/<details(?:\s|>)/g) || []).length, guide.faqs.length + 1, `${path}: FAQs and mobile contents`);
  assert.ok(html.includes('rel="canonical" href="https://www.smahope.org'+path+'"'), `${path}: canonical`);
  assert.ok(!/clinical review pending|not yet been reviewed by a clinician|no clinician review is claimed|show their review status/i.test(html), `${path}: no public workflow notes`);
  assert.ok(html.includes('id="sources"'), `${path}: source information`);
  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(block[1]);
  const market = guide.audience === "United Kingdom" ? "www.amazon.co.uk" : guide.audience === "Canada" ? "www.amazon.ca" : guide.audience === "United States" ? "www.amazon.com" : undefined;
  if (market) assert.ok(html.includes(`https://${market}/dp/B0GX2WHPXH`), `${path}: direct local Kindle link`);
  const resources = [...new Set([...html.matchAll(/href="(\/resources\/[^"#]+)"/g)].map(m => m[1]))];
  for (const resource of resources) assert.equal((await fetch(base+resource)).status, 200, resource);
  results.push({ path, status: response.status, faqCount: guide.faqs.length, audience: guide.audience });
}
const sitemap = await fetch(base+"/sitemap.xml").then(r => r.text());
for (const guide of scheduled.filter(guide => Date.parse(guide.scheduledFor) > Date.now())) {
  assert.ok(!sitemap.includes(`/blog/${guide.slug}</loc>`), `${guide.slug}: future page excluded from sitemap`);
  const response = await fetch(base+"/blog/"+guide.slug);
  assert.equal(response.status, 404, `${guide.slug}: future page returns 404`);
  const html = await response.text();
  assert.ok(!html.includes(guide.intro[0]), `${guide.slug}: future body not disclosed`);
}
for (const guide of guides) assert.ok(sitemap.includes(`/blog/${guide.slug}</loc>`), `Sitemap includes ${guide.slug}`);
for (const path of ["/blog", "/what-is-sma", "/book", "/editorial-policy"]) assert.equal((await fetch(base+path)).status, 200, path);
for (const path of ["/blog", "/what-is-sma", "/editorial-policy"]) {
  const html = await fetch(base+path).then(r => r.text());
  assert.ok(!/clinical review pending|not yet been reviewed by a clinician|no clinician review is claimed|show their review status/i.test(html), `${path}: no public workflow notes`);
}
const listing = await fetch(base+"/blog").then(r => r.text());
for (const guide of scheduled.filter(guide => Date.parse(guide.scheduledFor) > Date.now())) assert.ok(!listing.includes(guide.title), `${guide.slug}: future title excluded from listing and search data`);
const book = await fetch(base+"/book").then(r => r.text());
assert.ok(book.includes('id="nigeria"'));
const account = await fetch(base+"/account").then(r => r.text());
assert.ok(account.includes('noindex'));
assert.ok(!account.includes('aria-haspopup="dialog"'));
console.log(JSON.stringify({ base, articles: results.length, faqs: results.reduce((sum,r)=>sum+r.faqCount,0), results }, null, 2));
