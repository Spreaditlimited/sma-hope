"use client";

import { useEffect, useState } from "react";
import { AccountWorkspaceShell } from "@/components/account/workspace-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAccountSession } from "@/lib/supabase/use-account-session";

type BookOrderRow = {
  id: string;
  status: string;
  total_ngn: number;
  quantity: number;
  fez_tracking_url: string | null;
  fez_status: string | null;
  created_at: string;
};

export default function OrdersPage() {
  const { loading, email } = useAccountSession();
  const [fullName, setFullName] = useState("");
  const [rows, setRows] = useState<BookOrderRow[]>([]);
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState<"lagos" | "outside_lagos">("lagos");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    async function loadRows() {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase
        .from("book_orders")
        .select("id, status, total_ngn, quantity, fez_tracking_url, fez_status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!cancelled && !result.error) {
        setRows((result.data || []) as BookOrderRow[]);
      }

      const profileResult = await supabase
        .from("donor_accounts")
        .select("full_name")
        .eq("email", email)
        .maybeSingle();

      if (!cancelled && !profileResult.error) {
        const name = String((profileResult.data as { full_name?: string } | null)?.full_name || "");
        setFullName(name);
      }
    }

    loadRows().catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [loading, email]);

  async function handleOrderBook() {
    setActionError("");
    setActionNotice("");
    if (!fullName || !phone || !city || !stateValue || !address) {
      setActionError("Please complete all required fields before continuing.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/payments/book/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          source: "account",
          phone,
          quantity,
          city,
          state: stateValue,
          address,
          deliveryArea,
          note,
        }),
      });

      const json = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; authorizationUrl?: string }
        | null;
      if (!response.ok || !json?.ok || !json.authorizationUrl) {
        setActionError(json?.error || "Unable to start checkout for this order.");
        return;
      }

      window.location.assign(json.authorizationUrl);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const reference = params.get("reference") || params.get("trxref");
    if (status !== "success" || !reference) return;

    let cancelled = false;
    async function completePayment() {
      const response = await fetch("/api/payments/paystack/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const json = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      if (cancelled) return;

      if (!response.ok || !json?.ok) {
        setActionNotice("Payment received. Order confirmation is in progress.");
        window.history.replaceState({}, "", "/account/orders");
        return;
      }

      setActionNotice("Thank you. Your order payment was successful.");
      window.history.replaceState({}, "", "/account/orders");
    }

    completePayment().catch(() => {
      if (!cancelled) {
        setActionNotice("Payment received. Order confirmation is in progress.");
        window.history.replaceState({}, "", "/account/orders");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!actionError && !actionNotice) return;
    const timeout = window.setTimeout(() => {
      setActionError("");
      setActionNotice("");
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [actionError, actionNotice]);

  if (loading) {
    return (
      <AccountWorkspaceShell title="Book Orders" subtitle="Loading..." email="">
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-pulse">
          <div className="h-48 w-full rounded-3xl bg-gray-200"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 w-full rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        </div>
      </AccountWorkspaceShell>
    );
  }

  return (
    <AccountWorkspaceShell title="Book Orders" subtitle="Track your purchases" email={email}>
      <div className="w-full max-w-5xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-10 sm:px-12 sm:py-14 shadow-2xl border border-gray-800">
          {/* Subtle amber glow for the orders page identity */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-full w-1/2 bg-gradient-to-r from-gray-950 to-transparent z-0" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-6">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <span className="text-xs font-medium tracking-wide text-gray-200">Purchase History</span>
            </div>
            <h1 className="dashboard-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.06] tracking-tight !text-white">
              Book Orders
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl leading-relaxed">
              Review your order details, check delivery statuses, and track shipment progress all in one place.
            </p>
          </div>
        </section>

        {(actionError || actionNotice) && (
          <div className={`rounded-2xl p-4 border flex items-start gap-3 ${
            actionError ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
          }`}>
            {actionError ? (
              <svg className="h-5 w-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${actionError ? "text-red-800" : "text-emerald-800"}`}>
                {actionError ? "Action failed" : "Success"}
              </h3>
              <p className={`mt-1 text-sm ${actionError ? "text-red-700" : "text-emerald-700"}`}>
                {actionError || actionNotice}
              </p>
            </div>
          </div>
        )}

        <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-gray-900/5">

          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order more copies</h2>
              <p className="mt-1 text-sm text-gray-500">Place a new Nigeria hard-copy order from your account.</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Full name" />
            <input value={email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500" placeholder="Email" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Phone number" />
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value || 1))} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Quantity" />
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="City" />
            <input value={stateValue} onChange={(e) => setStateValue(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="State" />
            <select
              value={deliveryArea}
              onChange={(e) => setDeliveryArea(e.target.value === "outside_lagos" ? "outside_lagos" : "lagos")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
            >
              <option value="lagos">Within Lagos</option>
              <option value="outside_lagos">Outside Lagos</option>
            </select>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Order note (optional)" />
          </div>

          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-3 w-full px-4 py-3 rounded-xl border border-gray-200"
            rows={3}
            placeholder="Delivery address"
          />

          <div className="mt-3">
            <button type="button" className="btn btn-primary" onClick={handleOrderBook} disabled={isSubmitting}>
              {isSubmitting ? "Starting..." : "Continue with Paystack"}
            </button>
          </div>
        </section>

        {/* Orders List */}
        <section className="space-y-4">
          {rows.length > 0 ? (
            rows.map((row) => (
              <article 
                key={row.id} 
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10"
              >
                <div className="flex items-start sm:items-center gap-5">
                  <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-100 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 01-.567-.969V4.518c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 01.567.969v8.239z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.768V21M3 16.811c0 .864.933 1.405 1.683.977l7.108-4.062a1.125 1.125 0 00.567-.969V4.518c0-.864-.933-1.405-1.683-.977L3.567 8.604A1.125 1.125 0 003 9.573v7.238z"></path></svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-xl font-bold tracking-tight text-gray-900">
                        ₦{Number(row.total_ngn).toLocaleString()}
                      </p>
                      <span className="text-sm font-medium text-gray-500">• Qty: {row.quantity}</span>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {/* Order Status Badge */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        row.status.toLowerCase() === 'success' || row.status.toLowerCase() === 'paid'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          row.status.toLowerCase() === 'success' || row.status.toLowerCase() === 'paid' ? 'bg-green-500' : 'bg-amber-500'
                        }`}></span>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>

                      {/* Delivery Status Badge */}
                      {row.fez_status && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                          Delivery: {row.fez_status}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 flex items-center text-sm text-gray-400">
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {row.fez_tracking_url && (
                  <div className="mt-4 md:mt-0 md:ml-4 shrink-0">
                    <a
                      href={row.fez_tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-200 transition-all hover:bg-gray-100 hover:ring-gray-300"
                    >
                      Track shipment
                      <svg className="ml-2 -mr-0.5 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 px-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No book orders found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                You haven&apos;t purchased any books yet. Once you place an order, the tracking details will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </AccountWorkspaceShell>
  );
}
