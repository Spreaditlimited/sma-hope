
import { NextResponse } from "next/server";
import { ensureIdentity, sendSetupLink } from "@/lib/auth/provision";
import { requireAdminUser } from "@/lib/admin/server";

import { getDatabase } from "@/lib/database/store";

type CreatePayload = {
  email?: string;
  role?: "admin" | "ops";
};


export async function GET(request: Request) {
  try {
    await requireAdminUser(request, ["admin", "ops"]);
    const admin = getDatabase();
    const result = await admin
      .from("admin_users")
      .select("id, email, role, active, created_at")
      .order("created_at", { ascending: false });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, rows: result.data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load admin users.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser(request, ["admin"]);
    const payload = (await request.json().catch(() => null)) as CreatePayload | null;
    const email = String(payload?.email || "").trim().toLowerCase();
    const role = payload?.role === "admin" ? "admin" : "ops";
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email is required." }, { status: 400 });
    }

    const admin = getDatabase();
    const identity = await ensureIdentity(email,email,"administrator");
    const upsertResult = await admin.from("admin_users").upsert({email,auth_user_id:identity.id,role,active:true},{onConflict:"email"}).select("id,email,role,active").single();
    if (upsertResult.error) throw new Error(upsertResult.error.message);
    await sendSetupLink(email,"administrator");
    return NextResponse.json({ ok: true, row: upsertResult.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create admin user.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
