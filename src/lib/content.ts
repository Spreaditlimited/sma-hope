import { fallbackFaqs } from "@/content/faqs";
import { fallbackPosts, fallbackUpdates } from "@/content/updates";
import { hasSanityConfig } from "@/lib/env";
import { sanityClient } from "@/sanity/client";
import { faqQuery, latestUpdatesQuery, updateBySlugQuery, updatesQuery } from "@/sanity/queries";

type Update = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  body?: string[];
};

type FaqItem = {
  category: string;
  question: string;
  answer: string;
};

export async function getLatestUpdates(): Promise<Update[]> {
  if (!hasSanityConfig()) return fallbackUpdates;
  try {
    const posts = await sanityClient.fetch<Update[]>(latestUpdatesQuery);
    return posts?.length ? posts : fallbackUpdates;
  } catch {
    return fallbackUpdates;
  }
}

export async function getAllUpdates(): Promise<Update[]> {
  if (!hasSanityConfig()) return fallbackPosts;
  try {
    const posts = await sanityClient.fetch<Update[]>(updatesQuery);
    return posts?.length ? posts : fallbackPosts;
  } catch {
    return fallbackPosts;
  }
}

export async function getUpdateBySlug(slug: string): Promise<Update | null> {
  if (!hasSanityConfig()) return fallbackPosts.find((item) => item.slug === slug) || null;
  try {
    const post = await sanityClient.fetch<Update>(updateBySlugQuery, { slug });
    return post || fallbackPosts.find((item) => item.slug === slug) || null;
  } catch {
    return fallbackPosts.find((item) => item.slug === slug) || null;
  }
}

export async function getFaqItems(): Promise<FaqItem[]> {
  if (!hasSanityConfig()) return fallbackFaqs;
  try {
    const faqs = await sanityClient.fetch<FaqItem[]>(faqQuery);
    return faqs?.length ? faqs : fallbackFaqs;
  } catch {
    return fallbackFaqs;
  }
}
