import type { Guide } from "@/content/guides";
import { topics } from "@/lib/topics";
const text = (value:unknown,min:number,max:number):value is string => typeof value === "string" && value.trim().length>=min && value.length<=max;
const list = (value:unknown,max:number):value is string[] => Array.isArray(value) && value.length<=max && value.every(v=>text(v,1,5000));
export function validGuide(value:unknown): value is Guide {
  if (!value || typeof value !== "object") return false;
  const g = value as Guide;
  return text(g.slug,3,180) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.slug) && g.slug!=="topics" &&
    text(g.title,5,180) && text(g.excerpt,20,350) && topics.some(t=>t.name===g.category) &&
    typeof g.clinical === "boolean" && list(g.summary,8) && g.summary.length>0 &&
    list(g.checklist,20) && list(g.related,8) && g.related.every(s=>/^[a-z0-9-]+$/.test(s)) &&
    Array.isArray(g.sections) && g.sections.length>0 && g.sections.length<=30 && g.sections.every(s=>
      s && text(s.title,2,180) && list(s.paragraphs,30) && s.paragraphs.length>0 &&
      (!s.bullets || list(s.bullets,30)) && (!s.source || (text(s.source.title,2,200) && text(s.source.url,8,2000) && /^https:\/\//.test(s.source.url)))) &&
    (!g.clinical || g.sections.some(s=>s.source));
}
