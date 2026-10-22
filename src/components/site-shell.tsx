"use client";

import { usePathname } from "next/navigation";
import { ThemePicker } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieNotice } from "@/components/cookie-notice";
import { CTASection } from "@/components/cta-section";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspaceRoute = pathname.startsWith("/account") || pathname.startsWith("/admin");

  if (isWorkspaceRoute) {
    return <div id="main-content">{(pathname.endsWith("/login") || pathname.includes("reset-password")) && <div className="auth-appearance"><ThemePicker /></div>}{children}</div>;
  }

  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <CTASection
        headline="Together, we can make room for more hope."
        body="Learn, share, give, or lend your voice. Help us build a more informed and supportive world for families living with SMA."
        primary={{ label: "Give hope", href: "/donate" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
      <Footer />
      <CookieNotice />
    </>
  );
}
