import assert from "node:assert/strict";
const base = process.env.PREVIEW_URL || "http://localhost:3002";
const routes = [
  "/",
  "/about",
  "/what-is-sma",
  "/our-story",
  "/support-for-families",
  "/book",
  "/donate",
  "/contact",
  "/blog",
  "/updates",
  "/transparency",
  "/faqs",
  "/editorial-policy",
  "/privacy-policy",
  "/terms",
  "/blog/understanding-sma-nigeria",
  "/blog/after-sma-diagnosis",
  "/blog/planning-sma-care-costs",
  "/blog/sma-genetic-testing",
  "/blog/sma-treatment-access-nigeria",
  "/blog/school-and-sma",
  "/blog/supporting-an-sma-family",
  "/blog/sma-care-team-nigeria",
  "/blog/topics/understanding-sma",
  "/blog/topics/diagnosis-and-care",
  "/blog/topics/living-with-sma",
  "/blog/topics/family-and-community",
  "/updates/launching-sma-hope-foundation-nigeria",
];
const failures = [];
const pages = new Map();
for (let i = 0; i < routes.length; i += 4) {
  const results = await Promise.allSettled(
    routes.slice(i, i + 4).map(async (path) => {
      const res = await fetch(base + path);
      assert.equal(res.status, 200, `${path} HTTP status`);
      const html = await res.text();
      assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${path} must have one h1`);
      assert.equal(
        (html.match(/<main(?:\s|>)/g) || []).length,
        1,
        `${path} must have one main landmark`,
      );
      assert.match(html, /<meta name="description" content="[^"]+"/, `${path} description`);
      assert.ok(
        html.includes(
          `rel="canonical" href="https://www.smahope.org${path === "/" ? "" : path}"`,
        ) || html.includes(`rel="canonical" href="https://www.smahope.org${path}"`),
        `${path} canonical`,
      );
      for (const match of html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      )) {
        const schema = JSON.parse(match[1]);
        assert.equal(typeof schema["@context"], "string", `${path} JSON-LD context`);
        assert.equal(schema["@context"].toLowerCase(), "https://schema.org");
        assert.equal(typeof schema["@type"], "string", `${path} JSON-LD type`);
      }
      pages.set(path, html);
      console.log(`PASS ${path}`);
    }),
  );
  for (const result of results)
    if (result.status === "rejected") failures.push(result.reason.message);
}
const checks = await Promise.allSettled([
  (async () => {
    const res = await fetch(base + "/sitemap.xml");
    const xml = await res.text();
    assert.equal(res.status, 200);
    for (const path of routes)
      assert.ok(
        xml.includes(`https://www.smahope.org${path === "/" ? "" : path}`),
        `sitemap missing ${path}`,
      );
    assert.ok(!xml.includes("/account"));
    assert.ok(!xml.includes("/admin"));
    console.log("PASS sitemap coverage");
  })(),
  (async () => {
    for (const path of [
      "/account/login",
      "/account",
      "/admin",
      "/admin/content",
      "/account/reset-password",
    ]) {
      const res = await fetch(base + path);
      const html = await res.text();
      assert.equal(res.status, 200);
      assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    }
    console.log("PASS private route noindex");
  })(),
  (async () => {
    for (const path of [
      "/api/admin/dashboard",
      "/api/admin/donations",
      "/api/admin/book-orders",
      "/api/admin/donors",
      "/api/admin/users",
    ]) {
      const res = await fetch(base + path);
      assert.equal(res.status, 401, `${path} must reject unauthenticated requests`);
    }
    console.log("PASS admin API authentication");
  })(),
  (async () => {
    const res = await fetch(base + "/opengraph-image");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /image\/png/);
    assert.ok((await res.arrayBuffer()).byteLength > 1000);
    console.log("PASS generated social sharing image");
  })(),
  (async () => {
    for (const path of [
      "/blog/this-guide-does-not-exist",
      "/blog/topics/missing",
      "/missing-page",
    ]) {
      const res = await fetch(base + path);
      assert.equal(res.status, 404, `${path} missing route status`);
    }
    console.log("PASS missing route handling");
  })(),
]);
for (const result of checks) if (result.status === "rejected") failures.push(result.reason.message);
if (pages.has("/book")) assert.ok(pages.get("/book").includes("Not yet released."));
assert.ok(!pages.get("/book")?.includes("July 31, 2026"));
if (failures.length) {
  console.error("FAILED:", failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Verified ${routes.length} public routes, metadata, structured data, private indexing, API access, and social image.`,
  );
