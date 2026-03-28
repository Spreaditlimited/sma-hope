"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/admin/client";
import { useAdminSession } from "@/lib/admin/use-admin-session";

type Range = "day" | "week" | "month" | "year";
type DonationRow = {
  id: string;
  email: string;
  amount_major: number;
  currency: string;
  donation_interval: string;
  status: string;
  paystack_reference: string;
  created_at: string;
};

export default function AdminDonationsPage() {
  const { loading, email, role } = useAdminSession();
  const [range, setRange] = useState<Range>("month");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<DonationRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    adminFetch<{ ok: boolean; rows: DonationRow[] }>(`/api/admin/donations?range=${range}&q=${encodeURIComponent(query)}`)
      .then((result) => {
        if (!cancelled) setRows(result.rows || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load donations.");
      });
    return () => {
      cancelled = true;
    };
  }, [loading, range, query]);

  if (loading) {
    return (
      <AdminShell title="Admin Donations" subtitle="Loading..." email="" role="">
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-40 w-full rounded-3xl bg-gray-200"></div>
          <div className="h-20 w-full rounded-2xl bg-gray-200"></div>
          <div className="h-[500px] w-full rounded-2xl bg-gray-200"></div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Admin Donations" subtitle="All donation records" email={email} role={role}>
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-8 sm:px-10 sm:py-10 shadow-xl border border-gray-800">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-full w-1/2 bg-gradient-to-r from-gray-950 to-transparent z-0" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-4">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-xs font-medium tracking-wide text-gray-200">Donations Ledger</span>
            </div>
            <h1 className="dashboard-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.06] tracking-tight !text-white">
              Financial Records
            </h1>
            <p className="mt-2 text-gray-400 max-w-xl">
              Review all incoming contributions, search by reference or email, and monitor the status of one-time and recurring donations.
            </p>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-gray-900/5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Timeframe</span>
            <div className="inline-flex bg-gray-50 p-1 rounded-xl border border-gray-200">
              {(["day", "week", "month", "year"] as Range[]).map((item) => (
                <button 
                  key={item} 
                  type="button" 
                  onClick={() => setRange(item)} 
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${
                    range === item 
                      ? "bg-white text-emerald-700 shadow-sm ring-1 ring-gray-200" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative w-full lg:w-96">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="block w-full rounded-xl border-0 py-2.5 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-shadow" 
              style={{ paddingLeft: "3rem" }}
              placeholder="Search email, reference, or status..." 
            />
          </div>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Failed to load donations</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th scope="col" className="px-6 py-4">Date & Time</th>
                  <th scope="col" className="px-6 py-4">Donor</th>
                  <th scope="col" className="px-6 py-4">Amount</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Payment Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const isSuccess = row.status.toLowerCase() === 'success' || row.status.toLowerCase() === 'succeeded';
                  const isRecurring = row.donation_interval === "monthly";

                  return (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* Date */}
                      <td className="px-6 py-5 align-middle whitespace-nowrap">
                        <p className="font-medium text-gray-900">{new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-gray-500 mt-0.5">{new Date(row.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>

                      {/* Donor */}
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                            <span className="font-semibold text-xs uppercase">{row.email.charAt(0)}</span>
                          </div>
                          <p className="font-medium text-gray-900">{row.email}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5 align-middle">
                        <p className="font-bold text-gray-900 tracking-tight">
                          {row.currency} {Number(row.amount_major || 0).toLocaleString()}
                        </p>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-5 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isRecurring 
                            ? 'bg-[#e7f2fb] text-[#0f557f] border-[#c9ddec]'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {isRecurring ? "Recurring" : "One-time"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isSuccess 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isSuccess ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </span>
                      </td>

                      {/* Payment Ref */}
                      <td className="px-6 py-5 align-middle whitespace-nowrap">
                        <span className="inline-flex font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                          {row.paystack_reference}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty State */}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4 ring-1 ring-gray-100">
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">No donations found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your timeframe or search query.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
