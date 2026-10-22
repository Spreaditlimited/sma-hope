import "server-only";
import { randomUUID, randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { getPool } from "@/lib/database/pool";
import { getAuth, authOrigin, type AuthScope } from "./server";
export async function ensureIdentity(email: string, name: string, scope: AuthScope = "account") {
  const db = getPool().promise();
  const normalized = email.trim().toLowerCase();
  const [rows] = await db.query(`SELECT id FROM ${scope}_identity WHERE email=?`,[normalized]);
  const existing = (rows as {id:string}[])[0];
  if (existing) return {id:existing.id,created:false};
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const id = randomUUID();
    const password = await hashPassword(randomBytes(48).toString("base64url"));
    await connection.query(`INSERT INTO ${scope}_identity (id,name,email,emailVerified,createdAt,updatedAt) VALUES (?,?,?,false,NOW(3),NOW(3))`,[id,name || normalized,normalized]);
    await connection.query(`INSERT INTO ${scope}_credential (id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES (?,?,'credential',?,?,NOW(3),NOW(3))`,[randomUUID(),id,id,password]);
    await connection.commit();
    return {id,created:true};
  } catch(error) {
    await connection.rollback();
    if ((error as {code?:string}).code === "ER_DUP_ENTRY") {
      const [again] = await db.query(`SELECT id FROM ${scope}_identity WHERE email=?`,[normalized]);
      const row = (again as {id:string}[])[0];
      if (row) return {id:row.id,created:false};
    }
    throw new Error("Unable to create account.");
  } finally { connection.release(); }
}
export async function sendSetupLink(email: string, scope: AuthScope = "account") {
  await getAuth(scope).api.requestPasswordReset({body:{email,redirectTo:`${authOrigin()}/${scope === "administrator" ? "admin" : "account"}/reset-password`}});
}
