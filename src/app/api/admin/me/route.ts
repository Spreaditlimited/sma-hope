import { NextResponse } from "next/server";
import { bearerTokenFromRequest, requireAdminUser } from "@/lib/admin/server";

export async function GET(request: Request) {
  const token = bearerTokenFromRequest(request);
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  try {
    const auth = await requireAdminUser(token, ["admin", "ops"]);
    return NextResponse.json({ ok: true, email: auth.email, role: auth.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
