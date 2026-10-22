import Link from "next/link";
import { topics } from "@/lib/topics";
import { notFound } from "next/navigation";
import { getGuides } from "@/lib/articles";
import { ArticleTools } from "@/components/article-tools";
import { GuideCard, readingMinutes } from "@/components/guide-card";
import { Icon } from "@/components/icon";
import { buildMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  const guides = await getGuides();
  return guides.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({ params }: Props) {
  const guides = await getGuides();
  const { slug } = await params;
  const g = guides.find((g) => g.slug === slug);
  return g
    ? buildMetadata({
        title: g.title,
        description: g.excerpt,
        path: `/blog/${slug}`,
        type: "article",
        publishedTime: g.updatedAt,
        modifiedTime: g.updatedAt,
      })
    : {};
}
export default async function GuidePage({ params }: Props) {
  const guides = await getGuides();
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();
  const related = guides.filter((g) => guide.related.includes(g.slug));
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    datePublished: guide.updatedAt,
    dateModified: guide.updatedAt,
    author: { "@type": "Organization", name: siteConfig.shortName, url: siteConfig.url },
    publisher: { "@type": "Organization", name: siteConfig.shortName },
    mainEntityOfPage: `${siteConfig.url}/blog/${guide.slug}`,
    inLanguage: "en-NG",
  };
  return (
    <div className="guide-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <header className="article-header container">
        <Link href="/blog" className="text-link">
          ← Knowledge hub
        </Link>
        <p className="eyebrow">
          <Link href={`/blog/topics/${topics.find((t) => t.name === guide.category)?.slug}`}>
            {guide.category}
          </Link>{" "}
          / A guide for Nigerian families
        </p>
        <h1>{guide.title}</h1>
        <p className="article-deck">{guide.excerpt}</p>
        <div className="article-byline">
          <span className="author-mark">SH</span>
          <div>
            <strong>SMA Hope Foundation</strong>
            <p>
              {new Date(guide.updatedAt).toLocaleDateString("en-GB", {day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})} <span aria-hidden="true">·</span> {readingMinutes(guide)} min read
            </p>
          </div>
          <span className="review-label">
            {guide.clinical ? "Clinical review pending" : "Practical family guide"}
          </span>
        </div>
      </header>
      <div className="container article-layout">
        <aside className="article-toc">
          <p className="eyebrow">In this guide</p>
          <nav aria-label="Table of contents">
            {guide.sections.map((s, i) => (
              <a key={s.title} href={`#section-${i + 1}`}>
                {s.title}
              </a>
            ))}
            <a href="#checklist">Your practical checklist</a>
          </nav>
          <Link href="/support-for-families" className="toc-support">
            <Icon name="people" />
            <strong>You don’t have to navigate alone.</strong>
            <span>Explore family support →</span>
          </Link>
        </aside>
        <article className="guide-body">
          <div className="takeaways">
            <p className="eyebrow">The essentials</p>
            <ul>
              {guide.summary.map((s) => (
                <li key={s}>
                  <Icon name="check" size={18} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <p className="medical-note">
            {guide.clinical
              ? "This educational guide has not yet been reviewed by a clinician. Use it to prepare questions, not to diagnose a condition or change treatment. "
              : "These are practical suggestions to adapt with your family and care team. "}
            For severe breathing difficulty, choking, or sudden serious illness, seek emergency
            medical care immediately.
          </p>
          {guide.sections.map((s, i) => (
            <section id={`section-${i + 1}`} key={s.title}>
              <h2>{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.bullets && (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {s.source && (
                <p className="source-link">
                  Source:{" "}
                  <a href={s.source.url} target="_blank" rel="noopener noreferrer">
                    {s.source.title} ↗
                  </a>
                </p>
              )}
            </section>
          ))}
          <section id="checklist" className="print-checklist">
            <p className="eyebrow">Take this with you</p>
            <h2>Your practical checklist</h2>
            <ul>
              {guide.checklist.map((c) => (
                <li key={c}>
                  <span className="check-box" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </section>
          <ArticleTools />
          <div className="article-endnote">
            <h3>About this guide</h3>
            <p>
              Prepared for SMA Hope’s Nigeria-focused knowledge hub. Sources were checked on 22
              October 2026. Hospital services, prices, and treatment access need direct
              confirmation; no provider availability is guaranteed.
            </p>
            <Link href="/editorial-policy">Editorial approach</Link>
            <span> · </span>
            <Link href="/contact">Suggest a correction</Link>
          </div>
        </article>
      </div>
      <section className="container related-guides">
        <p className="eyebrow">Continue exploring</p>
        <h2 className="display-heading">A useful next read.</h2>
        <div className="guide-grid">
          {related.map((g) => (
            <GuideCard key={g.slug} guide={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
