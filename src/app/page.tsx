import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { SectionDivider } from "@/components/section-divider";
import { UpdateCard } from "@/components/update-card";
import { getLatestUpdates } from "@/lib/content";

export const metadata = buildMetadata({
  title: "Home",
  description: "Building Awareness and Support for Spinal Muscular Atrophy in Nigeria",
  path: "/",
});

function SectionArt({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1536}
      height={1024}
      style={{
        width: "100%",
        height: "280px",
        objectFit: "cover",
        borderRadius: "0.85rem",
        border: "1px solid var(--line)",
        margin: "0.85rem 0 0.95rem",
      }}
    />
  );
}

export default async function HomePage() {
  const updates = await getLatestUpdates();
  const homepageUpdates = updates.filter((item) => item.category !== "Book" && !item.title.toLowerCase().includes("book"));

  return (
    <>
      <section className="section home-hero-section">
        <div className="container home-hero-grid">
          <div>
            <p className="kicker">SMA Hope Foundation Nigeria</p>
            <h1 className="home-title">Building Awareness and Support for Spinal Muscular Atrophy in Nigeria</h1>
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
              src="/family.jpg"
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

      <section className="section">
        <div className="container about-page-flow">
          <article className="about-panel prose">
            <h2 className="section-heading-strong">A foundation born from lived experience</h2>
            <Image
              src="/home/home-who-we-are.png"
              alt="Abstract visual for who we are section"
              width={1024}
              height={1536}
              style={{
                width: "100%",
                height: "320px",
                objectFit: "cover",
                borderRadius: "0.85rem",
                border: "1px solid var(--line)",
                margin: "0.85rem 0 0.95rem",
              }}
            />
            <p>
              SMA Hope Foundation Nigeria did not begin as an idea on paper. It grew out of real life, real questions, real pain, and the long journey of caring for children living with Spinal Muscular Atrophy.
            </p>
            <p>
              For many families, SMA is not just a medical term. It changes daily life. It affects breathing, feeding, movement, sleep, finances, emotions, and the future a family once imagined. It can be deeply isolating, especially in places where awareness is low and support is limited.
            </p>
            <p>
              We started this foundation because we know that burden firsthand. We also know that families need more than sympathy. They need understanding. They need honest information. They need dignity. They need support. And they need to know they are not alone.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">What is Spinal Muscular Atrophy?</h2>
            <SectionArt src="/home/home-what-is-sma.png" alt="Abstract visual for what is SMA section" />
            <p>
              Spinal Muscular Atrophy, often called SMA, is a serious genetic condition that affects the muscles of the body. It weakens muscle strength over time and can make it difficult for a child to sit, stand, move, swallow, or breathe well without support.
            </p>
            <p>
              SMA is not always widely understood, but for affected families, its impact is immediate and far-reaching. It can shape nearly every part of daily life and often requires ongoing medical care, close monitoring, and constant adjustment.
            </p>
            <p>
              At SMA Hope Foundation Nigeria, one of our core goals is to help more people understand SMA in plain language, because understanding is where compassion, advocacy, and better support begin.
            </p>
            <div className="section-actions">
              <Link href="/what-is-sma" className="btn btn-secondary">
                What Is SMA?
              </Link>
            </div>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Why this work had to begin</h2>
            <SectionArt src="/home/home-why-foundation.png" alt="Abstract visual for why this foundation exists section" />
            <p>
              In many places, families affected by SMA are carrying an enormous burden in silence. Some are still searching for answers. Some are trying to understand a diagnosis they never expected. Some are learning, day by day, how much care a child may need just to breathe, feed, sleep, or stay stable.
            </p>
            <p>
              Awareness is still low. Public understanding is limited. The emotional and financial strain on families can be overwhelming. Too often, people only see a small part of what the condition really means.
            </p>
            <p>
              SMA Hope Foundation Nigeria exists because this gap is real. We believe families should not have to walk this road without support, and society should not remain uninformed about a condition that carries such a heavy human cost.
            </p>
          </article>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">The story behind the foundation</h2>
              <SectionArt src="/home/home-our-story.png" alt="Abstract visual for our story section" />
              <p>Behind this foundation is a real family journey with Spinal Muscular Atrophy.</p>
              <p>
                What we have lived through has shaped how we speak about SMA, how we think about support, and why this foundation matters so much to us. This work is personal, but it is not only personal.
              </p>
              <p>
                Our story is part of why SMA Hope Foundation Nigeria exists, but it is also part of why we believe awareness must grow, dignity must be protected, and families must be seen more clearly.
              </p>
              <div className="section-actions">
                <Link href="/our-story" className="btn btn-secondary">
                  Read Our Story
                </Link>
              </div>
            </article>

            <article className="about-panel prose">
              <h2 className="section-heading-strong">For families carrying this burden</h2>
              <SectionArt src="/home/home-support-families.png" alt="Abstract visual for support for families section" />
              <p>
                If your child has been diagnosed with SMA, or if your family is trying to make sense of symptoms, fear, medical appointments, and difficult decisions, this space is for you too.
              </p>
              <p>
                We understand that the burden is not only clinical. It is emotional, relational, financial, spiritual, and deeply practical.
              </p>
              <p>
                This foundation exists in part to help families feel less alone. We want to provide clear information, compassionate guidance, and a growing platform of support shaped by lived understanding.
              </p>
              <div className="section-actions">
                <Link href="/support-for-families" className="btn btn-secondary">
                  Support for Families
                </Link>
              </div>
            </article>
          </div>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">A book shaped by truth, family, and hard-won understanding</h2>
              <div className="book-landscape-visual">
                <div className="book-landscape-halo" aria-hidden="true" />
                <Image
                  src="/Book.PNG"
                  alt="When Every Breath Matters book cover"
                  width={1681}
                  height={2448}
                  className="book-landscape-cover"
                />
              </div>
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
            </article>

            <article className="about-panel prose">
              <h2 className="section-heading-strong">There are meaningful ways to help</h2>
              <SectionArt src="/home/home-ways-to-help.png" alt="Abstract visual for ways to help section" />
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

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Built on seriousness, compassion, and accountability</h2>
            <SectionArt src="/home/home-trust-transparency.png" alt="Abstract visual for trust and transparency section" />
            <p>
              SMA Hope Foundation Nigeria is a registered foundation. We believe that work like this must be carried out with care, honesty, and a strong sense of responsibility.
            </p>
            <p>Trust matters. Families need it. Donors need it. Partners need it. The public needs it.</p>
            <p>
              That is why we are committed to building this foundation on clear purpose, responsible stewardship, and a sincere desire to be useful to the people this mission is meant to serve.
            </p>
            <div className="section-actions">
              <Link href="/transparency" className="btn btn-secondary">
                Learn About Our Commitment to Transparency
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container home-block">
          <div className="latest-intro-grid">
            <div>
              <h2 className="section-heading-strong">Latest updates and reflections</h2>
              <p className="lead">
                As the foundation grows, this website will also serve as a place for updates, reflections, awareness resources, and important conversations around SMA, family care, advocacy, and hope.
              </p>
              <p className="lead">
                We want this to be a living platform, not a static website. A place where people can keep learning, stay connected to the mission, and follow the work as it develops.
              </p>
            </div>
            <div className="latest-intro-media">
              <Image
                src="/home/home-latest-updates.png"
                alt="Abstract visual for latest updates section"
                width={1536}
                height={1024}
                className="latest-intro-image"
              />
            </div>
          </div>
          <div className="home-card-grid" style={{ marginTop: "1.1rem" }}>
            {homepageUpdates.map((item) => (
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

    </>
  );
}
