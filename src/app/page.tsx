import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { Icon, type IconName } from "@/components/icon";
import { getGuides } from "@/lib/articles";
import { GuideCard } from "@/components/guide-card";
export const metadata = buildMetadata({
  title: "Understanding SMA. Finding a way forward.",
  description:
    "Clear information on spinal muscular atrophy, practical guides for Nigerian families, and a foundation built on lived experience.",
  path: "/",
});
const pathways: { title: string; text: string; href: string; icon: IconName }[] = [
  {
    title: "I’m new to SMA",
    text: "Understand the condition, diagnosis, and the words you’re hearing.",
    href: "/what-is-sma",
    icon: "book",
  },
  {
    title: "I’m looking for support",
    text: "Find practical starting points for your family’s next steps.",
    href: "/support-for-families",
    icon: "people",
  },
  {
    title: "I want to make a difference",
    text: "Help build awareness and stand alongside Nigerian families.",
    href: "/donate",
    icon: "heart",
  },
];
export default async function Home() {
  const guides = await getGuides();
  return (
    <>
      <section className="hope-hero">
        <div className="container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line" /> A Nigerian foundation. A shared hope.
            </p>
            <h1>
              Every family deserves
              <br />
              <em>understanding.</em>
              <br />
              Every life, possibility.
            </h1>
            <p className="hero-description">
              Spinal muscular atrophy can change a family’s world. Together, we can make that world
              more informed, more supportive, and less lonely.
            </p>
            <div className="button-row">
              <Link className="btn btn-primary" href="/support-for-families">
                Find your next step <Icon name="arrow" size={17} />
              </Link>
              <Link className="text-link" href="/what-is-sma">
                Understand SMA <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="hero-footnote">
              <Icon name="shield" size={18} />
              <span>Rooted in lived experience. Guided by dignity.</span>
            </div>
          </div>
          <figure className="hero-photo">
            <Image
              src="/family.jpg"
              alt="The family behind SMA Hope Foundation, together with Kamsi and Kachi"
              width={1200}
              height={1011}
              sizes="(max-width: 800px) 100vw, 50vw"
              priority
            />
            <figcaption>
              <span>THE HEART OF OUR FOUNDATION</span>
              <p>A family’s experience. A purpose beyond one home.</p>
              <Link href="/our-story" aria-label="Read the family story">
                <Icon name="arrow" />
              </Link>
            </figcaption>
            <span className="photo-label">Hope begins with us.</span>
          </figure>
        </div>
      </section>
      <section className="pathway-section">
        <div className="container">
          <div className="section-topline">
            <span className="eyebrow">A place to begin</span>
            <span>Wherever you are in your journey.</span>
          </div>
          <div className="pathway-grid">
            {pathways.map((p, i) => (
              <Link href={p.href} key={p.href} className="pathway">
                <div className="pathway-top">
                  <Icon name={p.icon} size={26} />
                  <span>0{i + 1}</span>
                </div>
                <h2>{p.title}</h2>
                <p>{p.text}</p>
                <span className="pathway-arrow">
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="hope-section">
        <div className="container mission-layout">
          <div>
            <p className="eyebrow">More than awareness</p>
            <h2 className="display-heading">
              Knowledge brings clarity.
              <br />
              <em>Connection brings hope.</em>
            </h2>
          </div>
          <div className="mission-copy">
            <p>
              SMA Hope Foundation Nigeria grew from our family’s experience with Kamsi and Kachi. We
              know how much can sit behind a diagnosis: questions, decisions, daily care, and love.
            </p>
            <p>
              We’re building a place where families can find clear information, where communities
              can learn to offer practical support, and where people living with SMA are seen in
              their fullness.
            </p>
            <Link href="/about" className="text-link">
              Get to know the foundation <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="hope-section knowledge-section">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">The knowledge hub</p>
              <h2 className="display-heading">
                Clear answers.
                <br />
                <em>Practical next steps.</em>
              </h2>
            </div>
            <div>
              <p>Thoughtful guides for the realities of life with SMA in Nigeria.</p>
              <Link href="/blog" className="text-link">
                Explore all guides <Icon name="arrow" size={17} />
              </Link>
            </div>
          </div>
          <div className="guide-grid">
            {guides.slice(0, 3).map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </div>
      </section>
      <section className="story-band">
        <div className="container story-band-layout">
          <div className="story-number" aria-hidden="true">
            Hope.
          </div>
          <div>
            <p className="eyebrow">Our commitment</p>
            <h2>
              People first.
              <br />
              Always.
            </h2>
            <p>
              Children and adults living with SMA have interests, ambitions, relationships, and
              futures. Our work begins with their dignity, and with the families who stand beside
              them.
            </p>
            <Link href="/transparency" className="text-link">
              How we build trust <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="hope-section">
        <div className="container book-feature">
          <div className="book-feature-art">
            <Image
              src="/Book-v3.PNG"
              alt="When Every Breath Matters book cover"
              width={280}
              height={370}
              sizes="280px"
            />
          </div>
          <div>
            <p className="eyebrow">The story behind the mission</p>
            <h2 className="display-heading">
              When Every
              <br />
              <em>Breath Matters.</em>
            </h2>
            <p>
              A family’s story of SMA, care, and the responsibility of keeping hope alive. Discover
              the book that gives deeper context to our foundation’s work.
            </p>
            <Link href="/book" className="btn btn-secondary">
              Explore the book <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
