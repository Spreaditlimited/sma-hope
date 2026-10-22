import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/server";

export async function GET(request: Request) {
  try {
    const auth = await requireAdminUser(request, ["admin", "ops"]);
    return NextResponse.json({ ok: true, email: auth.email, role: auth.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
