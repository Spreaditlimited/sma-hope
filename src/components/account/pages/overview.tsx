"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountWorkspaceShell } from "@/components/account/workspace-shell";
import { Icon } from "@/components/icon";
import { accountData } from "@/lib/auth/client";
import { useAccountSession } from "@/lib/auth/use-account-session";
import { donationTotals, formatMoney, displayDate, isSuccessful } from "@/lib/dashboard";
type Donation = {
  id: string;
  amount_major: number;
  currency: string;
  status: string;
  created_at: string;
  donation_interval: string;
};
type Order = {
  id: string;
  total_ngn: number;
  status: string;
  fez_status: string | null;
  created_at: string;
};
type Data = { donations: Donation[]; orders: Order[]; activePlans: number };
export default function AccountPage() {
  const { loading, email } = useAccountSession();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    async function load() {
      const result = await accountData();
      if (!cancelled) {setData({donations:result.donations,orders:result.orders,activePlans:result.activePlans});setError("");}

    }
    load().catch((e) => {
      if (!cancelled) setError(e.message);
    });
    return () => {
      cancelled = true;
    };
  }, [loading, attempt]);
  const totals = donationTotals(data?.donations || []);
  const events = [
    ...(data?.donations || []).map((d) => ({
      id: d.id,
      title: d.donation_interval === "monthly" ? "Monthly donation" : "One-time donation",
      amount: formatMoney(Number(d.amount_major), d.currency),
      status: d.status,
      date: d.created_at,
      href: "/account/donations",
    })),
    ...(data?.orders || []).map((o) => ({
      id: o.id,
      title: "Book order",
      amount: formatMoney(Number(o.total_ngn)),
      status: o.fez_status || o.status,
      date: o.created_at,
      href: "/account/orders",
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  return (
    <AccountWorkspaceShell
      title="Welcome back"
      subtitle="Your giving, your orders, and a shared purpose. All in one place."
      email={email}
    >
      <div className="dashboard-welcome">
        <div>
          <p className="eyebrow">A community built on care</p>
          <h2>
            Thank you for standing
            <br />
            with families.
          </h2>
          <p>Every act of support helps carry the foundation’s work forward.</p>
          <Link href="/transparency" className="text-link">
            See our commitment to transparency →
          </Link>
        </div>
        <Icon name="heart" size={120} />
      </div>
      {error ? (
        <div className="data-error" role="alert">
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
      ) : null}
      <div className="metric-grid">
        <div className="metric">
          <span>Successful giving</span>
          <Icon name="heart" />
          <strong>
            {!data
              ? "—"
              : Object.keys(totals).length
                ? Object.entries(totals).map(([c, v]) => <span key={c}>{formatMoney(v, c)}</span>)
                : formatMoney(0)}
          </strong>
          <small>Across your latest 100 donation records</small>
        </div>
        <div className="metric">
          <span>Donations made</span>
          <Icon name="file" />
          <strong>
            {data ? data.donations.filter((d) => isSuccessful(d.status)).length : "—"}
          </strong>
          <small>Successful payments in your recent records</small>
        </div>
        <div className="metric">
          <span>Active giving plans</span>
          <Icon name="heart" />
          <strong>{data ? data.activePlans : "—"}</strong>
          <small>
            <Link href="/account/donations">Manage recurring donations →</Link>
          </small>
        </div>
        <div className="metric">
          <span>Book orders</span>
          <Icon name="box" />
          <strong>{data ? data.orders.length : "—"}</strong>
          <small>
            <Link href="/account/orders">View your recent orders →</Link>
          </small>
        </div>
      </div>
      <div className="dashboard-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2>Recent activity</h2>
            <span>Latest five records</span>
          </div>
          {!data && !error ? (
            <div className="data-loading" role="status">
              Loading your activity…
            </div>
          ) : events.length ? (
            <div className="activity-list">
              {events.map((e) => (
                <Link href={e.href} key={e.id}>
                  <span className="activity-icon">
                    <Icon name={e.href.endsWith("orders") ? "box" : "heart"} />
                  </span>
                  <div>
                    <strong>{e.title}</strong>
                    <span>{displayDate(e.date)}</span>
                  </div>
                  <div>
                    <strong>{e.amount}</strong>
                    <span className="status-badge">{e.status.replaceAll("_", " ")}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : !error ? (
            <div className="dashboard-empty">
              <Icon name="heart" size={32} />
              <h3>Your story of support starts here.</h3>
              <p>Donations and book orders linked to your account will appear here.</p>
              <Link href="/donate" className="text-link">
                Make your first donation →
              </Link>
            </div>
          ) : (
            <p className="data-loading">Activity is unavailable until we reconnect.</p>
          )}
        </section>
        <section className="workspace-panel resource-panel">
          <p className="eyebrow">Keep learning</p>
          <Icon name="book" size={38} />
          <h2>
            Small steps.
            <br />
            Better understanding.
          </h2>
          <p>Practical guides for families, friends, and communities navigating SMA.</p>
          <Link href="/blog" className="btn btn-secondary">
            Explore the knowledge hub ↗
          </Link>
          <Link href="/contact" className="text-link">
            Need help with your account?
          </Link>
        </section>
      </div>
    </AccountWorkspaceShell>
  );
}
