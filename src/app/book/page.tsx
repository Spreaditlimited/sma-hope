import Link from "next/link";
import Image from "next/image";
import { BookPreorderSignup } from "@/components/book-preorder-signup";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "When Every Breath Matters — the SMA Hope book",
  description:
    "Discover the forthcoming book by Tochukwu and Ijeoma Nkwocha on spinal muscular atrophy, family, faith, and survival. Register your interest for updates.",
  path: "/book",
});
export default function Book() {
  return (
    <>
      <section className="book-landing">
        <div className="container book-landing-grid">
          <div>
            <p className="eyebrow">The story behind the mission / Forthcoming</p>
            <h1>
              When Every
              <br />
              <em>Breath Matters.</em>
            </h1>
            <p className="book-subtitle">
              Understanding Spinal Muscular Atrophy Through Medicine, Family, Faith, and Survival
            </p>
            <p className="book-authors">By Tochukwu and Ijeoma Nkwocha</p>
            <p className="book-deck">
              A family’s experience of SMA, and the love, questions, and daily responsibility that
              live beyond a diagnosis.
            </p>
            <a href="#book-interest" className="btn btn-primary">
              Keep me informed →
            </a>
            <p className="book-availability">
              Not yet released. Join the interest list for availability updates.
            </p>
          </div>
          <div className="book-landing-cover">
            <Image
              src="/Book-v3.PNG"
              alt="When Every Breath Matters by Tochukwu and Ijeoma Nkwocha"
              width={470}
              height={684}
              sizes="(max-width: 650px) 70vw, 370px"
              priority
            />
          </div>
        </div>
      </section>
      <section className="container hope-section mission-layout">
        <div>
          <p className="eyebrow">Born from lived experience</p>
          <h2 className="display-heading">
            The medical reality.
            <br />
            <em>The human story.</em>
          </h2>
        </div>
        <div className="mission-copy">
          <p>
            This book grew from raising children affected by SMA and navigating the decisions, care,
            and uncertainty that can reshape a home.
          </p>
          <p>
            It brings medical explanations into conversation with family life: appointments,
            treatment questions, financial pressure, siblings, relationships, and faith. It is
            written for families, communities, professionals, and anyone who wants a deeper
            understanding.
          </p>
          <p>
            Our experience is our own. The book adds context and perspective; it does not replace
            individual medical advice.
          </p>
          <Link href="/our-story" className="text-link">
            Meet the family behind the book →
          </Link>
        </div>
      </section>
      <section className="book-topics">
        <div className="container">
          <p className="eyebrow">Inside the conversation</p>
          <div className="book-topic-grid">
            {[
              ["Understanding", "Diagnosis, genetics, and the language of SMA."],
              ["Daily life", "Care, relationships, siblings, and the unseen work at home."],
              ["The way forward", "Treatment questions, access, community, and hope."],
            ].map(([t, d]) => (
              <div key={t}>
                <h2>{t}</h2>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container book-interest" id="book-interest">
        <div>
          <p className="eyebrow">Stay close to the story</p>
          <h2 className="display-heading">
            Be among the first
            <br />
            <em>to hear what’s next.</em>
          </h2>
          <p>
            Register your interest for book updates. This is an interest signup, not an order or a
            payment.
          </p>
        </div>
        <div className="action-form-card">
          <BookPreorderSignup inline />
        </div>
      </section>
    </>
  );
}
