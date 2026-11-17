import test from "node:test";
import assert from "node:assert/strict";
import { resolveAmazonMarket, amazonEditionUrl } from "../src/lib/amazon-marketplaces.ts";

test("country detection selects UK, Canadian and US stores", () => {
  for (const country of ["GB", "CA", "US"]) assert.equal(resolveAmazonMarket(country), country);
  assert.equal(resolveAmazonMarket("gb"), "GB");
});
test("reader's store selection overrides detected country", () => {
  assert.equal(resolveAmazonMarket("GB", "CA"), "CA");
  assert.equal(resolveAmazonMarket("CA", "US"), "US");
  assert.equal(resolveAmazonMarket("US", "GB"), "GB");
});
test("unsupported or malformed selections use detected country or US fallback", () => {
  assert.equal(resolveAmazonMarket("CA", "https://example.com"), "CA");
  assert.equal(resolveAmazonMarket("NG"), "US");
  assert.equal(resolveAmazonMarket(null), "US");
  assert.equal(resolveAmazonMarket("constructor", "__proto__"), "US");
});
test("all nine edition links preserve the verified edition on the correct store", () => {
  for (const asin of ["B0GX2WHPXH", "B0HRZLNGZZ", "B0HRZGVKM4"]) {
    for (const [market, host] of [["GB", "www.amazon.co.uk"], ["CA", "www.amazon.ca"], ["US", "www.amazon.com"]]) {
      assert.equal(amazonEditionUrl(asin, market), `https://${host}/dp/${asin}`);
    }
  }
  assert.throws(() => amazonEditionUrl("../redirect", "US"));
});
