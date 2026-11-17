import Link from "next/link";
import styles from "./page.module.css";
import { toGuidePreview } from "@/lib/guide-preview";
import { topics } from "@/lib/topics";
import { getGuides } from "@/lib/articles";
import { GuideLibrary } from "@/components/guide-library";
import { Icon } from "@/components/icon";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "Spinal muscular atrophy guides: Nigeria and international families",
  description:
    "Clear SMA answers on testing, treatment access, costs and family life, with guides for Nigeria, the UK, Canada, the USA and Africa.",
  path: "/blog",
});
export default async function BlogPage() {
  const guides = await getGuides();
  return (
    <div className={styles.page}>
      <header className="library-header">
        <div className="container">
          <p className="eyebrow">The SMA Hope knowledge hub</p>
          <h1>
            Clear answers about{" "}
            <br />
            <em>spinal muscular atrophy.</em>
          </h1>
          <div className="library-intro">
            <p>
              Practical guidance rooted in Nigeria, with dedicated resources for families in the UK, Canada, the USA and across Africa.
            </p>
            <Link href="/blog/understanding-sma-nigeria" className="text-link">
              New to SMA? Start here <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </header>
      <section className="container library-body">
        <nav className={`topic-navigation ${styles.topics}`} aria-label="Knowledge hub topics">
          {topics.map((t) => (
            <Link key={t.slug} href={`/blog/topics/${t.slug}`}>
              {t.name} ↗
            </Link>
          ))}
        </nav>
        <h2 className={styles.sectionTitle}>Find your next answer.</h2>
        <GuideLibrary guides={guides.map(toGuidePreview)} />
        <div className={styles.notes}><div className="editorial-note">
          <Icon name="book" size={24} />
          <div>
            <h2>A family’s experience of spinal muscular atrophy.</h2>
            <p>
              When Every Breath Matters by Tochukwu Nkwocha and Ijeoma Nkwocha brings the
              personal story behind SMA Hope into view: family, care, faith and survival.
            </p>
            <Link href="/book" className="text-link">
              Discover the book, available on Amazon →
            </Link>
          </div>
        </div>
        <div className="editorial-note">
          <Icon name="shield" size={24} />
          <div>
            <h2>Information you can put in context.</h2>
            <p>
              Our guides distinguish practical suggestions from clinical information, link to
              sources, and include practical next steps. They support conversations with your care team.
            </p>
            <Link href="/editorial-policy" className="text-link">
              Read our editorial approach →
            </Link>
          </div>
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
    </div>
  );
}
