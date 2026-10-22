import { allRows } from "@/lib/admin/pagination";
import { NextResponse } from "next/server";
import { requireAdminUser, startDateForRange } from "@/lib/admin/server";
import { getDatabase } from "@/lib/database/store";
import { donationTotals, isSuccessful } from "@/lib/dashboard";

type Donation = {
  id: string;
  email: string;
  amount_major: number;
  currency: string;
  status: string;
  donation_interval: string;
  created_at: string;
};
type Order = {
  id: string;
  email: string;
  status: string;
  total_ngn: number;
  fez_status: string | null;
  created_at: string;
};
export async function GET(request: Request) {
  try {
    await requireAdminUser(request, ["admin", "ops"]);
    const range = new URL(request.url).searchParams.get("range") || "month";
    if (!["day", "week", "month", "year"].includes(range))
      return NextResponse.json({ ok: false, error: "Invalid reporting period." }, { status: 400 });
    const since = startDateForRange(range).toISOString();
    const db = getDatabase();
    const [donations, orders, subscriptions, pending] = await Promise.all([
      allRows<Donation>((from, to) =>
        db
          .from("donations")
          .select("id,email,amount_major,currency,status,donation_interval,created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .order("id")
          .range(from, to),
      ),
      allRows<Order>((from, to) =>
        db
          .from("book_orders")
          .select("id,email,status,total_ngn,fez_status,created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .order("id")
          .range(from, to),
      ),
      db.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      db
        .from("book_orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["success", "successful", "paid", "completed"])
        .or("fez_status.is.null,fez_status.not.in.(delivered,cancelled,returned)"),
    ]);
    if (subscriptions.error || pending.error) throw new Error("Unable to load operational counts.");
    const successful = donations.filter((d) => isSuccessful(d.status));
    const paidOrders = orders.filter((o) => isSuccessful(o.status));
    const totals = donationTotals(successful);
    const activity = [
      ...donations
        .slice(0, 6)
        .map((d) => ({
          id: d.id,
          kind: "donation",
          email: d.email,
          amount: Number(d.amount_major),
          currency: d.currency,
          status: d.status,
          created_at: d.created_at,
        })),
      ...orders
        .slice(0, 6)
        .map((o) => ({
          id: o.id,
          kind: "order",
          email: o.email,
          amount: Number(o.total_ngn),
          currency: "NGN",
          status: o.status,
          created_at: o.created_at,
        })),
    ]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 6);
    return NextResponse.json(
      {
        ok: true,
        range,
        snapshot: {
          donationsCount: successful.length,
          donationsByCurrency: totals,
          donationsAmountNgn: totals.NGN || 0,
          oneTimeDonationCount: successful.filter((d) => d.donation_interval !== "monthly").length,
          recurringDonationCount: successful.filter((d) => d.donation_interval === "monthly")
            .length,
          activeSubscriptions: subscriptions.count || 0,
          ordersCount: paidOrders.length,
          ordersAmountNgn: paidOrders.reduce((sum, o) => sum + Number(o.total_ngn || 0), 0),
          pendingDeliveries: pending.count || 0,
        },
        recentActivity: activity,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load dashboard.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      {
        ok: false,
        error: status === 500 ? "Unable to load the dashboard. Please try again." : message,
      },
      { status },
    );
  }
}
