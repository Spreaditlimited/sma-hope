import { NextResponse } from "next/server";
import { bearerTokenFromRequest, requireAdminUser } from "@/lib/admin/server";
import { isFezConfigured, testFezConnection } from "@/lib/fez/client";

export async function POST(request: Request) {
  const token = bearerTokenFromRequest(request);
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  try {
    await requireAdminUser(token, ["admin", "ops"]);
    if (!isFezConfigured()) {
      return NextResponse.json({ ok: false, error: "FEZ credentials are missing." }, { status: 503 });
    }
    const result = await testFezConnection();
    return NextResponse.json({ ok: true, tokenExpiry: result.expiresAtIso });
  } catch (error) {
    const message = error instanceof Error ? error.message : "FEZ test failed.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
