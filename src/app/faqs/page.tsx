import Link from "next/link";
import Image from "next/image";
import { buildMetadata } from "@/lib/metadata";
import { getFaqItems } from "@/lib/content";
import { faqSourcesCheckedAt } from "@/content/faqs";
import { FAQLibrary } from "@/components/faq-library";
import { siteConfig } from "@/lib/site";
import { book } from "@/lib/book";
import { supportWhatsAppUrl } from "@/lib/support";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "SMA FAQs: Genetics, Treatment & Support in Nigeria",
  description: "Clear answers about spinal muscular atrophy: symptoms, inheritance, genetic testing, care in Nigeria, family support and When Every Breath Matters.",
  path: "/faqs",
});

export default async function FAQsPage() {
  const items = await getFaqItems();
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "FAQPage", "@id": `${siteConfig.url}/faqs#questions`, url: `${siteConfig.url}/faqs`, name: "Spinal muscular atrophy: frequently asked questions", inLanguage: "en", publisher: { "@id": `${siteConfig.url}/#organization` }, mainEntity: items.map(item => ({ "@type": "Question", "@id": `${siteConfig.url}/faqs#${item.id}`, name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url }, { "@type": "ListItem", position: 2, name: "SMA frequently asked questions", item: `${siteConfig.url}/faqs` }] },
  ] };
  return <div className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
    <header className={styles.header}><div className="container"><Link href="/" className="eyebrow">SMA Hope Foundation / Common questions</Link><h1>Spinal muscular atrophy:{" "}<br/><em>your questions, answered.</em></h1><p className={styles.deck}>Clear explanations and practical next steps for families in Nigeria and readers around the world.</p><p className={styles.meta}>SMA Hope Foundation editorial team · References checked <time dateTime={faqSourcesCheckedAt}>17 November 2026</time></p></div></header>
    <div className={`container ${styles.content}`}>
      <section className={styles.routes} aria-label="Useful starting points"><Link href="/what-is-sma"><span>New to SMA?</span><strong>Start with the condition →</strong></Link><Link href="/blog/sma-genetic-testing"><span>Looking for a test?</span><strong>Understand the testing route →</strong></Link><Link href="/book"><span>The family story</span><strong>Discover the book →</strong></Link></section>
      <p className={styles.note}>These answers support understanding and conversations with your care team. They do not replace individual medical advice. For severe breathing difficulty, choking or sudden serious illness, seek emergency medical care.</p>
      <FAQLibrary items={items}/>
      <aside className={styles.book} aria-labelledby="faq-book-title"><Image src={book.cover} alt="When Every Breath Matters book cover" width={100} height={155}/><div><p className="eyebrow">The family behind SMA Hope</p><h2 id="faq-book-title">There is a life behind every diagnosis.</h2><p>In <em>When Every Breath Matters</em>, Tochukwu Nkwocha and Ijeoma Nkwocha share their family’s experience of SMA, care, faith and survival.</p><Link href="/book#editions" className="text-link">Explore Kindle, paperback and hardcover →</Link></div></aside>
      <section className={styles.contact}><div><p className="eyebrow">A practical next step</p><h2>Still have a question?</h2><p>Tell us what you need help understanding. Use the Support button for a WhatsApp conversation, or send a family, book or partnership enquiry.</p></div><div className={styles.actions}><a href={supportWhatsAppUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">Chat with SMA Hope ↗</a><Link href="/contact" className="btn btn-secondary">Send an enquiry</Link></div></section>
      <p className={styles.endnote}>Read our <Link href="/editorial-policy">editorial approach</Link> or <Link href="/contact">suggest a correction</Link>. For fuller explanations, examples and planning tools, explore the <Link href="/blog">knowledge hub</Link>.</p>
    </div>
  </div>;
}
