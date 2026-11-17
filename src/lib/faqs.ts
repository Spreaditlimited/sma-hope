import { fallbackFaqs, faqCategories, legacyFaqs, type FaqItem } from "@/content/faqs";

type CmsFaq = { category?: string; question: string; answer: string };
const normalise = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const aliases: Record<string, string> = {
  "about sma": "understanding-sma", "about the foundation": "the-foundation",
  "for families": "everyday-life", donations: "the-foundation", "the book": "the-book",
  "partnerships contact": "the-foundation",
};
function categoryId(category = "") {
  if (typeof category !== "string") return "the-foundation";
  return faqCategories.find(item => item.id === category || normalise(item.title) === normalise(category))?.id || aliases[normalise(category)] || "the-foundation";
}
function extraId(question: string) {
  const key = normalise(question);
  let hash = 2166136261;
  for (const character of key) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `faq-${key.replaceAll(" ", "-").slice(0,70)}-${(hash >>> 0).toString(36)}`;
}
// Replace only unchanged legacy answers; retain later CMS edits and additional questions.
export function mergeFaqItems(incoming: CmsFaq[] = []): FaqItem[] {
  const merged = new Map(fallbackFaqs.map(item => [normalise(item.question), item]));
  for (const item of incoming) {
    if (!item || typeof item.question !== "string" || typeof item.answer !== "string" || !item.question.trim() || !item.answer.trim()) continue;
    const key = normalise(item.question);
    const legacy = legacyFaqs.find(original => normalise(original.question) === key);
    if (legacy && legacy.answer.replace(/\s+/g," ").trim() === item.answer.replace(/\s+/g," ").trim()) continue;
    const existing = merged.get(key);
    if (existing) {
      // An answer changed in the CMS is authoritative. Do not attach a source for different prose.
      merged.set(key, { ...existing, question: item.question.trim(), answer: item.answer.trim(), source: undefined });
    } else {
      merged.set(key, { id: extraId(item.question), category: categoryId(item.category), question: item.question.trim(), answer: item.answer.trim() });
    }
  }
  return [...merged.values()];
}
