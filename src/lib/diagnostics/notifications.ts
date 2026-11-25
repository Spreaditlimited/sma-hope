import 'server-only';
import {randomUUID} from 'node:crypto';
import type {PoolConnection} from 'mysql2/promise';
import type {RowDataPacket} from 'mysql2';
import {getPool} from '@/lib/database/pool';
import {sendTransactionalEmail} from '@/lib/email';
import {authOrigin} from '@/lib/auth/server';
type Kind='report'|'clinician';
export async function queueDiagnosticNotification(db:PoolConnection,kind:Kind,sourceId:string) {
  await db.query('INSERT IGNORE INTO diagnostic_notifications(id,event_key,kind,source_id) VALUES(?,?,?,?)',[randomUUID(),kind+':'+sourceId,kind,sourceId]);
}
export async function flushDiagnosticNotifications(limit=3) {
  const connection=await getPool().promise().getConnection(),token=randomUUID();let pending:RowDataPacket[]=[];
  try{
    await connection.beginTransaction();
    [pending]=await connection.query<RowDataPacket[]>("SELECT id,kind,source_id FROM diagnostic_notifications WHERE status='pending' AND next_attempt_at<=NOW(3) AND (locked_until IS NULL OR locked_until<NOW(3)) ORDER BY created_at LIMIT ? FOR UPDATE SKIP LOCKED",[Math.max(1,Math.min(3,limit))]);
    for(const row of pending) await connection.query('UPDATE diagnostic_notifications SET lock_token=?,locked_until=DATE_ADD(NOW(3),INTERVAL 2 MINUTE),attempts=attempts+1 WHERE id=?',[token,row.id]);
    await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  let sent=0,failed=0;
  for(const row of pending){
    try{
      const report=row.kind==='report',subject=report?'New diagnostic report — SMA Hope':'New clinician application — SMA Hope';
      const result=await sendTransactionalEmail({to:'help@smahope.org',subject,
        messageId:'<diagnostic-'+row.id+'@smahope.org>',
        text:(report?'A new diagnostic report has been received.':'A new clinician application has been received.')+'\n\nSign in to review it in the private admin area. Public submissions may still be awaiting email confirmation. No patient or applicant details are included in this email.\n\n'+authOrigin()+'/admin/diagnostics\n\nNotification reference: '+row.source_id,
        design:{heading:report?'A new report needs your attention.':'A clinician has applied.',eyebrow:'SMA Hope · Private administration',action:{label:'Open diagnostic administration',url:authOrigin()+'/admin/diagnostics'}}});
      if(result.skipped)throw new Error('Delivery unavailable');
      await getPool().promise().query("UPDATE diagnostic_notifications SET status='sent',sent_at=NOW(3),last_error=NULL,locked_until=NULL,lock_token=NULL WHERE id=? AND lock_token=?",[row.id,token]);sent++;
    }catch{
      await getPool().promise().query("UPDATE diagnostic_notifications SET last_error='Email delivery unavailable',next_attempt_at=TIMESTAMPADD(SECOND,LEAST(21600,60*POW(2,LEAST(attempts,8))),NOW(3)),locked_until=NULL,lock_token=NULL WHERE id=? AND lock_token=?",[row.id,token]);failed++;
    }
  }
  return {processed:pending.length,sent,failed};
}
export async function tryDiagnosticNotifications(){try{await flushDiagnosticNotifications();}catch{console.warn('Diagnostic notifications remain queued for retry.');}}
