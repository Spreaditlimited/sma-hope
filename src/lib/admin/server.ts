import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminRole = "admin" | "ops";

export function startDateForRange(range: string) {
  const now = new Date();
  const value = String(range || "month");
  if (value === "day") return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (value === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (value === "year") return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

export async function requireAdminUser(token: string, allowedRoles: AdminRole[] = ["admin", "ops"]) {
  const admin = getSupabaseAdminClient();
  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);
  if (error || !user?.id) {
    throw new Error("Unauthorized");
  }

  let lookup = await admin
    .from("admin_users")
    .select("id, email, role, active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!lookup.data?.id) {
    lookup = await admin
      .from("admin_users")
      .select("id, email, role, active")
      .eq("email", String(user.email || "").toLowerCase())
      .maybeSingle();
    if (lookup.data?.id) {
      await admin.from("admin_users").update({ auth_user_id: user.id }).eq("id", lookup.data.id);
    }
  }

  if (lookup.error) {
    throw new Error(lookup.error.message);
  }

  const row = lookup.data as { id: string; email: string; role: AdminRole; active: boolean } | null;
  if (!row?.id || !row.active || !allowedRoles.includes(row.role)) {
    throw new Error("Forbidden");
  }

  return {
    userId: user.id,
    email: String(user.email || row.email || ""),
    role: row.role,
  };
}

export function bearerTokenFromRequest(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}
