import release from "./guides-release.json";
import series from "./guides-series.json";

export type GuideLink = { label: string; href: string };
export type GuideSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  source?: { title: string; url: string };
  links?: GuideLink[];
  table?: { columns: string[]; rows: string[][] };
};
export type Guide = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  summary: string[];
  sections: GuideSection[];
  checklist: string[];
  related: string[];
  clinical: boolean;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
  sourcesCheckedAt?: string;
  audience?: "Nigeria" | "United Kingdom" | "Canada" | "United States" | "Africa" | "International";
  intro?: string[];
  faqs?: { question: string; answer: string; source?: { title: string; url: string } }[];
  bookContext?: string;
  links?: GuideLink[];
};
export const guides: Guide[] = [...release, ...series] as Guide[];
