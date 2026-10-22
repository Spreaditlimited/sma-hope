import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/server";
import { getDatabase } from "@/lib/database/store";
import { allRows } from "@/lib/admin/pagination";
import { donationTotals, isSuccessful } from "@/lib/dashboard";
type Donation = {
  id: string;
  email: string;
  amount_major: number;
  currency: string;
  status: string;
  created_at: string;
};
type Order = { id: string; email: string; total_ngn: number; status: string; created_at: string };
export async function GET(request: Request) {
  try {
    await requireAdminUser(request, ["admin", "ops"]);
    const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";
    const db = getDatabase();
    const [donations, orders] = await Promise.all([
      allRows<Donation>((from, to) =>
        db
          .from("donations")
          .select("id,email,amount_major,currency,status,created_at")
          .order("id")
          .range(from, to),
      ),
      allRows<Order>((from, to) =>
        db
          .from("book_orders")
          .select("id,email,total_ngn,status,created_at")
          .order("id")
          .range(from, to),
      ),
    ]);
    const emails = new Set([
      ...donations.map((d) => d.email.toLowerCase()),
      ...orders.map((o) => o.email.toLowerCase()),
    ]);
    const rows = [...emails]
      .filter((email) => email && email.includes(q))
      .map((email) => {
        const d = donations.filter((d) => d.email.toLowerCase() === email);
        const o = orders.filter((o) => o.email.toLowerCase() === email);
        const totals = donationTotals(d);
        return {
          email,
          donation_count: d.filter((d) => isSuccessful(d.status)).length,
          donation_totals: totals,
          donation_total_ngn: totals.NGN || 0,
          order_count: o.filter((o) => isSuccessful(o.status)).length,
          order_total_ngn: o
            .filter((o) => isSuccessful(o.status))
            .reduce((sum, o) => sum + Number(o.total_ngn), 0),
          latest_activity_at:
            [...d, ...o]
              .map((r) => r.created_at)
              .sort()
              .at(-1) || "",
        };
      })
      .sort((a, b) => b.latest_activity_at.localeCompare(a.latest_activity_at));
    return NextResponse.json(
      { ok: true, rows },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load supporters.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      {
        ok: false,
        error: status === 500 ? "Unable to load supporters. Please try again." : message,
      },
      { status },
    );
  }
}
