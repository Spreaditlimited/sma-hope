import { unsubscribe } from '@/lib/learning/reminders';
export const dynamic='force-dynamic';
export async function POST(r:Request){
 const token=new URL(r.url).searchParams.get('token')||'';
 try{const ok=await unsubscribe(token);return Response.json(ok?{ok:true}:{error:'This link is invalid. You can change preferences in your account.'},{status:ok?200:400,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});}catch{return Response.json({error:'Please try again shortly.'},{status:503});}
}
