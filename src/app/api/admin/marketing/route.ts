import { requireAdminUser } from '@/lib/admin/server';
import { reminderOverview, setReminderSwitch } from '@/lib/learning/reminders';
export const dynamic='force-dynamic';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'private, no-store'}});
function fail(e:unknown){const m=e instanceof Error?e.message:'';return json({error:'Unable to update learning emails.'},m==='Unauthorized'?401:m==='Forbidden'?403:e instanceof SyntaxError||m==='Invalid settings'?400:503);}
export async function GET(r:Request){try{await requireAdminUser(r,['admin','ops']);return json(await reminderOverview());}catch(e){return fail(e);}}
export async function POST(r:Request){try{const u=await requireAdminUser(r,['admin']);const raw=await r.text();if(raw.length>128)throw Error('Invalid settings');const b=JSON.parse(raw);if(!b||typeof b.enabled!=='boolean')throw Error('Invalid settings');if(b.enabled){const ready=await reminderOverview();if(!ready.schedulerConfigured||!ready.senderConfigured)return json({error:'Configure the scheduler and email sender before activation.'},409);}
await setReminderSwitch(b.enabled,u.userId);return json(await reminderOverview());}catch(e){return fail(e);}}
