import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { UpdateCard } from "@/components/update-card";
import { getAllUpdates } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "Foundation news & stories",
  description: "News, family perspectives, and updates from SMA Hope Foundation Nigeria.",
  path: "/updates",
});
export default async function Updates() {
  const posts = await getAllUpdates();
  return (
    <>
      <PageHeader
        title="The stories behind the work."
        intro="Foundation news, lived experience, and the journey we’re building together."
      />
      <section className="container hope-section">
        <div className="guide-grid">
          {[...posts]
            .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
            .map((p) => (
              <UpdateCard item={p} key={p.slug} />
            ))}
        </div>
        <div className="editorial-note">
          <div>
            <h2>Looking for practical information about SMA?</h2>
            <p>
              Explore our guides on diagnosis, care planning, genetic testing, school, and
              supporting families in Nigeria.
            </p>
            <Link href="/blog" className="text-link">
              Visit the knowledge hub →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
