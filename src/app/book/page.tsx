import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "The Book",
  description: "A book born from real experience, written to help more people understand SMA.",
  path: "/book",
});

const sections = [
  {
    heading: "Why This Book Was Written",
    paragraphs: [
      "This book was written because some realities are too deep to be captured fully in a short post, a brief conversation, or a public appeal.",
      "It was written to tell the truth carefully. To help people understand the condition beyond medical language. To give voice to the hidden labour of families. To honour the dignity of children living with SMA.",
    ],
  },
  {
    heading: "What Readers Will Find in This Book",
    paragraphs: ["This is not just a medical book, and it is not only a family memoir either."],
    items: [
      "a clearer understanding of what SMA is",
      "a closer look at how the condition affects children and families",
      "the emotional and practical realities of long-term care",
      "reflections shaped by real family experience",
      "a more honest understanding of burden, dignity, endurance, and hope",
      "why awareness, advocacy, and support matter so much",
    ],
  },
  {
    heading: "Who This Book Is For",
    paragraphs: [
      "It is for parents and caregivers trying to understand what SMA really means.",
      "It is for friends, relatives, supporters, and members of the public who want to move beyond surface-level awareness.",
      "It is for healthcare-minded readers, advocates, and institutions who need a more human window into the lived burden of SMA.",
    ],
  },
  {
    heading: "Why This Book Matters",
    paragraphs: [
      "There are conditions many people do not understand until they come close to them. SMA is one of those conditions.",
      "This book matters because it helps close that gap and gives language to things many families struggle to explain.",
    ],
  },
  {
    heading: "Launched Alongside the Foundation Website",
    paragraphs: [
      "This book is being launched alongside the official website of SMA Hope Foundation Nigeria.",
      "Together, the website and the book form part of the same effort: to help more people understand SMA clearly, respond more compassionately, and support affected families more meaningfully.",
    ],
  },
  {
    heading: "Buying the Book",
    paragraphs: [
      "The book is available through this website as part of its official launch.",
      "This website will provide the available purchase options for readers in Nigeria and for readers outside Nigeria.",
    ],
  },
  {
    heading: "For Individuals, Groups, and Institutions",
    paragraphs: [
      "It can serve as a meaningful resource for churches, schools, support communities, healthcare-minded groups, advocacy spaces, and organisations.",
      "For bulk orders, partnership interest, speaking invitations, or institutional conversations connected to the book, the foundation can be contacted through the website.",
    ],
  },
];

function renderPanel(section: { heading: string; paragraphs?: string[]; items?: string[] }) {
  return (
    <article className="about-panel prose" key={section.heading}>
      <h2 className="section-heading-strong">{section.heading}</h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.items ? (
        <ul>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function BookPage() {
  return (
    <>
      <PageHeader title="The Book" intro="A book born from real experience, written to help more people understand SMA" />

      <section className="section-tight">
        <div className="container about-page-flow">
          <article className="about-panel prose">
            <h2 className="section-heading-strong">A Book Rooted in Lived Reality</h2>
            <p>This book was written out of lived reality.</p>
            <p>
              It was not written from a distance, and it was not written to give a neat or simplified version of Spinal Muscular Atrophy. It was written from within a family&apos;s journey through diagnosis, care, fear, endurance, faith, difficult medical realities, and the long burden of loving children with SMA in the real world.
            </p>
            <p>
              At SMA Hope Foundation Nigeria, we believe awareness must go deeper than short explanations and passing sympathy.
            </p>
          </article>

          <div className="about-two-col">
            <aside className="about-panel">
              <h2 className="section-heading-strong">Book Preview</h2>
              <div className="book-mockup-wrap">
                <div className="book-mockup-spine" aria-hidden="true" />
                <article className="book-mockup-face" aria-label="Book mockup preview">
                  <div className="book-mockup-cover">
                    <Image
                      src="/Book.PNG"
                      alt="SMA Hope Foundation book cover"
                      width={1400}
                      height={874}
                      className="book-mockup-cover-image"
                    />
                  </div>
                  <div className="book-mockup-meta">
                    <p className="kicker" style={{ margin: 0 }}>When Every Breath Matters</p>
                    <p style={{ margin: "0.35rem 0 0", fontWeight: 700 }}>SMA Hope Foundation Nigeria</p>
                    <p style={{ margin: "0.2rem 0 0", color: "var(--text-soft)", fontSize: "0.9rem" }}>
                      Paperback / eBook / Hardcover
                    </p>
                  </div>
                </article>
              </div>
            </aside>

            <article className="about-panel prose">
              <h2 className="section-heading-strong">Book At a Glance</h2>
              <p>
                This section holds the key purchase and format context while the final cover and launch assets are being prepared.
              </p>
              <ul className="support-bullets">
                <li>Purpose: deepen understanding of SMA through real family experience</li>
                <li>Formats: paperback, eBook, and hardcover structure already prepared</li>
                <li>Availability: purchase flow ready for Nigeria and international readers</li>
                <li>Bulk orders: institution and partnership enquiries supported via contact</li>
              </ul>
              <p style={{ marginBottom: 0, color: "var(--text-soft)" }}>
                Once final book details are available, this panel will display title, subtitle, pricing, and launch status.
              </p>
            </article>
          </div>

          <div className="about-two-col">
            {renderPanel(sections[0])}
            {renderPanel(sections[1])}
          </div>

          <div className="about-two-col">
            {renderPanel(sections[2])}
            {renderPanel(sections[3])}
          </div>

          <div className="about-two-col">
            {renderPanel(sections[4])}
            {renderPanel(sections[5])}
          </div>

          {renderPanel(sections[6])}

          <article className="about-panel prose">
            <p>This book is part of the wider work of SMA Hope Foundation Nigeria.</p>
            <p>
              It carries truth, family, burden, faith, and hard-won understanding. It was written to help people see more clearly, care more deeply, and respond more meaningfully to the reality of Spinal Muscular Atrophy.
            </p>
            <p>We are honoured to share it with the world.</p>
          </article>
          <div className="section-actions page-end-actions" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn btn-primary" type="button">
              Buy the Book
            </button>
            <button className="btn btn-secondary" type="button">
              Support the Mission
            </button>
            <Link href="/contact" className="btn btn-secondary">
              Contact Us About Bulk Orders
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
