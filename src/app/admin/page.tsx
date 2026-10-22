"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/admin/client";
import { useAdminSession } from "@/lib/admin/use-admin-session";
import { formatMoney, displayDate } from "@/lib/dashboard";
import { Icon } from "@/components/icon";
type Range = "day" | "week" | "month" | "year";
type Payload = {
  snapshot: {
    donationsCount: number;
    donationsByCurrency: Record<string, number>;
    oneTimeDonationCount: number;
    recurringDonationCount: number;
    activeSubscriptions: number;
    ordersCount: number;
    ordersAmountNgn: number;
    pendingDeliveries: number;
  };
  recentActivity: {
    id: string;
    kind: string;
    email: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }[];
};
const ranges: Record<Range, string> = {
  day: "24 hours",
  week: "7 days",
  month: "30 days",
  year: "365 days",
};
export default function AdminPage() {
  const { loading, email, role } = useAdminSession();
  const [range, setRange] = useState<Range>("month");
  const [loaded, setLoaded] = useState<{ range: Range; data: Payload } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    adminFetch<Payload>(`/api/admin/dashboard?range=${range}`)
      .then((data) => {
        if (!cancelled) {
          setLoaded({ range, data });
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load dashboard.");
      });
    return () => {
      cancelled = true;
    };
  }, [loading, range, attempt]);
  const data = loaded?.range === range ? loaded.data : null;
  const s = data?.snapshot;
  return (
    <AdminShell
      title="Foundation overview"
      subtitle="A clear view of giving, book orders, and what needs attention."
      email={email}
      role={role}
    >
      <div className="dashboard-toolbar">
        <p>
          <span className="live-dot" />
          Reporting period <strong>Last {ranges[range]}</strong>
        </p>
        <div className="filter-tabs" aria-label="Reporting period">
          {(Object.keys(ranges) as Range[]).map((r) => (
            <button
              key={r}
              aria-pressed={r === range}
              onClick={() => {
                setRange(r);
                setError("");
              }}
            >
              {ranges[r]}
            </button>
          ))}
        </div>
        <button
          className="text-link"
          onClick={() => {
            setLoaded(null);
            setError("");
            setAttempt((a) => a + 1);
          }}
        >
          Refresh ↻
        </button>
      </div>
      {error && (
        <div role="alert" className="data-error">
          <p>{error}</p>
          <button
            onClick={() => {
              setError("");
              setAttempt((a) => a + 1);
            }}
          >
            Try again
          </button>
        </div>
      )}
      <div className="metric-grid">
        <div className="metric">
          <span>Successful donations</span>
          <Icon name="heart" />
          <strong>
            {!s
              ? "—"
              : Object.keys(s.donationsByCurrency).length
                ? Object.entries(s.donationsByCurrency).map(([c, v]) => (
                    <span key={c}>{formatMoney(v, c)}</span>
                  ))
                : formatMoney(0)}
          </strong>
          <small>Totals kept separate by currency</small>
        </div>
        <div className="metric">
          <span>Donation payments</span>
          <Icon name="file" />
          <strong>{s?.donationsCount ?? "—"}</strong>
          <small>Successful payments in this period</small>
        </div>
        <div className="metric">
          <span>Book revenue</span>
          <Icon name="book" />
          <strong>{s ? formatMoney(s.ordersAmountNgn) : "—"}</strong>
          <small>{s?.ordersCount ?? "—"} paid orders in this period</small>
        </div>
        <div className="metric">
          <span>Active giving plans</span>
          <Icon name="people" />
          <strong>{s?.activeSubscriptions ?? "—"}</strong>
          <small>Current active subscriptions · all time</small>
        </div>
      </div>
      <div className="dashboard-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2>Recent transactions</h2>
            <Link href="/admin/donations">View donations →</Link>
          </div>
          {!data && !error ? (
            <div className="data-loading" role="status">
              Loading foundation activity…
            </div>
          ) : data?.recentActivity.length ? (
            <div className="activity-list">
              {data.recentActivity.map((e) => (
                <Link
                  key={e.kind + e.id}
                  href={e.kind === "donation" ? "/admin/donations" : "/admin/book-orders"}
                >
                  <span className="activity-icon">
                    <Icon name={e.kind === "donation" ? "heart" : "box"} />
                  </span>
                  <div>
                    <strong>{e.email}</strong>
                    <span>
                      {e.kind === "donation" ? "Donation" : "Book order"} ·{" "}
                      {displayDate(e.created_at)}
                    </span>
                  </div>
                  <div>
                    <strong>{formatMoney(e.amount, e.currency)}</strong>
                    <span className="status-badge">{e.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <Icon name="file" size={32} />
              <h3>{error ? "Activity unavailable" : "No transactions in this period"}</h3>
              <p>
                {error
                  ? "Retry the request to load current records."
                  : "Choose a wider reporting period to see earlier activity."}
              </p>
            </div>
          )}
        </section>
        <div className="dashboard-side">
          <section className="workspace-panel attention-panel">
            <p className="eyebrow">Operations</p>
            <h2>Orders to follow up</h2>
            <strong className="attention-count">{s?.pendingDeliveries ?? "—"}</strong>
            <p>Paid orders awaiting delivery or needing dispatch follow-up across all time.</p>
            <Link href="/admin/book-orders" className="text-link">
              Open fulfilment workspace →
            </Link>
          </section>
          <section className="workspace-panel">
            <div className="panel-heading">
              <h2>Giving mix</h2>
            </div>
            <div className="giving-mix">
              <div>
                <span>One-time</span>
                <strong>{s?.oneTimeDonationCount ?? "—"}</strong>
              </div>
              <div>
                <span>Recurring</span>
                <strong>{s?.recurringDonationCount ?? "—"}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>
      <section className="workspace-panel editorial-dashboard">
        <div>
          <p className="eyebrow">Knowledge & trust</p>
          <h2>Keep the information as strong as the mission.</h2>
          <p>Review guide sources, clinical-review status, and the public reading experience.</p>
        </div>
        <Link href="/admin/content" className="btn btn-secondary">
          Open content library <Icon name="arrow" size={16} />
        </Link>
      </section>
    </AdminShell>
  );
}
