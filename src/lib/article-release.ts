import { createHash } from "node:crypto";
import baseline from "@/content/research/release-baseline.json";
import type { Guide } from "@/content/guides";

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, stable(item)]));
  }
  return value;
}
export function articleDigest(content: unknown) {
  return createHash("sha256").update(JSON.stringify(stable(content))).digest("hex");
}
// Refresh only the exact published CMS snapshot reviewed for this release.
// A later edit, draft, or differing content always takes precedence over the release.
export function applyArticleRelease<T extends { slug: string; status: string; revision: number; title: string; content: Guide }>(record: T, replacement?: Guide): T {
  const expected = (baseline as Record<string, { revision: number; digest: string }>)[record.slug];
  if (!replacement || !expected || record.status !== "published" || record.revision !== expected.revision || articleDigest(record.content) !== expected.digest) return record;
  return { ...record, title: replacement.title, content: replacement };
}
