import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, Intl });
  return exports;
}
const { donationTotals, isSuccessful, formatMoney } = load("src/lib/dashboard.ts");
const { allRows } = load("src/lib/admin/pagination.ts");
test("does not combine currencies or count failed and pending donations", () => {
  const totals = donationTotals([
    { amount_major: 5000, currency: "NGN", status: "success" },
    { amount_major: 20, currency: "USD", status: "success" },
    { amount_major: 100, currency: "USD", status: "failed" },
    { amount_major: 50, currency: "NGN", status: "pending" },
  ]);
  assert.equal(totals.NGN, 5000);
  assert.equal(totals.USD, 20);
});
test("normalizes currency and rounds decimal sums without binary drift", () => {
  const totals = donationTotals([
    { amount_major: "0.10", currency: "usd", status: "PAID" },
    { amount_major: 0.2, currency: "USD", status: "completed" },
  ]);
  assert.equal(totals.USD, 0.3);
});
test("ignores invalid monetary values and preserves unknown currency separately", () => {
  const totals = donationTotals([
    { amount_major: "not money", currency: "NGN", status: "success" },
    { amount_major: 5, currency: "", status: "success" },
  ]);
  assert.equal(totals.NGN, undefined);
  assert.equal(totals.UNKNOWN, 5);
  assert.equal(isSuccessful("refunded"), false);
});
test("formatting uses the supplied currency without exchange-rate assumptions", () => {
  assert.match(formatMoney(250, "USD"), /250/);
  assert.match(formatMoney(250, "NGN"), /250/);
  assert.notEqual(formatMoney(250, "USD"), formatMoney(250, "NGN"));
});
test("pagination reads beyond the database single-response cap", async () => {
  const source = Array.from({ length: 2005 }, (_, id) => ({ id }));
  const calls = [];
  const rows = await allRows(async (from, to) => {
    calls.push([from, to]);
    return { data: source.slice(from, to + 1), error: null };
  });
  assert.equal(rows.length, 2005);
  assert.equal(calls.length, 3);
  assert.equal(rows.at(-1).id, 2004);
});
test("pagination does not turn a database error into a partial total", async () => {
  await assert.rejects(
    () => allRows(async () => ({ data: null, error: { message: "disconnected" } })),
    /disconnected/,
  );
});
