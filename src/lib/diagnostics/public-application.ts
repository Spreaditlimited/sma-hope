import 'server-only';
import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/database/pool';
import { queueDiagnosticNotification, tryDiagnosticNotifications } from './notifications';
import { ensureIdentity, sendSetupLink } from '@/lib/auth/provision';
import { clinicianInput, DiagnosticError, object, text } from './domain';
import { applyClinician, audit, transaction } from './server';

export async function publicClinicianApplication(raw: unknown) {
  const v = object(raw), profile = clinicianInput(v);
  const email = text(v.email, 'email address', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || v.terms !== true)
    throw new DiagnosticError('Enter your email and accept the terms and privacy notice.');
  const identity = await ensureIdentity(email, profile.fullName);
  await transaction(async db => {
    // Never change an existing clinician profile from an unsigned request.
    const [existing] = await db.query<RowDataPacket[]>('SELECT id FROM diagnostic_clinicians WHERE user_id=?', [identity.id]);
    if (existing.length) return;
    const [pending] = await db.query<RowDataPacket[]>('SELECT id FROM diagnostic_public_applications WHERE user_id=?', [identity.id]);
    if (pending.length) return;
    const id = randomUUID();
    await db.query('INSERT INTO diagnostic_public_applications(id,user_id,profile_json) VALUES(?,?,?)', [id, identity.id, JSON.stringify({...profile, consent:true, terms:true})]);
    await queueDiagnosticNotification(db,'clinician',id);
    await audit(db, {userId:identity.id,role:'account'}, 'clinician.public_application_received', id, {emailOwnershipConfirmed:false});
  });
  // Await SMTP: never report successful delivery when sending failed.
  try {await sendSetupLink(email, "account", true);} finally {await tryDiagnosticNotifications();}
  return {ok:true, message:'Check your email for a secure link to set your password. Once you have done that, sign in to review your application. Our team will check your professional details before you can take on cases.'};
}

export async function claimPublicClinicianApplication(userId: string) {
  const db = getPool().promise();
  let pending: RowDataPacket[];
  try {
    [pending] = await db.query<RowDataPacket[]>('SELECT id,profile_json FROM diagnostic_public_applications WHERE user_id=? AND claimed_at IS NULL', [userId]);
  } catch (error) {
    // Ordinary password resets continue working before migration 007 is installed.
    if ((error as {code?:string}).code === 'ER_NO_SUCH_TABLE') return;
    throw error;
  }
  if (!pending.length) return;
  try { await applyClinician({userId,role:'account'}, JSON.parse(pending[0].profile_json), pending[0].id); }
  catch (error) { if (!(error instanceof DiagnosticError && error.status === 409)) throw error; }
  await transaction(async connection => {
    const [result] = await connection.query('UPDATE diagnostic_public_applications SET claimed_at=NOW(3) WHERE id=? AND claimed_at IS NULL', [pending[0].id]);
    if ((result as {affectedRows:number}).affectedRows)
      await audit(connection, {userId,role:'account'}, 'clinician.email_confirmed', pending[0].id);
  });
}
