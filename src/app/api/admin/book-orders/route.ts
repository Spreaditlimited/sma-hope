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
      .from("book_orders")
      .select("id, email, status, total_ngn, quantity, phone, address, city, state, delivery_area, note, paystack_reference, fez_tracking_id, fez_status, fez_tracking_url, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);
    if (result.error) throw new Error(result.error.message);

    let rows = (result.data || []) as Array<{
      id: string;
      email: string;
      status: string;
      total_ngn: number;
      quantity: number;
      phone: string;
      address: string;
      city: string;
      state: string;
      delivery_area: string;
      note: string;
      paystack_reference: string;
      fez_tracking_id: string | null;
      fez_status: string | null;
      fez_tracking_url: string | null;
      created_at: string;
    }>;

    if (q) {
      rows = rows.filter((row) => {
        const hay = `${row.email} ${row.phone} ${row.paystack_reference} ${row.fez_tracking_id || ""} ${row.address} ${row.city} ${row.state}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load book orders.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
