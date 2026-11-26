import { randomUUID } from "node:crypto";
import { requireAdminUser } from "@/lib/admin/server";
import { getPool } from "@/lib/database/pool";
import { supportCatalog } from "@/lib/support-catalog-server";
import { supportItemInput } from "@/lib/support-catalog";
function failure(error:unknown){const m=error instanceof Error?error.message:"Unable to save.";const status=m==="Unauthorized"?401:m==="Forbidden"?403:m.startsWith("This item changed")?409:500;return Response.json({error:status===500?"Unable to load or save support items. Please retry.":m},{status,headers:{"Cache-Control":"private, no-store"}});}
export async function GET(request:Request){try{await requireAdminUser(request);return Response.json(await supportCatalog(),{headers:{"Cache-Control":"private, no-store"}});}catch(e){return failure(e);}}
export async function POST(request:Request){
 try{
  const admin=await requireAdminUser(request,["admin"]);
  const raw=await request.text();if(raw.length>12000)return Response.json({error:"Item is too large."},{status:413});
  let item;try{item=supportItemInput(JSON.parse(raw));}catch(e){return Response.json({error:e instanceof Error?e.message:"Invalid item."},{status:400});}
  const db=await getPool().promise().getConnection();
  try{
   await db.beginTransaction();
   const [rows]=await db.query("SELECT revision FROM support_items WHERE id=? FOR UPDATE",[item.id]);
   const current=(rows as {revision:number}[])[0];
   if((current?.revision || 0)!==item.revision)throw new Error("This item changed in another session. Reload before saving.");
   item={...item,revision:item.revision+1};
   if(current)await db.query("UPDATE support_items SET content=?,revision=? WHERE id=?",[JSON.stringify(item),item.revision,item.id]);
   else await db.query("INSERT INTO support_items (id,content,revision) VALUES (?,?,?)",[item.id,JSON.stringify(item),item.revision]);
   await db.query("INSERT INTO support_item_revisions (item_id,revision,content,actor_id) VALUES (?,?,?,?)",[item.id,item.revision,JSON.stringify(item),admin.userId]);
   await db.query("INSERT INTO audit_events (id,actor_id,action,target_id) VALUES (?,?,?,?)",[randomUUID(),admin.userId,`support_item.${item.status}`,item.id]);
   await db.commit();
  }catch(e){await db.rollback();throw e;}finally{db.release();}
  return Response.json({ok:true,item});
 }catch(e){return failure(e);}
}
