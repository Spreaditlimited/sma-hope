import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getAllUpdates, getUpdateBySlug } from "@/lib/content";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";

type Props = {
  params: Promise<{ slug: string }>;
};

const updateBackgrounds = [
  "/home/home-who-we-are.png",
  "/home/home-what-is-sma.png",
  "/home/home-why-foundation.png",
  "/home/home-our-story.png",
  "/home/home-support-families.png",
  "/home/home-ways-to-help.png",
  "/home/home-trust-transparency.png",
  "/home/home-latest-updates.png",
  "/home/home-final-cta.png",
];

function getBackgroundFromSlug(slug: string) {
  const hash = slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return updateBackgrounds[hash % updateBackgrounds.length];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getUpdateBySlug(slug);

  if (!post) {
    return buildMetadata({ title: "Update Not Found", description: "The requested update could not be found.", path: `/updates/${slug}` });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt || "Update from SMA Hope Foundation Nigeria",
    path: `/updates/${slug}`,
  });
}

export default async function UpdatePage({ params }: Props) {
  const { slug } = await params;
  const [post, allUpdates] = await Promise.all([getUpdateBySlug(slug), getAllUpdates()]);

  if (!post) notFound();

  const backgroundImage = getBackgroundFromSlug(post.slug);
  const moreUpdates = allUpdates.filter((item) => item.slug !== post.slug).slice(0, 4);

  return (
    <ContentPageBg image={backgroundImage}>
      <PageHeader title={post.title} intro={post.excerpt} backgroundImage={backgroundImage} />

      <section className="section-tight content-page-section">
        <div className="container updates-detail-layout">
          <article className="about-panel prose updates-detail-article">
            <p className="kicker" style={{ marginTop: 0 }}>{post.category}</p>
            {Array.isArray(post.body)
              ? post.body.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)
              : <p>{post.body || "Content coming soon."}</p>}
          </article>

          {moreUpdates.length ? (
            <aside className="about-panel updates-more-panel" aria-label="More updates">
              <h2 className="section-heading-strong" style={{ marginTop: 0 }}>More Updates</h2>
              <div className="updates-more-list">
                {moreUpdates.map((item) => (
                  <Link key={item.slug} href={`/updates/${item.slug}`} className="updates-more-item">
                    <p className="updates-more-meta">
                      {item.category} · {new Date(item.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <h3 className="updates-more-title">{item.title}</h3>
                    <p className="updates-more-excerpt">{item.excerpt}</p>
                  </Link>
                ))}
              </div>
              <div className="section-actions" style={{ marginTop: "0.9rem" }}>
                <Link href="/updates" className="btn btn-secondary">
                  View All Updates
                </Link>
              </div>
            </aside>
          ) : null}
        </div>
      </section>
    </ContentPageBg>
  );
}
