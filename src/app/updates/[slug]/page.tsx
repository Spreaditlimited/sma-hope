import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { getAllUpdates, getUpdateBySlug } from "@/lib/content";
import { RichBody } from "@/components/rich-body";
import { ArticleTools } from "@/components/article-tools";
import { siteConfig } from "@/lib/site";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await getUpdateBySlug(slug);
  return p
    ? buildMetadata({
        title: p.title,
        description: p.excerpt,
        path: `/updates/${slug}`,
        type: "article",
        publishedTime: p.publishedAt,
      })
    : {};
}
export default async function Post({ params }: Props) {
  const { slug } = await params;
  const [p, posts] = await Promise.all([getUpdateBySlug(slug), getAllUpdates()]);
  if (!p) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    datePublished: p.publishedAt,
    author: { "@type": "Organization", name: siteConfig.shortName, url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/updates/${slug}`,
  };
  return (
    <div className="guide-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <header className="article-header container">
        <Link href="/updates" className="text-link">
          ← Foundation news & stories
        </Link>
        <p className="eyebrow">{p.category}</p>
        <h1>{p.title}</h1>
        <p className="article-deck">{p.excerpt}</p>
        <div className="article-byline">
          <span className="author-mark">SH</span>
          <div>
            <strong>SMA Hope Foundation</strong>
            <p>
              {new Date(p.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
          </div>
        </div>
      </header>
      <div className="container article-layout">
        <aside className="article-toc">
          <p className="eyebrow">More from the foundation</p>
          <nav>
            {posts
              .filter((x) => x.slug !== slug)
              .slice(0, 4)
              .map((x) => (
                <Link href={`/updates/${x.slug}`} key={x.slug}>
                  {x.title}
                </Link>
              ))}
          </nav>
        </aside>
        <article className="guide-body legacy-article">
          <RichBody body={p.body} />
          <ArticleTools />
          <div className="article-endnote">
            <Link href="/blog">Explore practical SMA guides →</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
