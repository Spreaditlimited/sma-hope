import type { Metadata } from "next";
import { siteConfig, type MetadataConfig } from "@/lib/site";

export function buildMetadata({ title, description, path = "" }: MetadataConfig): Metadata {
  const fullTitle = `${title} | ${siteConfig.shortName}`;
  const url = `${siteConfig.url}${path}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [siteConfig.ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}
