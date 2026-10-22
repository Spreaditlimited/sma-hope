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
test("password email retains an exact usable link, plus fallback and both logo variants", () => {
  const url='https://www.smahope.org/api/auth/reset-password/test?callbackURL=%2Faccount&test=1';
  const html=renderEmailTemplate({subject:'Set password',text:`Hello\n\n${url}\n\nThis link expires in one hour.`,design:{action:{label:'Set my password',url}}});
  assert.ok(html.includes(url.replace('&','&amp;')));
  assert.ok(html.includes('copy it into your browser'));
  assert.ok(html.includes('This link expires in one hour.'));
  assert.ok(html.includes('prefers-color-scheme:dark'));
  assert.ok(html.includes('/sma-hope-logo-dark.png'));
  assert.ok(html.includes('width="140"'));
  assert.ok(!html.includes('<script'));
});
test("email actions reject executable schemes and preserve prose around URLs", () => {
  const html=renderEmailTemplate({subject:'Update',text:'Read https://www.smahope.org/blog for details.',design:{action:{label:'Unsafe action',url:'javascript:alert(1)'}}});
  assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('Read '));assert.ok(html.includes(' for details.'));
});
