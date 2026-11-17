import type { Guide } from "@/content/guides";
export type GuidePreview = Pick<Guide, "slug" | "title" | "excerpt" | "category" | "audience"> & { minutes: number; headings: string[] };
export function guideReadingMinutes(guide: Guide) {
  const words = [...(guide.intro || []), ...guide.sections.flatMap(section => [...section.paragraphs, ...(section.bullets || [])]), ...(guide.faqs || []).map(faq => `${faq.question} ${faq.answer}`)].join(" ").split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 180));
}
export function toGuidePreview(guide: Guide): GuidePreview {
  return { slug: guide.slug, title: guide.title, excerpt: guide.excerpt, category: guide.category, audience: guide.audience, minutes: guideReadingMinutes(guide), headings: guide.sections.map(section => section.title) };
}
