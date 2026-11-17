import type { Guide } from "@/content/guides";

// A scheduled article stays private until its exact UTC instant. Invalid dates fail closed.
export function isGuideDue(guide: Pick<Guide, "scheduledFor">, now = Date.now()): boolean {
  if (!guide.scheduledFor) return true;
  const scheduled = Date.parse(guide.scheduledFor);
  return Number.isFinite(scheduled) && scheduled <= now;
}
export function publicGuide(guide: Guide): Guide {
  if (!guide.scheduledFor) return guide;
  const publishedAt = guide.scheduledFor.slice(0, 10);
  return { ...guide, publishedAt: guide.publishedAt || publishedAt, updatedAt: guide.updatedAt < publishedAt ? publishedAt : guide.updatedAt };
}
export function publishedGuides(records: { status: string; content: Guide }[], now = Date.now()): Guide[] {
  return records.filter(record => record.status === "published" && isGuideDue(record.content, now)).map(record => publicGuide(record.content));
}
