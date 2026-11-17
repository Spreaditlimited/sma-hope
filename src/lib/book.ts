import { siteConfig } from "@/lib/site";

export type BookEdition = {
  name: string;
  format: "EBook" | "Paperback" | "Hardcover";
  asin: string;
  isbn?: string;
  pages?: number;
  amazonUrl: string | null;
};

export const book = {
  title: "When Every Breath Matters",
  subtitle: "Understanding Spinal Muscular Atrophy Through Medicine, Family, Faith, and Survival",
  authors: ["Tochukwu Nkwocha", "Ijeoma Nkwocha"],
  path: "/book",
  amazonUrl: "https://www.amazon.com/dp/B0GX2WHPXH",
  cover: "/books/when-every-breath-matters-cover.jpg",
  description: "Two Nigerian parents share their family’s story of spinal muscular atrophy (SMA), alongside clear explanations of diagnosis, genetics, treatment access, supportive care, faith and daily caregiving.",
  // All three Amazon detail pages verified live against their edition and
  // ISBN on 17 November 2026.
  editions: [
    { name: "Kindle", format: "EBook", asin: "B0GX2WHPXH", amazonUrl: "https://www.amazon.com/dp/B0GX2WHPXH" },
    { name: "Paperback", format: "Paperback", asin: "B0HRZLNGZZ", isbn: "9798143499485", pages: 271, amazonUrl: "https://www.amazon.com/dp/B0HRZLNGZZ" },
    { name: "Hardcover", format: "Hardcover", asin: "B0HRZGVKM4", isbn: "9798143500198", pages: 271, amazonUrl: "https://www.amazon.com/dp/B0HRZGVKM4" },
  ] satisfies BookEdition[],
};

export const bookFaqs = [
  { question: "What is When Every Breath Matters about?", answer: "It combines Tochukwu and Ijeoma Nkwocha’s experience of raising two daughters with spinal muscular atrophy with clear explanations of SMA, genetics, diagnosis, treatment options and supportive care. Family life, faith and the struggle for access run through the book." },
  { question: "Who is the book for?", answer: "Parents and caregivers, families facing a new diagnosis, relatives and friends, healthcare professionals, churches and advocates who want to understand SMA and offer meaningful support." },
  { question: "Which editions can I choose?", answer: "When Every Breath Matters is published in Kindle, paperback and hardcover editions. Visit Amazon to see the formats currently available in your country, local pricing and delivery options. You can read the Kindle edition on a Kindle device or with the Kindle app." },
  { question: "Does the book replace medical advice?", answer: "No. It shares personal experience and information for education and awareness. Individual diagnosis, treatment and care decisions should be discussed with qualified healthcare professionals." },
];

export function bookStructuredData() {
  const url = `${siteConfig.url}${book.path}`;
  const liveLinks = book.editions.flatMap((edition) => edition.amazonUrl ? [edition.amazonUrl] : []);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book", "@id": `${url}#book`, url,
        name: book.title, alternativeHeadline: book.subtitle,
        description: book.description, image: `${siteConfig.url}${book.cover}`,
        author: book.authors.map((name) => ({ "@type": "Person", name })),
        publisher: { "@type": "Organization", name: "Spinal Muscular Atrophy Hope Foundation, Nigeria", url: siteConfig.url },
        inLanguage: "en-GB", genre: ["Memoir", "Health and family"],
        about: [{ "@type": "Thing", name: "Spinal muscular atrophy" }, { "@type": "Thing", name: "Family caregiving" }],
        ...(liveLinks.length ? { sameAs: liveLinks } : {}),
        workExample: book.editions.map((edition: BookEdition) => ({
          "@type": "Book", "@id": `${url}#${edition.format.toLowerCase()}`,
          name: book.title, bookEdition: "First edition", bookFormat: `https://schema.org/${edition.format}`,
          inLanguage: "en-GB",
          ...(edition.isbn ? { isbn: edition.isbn } : {}),
          ...(edition.pages ? { numberOfPages: edition.pages } : {}),
          ...(edition.amazonUrl ? { sameAs: edition.amazonUrl } : {}),
        })),
      },
      { "@type": "FAQPage", mainEntity: bookFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    ],
  };
}
