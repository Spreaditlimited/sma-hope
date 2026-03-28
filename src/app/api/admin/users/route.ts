import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email";
import { bearerTokenFromRequest, requireAdminUser } from "@/lib/admin/server";
import { env } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type CreatePayload = {
  email?: string;
  role?: "admin" | "ops";
};

function temporaryPassword() {
  return `SMA-ADMIN-${randomBytes(6).toString("hex")}!`;
}

export async function GET(request: Request) {
  const token = bearerTokenFromRequest(request);
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  try {
    await requireAdminUser(token, ["admin", "ops"]);
    const admin = getSupabaseAdminClient();
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
  const token = bearerTokenFromRequest(request);
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  try {
    await requireAdminUser(token, ["admin"]);
    const payload = (await request.json().catch(() => null)) as CreatePayload | null;
    const email = String(payload?.email || "").trim().toLowerCase();
    const role = payload?.role === "admin" ? "admin" : "ops";
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email is required." }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (users.error) throw new Error(users.error.message);
    const existing = users.data.users.find((user) => user.email?.toLowerCase() === email);

    let authUserId = existing?.id || "";
    let tempPass = "";
    let createdAuthUser = false;

    if (!authUserId) {
      tempPass = temporaryPassword();
      const created = await admin.auth.admin.createUser({
        email,
        password: tempPass,
        email_confirm: true,
      });
      if (created.error) throw new Error(created.error.message);
      authUserId = created.data.user.id;
      createdAuthUser = true;
    }

    const upsertResult = await admin
      .from("admin_users")
      .upsert(
        {
          email,
          auth_user_id: authUserId || null,
          role,
          active: true,
        },
        { onConflict: "email" },
      )
      .select("id, email, role, active")
      .single();
    if (upsertResult.error) throw new Error(upsertResult.error.message);

    if (createdAuthUser) {
      const resetLinkResult = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${env.siteUrl.replace(/\/$/, "")}/account/reset-password`,
        },
      });
      const resetLink = resetLinkResult.data?.properties?.action_link || `${env.siteUrl.replace(/\/$/, "")}/account/reset-password`;
      await sendTransactionalEmail({
        to: email,
        subject: "Your SMA Hope admin access is ready",
        text: [
          "Your admin account was created.",
          `Role: ${role}`,
          `Temporary password: ${tempPass}`,
          "",
          "Please sign in and reset your password immediately.",
          `Login: ${env.siteUrl.replace(/\/$/, "")}/account/login`,
          `Reset password: ${resetLink}`,
        ].join("\n"),
      });
    }

    return NextResponse.json({ ok: true, row: upsertResult.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create admin user.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
