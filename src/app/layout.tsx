import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import "./redesign.css";
import "./theme.css";
import { ThemeProvider } from "@/components/theme-provider";
import { themeInitScript } from "@/lib/theme";
import { siteConfig } from "@/lib/site";
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

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
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
        <ThemeProvider><SiteShell>{children}</SiteShell></ThemeProvider>
      </body>
    </html>
  );
}
