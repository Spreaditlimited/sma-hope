"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/admin/client";
import { useAdminSession } from "@/lib/admin/use-admin-session";

type Range = "day" | "week" | "month" | "year";
type OrderRow = {
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
};

export default function AdminBookOrdersPage() {
  const { loading, email, role } = useAdminSession();
  const [range, setRange] = useState<Range>("month");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    adminFetch<{ ok: boolean; rows: OrderRow[] }>(`/api/admin/book-orders?range=${range}&q=${encodeURIComponent(query)}`)
      .then((result) => {
        if (!cancelled) setRows(result.rows || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load orders.");
      });
    return () => {
      cancelled = true;
    };
  }, [loading, range, query]);

  if (loading) {
    return (
      <AdminShell title="Admin Book Orders" subtitle="Loading..." email="" role="">
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-40 w-full rounded-3xl bg-gray-200"></div>
          <div className="h-20 w-full rounded-2xl bg-gray-200"></div>
          <div className="h-[500px] w-full rounded-2xl bg-gray-200"></div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Admin Book Orders" subtitle="All purchases and delivery status" email={email} role={role}>
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-8 sm:px-10 sm:py-10 shadow-xl border border-gray-800">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-full w-1/2 bg-gradient-to-r from-gray-950 to-transparent z-0" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-4">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <span className="text-xs font-medium tracking-wide text-gray-200">Fulfillment Hub</span>
            </div>
            <h1 className="dashboard-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.06] tracking-tight !text-white">
              Book Orders
            </h1>
            <p className="mt-2 text-gray-400 max-w-xl">
              Track customer purchases, monitor delivery statuses through Fez Delivery, and manage fulfillment operations.
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
                      ? "bg-white text-[#0f557f] shadow-sm ring-1 ring-gray-200" 
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
              className="block w-full rounded-xl border-0 py-2.5 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0f557f] sm:text-sm sm:leading-6 transition-shadow" 
              style={{ paddingLeft: "3rem" }}
              placeholder="Search email, phone, tracking, or address..." 
            />
          </div>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Failed to load orders</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th scope="col" className="px-6 py-4">Date & Time</th>
                  <th scope="col" className="px-6 py-4">Buyer Details</th>
                  <th scope="col" className="px-6 py-4">Order Summary</th>
                  <th scope="col" className="px-6 py-4">Delivery Status</th>
                  <th scope="col" className="px-6 py-4">Fez Tracking</th>
                  <th scope="col" className="px-6 py-4">Payment Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const isPaid = row.status.toLowerCase() === 'success' || row.status.toLowerCase() === 'paid';
                  const isPendingDelivery = !row.fez_status || row.fez_status.toLowerCase() === 'pending';

                  return (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* Date */}
                      <td className="px-6 py-5 align-top whitespace-nowrap">
                        <p className="font-medium text-gray-900">{new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-gray-500 mt-1">{new Date(row.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>

                      {/* Buyer */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e7f2fb] text-[#0f557f] ring-1 ring-[#c9ddec]">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{row.email}</p>
                            <p className="text-gray-500 mt-1 flex items-center gap-1.5">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                              {row.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Order Summary */}
                      <td className="px-6 py-5 align-top">
                        <p className="font-bold text-gray-900 tracking-tight">₦{Number(row.total_ngn || 0).toLocaleString()}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            Qty: {row.quantity}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e7f2fb] text-[#0f557f] border border-[#c9ddec] capitalize">
                            {row.delivery_area?.replace("_", " ")}
                          </span>
                        </div>
                      </td>

                      {/* Delivery Status */}
                      <td className="px-6 py-5 align-top max-w-xs">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {/* Payment Status */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isPaid ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </span>

                          {/* Logistics Status */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            isPendingDelivery ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-[#e7f2fb] text-[#0f557f] border-[#c9ddec]'
                          }`}>
                            {row.fez_status ? row.fez_status.charAt(0).toUpperCase() + row.fez_status.slice(1) : "Pending"}
                          </span>
                        </div>
                        
                        <div className="text-gray-500 flex items-start gap-1.5 mt-2">
                          <svg className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          <span className="leading-snug line-clamp-2" title={[row.address, row.city, row.state].filter(Boolean).join(", ")}>
                            {[row.address, row.city, row.state].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </td>

                      {/* Tracking */}
                      <td className="px-6 py-5 align-top whitespace-nowrap">
                        {row.fez_tracking_id ? (
                          <span className="inline-flex font-mono text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200">
                            {row.fez_tracking_id}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                        
                        {row.fez_tracking_url && (
                          <div className="mt-2">
                            <a 
                              href={row.fez_tracking_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center text-xs font-medium text-[#0f557f] hover:text-[#0c4669] hover:underline"
                            >
                              Track package
                              <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Payment Ref */}
                      <td className="px-6 py-5 align-top whitespace-nowrap">
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
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">No orders found</h3>
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
