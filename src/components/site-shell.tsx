"use client";

import { usePathname } from "next/navigation";
import { ThemePicker } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MetaPixel } from "@/components/meta-pixel";
import { CookieNotice } from "@/components/cookie-notice";
import { CTASection } from "@/components/cta-section";
import { SupportLauncher } from "@/components/support-launcher";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspaceRoute = pathname.startsWith("/account") || pathname.startsWith("/admin");

  if (isWorkspaceRoute) {
    return <><MetaPixel /><div id="main-content" className="workspace-typography">{(pathname.endsWith("/login") || pathname.includes("reset-password")) && <div className="auth-appearance"><ThemePicker /></div>}{children}</div></>;
  }

  return (
    <>
      <MetaPixel />
      <Navbar />
      <main id="main-content">{children}</main>
      <CTASection
        headline="Stay informed. Stay connected."
        body="Practical SMA guidance, new learning resources and news from the foundation. Useful information for families, caregivers and everyone who wants to help."
        primary={{ label: "Give hope", href: "/donate" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
      <Footer />
      <CookieNotice />
      <SupportLauncher key={pathname} />
    </>
  );
}
