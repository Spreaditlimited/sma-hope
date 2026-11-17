import release from "./faqs-release.json";
import categories from "./faq-categories.json";
import legacy from "./faqs-legacy.json";

export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  links?: { label: string; href: string }[];
  source?: { title: string; url: string };
  keywords?: string[];
};
export const faqCategories = categories;
export const fallbackFaqs: FaqItem[] = release;
export const legacyFaqs = legacy;
export const faqSourcesCheckedAt = "2026-11-17";
