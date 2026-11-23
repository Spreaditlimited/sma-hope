import type { Guide } from "@/content/guides";
import { topics } from "@/lib/topics";
const text = (value: unknown, min: number, max: number): value is string => typeof value === "string" && value.trim().length >= min && value.length <= max;
const list = (value: unknown, max: number): value is string[] => Array.isArray(value) && value.length <= max && value.every(v => text(v, 1, 5000));
const date = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const source = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  const s = value as { title: unknown; url: unknown };
  if (!text(s.title, 2, 200) || !text(s.url, 8, 2000)) return false;
  try { const url = new URL(s.url); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
};
const links = (value: unknown): boolean => Array.isArray(value) && value.length <= 12 && value.every(v => {
  if (!v || !text(v.label, 2, 200) || !text(v.href, 1, 2000)) return false;
  return /^\/(?!\/)[a-zA-Z0-9/._?=#%&-]*$/.test(v.href) || source({ title: v.label, url: v.href });
});
export function validGuide(value: unknown): value is Guide {
  if (!value || typeof value !== "object") return false;
  const g = value as Guide;
  return text(g.slug, 3, 180) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.slug) && g.slug !== "topics" &&
    text(g.title, 5, 180) && (!g.seoTitle || text(g.seoTitle, 5, 180)) && (!g.bookPlacement || ["inline", "end"].includes(g.bookPlacement)) && text(g.excerpt, 20, 350) && topics.some(t => t.name === g.category) &&
    typeof g.clinical === "boolean" && list(g.summary, 8) && g.summary.length > 0 &&
    list(g.checklist, 20) && list(g.related, 8) && g.related.every(s => /^[a-z0-9-]+$/.test(s)) &&
    date(g.updatedAt) && (!g.publishedAt || date(g.publishedAt)) && (!g.sourcesCheckedAt || date(g.sourcesCheckedAt)) &&
    (!g.scheduledFor || (typeof g.scheduledFor === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/.test(g.scheduledFor) && !Number.isNaN(Date.parse(g.scheduledFor)) && new Date(g.scheduledFor).toISOString() === g.scheduledFor)) &&
    (!g.audience || ["Nigeria", "United Kingdom", "Canada", "United States", "Africa", "International"].includes(g.audience)) &&
    (!g.intro || list(g.intro, 8)) && (!g.bookContext || text(g.bookContext, 20, 1500)) &&
    (!g.links || links(g.links)) &&
    (!g.faqs || (Array.isArray(g.faqs) && g.faqs.length <= 15 && g.faqs.every(f => f && text(f.question, 5, 250) && text(f.answer, 10, 3000) && (!f.source || source(f.source))))) &&
    Array.isArray(g.sections) && g.sections.length > 0 && g.sections.length <= 30 && g.sections.every(s =>
      s && text(s.title, 2, 180) && list(s.paragraphs, 30) && s.paragraphs.length > 0 &&
      (!s.bullets || list(s.bullets, 30)) && (!s.source || source(s.source)) && (!s.links || links(s.links)) &&
      (!s.table || (Array.isArray(s.table.columns) && s.table.columns.length >= 2 && s.table.columns.length <= 8 && list(s.table.columns, 8) && Array.isArray(s.table.rows) && s.table.rows.length <= 30 && s.table.rows.every(row => list(row, 8) && row.length === s.table!.columns.length)))) &&
    (!g.clinical || g.sections.some(s => s.source));
}
