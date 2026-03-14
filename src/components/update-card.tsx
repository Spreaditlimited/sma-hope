import Image from "next/image";
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
  const imageSrc = item.image || "/home/home-latest-updates.png";

  return (
    <article className="card" style={{ padding: "0", overflow: "hidden" }}>
      <Image
        src={imageSrc}
        alt={item.title}
        width={1536}
        height={1024}
        style={{ width: "100%", height: "180px", objectFit: "cover", borderBottom: "1px solid var(--line)" }}
      />
      <div style={{ padding: "1rem" }}>
      <p style={{ marginTop: 0, color: "var(--text-soft)", fontSize: "0.9rem" }}>
        {item.category} · {new Date(item.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <h3 style={{ margin: "0.4rem 0" }}>{item.title}</h3>
      <p style={{ color: "var(--text-soft)" }}>{item.excerpt}</p>
      <Link href={`/updates/${item.slug}`} className="btn btn-secondary">
        Read more
      </Link>
      </div>
    </article>
  );
}
