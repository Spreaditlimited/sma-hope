import type { UpdateCardData } from "@/components/update-card";

export const fallbackUpdates: UpdateCardData[] = [
  {
    title: "Launching SMA Hope Foundation Nigeria",
    excerpt: "Why this foundation exists, what we are building, and what supporters should expect from this platform as we grow.",
    slug: "launching-sma-hope-foundation-nigeria",
    publishedAt: "2026-03-14",
    category: "Foundation",
    image: "/home/home-why-foundation.png",
  },
  {
    title: "Why Public Understanding of SMA Matters",
    excerpt: "A short reflection on how low awareness increases isolation for families and limits meaningful support.",
    slug: "why-public-understanding-of-sma-matters",
    publishedAt: "2026-03-10",
    category: "Awareness",
    image: "/home/home-what-is-sma.png",
  },
  {
    title: "Book Launch: A Family Story in Full",
    excerpt: "The official book launch and how the publication supports advocacy, education, and sustained public compassion.",
    slug: "book-launch-a-family-story-in-full",
    publishedAt: "2026-03-08",
    category: "Book",
    image: "/Book.PNG",
  },
];

export const fallbackPosts = fallbackUpdates.map((item) => ({
  ...item,
  body: [
    "This is a placeholder update body. Replace with Sanity-managed content as publishing begins.",
    "The platform is set up for long-form reflection and awareness content.",
  ],
}));
