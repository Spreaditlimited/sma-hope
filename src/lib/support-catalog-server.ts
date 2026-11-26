import "server-only";
import seeds from "@/content/support-items.json";
import { getPool } from "@/lib/database/pool";
import { publicSupportItem, supportItemInput, type SupportItem } from "@/lib/support-catalog";
export async function supportCatalog():Promise<{items:SupportItem[];ready:boolean}> {
 const initial=seeds.map(supportItemInput);
 try {
  const [rows]=await getPool().promise().query("SELECT content,revision FROM support_items");
  const overrides=(rows as {content:string|SupportItem;revision:number}[]).map(r=>supportItemInput({...(typeof r.content==="string"?JSON.parse(r.content):r.content),revision:r.revision}));
  const map=new Map(initial.map(i=>[i.id,i]));for(const item of overrides)map.set(item.id,item);
  return {items:[...map.values()].sort((a,b)=>a.sortOrder-b.sortOrder || a.title.localeCompare(b.title)),ready:true};
 }catch(error){
  // Before the additive migration, shipped seed items still render; real DB failures fail closed.
  if((error as {code?:string}).code==="ER_NO_SUCH_TABLE")return {items:initial,ready:false};
  throw error;
 }
}
export async function publicSupportItems(){return (await supportCatalog()).items.filter(i=>i.status!=="draft").map(publicSupportItem);}
export async function activeSupportItem(id:string){return (await publicSupportItems()).find(i=>i.id===id && i.status==="active") || null;}
