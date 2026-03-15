import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { getUpdateBySlug } from "@/lib/content";
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
  const post = await getUpdateBySlug(slug);

  if (!post) notFound();

  const backgroundImage = getBackgroundFromSlug(post.slug);

  return (
    <ContentPageBg image={backgroundImage}>
      <PageHeader title={post.title} intro={post.excerpt} backgroundImage={backgroundImage} />

      <section className="section-tight content-page-section">
        <div className="container about-page-flow">
          <article className="about-panel prose" style={{ maxWidth: "72ch" }}>
            <p className="kicker">{post.category}</p>
            {Array.isArray(post.body)
              ? post.body.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)
              : <p>{post.body || "Content coming soon."}</p>}
          </article>
        </div>
      </section>
    </ContentPageBg>
  );
}
