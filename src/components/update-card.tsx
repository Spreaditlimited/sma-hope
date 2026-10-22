import Link from "next/link";
export type UpdateCardData = {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  category: string;
  image?: string;
};
export function UpdateCard({ item }: { item: UpdateCardData }) {
  return (
    <article className="news-card">
      <p className="eyebrow">
        {item.category} /{" "}
        {new Date(item.publishedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })}
      </p>
      <h3>
        <Link href={`/updates/${item.slug}`}>{item.title}</Link>
      </h3>
      <p>{item.excerpt}</p>
      <Link href={`/updates/${item.slug}`} className="text-link">
        Read the story →
      </Link>
    </article>
  );
}
