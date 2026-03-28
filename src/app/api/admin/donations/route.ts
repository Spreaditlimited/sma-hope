import { NextResponse } from "next/server";
import { bearerTokenFromRequest, requireAdminUser, startDateForRange } from "@/lib/admin/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const token = bearerTokenFromRequest(request);
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  try {
    await requireAdminUser(token, ["admin", "ops"]);
    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "month";
    const q = String(url.searchParams.get("q") || "").trim().toLowerCase();
    const since = startDateForRange(range).toISOString();

    const admin = getSupabaseAdminClient();
    const result = await admin
      .from("donations")
      .select("id, email, amount_major, currency, donation_interval, status, paystack_reference, created_at, paid_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);

    if (result.error) throw new Error(result.error.message);

    let rows = (result.data || []) as Array<{
      id: string;
      email: string;
      amount_major: number;
      currency: string;
      donation_interval: string;
      status: string;
      paystack_reference: string;
      created_at: string;
      paid_at: string | null;
    }>;

    if (q) {
      rows = rows.filter((row) => {
        const hay = `${row.email} ${row.paystack_reference} ${row.currency} ${row.status}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load donations.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
