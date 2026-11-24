import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/lib/email-template.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports, URL });
const { renderEmailTemplate } = exports;
test("email design preserves receipt fields and escapes supplied HTML", () => {
  const html = renderEmailTemplate({subject:'Receipt <script>alert(1)</script>',text:'Hello <img src=x onerror=alert(1)>\nAmount: NGN 5,000\nReference: SMA-123\n\nThank you.'});
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  for(const value of ['NGN 5,000','SMA-123','Thank you.','&lt;img']) assert.ok(html.includes(value));
});
test("password email retains an exact usable link, plus a discreet fallback and both logo variants", () => {
  const url='https://www.smahope.org/api/auth/reset-password/test?callbackURL=%2Faccount&test=1';
  const html=renderEmailTemplate({subject:'Set password',text:`Hello\n\n${url}\n\nThis link expires in one hour.`,design:{action:{label:'Set my password',url}}});
  assert.ok(html.includes(url.replace('&','&amp;')));
  assert.ok(html.includes('Open this link'));
  assert.ok(html.includes('This link expires in one hour.'));
  assert.ok(html.includes('prefers-color-scheme:dark'));
  assert.ok(html.includes('/sma-hope-logo-dark.png'));
  assert.ok(html.includes('width="112"'));
  assert.ok(!html.includes('<script'));
});
test("email actions reject executable schemes and preserve prose around URLs", () => {
  const html=renderEmailTemplate({subject:'Update',text:'Read https://www.smahope.org/blog for details.',design:{action:{label:'Unsafe action',url:'javascript:alert(1)'}}});
  assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('Read '));assert.ok(html.includes(' for details.'));
});

test("learning layout keeps private controls discreet and removes long visible URLs and promotional panels", () => {
 const url='https://www.smahope.org/account/learn/feedback?utm_campaign=learning-reminders';
 const html=renderEmailTemplate({subject:'Course complete',text:'Plain text version with all links',design:{variant:'learning',heading:'Thank you for learning.',copy:'You completed the course.\n\nPlease tell us what helped.',action:{label:'Share feedback',url},links:{unsubscribe:'https://www.smahope.org/learning-emails?token='+ 'a'.repeat(64),preferences:'https://www.smahope.org/account/email-preferences',share:'https://www.smahope.org/learn/understanding-sma'}}});
 for(const text of ['Share feedback','Email preferences','Stop learning emails','Share the free course','Please tell us what helped.']) assert.ok(html.includes(text));
 const visible=html.replace(/<head>[\s\S]*?<\/head>/,'').replace(/<[^>]*>/g,'');
 assert.ok(!visible.includes('https://'));assert.ok(!visible.includes('Hope. Support. A way forward.'));assert.ok(!html.includes('email-muted'));
});
