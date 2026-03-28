"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/admin/client";
import { useAdminSession } from "@/lib/admin/use-admin-session";

type Range = "day" | "week" | "month" | "year";

type DashboardPayload = {
  ok: boolean;
  snapshot: {
    donationsCount: number;
    donationsAmountNgn: number;
    oneTimeDonationCount: number;
    recurringDonationCount: number;
    activeSubscriptions: number;
    ordersCount: number;
    ordersAmountNgn: number;
    pendingDeliveries: number;
  };
};

export default function AdminOverviewPage() {
  const { loading, email, role } = useAdminSession();
  const [range, setRange] = useState<Range>("month");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardPayload["snapshot"] | null>(null);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    adminFetch<DashboardPayload>(`/api/admin/dashboard?range=${range}`)
      .then((result) => {
        if (!cancelled) setStats(result.snapshot);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load.");
      });
    return () => {
      cancelled = true;
    };
  }, [loading, range]);

  if (loading) {
    return (
      <AdminShell title="Admin Dashboard" subtitle="Loading..." email="" role="">
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-40 w-full rounded-3xl bg-gray-200"></div>
          <div className="h-16 w-full max-w-md rounded-2xl bg-gray-200"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-200"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Admin Dashboard" subtitle="Snapshot and operations" email={email} role={role}>
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-8 sm:px-10 sm:py-10 shadow-xl border border-gray-800">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-full w-1/2 bg-gradient-to-r from-gray-950 to-transparent z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-4">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <span className="text-xs font-medium tracking-wide text-gray-200">Control Center</span>
              </div>
              <h1 className="dashboard-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.06] tracking-tight !text-white">
                Platform Overview
              </h1>
              <p className="mt-2 text-gray-400 max-w-xl">
                Monitor donation inflows, active subscriptions, and book order fulfillment across the foundation.
              </p>
            </div>

            {/* Range Selector */}
            <div className="flex flex-col gap-2 shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide md:text-right">Timeframe</span>
              <div className="inline-flex bg-gray-900/50 p-1 rounded-xl border border-gray-800 backdrop-blur-sm">
                {(["day", "week", "month", "year"] as Range[]).map((item) => (
                  <button 
                    key={item} 
                    type="button" 
                    onClick={() => setRange(item)} 
                    className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                      range === item 
                        ? "bg-[#0f557f] text-white shadow-sm" 
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Primary Metrics (Value & Volume) */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Donation Value */}
          <article className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-[#0f557f]/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Donation Value</p>
              <div className="rounded-lg bg-[#e7f2fb] p-2 text-[#0f557f] ring-1 ring-[#0f557f]/20 group-hover:bg-[#0f557f] group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">₦{Number(stats?.donationsAmountNgn || 0).toLocaleString()}</p>
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <span>Over the last {range}</span>
            </div>
          </article>

          {/* Donation Volume */}
          <article className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-[#0f557f]/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Donations</p>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 ring-1 ring-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{stats?.donationsCount || 0}</p>
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <span>Transactions processed</span>
            </div>
          </article>

          {/* Order Value */}
          <article className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-[#0f557f]/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Order Value</p>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600 ring-1 ring-amber-500/20 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">₦{Number(stats?.ordersAmountNgn || 0).toLocaleString()}</p>
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <span>Revenue from books</span>
            </div>
          </article>

          {/* Order Volume */}
          <article className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-[#0f557f]/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Book Orders</p>
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 ring-1 ring-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{stats?.ordersCount || 0}</p>
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <span>Orders placed</span>
            </div>
          </article>
        </section>

        {/* Secondary Metrics (Breakdowns & Statuses) */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <article className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 hover:bg-gray-50 transition-colors">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e7f2fb] text-[#0f557f]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Recurring</p>
              <p className="mt-0.5 text-2xl font-bold text-gray-900">{stats?.recurringDonationCount || 0}</p>
            </div>
          </article>

          <article className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 hover:bg-gray-50 transition-colors">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">One-time</p>
              <p className="mt-0.5 text-2xl font-bold text-gray-900">{stats?.oneTimeDonationCount || 0}</p>
            </div>
          </article>

          <article className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 hover:bg-gray-50 transition-colors">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Plans</p>
              <p className="mt-0.5 text-2xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</p>
            </div>
          </article>

          <article className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 hover:bg-gray-50 transition-colors">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Delivery</p>
              <div className="flex items-baseline gap-2">
                <p className="mt-0.5 text-2xl font-bold text-gray-900">{stats?.pendingDeliveries || 0}</p>
                {(stats?.pendingDeliveries || 0) > 0 && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </div>
            </div>
          </article>
        </section>

      </div>
    </AdminShell>
  );
}
