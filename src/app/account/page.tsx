"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountWorkspaceShell } from "@/components/account/workspace-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAccountSession } from "@/lib/supabase/use-account-session";

export default function AccountPage() {
  const { loading, email } = useAccountSession();
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    orderCount: 0,
  });

  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    async function loadStats() {
      const supabase = getSupabaseBrowserClient();

      const [donationsResult, ordersResult] = await Promise.all([
        supabase.from("donations").select("amount_major"),
        supabase.from("book_orders").select("id"),
      ]);

      if (cancelled) return;
      if (donationsResult.error || ordersResult.error) return;

      const donations = donationsResult.data || [];
      const orders = ordersResult.data || [];
      const totalDonated = donations.reduce((sum, row) => sum + Number((row as { amount_major: number }).amount_major || 0), 0);

      setStats({
        totalDonated,
        donationCount: donations.length,
        orderCount: orders.length,
      });
    }

    loadStats().catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [loading]);

  if (loading) {
    return (
      <AccountWorkspaceShell title="SMA Hope Workspace" subtitle="Loading..." email="">
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-48 w-full rounded-3xl bg-gray-200"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-200"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        </div>
      </AccountWorkspaceShell>
    );
  }

  return (
    <AccountWorkspaceShell title="SMA Hope Workspace" subtitle={email} email={email}>
      <div className="w-full max-w-6xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-10 sm:px-12 sm:py-14 shadow-2xl border border-gray-800">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#0f557f]/25 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-full w-1/2 bg-gradient-to-r from-gray-950 to-transparent z-0" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-medium tracking-wide text-gray-200">Impact Dashboard</span>
            </div>
            <h1 className="dashboard-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.06] tracking-tight !text-white">
              Welcome back
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl leading-relaxed">
              Manage your impact, oversee recurring subscriptions, and track your book orders from a centralized workspace.
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Card 1 */}
          <article className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Donated</p>
              <div className="rounded-lg bg-[#e7f2fb] p-2 text-[#0f557f] ring-1 ring-[#0f557f]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">₦{stats.totalDonated.toLocaleString()}</p>
          </article>

          {/* Card 2 */}
          <article className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Donation Records</p>
              <div className="rounded-lg bg-[#e7f2fb] p-2 text-[#0f557f] ring-1 ring-[#0f557f]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">{stats.donationCount}</p>
          </article>

          {/* Card 3 */}
          <article className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Book Orders</p>
              <div className="rounded-lg bg-[#e7f2fb] p-2 text-[#0f557f] ring-1 ring-[#0f557f]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">{stats.orderCount}</p>
          </article>
        </section>

        {/* Action Links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/account/donations" className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:ring-[#0f557f]/45 hover:shadow-md">
            <div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">Review all successful one-time and recurring payments.</p>
            </div>
            <span className="mt-6 flex items-center text-sm font-semibold text-[#0f557f]">
              View records <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </Link>

          <Link href="/account/donations" className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:ring-[#0f557f]/45 hover:shadow-md">
            <div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recurring Donations</h2>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">Start and manage monthly donation plans inside Donations.</p>
            </div>
            <span className="mt-6 flex items-center text-sm font-semibold text-[#0f557f]">
              Open donations <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </Link>

          <Link href="/account/orders" className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:ring-[#0f557f]/45 hover:shadow-md">
            <div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Track Orders</h2>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">View order status, download receipts, and track shipments.</p>
            </div>
            <span className="mt-6 flex items-center text-sm font-semibold text-[#0f557f]">
              View orders <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </Link>
        </section>

      </div>
    </AccountWorkspaceShell>
  );
}
