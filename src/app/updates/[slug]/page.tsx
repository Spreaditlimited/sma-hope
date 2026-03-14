import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { getUpdateBySlug } from "@/lib/content";

type Props = {
  params: Promise<{ slug: string }>;
};

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

  return (
    <article className="section">
      <div className="container prose" style={{ maxWidth: "72ch" }}>
        <p className="kicker">{post.category}</p>
        <h1>{post.title}</h1>
        <p className="lead">{post.excerpt}</p>
        {Array.isArray(post.body)
          ? post.body.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)
          : <p>{post.body || "Content coming soon."}</p>}
      </div>
    </article>
  );
}
