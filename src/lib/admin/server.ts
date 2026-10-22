import { getAuth, assertSameOrigin } from "@/lib/auth/server";
import { getDatabase } from "@/lib/database/store";
export type AdminRole = "admin" | "ops";

export function startDateForRange(range: string) {
  const now = new Date();
  const value = String(range || "month");
  if (value === "day") return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (value === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (value === "year") return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

export async function requireAdminUser(request: Request, allowedRoles: AdminRole[] = ["admin", "ops"]) {
  if (!["GET","HEAD"].includes(request.method)) assertSameOrigin(request);
  const session = await getAuth("administrator").api.getSession({headers:request.headers});
  if (!session?.user || !session.user.active) throw new Error("Unauthorized");
  const result = await getDatabase().from("admin_users").select("id,email,role,active").eq("auth_user_id",session.user.id).maybeSingle();
  if (result.error) throw new Error("Unable to check administrator access.");
  const row = result.data as {email:string;role:AdminRole;active:boolean}|null;
  if (!row?.active || !allowedRoles.includes(row.role)) throw new Error("Forbidden");
  return {userId:session.user.id,email:row.email,role:row.role};
}
