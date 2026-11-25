"use client";
import learningStyles from "@/components/learning/learning.module.css";
import { ThemePicker } from "@/components/theme-provider";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import { accountAuth, adminAuth } from "@/lib/auth/client";
type Item = { label: string; href: string; icon: IconName };
const accountItems: Item[] = [
  { label: "Overview", href: "/account", icon: "grid" },
  { label: "Diagnostic access", href: "/account/diagnostics", icon: "heart" },
  { label: "Clinician network", href: "/account/clinician", icon: "people" },
  { label: "My learning", href: "/account/learn", icon: "book" },
  { label: "Course feedback", href: "/account/learn/feedback", icon: "heart" },
  { label: "Email preferences", href: "/account/email-preferences", icon: "settings" },
  { label: "My donations", href: "/account/donations", icon: "heart" },
  { label: "Book orders", href: "/account/orders", icon: "box" },
];
const adminItems: Item[] = [
  { label: "Overview", href: "/admin", icon: "grid" },
  { label: "Donations", href: "/admin/donations", icon: "heart" },
  { label: "Book orders", href: "/admin/book-orders", icon: "box" },
  { label: "Supporters", href: "/admin/donors", icon: "people" },
  { label: "Diagnostic access", href: "/admin/diagnostics", icon: "heart" },
  { label: "Learning", href: "/admin/learning", icon: "book" },
  { label: "Course feedback", href: "/admin/learning/feedback", icon: "heart" },
  { label: "Learning emails", href: "/admin/marketing", icon: "settings" },
  { label: "Content library", href: "/admin/content", icon: "book" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];
export function WorkspaceShell({
  title,
  subtitle,
  email,
  role,
  children,
  pending = false,
}: {
  title: string;
  subtitle?: string;
  email: string;
  role?: string;
  children: React.ReactNode;
  pending?: boolean;
}) {
  const admin = role !== undefined;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const items = (admin ? adminItems : accountItems).filter(
    (i) => !["/admin/settings", "/admin/diagnostics"].includes(i.href) || role === "admin",
  );
  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      const { error } = await (admin ? adminAuth : accountAuth).signOut();
      if (error) throw error;
      try {
        window.sessionStorage.removeItem("sma_admin_session_cache_v1");
      } catch {}
      router.replace(admin ? "/admin/login" : "/account/login");
      router.refresh();
    } catch {
      setError("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }
  return (
    <div
      className={`workspace ${admin ? "workspace-admin" : "workspace-account"} ${pathname === "/account/learn" ? learningStyles.learningShell : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <aside className={`workspace-sidebar ${open ? "is-open" : ""}`}>
        <Link href="/" className="workspace-brand">
          <BrandLogo />
        </Link>
        <p className="workspace-section-label">
          {admin ? "Foundation management" : "Your SMA Hope space"}
        </p>
        <nav
          aria-label={admin ? "Admin navigation" : "Account navigation"}
          id="workspace-navigation"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {pathname === item.href && <span className="nav-active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="workspace-help">
          <Icon name="book" size={23} />
          <strong>Understanding makes a difference.</strong>
          <p>Explore practical guides for life with SMA in Nigeria.</p>
          <Link href="/blog">Visit the knowledge hub ↗</Link>
        </div>
        <div className="workspace-profile">
          <span className="avatar">{email ? email.slice(0, 1).toUpperCase() : "SH"}</span>
          <div>
            <strong>
              {admin ? (role === "admin" ? "Administrator" : role === "ops" ? "Operations" : "Foundation account") : "SMA Hope account"}
            </strong>
            <span title={email} className={!email ? "workspace-profile-placeholder" : undefined} aria-hidden={!email || undefined}>{email || "\u00a0"}</span>
          </div>
        </div>
        <button className="workspace-signout" onClick={signOut} disabled={signingOut}>
          <Icon name="logout" size={17} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
        {error && (
          <p role="alert" className="workspace-error">
            {error}
          </p>
        )}
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <button
            className="workspace-menu"
            aria-controls="workspace-navigation"
            aria-expanded={open}
            aria-label={open ? "Close workspace navigation" : "Open workspace navigation"}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
          <div>
            <span>{admin ? "Foundation workspace" : "My account"}</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{title}</strong>
          </div>
          <ThemePicker />
          <Link href="/" className="workspace-site-link">
            View website <span aria-hidden="true">↗</span>
          </Link>
        </header>
        <main id="workspace-content" className="workspace-content">
          <div className="workspace-page-heading">
            <div>
              <p className="eyebrow">
                {admin ? "SMA Hope / Administration" : pathname.startsWith("/account/diagnostics") || pathname.startsWith("/account/clinician") ? "SMA Hope / Diagnostic access" : pathname.startsWith("/account/learn") ? "SMA Hope / Learn with understanding" : "SMA Hope / Your support matters"}
              </p>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
            {!pathname.startsWith("/account/learn") && !pathname.startsWith("/account/diagnostics") && !pathname.startsWith("/account/clinician") && !pathname.startsWith("/admin/diagnostics") && <Link href={admin ? pathname === "/admin/learning" ? "/learn/understanding-sma" : "/admin/donations" : "/donate"} className="btn btn-primary">
              {admin ? pathname === "/admin/learning" ? "View course" : "View donations" : "Make a donation"}
              <Icon name="arrow" size={16} />
            </Link>}
          </div>
          {pending ? (
            <div className="workspace-panel workspace-pending" role="status" aria-label="Loading workspace" aria-busy="true">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </div>
          ) : children}
        </main>
      </div>
    </div>
  );
}
