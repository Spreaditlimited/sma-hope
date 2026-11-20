import "server-only";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";
import { publishedGuides } from "@/lib/article-publishing";
import { guides as initialGuides, type Guide } from "@/content/guides";
import { applyArticleRelease } from "@/lib/article-release";
import { getPool } from "@/lib/database/pool";
export type ArticleRecord = {slug:string;title:string;status:"draft"|"published";content:Guide;revision:number};
export async function editorialArticles(): Promise<ArticleRecord[]> {
  const [rows] = await getPool().promise().query("SELECT slug,title,status,content,revision FROM articles ORDER BY updated_at DESC");
  const records = (rows as ArticleRecord[]).map(record => applyArticleRelease(record, initialGuides.find(guide => guide.slug === record.slug)));
  return [...records,...initialGuides.filter(g=>!records.some(r=>r.slug===g.slug)).map(g=>({slug:g.slug,title:g.title,status:"published" as const,content:g,revision:0}))];
}
const cachedArticles = unstable_cache(async (): Promise<ArticleRecord[]> => {
  if (!process.env.SMAHOPE_DATABASE_URL) return initialGuides.map(content => ({slug:content.slug,title:content.title,status:"published",content,revision:0}));
  return editorialArticles();
},["smahope-articles","2026-11-20-editorial-voice"],{revalidate:300,tags:["guides"]});
export const getGuides = cache(async (): Promise<Guide[]> => {
  // Evaluate the clock outside the data cache on every request, including sitemap requests.
  await connection();
  return publishedGuides(await cachedArticles());
});
