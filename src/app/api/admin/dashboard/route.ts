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
    const since = startDateForRange(range).toISOString();
    const admin = getSupabaseAdminClient();

    const [donationsResult, subscriptionsResult, ordersResult] = await Promise.all([
      admin.from("donations").select("amount_major, status, donation_interval, created_at"),
      admin.from("subscriptions").select("status"),
      admin.from("book_orders").select("status, total_ngn, fez_status, created_at"),
    ]);

    if (donationsResult.error) throw new Error(donationsResult.error.message);
    if (subscriptionsResult.error) throw new Error(subscriptionsResult.error.message);
    if (ordersResult.error) throw new Error(ordersResult.error.message);

    const donations = (donationsResult.data || []) as Array<{
      amount_major: number;
      status: string;
      donation_interval: string;
      created_at: string;
    }>;
    const subs = (subscriptionsResult.data || []) as Array<{ status: string }>;
    const orders = (ordersResult.data || []) as Array<{
      status: string;
      total_ngn: number;
      fez_status: string | null;
      created_at: string;
    }>;

    const donationsInRange = donations.filter((d) => d.created_at >= since);
    const ordersInRange = orders.filter((o) => o.created_at >= since);

    const totalDonationAmount = donationsInRange.reduce((sum, d) => sum + Number(d.amount_major || 0), 0);
    const recurringDonationCount = donationsInRange.filter((d) => d.donation_interval === "monthly").length;
    const oneTimeDonationCount = donationsInRange.filter((d) => d.donation_interval !== "monthly").length;
    const activeSubscriptions = subs.filter((s) => {
      const st = String(s.status || "").toLowerCase();
      return st === "active" || st === "attention";
    }).length;
    const ordersTotalAmount = ordersInRange.reduce((sum, row) => sum + Number(row.total_ngn || 0), 0);
    const pendingDeliveries = ordersInRange.filter((row) => {
      const st = String(row.fez_status || "").toLowerCase();
      return !st || !["delivered", "failed", "cancelled", "returned"].includes(st);
    }).length;

    return NextResponse.json({
      ok: true,
      range,
      snapshot: {
        donationsCount: donationsInRange.length,
        donationsAmountNgn: totalDonationAmount,
        oneTimeDonationCount,
        recurringDonationCount,
        activeSubscriptions,
        ordersCount: ordersInRange.length,
        ordersAmountNgn: ordersTotalAmount,
        pendingDeliveries,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load admin dashboard.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
