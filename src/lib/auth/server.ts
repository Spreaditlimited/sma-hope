import "server-only";
import { betterAuth } from "better-auth";
import { MysqlDialect } from "kysely";
import { nextCookies } from "better-auth/next-js";
import { getPool } from "@/lib/database/pool";
import { confirmSetupDelivery } from "./setup-delivery";
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
      enabled: true, disableSignUp: admin, minPasswordLength: 12, revokeSessionsOnPasswordReset: true,
      onPasswordReset: async ({user}) => {
        if (!admin) {
          const {claimPublicClinicianApplication} = await import('@/lib/diagnostics/public-application');
          await claimPublicClinicianApplication(user.id);
          const {confirmPublicReports} = await import('@/lib/diagnostics/public-report');
          await confirmPublicReports(user.id);
        }
      },
      sendResetPassword: async ({ user, url }) => {
        const clinicianSetup = !admin && new URL(url).searchParams.get('callbackURL')?.includes('next=%2Faccount%2Fclinician');
        const reportingSetup = !admin && new URL(url).searchParams.get('callbackURL')?.includes('next=%2Faccount%2Fdiagnostics');
        const result = await sendTransactionalEmail({ to:user.email,
          subject: admin ? "Set your SMA Hope administrator password" : clinicianSetup ? "Your SMA Hope clinician application: set your password" : reportingSetup ? "Set up your private SMA Hope account" : "Set your SMA Hope account password",
          design: {
            heading: clinicianSetup ? "Your clinician application starts here." : reportingSetup ? "Your private SMA Hope account." : "A fresh start. A secure account.",
            eyebrow: admin ? "Administrator access · Password reset" : "Your account · Password reset",
            action: { label: "Set my password", url },
            note: { title: "Didn’t request this?", text: "You can safely ignore this email. Your password will stay the same. Keep this reset link private." },
          },
          text:`Hello ${user.name},\n\n${clinicianSetup ? "Thank you for applying to the SMA Hope clinician network. Set your password to confirm your email, then sign in to review your application. Our team will check your professional details before you can take on cases.\n\n" : reportingSetup ? "Set your password to confirm your email, then sign in to your private SMA Hope account. For your privacy, this email contains no medical information.\n\n" : ""}Use this secure link to choose your password:\n${url}\n\nThis link expires in one hour. If you did not request it, ignore this email.`,
        });
        if (result.skipped) throw new Error("Email delivery is unavailable.");
        confirmSetupDelivery();
      },
    },
    rateLimit: { enabled:true, storage:"database", modelName:"auth_rate_limit", window:60, max:30,
      customRules:{"/sign-up/email":{window:60,max:3},"/sign-in/email":{window:60,max:5},"/request-password-reset":{window:60,max:3}} },
    advanced: {
      cookiePrefix: admin ? "smahope_admin" : "smahope_account",
      useSecureCookies: authOrigin().startsWith("https:"),
      defaultCookieAttributes: { httpOnly:true, sameSite:"lax", path:"/" },
    },
    databaseHooks: {
      session: {create:{before:async(session, context)=>{
        // Use the auth adapter so signup sees its own uncommitted user.
        const user = await context?.context.internalAdapter.findUserById(session.userId);
        if (!user || !(user as typeof user & {active?:boolean|number}).active) return false;
        return {data:session};
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
