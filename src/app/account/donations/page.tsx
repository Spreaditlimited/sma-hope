"use client";

import { useEffect, useState } from "react";
import { AccountWorkspaceShell } from "@/components/account/workspace-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAccountSession } from "@/lib/supabase/use-account-session";

type DonationRow = {
  id: string;
  amount_major: number;
  currency: string;
  donation_interval: string;
  status: string;
  created_at: string;
};

type SubscriptionRow = {
  id: string;
  subscription_code: string;
  status: string;
  next_payment_date: string | null;
};

export default function DonationsPage() {
  const { loading, email } = useAccountSession();
  const [fullName, setFullName] = useState("");
  const [rows, setRows] = useState<DonationRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [amount, setAmount] = useState(10000);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [interval, setInterval] = useState<"one_time" | "monthly">("one_time");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [disablingId, setDisablingId] = useState("");

  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    async function loadRows() {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase
        .from("donations")
        .select("id, amount_major, currency, donation_interval, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!cancelled && !result.error) {
        setRows((result.data || []) as DonationRow[]);
      }

      const subscriptionsResult = await supabase
        .from("subscriptions")
        .select("id, subscription_code, status, next_payment_date")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled && !subscriptionsResult.error) {
        setSubscriptions((subscriptionsResult.data || []) as SubscriptionRow[]);
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

  async function handleDonate() {
    setActionError("");
    setActionNotice("");
    if (!amount || amount < 500) {
      setActionError("Please enter a valid amount (minimum ₦500).");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/payments/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          source: "account",
          location: currency === "NGN" ? "nigeria" : "international",
          interval,
          amount,
          currency,
        }),
      });

      const json = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; authorizationUrl?: string }
        | null;
      if (!response.ok || !json?.ok || !json.authorizationUrl) {
        setActionError(json?.error || "Unable to start checkout.");
        return;
      }

      window.location.assign(json.authorizationUrl);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDisableSubscription(row: SubscriptionRow) {
    setActionError("");
    setDisablingId(row.id);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";
      if (!token) return;

      const response = await fetch("/api/account/subscriptions/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionCode: row.subscription_code }),
      });
      const json = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !json?.ok) {
        setActionError(json?.error || "Unable to disable recurring donation.");
        return;
      }

      setSubscriptions((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: "disabled" } : item)));
    } finally {
      setDisablingId("");
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
      const json = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; result?: { recurring?: boolean } }
        | null;
      if (cancelled) return;

      if (!response.ok || !json?.ok) {
        setActionNotice("Payment received. Confirmation is in progress.");
        return;
      }

      setActionNotice(json.result?.recurring ? "Thank you. Your recurring donation is active." : "Thank you. Your donation was successful.");
    }

    completePayment().catch(() => {
      if (!cancelled) setActionNotice("Payment received. Confirmation is in progress.");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <AccountWorkspaceShell title="Donations" subtitle="Loading..." email="">
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-pulse">
          <div className="h-48 w-full rounded-3xl bg-gray-200"></div>
          <div className="h-40 w-full rounded-2xl bg-gray-200"></div>
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        </div>
      </AccountWorkspaceShell>
    );
  }

  return (
    <AccountWorkspaceShell title="Donations" subtitle="Your payment history" email={email}>
      <div className="w-full max-w-5xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-10 sm:px-12 sm:py-14 shadow-2xl border border-gray-800">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#0f557f]/25 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-full w-1/2 bg-gradient-to-r from-gray-950 to-transparent z-0" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-6">
              <svg className="w-4 h-4 text-[#6ea8cd]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-xs font-medium tracking-wide text-gray-200">Donation Center</span>
            </div>
            <h1 className="dashboard-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.06] tracking-tight !text-white">
              Your Contributions
            </h1>
            <p className="mt-6 text-lg text-gray-400 max-w-xl leading-relaxed">
              Manage your recurring support, make new contributions, and view your complete donation history to the SMA Hope Foundation.
            </p>
          </div>
        </section>

        {/* Alerts */}
        {(actionError || actionNotice) && (
          <div className={`rounded-2xl p-4 border flex items-start gap-3 ${
            actionError ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
          }`}>
            {actionError ? (
              <svg className="h-5 w-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${actionError ? 'text-red-800' : 'text-emerald-800'}`}>
                {actionError ? 'Action failed' : 'Success'}
              </h3>
              <p className={`mt-1 text-sm ${actionError ? 'text-red-700' : 'text-emerald-700'}`}>
                {actionError || actionNotice}
              </p>
            </div>
          </div>
        )}

        {/* Quick Donate Section */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-900/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-[#e7f2fb] opacity-60 blur-xl"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e7f2fb]">
                  <span className="h-2 w-2 rounded-full bg-[#0f557f]"></span>
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#0f557f]">Support Us</p>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Make a donation</h2>
              <p className="mt-1 text-sm text-gray-500">Choose an amount to donate directly from your dashboard.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {[5000, 10000, 25000, 50000].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`rounded-xl px-4 py-2 text-sm font-semibold border transition-all ${
                    amount === value 
                      ? "bg-[#0f557f] text-white border-[#0f557f] shadow-md shadow-[#0f557f]/25" 
                      : "bg-white text-gray-700 border-gray-200 hover:border-[#7eaecb] hover:bg-gray-50"
                  }`}
                  onClick={() => setAmount(value)}
                >
                  ₦{value.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex rounded-xl shadow-sm ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-[#0f557f]">
              <div className="flex items-center rounded-l-xl border-r border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-600">
                {currency}
              </div>
              <input
                type="number"
                min={500}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value || 0))}
                className="block w-full rounded-r-xl border-0 py-3.5 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm sm:leading-6"
                placeholder="Amount"
              />
            </div>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value === "USD" ? "USD" : "NGN")}
              className="block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-[#0f557f] sm:text-sm sm:leading-6 transition-shadow bg-white"
            >
              <option value="NGN">NGN</option>
              <option value="USD" disabled>
                USD (Coming soon)
              </option>
            </select>
            <select
              value={interval}
              onChange={(event) => setInterval(event.target.value === "monthly" ? "monthly" : "one_time")}
              className="block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-[#0f557f] sm:text-sm sm:leading-6 transition-shadow bg-white"
            >
              <option value="one_time">One-time donation</option>
              <option value="monthly">Recurring monthly</option>
            </select>
            <button type="button" className="btn btn-primary" onClick={handleDonate} disabled={isSubmitting}>
              {isSubmitting ? "Starting..." : "Continue with Paystack"}
            </button>
          </div>
        </section>

        {/* Active Subscriptions Section (Only show if there are subscriptions) */}
        {subscriptions.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 px-1">Active Plans</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {subscriptions.map((row) => {
                const isActive = row.status.toLowerCase() === "active";
                const isDisabled = row.status === "disabled" || row.status === "cancelled";

                return (
                  <article key={row.id} className="relative flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isActive ? 'bg-[#e7f2fb] text-[#0f557f]' : 'bg-gray-50 text-gray-400'}`}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
                        </div>
                        <div>
                          <p className="font-bold font-mono text-gray-900">{row.subscription_code}</p>
                          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                            isActive ? 'bg-green-50 text-green-700 border-green-200' : isDisabled ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            <span className={`w-1 h-1 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : isDisabled ? 'bg-gray-400' : 'bg-amber-500'}`}></span>
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {!isDisabled && (
                        <button
                          type="button"
                          onClick={() => handleDisableSubscription(row)}
                          disabled={disablingId === row.id}
                          className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                          {disablingId === row.id ? "Disabling..." : "Cancel plan"}
                        </button>
                      )}
                    </div>
                    
                    {row.next_payment_date && !isDisabled && (
                      <div className="mt-2 flex items-center text-sm text-gray-500 bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                        <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Next billing date: <span className="font-medium text-gray-900 ml-1">{new Date(row.next_payment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Donations List */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 px-1">Recent Transactions</h2>
          {rows.length > 0 ? (
            rows.map((row) => (
              <article 
                key={row.id} 
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10"
              >
                <div className="flex items-center gap-5">
                  <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-100 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold tracking-tight text-gray-900">
                        {row.currency} {Number(row.amount_major).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    row.status.toLowerCase() === 'success' || row.status.toLowerCase() === 'succeeded'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      row.status.toLowerCase() === 'success' || row.status.toLowerCase() === 'succeeded' ? 'bg-green-500' : 'bg-amber-500'
                    }`}></span>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    row.donation_interval === "monthly" 
                      ? 'bg-[#e7f2fb] text-[#0c4669] border-[#c9ddec]'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {row.donation_interval === "monthly" ? "Recurring" : "One-time"}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 px-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No donations found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                You haven&apos;t made any contributions yet. When you do, they will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </AccountWorkspaceShell>
  );
}
