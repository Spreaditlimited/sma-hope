import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getGuides } from "@/lib/articles";
import { getGuideImage, guideImageUrl } from "@/lib/guide-images";
import { topics } from "@/lib/topics";
import { getAllUpdates } from "@/lib/content";
const routes = [
  "",
  "/about",
  "/what-is-sma",
  "/our-story",
  "/support-for-families",
  "/book",
  "/donate",
  "/contact",
  "/blog",
  "/learn/understanding-sma",
  "/project-one-million",
  "/report-a-concern",
  "/clinician-network",
  "/updates",
  "/transparency",
  "/faqs",
  "/editorial-policy",
  "/privacy-policy",
  "/terms",
];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guides = await getGuides();
  const posts = await getAllUpdates();
  return [
    ...routes.map((path) => ({
      url: `${siteConfig.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...guides.map((g) => ({
      url: `${siteConfig.url}/blog/${g.slug}`,
      lastModified: g.updatedAt,
      ...(getGuideImage(g.slug) ? { images: [guideImageUrl(getGuideImage(g.slug)!, 1600)] } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...topics.map((t) => ({
      url: `${siteConfig.url}/blog/topics/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${siteConfig.url}/updates/${p.slug}`,
      lastModified: p.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
