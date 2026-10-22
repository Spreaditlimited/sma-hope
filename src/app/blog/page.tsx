import Link from "next/link";
import { topics } from "@/lib/topics";
import { getGuides } from "@/lib/articles";
import { GuideLibrary } from "@/components/guide-library";
import { Icon } from "@/components/icon";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "Knowledge hub: SMA guides for Nigerian families",
  description:
    "Practical, sourced SMA guides on diagnosis, genetic testing, care costs, school, and supporting families in Nigeria.",
  path: "/blog",
});
export default async function BlogPage() {
  const guides = await getGuides();
  return (
    <>
      <header className="library-header">
        <div className="container">
          <p className="eyebrow">The SMA Hope knowledge hub</p>
          <h1>
            Understanding changes
            <br />
            <em>what comes next.</em>
          </h1>
          <div className="library-intro">
            <p>
              Clear information. Practical tools. Thoughtful guidance for families navigating SMA in
              Nigeria.
            </p>
            <Link href="/blog/understanding-sma-nigeria" className="text-link">
              New to SMA? Start here <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </header>
      <section className="container library-body">
        <nav className="topic-navigation" aria-label="Knowledge hub topics">
          {topics.map((t) => (
            <Link key={t.slug} href={`/blog/topics/${t.slug}`}>
              {t.name} ↗
            </Link>
          ))}
        </nav>
        <GuideLibrary guides={guides} />
        <div className="editorial-note">
          <Icon name="shield" size={24} />
          <div>
            <h2>Information you can put in context.</h2>
            <p>
              Our guides distinguish practical suggestions from clinical information, link to
              sources, and show their review status. They support conversations with your care team.
            </p>
            <Link href="/editorial-policy" className="text-link">
              Read our editorial approach →
            </Link>
          </div>
        </div>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">From the foundation</p>
            <h2 className="display-heading">The work behind the words.</h2>
          </div>
          <Link href="/updates" className="text-link">
            Foundation news & stories <Icon name="arrow" size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
