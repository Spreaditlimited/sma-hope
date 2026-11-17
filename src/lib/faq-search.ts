import type { FaqItem } from "@/content/faqs";
const normalise = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
export function filterFaqItems(items: FaqItem[], query: string): FaqItem[] {
  const tokens = normalise(query).split(" ").filter(Boolean);
  if (!tokens.length) return items;
  return items.filter(item => {
    const text = normalise([item.question,item.answer,item.category.replaceAll("-"," "),...(item.keywords || [])].join(" "));
    return tokens.every(token => text.includes(token));
  });
}
