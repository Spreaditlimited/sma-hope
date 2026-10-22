import "server-only";
import { betterAuth } from "better-auth";
import { MysqlDialect } from "kysely";
import { nextCookies } from "better-auth/next-js";
import { getPool } from "@/lib/database/pool";
import { sendTransactionalEmail } from "@/lib/email";
export type AuthScope = "account" | "administrator";
export function authOrigin() {
  const origin = process.env.SMAHOPE_AUTH_URL || "https://www.smahope.org";
  const url = new URL(origin);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("Invalid authentication origin.");
  return url.origin;
}
function createAuth(scope: AuthScope) {
  const admin = scope === "administrator";
  const secret = process.env[admin ? "SMAHOPE_ADMIN_AUTH_SECRET" : "SMAHOPE_AUTH_SECRET"];
  if (!secret || secret.length < 32) throw new Error("Authentication is not configured.");
  return betterAuth({
    appName: admin ? "SMA Hope Administration" : "SMA Hope",
    baseURL: authOrigin(), basePath: admin ? "/api/admin-auth" : "/api/auth", secret,
    trustedOrigins: [authOrigin()], database: {dialect:new MysqlDialect({pool:getPool()}),type:"mysql",transaction:true},
    user: { modelName: `${scope}_identity`, additionalFields: { active: { type: "boolean", defaultValue: true, input: false } } },
    account: { modelName: `${scope}_credential` },
    session: { modelName: `${scope}_session`, expiresIn: admin ? 28800 : 604800, cookieCache: {enabled:false} },
    verification: { modelName: `${scope}_verification` },
    emailAndPassword: {
      enabled: true, disableSignUp: true, minPasswordLength: 12, revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        const result = await sendTransactionalEmail({ to:user.email,
          subject: admin ? "Set your SMA Hope administrator password" : "Set your SMA Hope account password",
          design: {
            heading: "A fresh start. A secure account.",
            eyebrow: admin ? "Administrator access · Password reset" : "Your account · Password reset",
            action: { label: "Set my password", url },
            note: { title: "Didn’t request this?", text: "You can safely ignore this email. Your password will stay the same. Keep this reset link private." },
          },
          text:`Hello ${user.name},\n\nUse this secure link to choose your password:\n${url}\n\nThis link expires in one hour. If you did not request it, ignore this email.`,
        });
        if (result.skipped) throw new Error("Email delivery is unavailable.");
      },
    },
    rateLimit: { enabled:true, storage:"database", modelName:"auth_rate_limit", window:60, max:30,
      customRules:{"/sign-in/email":{window:60,max:5},"/request-password-reset":{window:60,max:3}} },
    advanced: {
      cookiePrefix: admin ? "smahope_admin" : "smahope_account",
      useSecureCookies: authOrigin().startsWith("https:"),
      defaultCookieAttributes: { httpOnly:true, sameSite:"lax", path:"/" },
    },
    databaseHooks: {
      session: {create:{before:async(session)=>{
        const [rows] = await getPool().promise().query(`SELECT active FROM ${scope}_identity WHERE id=?`,[session.userId]);
        if (!(rows as {active:number}[])[0]?.active) return false;
      }}},
    },
    plugins:[nextCookies()],
  });
}
const instances = new Map<AuthScope, ReturnType<typeof createAuth>>();
export function getAuth(scope: AuthScope = "account") {
  let instance = instances.get(scope);
  if (!instance) {instance = createAuth(scope);instances.set(scope,instance);}
  return instance;
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin !== authOrigin()) throw new Error("Forbidden");
}
export async function requireAccount(request: Request) {
  if (!["GET","HEAD"].includes(request.method)) assertSameOrigin(request);
  const session = await getAuth().api.getSession({headers:request.headers});
  if (!session?.user || !session.user.active) throw new Error("Unauthorized");
  return session.user;
}
