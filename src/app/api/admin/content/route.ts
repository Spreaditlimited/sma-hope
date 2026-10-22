import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { requireAdminUser } from "@/lib/admin/server";
import { getPool } from "@/lib/database/pool";
import { editorialArticles } from "@/lib/articles";
import { validGuide } from "@/lib/article-validation";
function failure(error:unknown) {
  const message=error instanceof Error?error.message:"Request failed.";
  const status=message==="Unauthorized"?401:message==="Forbidden"?403:message==="This article changed in another session. Reload before saving."?409:500;
  return Response.json({error:status===500?"Unable to save or load content. Please retry.":message},{status});
}
export async function GET(request:Request) {
  try {await requireAdminUser(request);return Response.json({rows:await editorialArticles()},{headers:{"Cache-Control":"private, no-store"}});}
  catch(error){return failure(error);}
}
export async function POST(request:Request) {
  try {
    const admin=await requireAdminUser(request,["admin"]);
    if(Number(request.headers.get("content-length") || 0)>200000)return Response.json({error:"Article is too large."},{status:413});
    const raw=await request.text();if(raw.length>200000)return Response.json({error:"Article is too large."},{status:413});
    let payload;try{payload=JSON.parse(raw);}catch{return Response.json({error:"Invalid article."},{status:400});}
    if(!validGuide(payload.content) || !["draft","published"].includes(payload.status) || !Number.isSafeInteger(payload.revision) || payload.revision<0)return Response.json({error:"Check the title, description, topic, sections and source links. Clinical articles need at least one source."},{status:400});
    const content={...payload.content,updatedAt:new Date().toISOString().slice(0,10)};
    const db=await getPool().promise().getConnection();
    const revision=payload.revision+1;
    try {
      await db.beginTransaction();
      const [records]=await db.query("SELECT revision FROM articles WHERE slug=? FOR UPDATE",[content.slug]);
      const current=(records as {revision:number}[])[0];
      if((current?.revision || 0)!==payload.revision)throw new Error("This article changed in another session. Reload before saving.");
      if(current)await db.query("UPDATE articles SET title=?,status=?,content=?,revision=? WHERE slug=?",[content.title,payload.status,JSON.stringify(content),revision,content.slug]);
      else await db.query("INSERT INTO articles (id,slug,title,status,content,revision) VALUES (?,?,?,?,?,?)",[randomUUID(),content.slug,content.title,payload.status,JSON.stringify(content),revision]);
      await db.query("INSERT INTO audit_events (id,actor_id,action,target_id) VALUES (?,?,?,?)",[randomUUID(),admin.userId,`article.${payload.status}`,content.slug]);
      await db.commit();
    }catch(error){await db.rollback();throw error;}finally{db.release();}
    revalidateTag("guides",{expire:0});
    return Response.json({ok:true,revision,content,status:payload.status});
  }catch(error){return failure(error);}
}
