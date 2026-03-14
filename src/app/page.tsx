import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { CTASection } from "@/components/cta-section";
import { SectionDivider } from "@/components/section-divider";
import { UpdateCard } from "@/components/update-card";
import { getLatestUpdates } from "@/lib/content";

export const metadata = buildMetadata({
  title: "Home",
  description:
    "Helping Nigeria understand Spinal Muscular Atrophy, support affected families, and respond with compassion, dignity, and truth.",
  path: "/",
});

type EditorialBlockProps = {
  heading: string;
  paragraphs: string[];
  cta?: { label: string; href: string };
  imageAlt: string;
  imagePosition?: string;
  reverse?: boolean;
  headingStrong?: boolean;
};

function EditorialBlock({
  heading,
  paragraphs,
  cta,
  imageAlt,
  imagePosition = "center",
  reverse = false,
  headingStrong = false,
}: EditorialBlockProps) {
  return (
    <section className="section">
      <div className={`container editorial-block ${reverse ? "is-reverse" : ""}`}>
        <div className="editorial-block-copy">
          <h2 className={headingStrong ? "section-heading-strong" : undefined}>{heading}</h2>
        <div className="prose" style={{ maxWidth: "68ch" }}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {cta ? (
          <div className="section-actions">
            <Link href={cta.href} className="btn btn-secondary">
              {cta.label}
            </Link>
          </div>
        ) : null}
      </div>
      <aside className="editorial-block-media card">
          <Image
            src="/family.jpg"
            alt={imageAlt}
            width={3589}
            height={3024}
            className="editorial-image"
            style={{ objectPosition: imagePosition }}
          />
        </aside>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const updates = await getLatestUpdates();

  return (
    <>
      <section className="section home-hero-section">
        <div className="container home-hero-grid">
          <div>
            <p className="kicker">SMA Hope Foundation Nigeria</p>
            <h1 className="home-title">
              Helping Nigeria understand Spinal Muscular Atrophy, support affected families, and respond with compassion, dignity, and truth.
            </h1>
            <p className="lead">
              SMA Hope Foundation Nigeria is a registered foundation shaped by real family experience with Spinal Muscular Atrophy. We exist to raise awareness, share knowledge, support families, and help more people understand the weight this condition places on children and those who care for them.
            </p>
            <div className="section-actions" style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
              <Link href="/what-is-sma" className="btn btn-primary">
                Learn About SMA
              </Link>
              <Link href="/donate" className="btn btn-secondary">
                Support the Foundation
              </Link>
            </div>
          </div>

          <aside className="home-hero-media card">
            <Image
              src="/home/home-hero.png"
              alt="Family photo related to SMA Hope Foundation"
              width={3589}
              height={3024}
              className="hero-family-image"
              priority
            />
            <div className="hero-media-caption">
              <p className="kicker" style={{ margin: 0 }}>
                Real Family Journey
              </p>
              <p style={{ margin: "0.35rem 0 0", color: "var(--text-soft)", fontSize: "0.94rem" }}>
                This foundation is rooted in lived experience with Kamsi and Kachi.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <SectionDivider />

      <EditorialBlock
        heading="A foundation born from lived experience"
        paragraphs={[
          "SMA Hope Foundation Nigeria did not begin as an idea on paper. It grew out of real life, real questions, real pain, and the long journey of caring for children living with Spinal Muscular Atrophy.",
          "For many families, SMA is not just a medical term. It changes daily life. It affects breathing, feeding, movement, sleep, finances, emotions, and the future a family once imagined. It can be deeply isolating, especially in places where awareness is low and support is limited.",
          "We started this foundation because we know that burden firsthand. We also know that families need more than sympathy. They need understanding. They need honest information. They need dignity. They need support. And they need to know they are not alone.",
        ]}
        imageAlt="Family portrait for lived experience section"
        imagePosition="center top"
      />

      <EditorialBlock
        heading="What is Spinal Muscular Atrophy?"
        paragraphs={[
          "Spinal Muscular Atrophy, often called SMA, is a serious genetic condition that affects the muscles of the body. It weakens muscle strength over time and can make it difficult for a child to sit, stand, move, swallow, or breathe well without support.",
          "SMA is not always widely understood, but for affected families, its impact is immediate and far-reaching. It can shape nearly every part of daily life and often requires ongoing medical care, close monitoring, and constant adjustment.",
          "At SMA Hope Foundation Nigeria, one of our core goals is to help more people understand SMA in plain language, because understanding is where compassion, advocacy, and better support begin.",
        ]}
        cta={{ label: "What Is SMA?", href: "/what-is-sma" }}
        imageAlt="Supportive family image for SMA education section"
        imagePosition="center"
        reverse
      />

      <section className="section">
        <div className="container feature-banner card">
          <div>
            <p className="kicker">Why This Foundation Exists</p>
            <h2 className="section-heading-strong" style={{ marginTop: "0.25rem" }}>Why this work had to begin</h2>
            <p>
              In many places, families affected by SMA are carrying an enormous burden in silence. Some are still searching for answers. Some are trying to understand a diagnosis they never expected. Some are learning, day by day, how much care a child may need just to breathe, feed, sleep, or stay stable.
            </p>
            <p>
              Awareness is still low. Public understanding is limited. The emotional and financial strain on families can be overwhelming. Too often, people only see a small part of what the condition really means.
            </p>
            <p>
              SMA Hope Foundation Nigeria exists because this gap is real. We believe families should not have to walk this road without support, and society should not remain uninformed about a condition that carries such a heavy human cost.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container home-card-grid">
          <div className="section-header">
            <p className="kicker">Our Story Preview</p>
            <h2>The story behind the foundation and support for families</h2>
          </div>
          <article className="card home-content-card home-content-card-rich">
            <Image src="/family.jpg" alt="Our story visual" width={3589} height={3024} className="card-hero-image" style={{ objectPosition: "center 30%" }} />
            <h2 className="section-heading-strong">The story behind the foundation</h2>
            <p>Behind this foundation is a real family journey with Spinal Muscular Atrophy.</p>
            <p>
              What we have lived through has shaped how we speak about SMA, how we think about support, and why this foundation matters so much to us. This work is personal, but it is not only personal. It is our response to a reality many other families may also be facing, often with far less visibility and support.
            </p>
            <p>
              Our story is part of why SMA Hope Foundation Nigeria exists, but it is also part of why we believe awareness must grow, dignity must be protected, and families must be seen more clearly.
            </p>
            <Link href="/our-story" className="btn btn-secondary">
              Read Our Story
            </Link>
          </article>

          <article className="card home-content-card home-content-card-rich">
            <Image src="/family.jpg" alt="Family support visual" width={3589} height={3024} className="card-hero-image" style={{ objectPosition: "center 52%" }} />
            <h2 className="section-heading-strong">For families carrying this burden</h2>
            <p>
              If your child has been diagnosed with SMA, or if your family is trying to make sense of symptoms, fear, medical appointments, and difficult decisions, this space is for you too.
            </p>
            <p>
              We understand that the burden is not only clinical. It is emotional, relational, financial, spiritual, and deeply practical. There are questions that keep parents awake. There is exhaustion that is hard to explain. There is the weight of trying to keep going while learning a new and difficult reality.
            </p>
            <p>
              This foundation exists in part to help families feel less alone. We want to provide clear information, compassionate guidance, and a growing platform of support shaped by lived understanding.
            </p>
            <Link href="/support-for-families" className="btn btn-secondary">
              Support for Families
            </Link>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container home-card-grid">
          <div className="section-header">
            <p className="kicker">The Book Preview</p>
            <h2>The book and meaningful ways to help</h2>
          </div>
          <article className="card home-book-feature">
            <div className="home-book-feature-grid">
              <div className="home-book-feature-copy">
                <p className="kicker">Book Launch</p>
                <h2 className="section-heading-strong">A book shaped by truth, family, and hard-won understanding</h2>
                <p>
                  We are also launching a book that explores Spinal Muscular Atrophy more deeply through the lens of real family experience. The aim is not only to tell a story, but to help people understand the condition, the burden families carry, and the kind of support and awareness that are still needed.
                </p>
                <p>
                  For some readers, the book will be their first real introduction to SMA. For others, it will be a more personal and reflective journey into the realities that many families rarely have the chance to explain fully.
                </p>
                <p>
                  The book is part of the wider mission of this foundation: to educate, advocate, build understanding, and move more people toward meaningful support.
                </p>
                <div className="section-actions">
                  <Link href="/book" className="btn btn-secondary">
                    Explore the Book
                  </Link>
                </div>
              </div>

              <aside className="home-book-feature-visual" aria-label="Book cover feature">
                <div className="home-book-feature-cover">
                  <Image
                    src="/Book.PNG"
                    alt="When Every Breath Matters book cover"
                    width={1681}
                    height={2448}
                    className="home-book-feature-image"
                  />
                </div>
                <p className="home-book-feature-title">When Every Breath Matters</p>
                <p className="home-book-feature-meta">Paperback / eBook / Hardcover</p>
              </aside>
            </div>
          </article>

          <article className="card home-content-card home-content-card-rich">
            <Image src="/family.jpg" alt="Ways to help visual" width={3589} height={3024} className="card-hero-image" style={{ objectPosition: "center 70%" }} />
            <h2 className="section-heading-strong">There are meaningful ways to help</h2>
            <p>
              Some people will want to support by giving. Others will want to learn more, buy the book, share awareness, or partner with the foundation in a deeper way. All of these matter.
            </p>
            <ul>
              <li>Support the Foundation: Your support can help strengthen awareness, education, advocacy, and the foundation&apos;s work over time.</li>
              <li>Buy the Book: The book is one of the ways this mission will reach more people and deepen understanding.</li>
              <li>Share Awareness: Sometimes help begins with helping others understand what SMA is and why affected families need support.</li>
              <li>Get Involved: There may be opportunities to partner, volunteer, collaborate, or support the foundation in practical ways.</li>
            </ul>
          </article>
        </div>
      </section>

      <EditorialBlock
        heading="Built on seriousness, compassion, and accountability"
        paragraphs={[
          "SMA Hope Foundation Nigeria is a registered foundation. We believe that work like this must be carried out with care, honesty, and a strong sense of responsibility.",
          "Trust matters. Families need it. Donors need it. Partners need it. The public needs it.",
          "That is why we are committed to building this foundation on clear purpose, responsible stewardship, and a sincere desire to be useful to the people this mission is meant to serve.",
        ]}
        cta={{ label: "Learn About Our Commitment to Transparency", href: "/transparency" }}
        imageAlt="Trust and transparency section visual"
        imagePosition="center 35%"
        reverse
        headingStrong
      />

      <section className="section">
        <div className="container home-block">
          <h2 className="section-heading-strong">Latest updates and reflections</h2>
          <p className="lead">
            As the foundation grows, this website will also serve as a place for updates, reflections, awareness resources, and important conversations around SMA, family care, advocacy, and hope.
          </p>
          <p className="lead">
            We want this to be a living platform, not a static website. A place where people can keep learning, stay connected to the mission, and follow the work as it develops.
          </p>
          <div className="home-card-grid" style={{ marginTop: "1.1rem" }}>
            {updates.map((item) => (
              <UpdateCard key={item.slug} item={item} />
            ))}
          </div>
          <div style={{ marginTop: "1rem" }}>
            <Link href="/updates" className="btn btn-secondary">
              Read Updates
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        headline="Help us build understanding, strengthen support, and carry this mission forward."
        body="Whether you are here to learn, to support, to seek help, or to understand what SMA really means for families, you are welcome here."
        primary={{ label: "Donate", href: "/donate" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
