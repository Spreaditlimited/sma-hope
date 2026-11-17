import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookEditionMockup } from "@/components/book-edition-mockup";
import { buildMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import { book, bookFaqs, bookStructuredData } from "@/lib/book";

const baseMetadata = buildMetadata({
  title: book.title,
  description: "When Every Breath Matters by Tochukwu and Ijeoma Nkwocha: a family’s story of spinal muscular atrophy (SMA), caregiving, treatment access, faith and survival.",
  path: book.path,
});
export const metadata: Metadata = {
  ...baseMetadata,
  authors: book.authors.map((name) => ({ name })),
  openGraph: { ...baseMetadata.openGraph, images: [{ url: `${siteConfig.url}/book/opengraph-image`, width: 1200, height: 630, alt: `${book.title} by ${book.authors.join(" and ")}` }] },
  twitter: { ...baseMetadata.twitter, images: [`${siteConfig.url}/book/opengraph-image`] },
};

export default function Book() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookStructuredData()).replace(/</g, "\\u003c") }} />
      <section className="book-landing">
        <div className="container book-landing-grid">
          <div>
            <p className="eyebrow">A family’s story of living with SMA</p>
            <h1>When Every<br /><em>Breath Matters</em></h1>
            <p className="book-subtitle">{book.subtitle}</p>
            <p className="book-authors">By {book.authors.join(" and ")}</p>
            <p className="book-deck">What does spinal muscular atrophy really mean inside a family? For us, it means listening differently to a cough, learning to protect a child’s breathing, and crossing borders in search of care for our two daughters.</p>
            <a href={book.amazonUrl} className="btn btn-primary" rel="noopener noreferrer">Read on Amazon Kindle →</a>
            <p className="book-availability">A story of family, faith and survival. <a href="#editions">Explore the editions →</a></p>
          </div>
          <div className="book-landing-cover">
            <Image src={book.cover} alt={`${book.title}, by ${book.authors.join(" and ")}: cream cover with green lettering and intertwined green and copper threads`} width={1600} height={2473} sizes="(max-width: 650px) 70vw, 350px" preload />
          </div>
        </div>
      </section>
      <section className="container hope-section mission-layout">
        <div><p className="eyebrow">Born from lived experience</p><h2 className="display-heading">The medical reality.<br /><em>The human story.</em></h2></div>
        <div className="mission-copy">
          <p><em>When Every Breath Matters</em> brings together our family’s experience and a clear explanation of spinal muscular atrophy (SMA), a rare genetic neuromuscular condition. From the uncertainty of early symptoms to diagnosis, treatment decisions and daily caregiving, we share what we wish someone had explained when our journey began.</p>
          <p>Our story is rooted in Nigeria and shaped by the search for care across borders. It follows the work of caring for our daughters, the pressures on marriage and family life, the question of access, and the place of faith in the middle of fear.</p>
          <p>It is also attentive to ordinary moments: learning, laughter, siblings and the small changes that can mean so much inside a family.</p>
          <Link href="/our-story" className="text-link">Meet the family behind the book →</Link>
        </div>
      </section>
      <section className="book-topics"><div className="container">
        <p className="eyebrow">What you will find inside</p>
        <div className="book-topic-grid">
          {[
            ["Understanding SMA", "Types, genetics, carrier testing, early signs and the path to diagnosis."],
            ["The work of care", "Breathing, swallowing, nutrition, equipment and the daily work families carry."],
            ["Family and access", "Treatment options, inequality, marriage, siblings, migration, faith and community."],
          ].map(([title, description]) => <div key={title}><h2>{title}</h2><p>{description}</p></div>)}
        </div>
      </div></section>
      <section className="container hope-section book-editions" id="editions" aria-labelledby="editions-title">
        <p className="eyebrow">Choose how you read</p><h2 className="display-heading" id="editions-title">Three editions.<br /><em>One family’s story.</em></h2>
        <p>Read digitally or make room for the story on your bookshelf. Choose Kindle, paperback or hardcover, and visit Amazon for current availability in your country.</p>
        <div className="book-edition-grid">
          {book.editions.map((edition) => <article className="card book-edition" key={edition.format}>
            <BookEditionMockup format={edition.format} />
            <h3>{edition.name}</h3>
            <p>{edition.format === "EBook" ? "A reflowable digital edition for Kindle devices and the Kindle app." : `${edition.pages} pages, in a ${edition.name.toLowerCase()} edition.`}</p>
            {"isbn" in edition ? <p className="book-edition-isbn">ISBN: {edition.isbn}</p> : null}
            <a href={edition.amazonUrl ?? book.amazonUrl} className="btn btn-primary" rel="noopener noreferrer">{edition.amazonUrl ? `View ${edition.name} on Amazon →` : "See editions on Amazon →"}</a>
          </article>)}
        </div>
        <p className="book-availability">Buy securely through Amazon. Prices, format availability and delivery options vary by marketplace.</p>
      </section>
      <section className="container hope-section mission-layout" id="authors">
        <div><p className="eyebrow">About the authors</p><h2 className="display-heading">Tochukwu &amp;<br /><em>Ijeoma Nkwocha</em></h2></div>
        <div className="mission-copy"><p>We are parents, advocates and co-founders of Spinal Muscular Atrophy Hope Foundation, Nigeria. Our work grows from our experience of raising daughters affected by SMA and our commitment to awareness, support and dignity for families.</p><p>This book is for families facing a new diagnosis, parents raising children with disabilities, caregivers, relatives and friends, healthcare professionals, churches and advocates who want to understand SMA and offer meaningful support.</p></div>
      </section>
      <section className="container hope-section book-questions" aria-labelledby="book-questions-title">
        <h2 className="display-heading" id="book-questions-title">About the book</h2>
        {bookFaqs.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      </section>
    </>
  );
}
