import { cronAuthorised, runReminders } from '@/lib/learning/reminders';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(r:Request){if(!cronAuthorised(r.headers.get('authorization')))return Response.json({error:'Unauthorized'},{status:401});try{return Response.json(await runReminders(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Reminder processing failed; inspect the delivery ledger before retrying.'},{status:503});}}
