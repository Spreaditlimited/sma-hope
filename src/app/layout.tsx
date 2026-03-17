import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieNotice } from "@/components/cookie-notice";
import { CTASection } from "@/components/cta-section";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  email: "hello@smahope.org",
  areaServed: "Nigeria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
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
      </body>
    </html>
  );
}
