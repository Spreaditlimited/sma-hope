import { NextResponse } from "next/server";
import { bearerTokenFromRequest, requireAdminUser } from "@/lib/admin/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type PersonSummary = {
  email: string;
  donation_count: number;
  donation_total_ngn: number;
  order_count: number;
  order_total_ngn: number;
  latest_activity_at: string;
};

export async function GET(request: Request) {
  const token = bearerTokenFromRequest(request);
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  try {
    await requireAdminUser(token, ["admin", "ops"]);
    const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";
    const admin = getSupabaseAdminClient();
    const [donationsResult, ordersResult] = await Promise.all([
      admin.from("donations").select("email, amount_major, created_at"),
      admin.from("book_orders").select("email, total_ngn, created_at"),
    ]);
    if (donationsResult.error) throw new Error(donationsResult.error.message);
    if (ordersResult.error) throw new Error(ordersResult.error.message);

    const map = new Map<string, PersonSummary>();
    for (const row of (donationsResult.data || []) as Array<{ email: string; amount_major: number; created_at: string }>) {
      const email = String(row.email || "").toLowerCase();
      if (!email) continue;
      const existing = map.get(email) || {
        email,
        donation_count: 0,
        donation_total_ngn: 0,
        order_count: 0,
        order_total_ngn: 0,
        latest_activity_at: row.created_at,
      };
      existing.donation_count += 1;
      existing.donation_total_ngn += Number(row.amount_major || 0);
      if (row.created_at > existing.latest_activity_at) existing.latest_activity_at = row.created_at;
      map.set(email, existing);
    }

    for (const row of (ordersResult.data || []) as Array<{ email: string; total_ngn: number; created_at: string }>) {
      const email = String(row.email || "").toLowerCase();
      if (!email) continue;
      const existing = map.get(email) || {
        email,
        donation_count: 0,
        donation_total_ngn: 0,
        order_count: 0,
        order_total_ngn: 0,
        latest_activity_at: row.created_at,
      };
      existing.order_count += 1;
      existing.order_total_ngn += Number(row.total_ngn || 0);
      if (row.created_at > existing.latest_activity_at) existing.latest_activity_at = row.created_at;
      map.set(email, existing);
    }

    let rows = [...map.values()].sort((a, b) => (a.latest_activity_at < b.latest_activity_at ? 1 : -1));
    if (q) {
      rows = rows.filter((row) => row.email.includes(q));
    }
    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load donors.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
