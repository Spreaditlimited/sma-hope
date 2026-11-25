import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/database/pool';
import { queueDiagnosticNotification, tryDiagnosticNotifications } from './notifications';
import { ensureIdentity, sendSetupLink } from '@/lib/auth/provision';
import { caseInput, DiagnosticError, object, text } from './domain';
import { audit, reportCase, settings, transaction } from './server';
export async function publicDiagnosticReport(raw:unknown) {
  const v=object(raw), report=caseInput(v);
  const email=text(v.email,'email address',254).toLowerCase(), name=text(v.contactName,'your name',180,2);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||v.terms!==true)
    throw new DiagnosticError('Enter your email and accept the terms and privacy notice.');
  if(!(await settings()).intake_open) throw new DiagnosticError('Reporting is currently paused. Please contact your healthcare provider for assessment.',409);
  const identity=await ensureIdentity(email,name);
  const fingerprint=createHash('sha256').update(JSON.stringify(report)).digest('hex');
  await transaction(async db=>{
    const [s]=await db.query<RowDataPacket[]>('SELECT intake_open FROM diagnostic_settings WHERE id=1');
    if(!s[0]?.intake_open) throw new DiagnosticError('Reporting is currently paused.',409);
    const [duplicates]=await db.query<RowDataPacket[]>('SELECT id FROM diagnostic_public_reports WHERE user_id=? AND fingerprint=?',[identity.id,fingerprint]);
    if(duplicates.length) return;
    const [pending]=await db.query<RowDataPacket[]>('SELECT id FROM diagnostic_public_reports WHERE user_id=? AND case_id IS NULL',[identity.id]);
    if(pending.length>=3) throw new DiagnosticError('Please confirm the reports already sent to this email before submitting another.',409);
    const id=randomUUID();
    await db.query('INSERT INTO diagnostic_public_reports(id,user_id,fingerprint,report_json) VALUES(?,?,?,?)',[id,identity.id,fingerprint,JSON.stringify({...report,consent:true,sharingConsent:true})]);
    await queueDiagnosticNotification(db,'report',id);
    await audit(db,{userId:identity.id,role:'account'},'case.public_report_received',id,{emailOwnershipConfirmed:false});
  });
  try {await sendSetupLink(email,'account','diagnostics');} finally {await tryDiagnosticNotifications();}
  return {ok:true};
}
export async function confirmPublicReports(userId:string) {
  try {
    await getPool().promise().query('UPDATE diagnostic_public_reports SET email_confirmed_at=NOW(3) WHERE user_id=? AND email_confirmed_at IS NULL',[userId]);
  } catch(error) {if((error as {code?:string}).code==='ER_NO_SUCH_TABLE')return;throw error;}
  await claimConfirmedPublicReports(userId);
}
export async function claimConfirmedPublicReports(userId:string) {
  let pending:RowDataPacket[];
  try { [pending]=await getPool().promise().query<RowDataPacket[]>('SELECT id,report_json FROM diagnostic_public_reports WHERE user_id=? AND email_confirmed_at IS NOT NULL AND case_id IS NULL',[userId]); }
  catch(error){if((error as {code?:string}).code==='ER_NO_SUCH_TABLE')return;throw error;}
  if(!pending.length||!(await settings()).intake_open)return;
  for(const item of pending){
    const report=JSON.parse(item.report_json);let caseId:string;
    try{caseId=(await reportCase({userId,role:'account'},report,item.id)).id;}
    catch(error){
      if(!(error instanceof DiagnosticError&&error.status===409))throw error;
      const [existing]=await getPool().promise().query<RowDataPacket[]>("SELECT id FROM diagnostic_cases WHERE user_id=? AND patient_name=? AND age_months=? AND status<>'withdrawn'",[userId,report.patientName,report.ageMonths]);
      if(!existing[0])return;caseId=existing[0].id;
    }
    await transaction(async db=>{
      await db.query('UPDATE diagnostic_public_reports SET case_id=? WHERE id=? AND case_id IS NULL',[caseId,item.id]);
      await audit(db,{userId,role:'account'},'case.public_report_confirmed',caseId);
    });
  }
}
