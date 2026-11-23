import Link from "next/link";
import { GuideImage } from "@/components/guide-image";
import { getGuideImage, guideImageUrl } from "@/lib/guide-images";
import { topics } from "@/lib/topics";
import { notFound } from "next/navigation";
import { getGuides } from "@/lib/articles";
import { ArticleTools } from "@/components/article-tools";
import { GuideCard, readingMinutes } from "@/components/guide-card";
import { ArticleBookCTA } from "@/components/article-book-cta";
import { Icon } from "@/components/icon";
import { buildMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import type { GuideLink } from "@/content/guides";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };
const language = (audience?: string) => audience === "United Kingdom" ? "en-GB" : audience === "Canada" ? "en-CA" : audience === "United States" ? "en-US" : audience === "Nigeria" ? "en-NG" : "en";
function GuideLinks({ links }: { links: GuideLink[] }) {
  return <ul className={styles.links}>{links.map(link => <li key={`${link.href}-${link.label}`}>{link.href.startsWith("/") ? <Link href={link.href}>{link.label} →</Link> : <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>}</li>)}</ul>;
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const guide = (await getGuides()).find(g => g.slug === slug);
  if (!guide) return {};
  const image = getGuideImage(guide.slug);
  return buildMetadata({ ...(image ? { image: { url: image.sharingUrl, width: 1200, height: 630, alt: image.alt } } : {}), title: guide.seoTitle || guide.title, description: guide.excerpt, path: `/blog/${slug}`, type: "article", publishedTime: guide.publishedAt, modifiedTime: guide.updatedAt, language: language(guide.audience) });
}
export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guides = await getGuides();
  const guide = guides.find(g => g.slug === slug);
  if (!guide) notFound();
  const image = getGuideImage(guide.slug);
  const topic = topics.find(t => t.name === guide.category);
  const related = guide.related.map(id => guides.find(g => g.slug === id)).filter((g): g is NonNullable<typeof g> => Boolean(g));
  const sources = [...new Map([...guide.sections.map(s => s.source), ...(guide.faqs || []).map(f => f.source)].filter((s): s is NonNullable<typeof s> => Boolean(s)).map(s => [s.url, s])).values()];
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", "@id": `${siteConfig.url}/blog/${guide.slug}#article`, headline: guide.title, description: guide.excerpt, ...(image ? { image: { "@type": "ImageObject", url: guideImageUrl(image, 1600), width: 1600, height: 900, caption: image.alt } } : {}), ...(guide.publishedAt ? { datePublished: guide.publishedAt } : {}), dateModified: guide.updatedAt, author: { "@type": "Organization", name: siteConfig.shortName, url: `${siteConfig.url}/about` }, publisher: { "@type": "Organization", name: siteConfig.shortName, url: siteConfig.url }, mainEntityOfPage: `${siteConfig.url}/blog/${guide.slug}`, inLanguage: language(guide.audience), citation: sources.map(s => s.url), ...(guide.audience ? { spatialCoverage: guide.audience } : {}) },
    ...(guide.faqs?.length ? [{ "@type": "FAQPage", "@id": `${siteConfig.url}/blog/${guide.slug}#questions`, mainEntity: guide.faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }] : []),
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Knowledge hub", item: `${siteConfig.url}/blog` }, { "@type": "ListItem", position: 2, name: guide.category, item: `${siteConfig.url}/blog/topics/${topic?.slug}` }, { "@type": "ListItem", position: 3, name: guide.title, item: `${siteConfig.url}/blog/${guide.slug}` }] },
  ] };
  return <div className={`guide-page ${styles.page}`} lang={language(guide.audience)}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="article-header container">
      <Link href="/blog" className="text-link">← Knowledge hub</Link>
      <p className="eyebrow"><Link href={`/blog/topics/${topic?.slug}`}>{guide.category}</Link> / {guide.audience || "Nigeria"}</p>
      <h1>{guide.title}</h1>
      <p className="article-deck">{guide.excerpt}</p>
      <div className="article-byline"><span className="author-mark">SH</span><div><strong>SMA Hope Foundation editorial team</strong><p>Updated <time dateTime={guide.updatedAt}>{new Date(guide.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time> · {readingMinutes(guide)} min read</p></div><span className="review-label">{guide.clinical ? "SMA information" : "Practical family guide"}</span></div>
      {image && <figure className="article-feature"><GuideImage slug={guide.slug} /></figure>}
    </header>
    <div className="container article-layout">
      <aside className="article-toc"><p className="eyebrow">In this guide</p><nav aria-label="Table of contents">{guide.sections.map((s, i) => <a key={s.title} href={`#section-${i + 1}`}>{s.title}</a>)}{Boolean(guide.faqs?.length) && <a href="#questions">Frequently asked questions</a>}<a href="#checklist">Your practical checklist</a>{sources.length > 0 && <a href="#sources">Sources and editorial information</a>}</nav><Link href="/support-for-families" className="toc-support"><Icon name="people" /><strong>Have a practical question?</strong><span>Explore support or use the Support button →</span></Link></aside>
      <article className="guide-body">
        <details className={styles.mobileContents}><summary>In this guide</summary><nav aria-label="Guide sections">{guide.sections.map((section, index) => <a key={section.title} href={`#section-${index + 1}`}>{section.title}</a>)}<a href="#questions">Frequently asked questions</a><a href="#checklist">Your practical checklist</a></nav></details>
        {guide.intro?.map(p => <p key={p}>{p}</p>)}
        <div className="takeaways"><p className="eyebrow">The essentials</p><ul>{guide.summary.map(s => <li key={s}><Icon name="check" size={18} />{s}</li>)}</ul></div>
        {guide.clinical && <p className="medical-note">This information supports conversations with your care team and does not replace individual medical advice. For severe breathing difficulty, choking or sudden serious illness, seek emergency medical care; do not wait for a support-chat reply.</p>}
        {guide.sections.map((s, i) => <div key={s.title}>
          <section id={`section-${i + 1}`}><h2>{s.title}</h2>{s.paragraphs.map(p => <p key={p}>{p}</p>)}{s.bullets && <ul>{s.bullets.map(b => <li key={b}>{b}</li>)}</ul>}{s.table && <div className={styles.tableWrap} role="region" aria-label={s.title} tabIndex={0}><table><thead><tr>{s.table.columns.map(c => <th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{s.table.rows.map((row, index) => <tr key={index}>{row.map((cell, col) => <td key={col}>{cell}</td>)}</tr>)}</tbody></table></div>}{s.source && <p className="source-link">Source: <a href={s.source.url} target="_blank" rel="noopener noreferrer">{s.source.title} ↗</a></p>}{s.links && <GuideLinks links={s.links} />}</section>
          {i === 2 && guide.bookPlacement !== "end" && <ArticleBookCTA guide={guide} />}
        </div>)}
        {Boolean(guide.faqs?.length) && <section id="questions" className={styles.faqs}><h2>Frequently asked questions</h2>{guide.faqs?.map(f => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p>{f.source && <p className="source-link"><a href={f.source.url} target="_blank" rel="noopener noreferrer">{f.source.title} ↗</a></p>}</details>)}</section>}
        <section id="checklist" className="print-checklist"><p className="eyebrow">Take this with you</p><h2>Your practical checklist</h2><ul>{guide.checklist.map(c => <li key={c}><span className="check-box" aria-hidden="true" />{c}</li>)}</ul></section>
        <ArticleTools />
        {guide.bookPlacement === "end" && <ArticleBookCTA guide={guide} />}
        {guide.links && <section><h2>Useful next steps</h2><GuideLinks links={guide.links} /></section>}
        <section id="sources" className="article-endnote"><h2>Sources and editorial information</h2>{guide.sourcesCheckedAt ? <p>Sources checked on <time dateTime={guide.sourcesCheckedAt}>{new Date(guide.sourcesCheckedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time>. Access rules, provider services and prices can change. Check the named service before making a commitment.</p> : <p>Check the linked source and named service for current information.</p>}{sources.length > 0 && <ul>{sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a></li>)}</ul>}<p>Written by the foundation editorial team. {guide.clinical ? "Medical decisions should be made with the person’s care team." : "Planning tools and practical suggestions should be adapted to the family’s circumstances."}</p><Link href="/editorial-policy">Editorial approach</Link><span> · </span><Link href="/contact">Suggest a correction</Link><p>For the personal story behind the foundation, <Link href="/book">explore When Every Breath Matters</Link>.</p></section>
      </article>
    </div>
    <section className="container related-guides"><p className="eyebrow">Continue exploring</p><h2 className="display-heading">A useful next read.</h2><div className="guide-grid">{related.map(g => <GuideCard key={g.slug} guide={g} />)}</div></section>
  </div>;
}
