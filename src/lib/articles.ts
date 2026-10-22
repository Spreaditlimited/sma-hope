import "server-only";
import { unstable_cache } from "next/cache";
import { guides as initialGuides, type Guide } from "@/content/guides";
import { getPool } from "@/lib/database/pool";
export type ArticleRecord = {slug:string;title:string;status:"draft"|"published";content:Guide;revision:number};
export async function editorialArticles(): Promise<ArticleRecord[]> {
  const [rows] = await getPool().promise().query("SELECT slug,title,status,content,revision FROM articles ORDER BY updated_at DESC");
  const records = rows as ArticleRecord[];
  return [...records,...initialGuides.filter(g=>!records.some(r=>r.slug===g.slug)).map(g=>({slug:g.slug,title:g.title,status:"published" as const,content:g,revision:0}))];
}
export const getGuides = unstable_cache(async()=>{
  if (!process.env.SMAHOPE_DATABASE_URL) return initialGuides;
  return (await editorialArticles()).filter(r=>r.status==="published").map(r=>r.content);
},["smahope-guides"],{revalidate:300,tags:["guides"]});
