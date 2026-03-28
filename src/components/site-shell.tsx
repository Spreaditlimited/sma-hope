"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieNotice } from "@/components/cookie-notice";
import { CTASection } from "@/components/cta-section";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspaceRoute = pathname.startsWith("/account") || pathname.startsWith("/admin");

  if (isWorkspaceRoute) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <CTASection
        headline="Help us build understanding, strengthen support, and carry this mission forward."
        body="Whether you are here to learn, to support, to seek help, or to understand what SMA really means for families, you are welcome here."
        primary={{ label: "Donate", href: "/donate" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
      <Footer />
      <CookieNotice />
    </>
  );
}
