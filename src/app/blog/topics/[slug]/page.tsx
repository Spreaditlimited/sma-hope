import Link from "next/link";
import { notFound } from "next/navigation";
import { topics } from "@/lib/topics";
import { getGuides } from "@/lib/articles";
import { GuideCard } from "@/components/guide-card";
import { PageHeader } from "@/components/page-header";
import { buildMetadata } from "@/lib/metadata";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const t = topics.find((t) => t.slug === slug);
  return t
    ? buildMetadata({
        title: `${t.name}: SMA guides for Nigeria`,
        description: t.description,
        path: `/blog/topics/${slug}`,
      })
    : {};
}
export default async function Topic({ params }: Props) {
  const guides = await getGuides();
  const { slug } = await params;
  const t = topics.find((t) => t.slug === slug);
  if (!t) notFound();
  return (
    <>
      <PageHeader title={t.name} intro={t.description} />
      <section className="container hope-section">
        <Link href="/blog" className="text-link" style={{ marginBottom: 30 }}>
          ← All knowledge hub topics
        </Link>
        <div className="guide-grid">
          {guides
            .filter((g) => g.category === t.name)
            .map((g) => (
              <GuideCard guide={g} key={g.slug} />
            ))}
        </div>
      </section>
    </>
  );
}
