import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const released = JSON.parse(fs.readFileSync(new URL("../src/content/guides-release.json", import.meta.url)));
const scheduled = JSON.parse(fs.readFileSync(new URL("../src/content/guides-series.json", import.meta.url)));
const content = [...released, ...scheduled];
const briefs = JSON.parse(fs.readFileSync(new URL("../src/content/research/keyword-briefs.json", import.meta.url)));
async function moduleFrom(source) {
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
}
const topics = fs.readFileSync(new URL("../src/lib/topics.ts", import.meta.url), "utf8").replace("export const", "const");
const validation = fs.readFileSync(new URL("../src/lib/article-validation.ts", import.meta.url), "utf8").replace('import { topics } from "@/lib/topics";', topics);
const { validGuide } = await moduleFrom(validation);

test("every released article validates and has distinct answers, FAQs and a research brief", () => {
  assert.equal(released.length, 18);
  assert.equal(scheduled.length, 12);
  assert.equal(content.length, 30);
  assert.equal(new Set(content.map(g => g.slug)).size, content.length);
  for (const guide of content) {
    assert.ok(validGuide(guide), guide.slug);
    assert.ok(guide.intro?.length, guide.slug);
    assert.ok(guide.faqs?.length >= 5, guide.slug);
    assert.equal(new Set(guide.faqs.map(f => f.question)).size, guide.faqs.length);
    assert.ok(guide.sourcesCheckedAt, guide.slug);
    assert.ok(guide.bookContext, guide.slug);
    assert.ok(briefs.find(b => b.slug === guide.slug)?.keywords.length, guide.slug);
    for (const slug of guide.related) assert.ok(content.some(g => g.slug === slug), `${guide.slug}: ${slug}`);
  }
});
test("validation rejects unsafe links, malformed FAQ data and incorrect dates", () => {
  const guide = structuredClone(content[0]);
  assert.equal(validGuide({ ...guide, updatedAt: "2026-02-31" }), false);
  assert.equal(validGuide({ ...guide, links: [{ label: "Unsafe", href: "javascript:alert(1)" }] }), false);
  assert.equal(validGuide({ ...guide, links: [{ label: "Redirect", href: "//example.com" }] }), false);
  assert.equal(validGuide({ ...guide, faqs: [{ question: "Question?", answer: "x" }] }), false);
  assert.equal(validGuide({ ...guide, audience: "Invented country" }), false);
  assert.equal(validGuide({ ...guide, sections: [{ title: "Table", paragraphs: ["Context"], table: { columns: ["One", "Two"], rows: [["Missing cell"]] } }] }), false);
});
test("country articles use distinct local primary sources and preserve regional intent", () => {
  for (const [slug, audience, host] of [["sma-treatment-support-uk", "United Kingdom", "smauk.org.uk"], ["sma-treatment-support-canada", "Canada", "ontario.ca"], ["sma-treatment-support-usa", "United States", "fda.gov"]]) {
    const guide = content.find(g => g.slug === slug);
    assert.equal(guide.audience, audience);
    assert.ok(guide.sections.some(s => s.source?.url.includes(host)));
  }
});
test("content release updates only its exact reviewed CMS snapshot", async () => {
  const sample = { slug: "fixture", title: "Original", status: "published", revision: 1, content: { title: "Original", sections: [] } };
  let source = fs.readFileSync(new URL("../src/lib/article-release.ts", import.meta.url), "utf8");
  const first = await moduleFrom(source.replace('import baseline from "@/content/research/release-baseline.json";', "const baseline = {};"));
  const baseline = { fixture: { revision: 1, digest: first.articleDigest(sample.content) } };
  const { applyArticleRelease, articleDigest } = await moduleFrom(source.replace('import baseline from "@/content/research/release-baseline.json";', `const baseline = ${JSON.stringify(baseline)};`));
  const replacement = { title: "Refreshed", sections: [] };
  assert.equal(applyArticleRelease(sample, replacement).content, replacement);
  for (const modified of [{ ...sample, revision: 2 }, { ...sample, status: "draft" }, { ...sample, content: { ...sample.content, title: "Owner edit" } }]) assert.equal(applyArticleRelease(modified, replacement), modified);
  assert.equal(applyArticleRelease(sample, undefined), sample);
  assert.equal(articleDigest({ b: 2, a: 1 }), articleDigest({ a: 1, b: 2 }));
});

// Internal publishing workflow must never be rendered to readers.
test("public article templates do not expose internal workflow labels", () => {
  for (const path of ["../src/app/blog/page.tsx", "../src/app/blog/[slug]/page.tsx", "../src/app/what-is-sma/page.tsx", "../src/app/editorial-policy/page.tsx"]) {
    const source = fs.readFileSync(new URL(path, import.meta.url), "utf8");
    assert.doesNotMatch(source, /clinical review pending|not yet been reviewed by a clinician|no clinician review is claimed|show their review status/i, path);
  }
  assert.doesNotMatch(JSON.stringify(content), /clinical review pending|not yet been reviewed by a clinician|no clinician review is claimed/i);
});

const publishingSource = fs.readFileSync(new URL("../src/lib/article-publishing.ts", import.meta.url), "utf8");
const { isGuideDue, publishedGuides, publicGuide } = await moduleFrom(publishingSource);
test("scheduled content is private before its instant and becomes public at the exact boundary", () => {
  for (const guide of scheduled) {
    const due = Date.parse(guide.scheduledFor);
    assert.equal(isGuideDue(guide, due - 1), false, guide.slug);
    assert.equal(isGuideDue(guide, due), true, guide.slug);
    assert.deepEqual(publishedGuides([{ status: "published", content: guide }], due - 1), []);
    assert.equal(publishedGuides([{ status: "published", content: guide }], due)[0].slug, guide.slug);
    assert.deepEqual(publishedGuides([{ status: "draft", content: guide }], due + 1), []);
    const publicVersion = publicGuide(guide);
    assert.equal(publicVersion.publishedAt, guide.scheduledFor.slice(0,10));
    assert.ok(publicVersion.updatedAt >= publicVersion.publishedAt);
  }
  assert.equal(isGuideDue({scheduledFor:"not-a-date"}), false);
  assert.equal(isGuideDue({}), true);
});
test("approved series has two releases per week on Monday and Thursday at 09:00 UK time", () => {
  const formatter = new Intl.DateTimeFormat("en-GB", {timeZone:"Europe/London", weekday:"long", hour:"2-digit", minute:"2-digit", hourCycle:"h23"});
  const dates = scheduled.map(guide => guide.scheduledFor);
  assert.equal(new Set(dates).size, 12);
  assert.equal(dates[0], "2026-11-23T09:00:00.000Z");
  assert.equal(dates.at(-1), "2026-12-31T09:00:00.000Z");
  scheduled.forEach((guide,index) => {
    assert.ok(validGuide(guide), guide.slug);
    assert.equal(formatter.format(new Date(guide.scheduledFor)), `${index % 2 === 0 ? "Monday" : "Thursday"} 09:00`);
    const words = [...guide.intro, ...guide.sections.flatMap(section => section.paragraphs), ...guide.faqs.map(faq => `${faq.question} ${faq.answer}`)].join(" ").split(/\s+/).length;
    assert.ok(words >= 1950 && words <= 2300, `${guide.slug}: ${words} substantive words`);
  });
});
test("a draft can pause a future or past-due article and later edits retain their own schedule", () => {
  const guide = {...scheduled[0], scheduledFor:"2027-01-04T09:00:00.000Z"};
  assert.deepEqual(publishedGuides([{status:"published", content:guide}], Date.parse("2026-12-01T10:00:00.000Z")), []);
  assert.equal(publishedGuides([{status:"published", content:guide}], Date.parse(guide.scheduledFor)).length,1);
  assert.deepEqual(publishedGuides([{status:"draft",content:guide}], Date.parse("2027-02-01T10:00:00.000Z")), []);
  assert.equal(validGuide({...guide,scheduledFor:"2026-02-31T09:00:00.000Z"}), false);
  assert.equal(validGuide({...guide,scheduledFor:"2026-11-23T09:00:00+01:00"}), false);
});
