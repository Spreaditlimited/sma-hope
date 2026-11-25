import {cronAuthorised} from '@/lib/learning/reminders';
import {verifyStorage} from '@/lib/diagnostics/storage';
import {flushDiagnosticNotifications} from '@/lib/diagnostics/notifications';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(request:Request){
 if(!cronAuthorised(request.headers.get('authorization')))return Response.json({error:'Unauthorized'},{status:401});
 try{if(new URL(request.url).searchParams.get('check')==='storage'){await verifyStorage();return Response.json({privateStorageVerified:true},{headers:{'Cache-Control':'no-store'}});}
 return Response.json(await flushDiagnosticNotifications(),{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Notification processing failed; saved notifications will be retried.'},{status:503});}
}
