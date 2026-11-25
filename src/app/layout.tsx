import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import "./redesign.css";
import "./theme.css";
import { ThemeProvider } from "@/components/theme-provider";
import { themeInitScript } from "@/lib/theme";
import { siteConfig } from "@/lib/site";
import { GoogleAds } from '@/components/google-ads';
import { GoogleAnalytics } from "@/components/google-analytics";
import { SiteShell } from "@/components/site-shell";

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
  "@id": `${siteConfig.url}/#organization`,
  logo: `${siteConfig.url}/SMA%20Hope%20Foundation%20logo.png`,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  email: "help@smahope.org",
  areaServed: "Nigeria",
  address: {
    "@type": "PostalAddress",
    streetAddress: "5 Olutosin Ajayi Street, Ajao Estate",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
};

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  axes: ["opsz"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${sourceSans.variable} ${sourceSerif.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /><meta name="theme-color" content="#fbfaf7" /></head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {[orgSchema, {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${siteConfig.url}/#website`,
          url: siteConfig.url,
          name: siteConfig.shortName,
          publisher: { "@id": `${siteConfig.url}/#organization` },
          inLanguage: "en-NG",
        }].map((schema) => <script
          key={schema["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />)}
        <ThemeProvider><GoogleAnalytics /><GoogleAds /><SiteShell>{children}</SiteShell></ThemeProvider>
      </body>
    </html>
  );
}
