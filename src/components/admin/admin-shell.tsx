"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const items = [
  { label: "Overview", href: "/admin" },
  { label: "Donations", href: "/admin/donations" },
  { label: "Book Orders", href: "/admin/book-orders" },
  { label: "Donors", href: "/admin/donors" },
  { label: "Settings", href: "/admin/settings" },
] as const;

export function AdminShell({
  title,
  subtitle,
  email,
  role,
  children,
}: {
  title: string;
  subtitle?: string;
  email: string;
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCollapsed(window.localStorage.getItem("admin_sidebar_collapsed") === "1");
    setSidebarReady(true);
  }, []);

  useEffect(() => {
    if (!sidebarReady) return;
    window.localStorage.setItem("admin_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed, sidebarReady]);

  const activeHref = useMemo(() => {
    const exact = items.find((item) => item.href === pathname);
    if (exact) return exact.href;
    if (pathname.startsWith("/admin/donations")) return "/admin/donations";
    if (pathname.startsWith("/admin/book-orders")) return "/admin/book-orders";
    if (pathname.startsWith("/admin/donors")) return "/admin/donors";
    if (pathname.startsWith("/admin/settings")) return "/admin/settings";
    return "/admin";
  }, [pathname]);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/account/login");
  }

  return (
    <section className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-[#e7f2fb] to-[#d8eaf7] text-gray-900 overflow-hidden">
      {open ? <button type="button" className="fixed inset-0 z-40 bg-[#0c4669]/45 sm:hidden" onClick={() => setOpen(false)} /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 ${collapsed ? "sm:w-20" : "sm:w-72"} overflow-hidden bg-gray-950 text-white flex flex-col transform transition-all duration-300 sm:relative sm:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-full w-2/3 bg-gradient-to-r from-gray-950 to-transparent" />
        <div className={`h-16 flex items-center border-b border-white/10 ${collapsed ? "px-2 sm:justify-center" : "px-4"}`}>
          <span className={`flex items-center justify-center h-8 w-8 rounded bg-white/10 overflow-hidden ${collapsed ? "mr-0" : "mr-3"}`}>
            <Image src="/favicon.png" alt="SMA Hope icon" width={24} height={24} />
          </span>
          <span className={`font-bold text-lg ${collapsed ? "sm:hidden" : ""}`}>Admin</span>
          <button
            type="button"
            className={`hidden sm:inline-flex items-center justify-center rounded-md bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20 ${collapsed ? "ml-0" : "ml-auto"}`}
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
        <nav className="relative z-10 flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center ${collapsed ? "sm:justify-center sm:px-2" : "gap-3 px-3"} py-2.5 rounded-lg transition-colors ${
                  active ? "bg-white/15 text-white" : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-gray-500"}`} />
                <span className={`${collapsed ? "sm:hidden" : ""}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="relative z-10 border-t border-white/10 p-4">
          <div className={`mb-3 text-xs text-[#cfe3f4] uppercase tracking-wide ${collapsed ? "sm:hidden" : ""}`}>
            {role} • {email}
          </div>
          <button type="button" className="w-full inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20" onClick={signOut}>
            <span className={collapsed ? "sm:hidden" : ""}>Sign out</span>
            <span className={`${collapsed ? "hidden sm:inline" : "hidden"}`}>↩</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white/95 backdrop-blur border-b border-[#d6e6f2] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button type="button" className="sm:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen(true)} aria-label="Open menu">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{subtitle || "SMA Hope Admin"}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 admin-page-enter">{children}</main>
      </div>
    </section>
  );
}
