import { requireAccount } from '@/lib/auth/server';
import { preferences, savePreferences } from '@/lib/learning/reminders';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
function failure(e:unknown){const m=e instanceof Error?e.message:'';return json({error:'Unable to update email preferences.'},m==='Unauthorized'?401:m==='Forbidden'?403:m.startsWith('Invalid')||e instanceof SyntaxError?400:503);}
export async function GET(r:Request){try{const u=await requireAccount(r);return json(await preferences(u.id));}catch(e){return failure(e);}}
export async function POST(r:Request){try{const u=await requireAccount(r);const raw=await r.text();if(raw.length>256)throw Error('Invalid preferences');const b=JSON.parse(raw);if(!b||typeof b.enabled!=='boolean'||![0,7,30].includes(b.pauseDays))throw Error('Invalid preferences');await savePreferences(u.id,b.enabled,b.pauseDays);return json(await preferences(u.id));}catch(e){return failure(e);}}
