"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/admin/client";
import { useAdminSession } from "@/lib/admin/use-admin-session";

type PersonRow = {
  email: string;
  donation_count: number;
  donation_total_ngn: number;
  order_count: number;
  order_total_ngn: number;
  latest_activity_at: string;
};

export default function AdminDonorsPage() {
  const { loading, email, role } = useAdminSession();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<PersonRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    adminFetch<{ ok: boolean; rows: PersonRow[] }>(`/api/admin/donors?q=${encodeURIComponent(query)}`)
      .then((result) => {
        if (!cancelled) setRows(result.rows || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load donors.");
      });
    return () => {
      cancelled = true;
    };
  }, [loading, query]);

  if (loading) {
    return (
      <AdminShell title="Admin Donors & Buyers" subtitle="Loading..." email="" role="">
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-40 w-full rounded-3xl bg-gray-200"></div>
          <div className="h-20 w-full rounded-2xl bg-gray-200"></div>
          <div className="h-[500px] w-full rounded-2xl bg-gray-200"></div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Admin Donors & Buyers" subtitle="Individual supporter records" email={email} role={role}>
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-8 sm:px-10 sm:py-10 shadow-xl border border-gray-800">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-500/15 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-full w-1/2 bg-gradient-to-r from-gray-950 to-transparent z-0" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-4">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span className="text-xs font-medium tracking-wide text-gray-200">Supporter Directory</span>
            </div>
            <h1 className="dashboard-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.06] tracking-tight !text-white">
              Donors & Buyers
            </h1>
            <p className="mt-2 text-gray-400 max-w-xl">
              View consolidated records of all individuals who have contributed to or purchased from the foundation.
            </p>
          </div>
        </section>

        {/* Search Bar */}
        <section className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-gray-900/5">
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="block w-full rounded-xl border-0 py-2.5 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6 transition-shadow" 
              style={{ paddingLeft: "3rem" }}
              placeholder="Search by email address..." 
            />
          </div>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Failed to load directory</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th scope="col" className="px-6 py-4">Supporter Email</th>
                  <th scope="col" className="px-6 py-4">Donations History</th>
                  <th scope="col" className="px-6 py-4">Book Orders</th>
                  <th scope="col" className="px-6 py-4">Latest Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.email} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Supporter Email */}
                    <td className="px-6 py-5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                          <span className="font-semibold text-xs uppercase">{row.email.charAt(0)}</span>
                        </div>
                        <p className="font-medium text-gray-900">{row.email}</p>
                      </div>
                    </td>

                    {/* Donations History */}
                    <td className="px-6 py-5 align-middle">
                      {row.donation_count > 0 ? (
                        <div>
                          <p className="font-bold text-gray-900 tracking-tight">
                            ₦{Number(row.donation_total_ngn || 0).toLocaleString()}
                          </p>
                          <p className="text-gray-500 mt-1 flex items-center gap-1.5 text-xs font-medium">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {row.donation_count} {row.donation_count === 1 ? 'donation' : 'donations'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>

                    {/* Book Orders */}
                    <td className="px-6 py-5 align-middle">
                      {row.order_count > 0 ? (
                        <div>
                          <p className="font-bold text-gray-900 tracking-tight">
                            ₦{Number(row.order_total_ngn || 0).toLocaleString()}
                          </p>
                          <p className="text-gray-500 mt-1 flex items-center gap-1.5 text-xs font-medium">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {row.order_count} {row.order_count === 1 ? 'order' : 'orders'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>

                    {/* Latest Activity */}
                    <td className="px-6 py-5 align-middle whitespace-nowrap">
                      <p className="font-medium text-gray-900">
                        {new Date(row.latest_activity_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        {new Date(row.latest_activity_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {!rows.length && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4 ring-1 ring-gray-100">
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">No supporters found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try searching for a different email address.</p>
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
