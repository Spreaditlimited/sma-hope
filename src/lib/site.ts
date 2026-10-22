export const siteConfig = {
  name: "SMA Hope Foundation Nigeria",
  shortName: "SMA Hope Foundation",
  description:
    "SMA Hope Foundation Nigeria is a registered foundation raising awareness about Spinal Muscular Atrophy, supporting affected families, and building a more informed and compassionate response.",
  url: "https://www.smahope.org",
  ogImage: "/opengraph-image",
  social: {
    twitter: "@smahopeorg",
  },
};

export type MetadataConfig = {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};
