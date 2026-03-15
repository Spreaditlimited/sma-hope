import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { UpdateCard } from "@/components/update-card";
import { getAllUpdates } from "@/lib/content";
import { ContentPageBg } from "@/components/content-page-bg";

export const metadata = buildMetadata({
  title: "Updates",
  description: "Latest updates, reflections, and awareness resources from SMA Hope Foundation Nigeria.",
  path: "/updates",
});

export default async function UpdatesPage() {
  const updates = await getAllUpdates();

  return (
    <ContentPageBg image="/home/home-final-cta.png">
      <PageHeader title="Updates" intro="Latest updates and reflections" backgroundImage="/home/home-final-cta.png" />
      <section className="section content-page-section">
        <div className="container grid-2">
          {updates.map((item) => (
            <UpdateCard key={item.slug} item={item} />
          ))}
        </div>
      </section>
    </ContentPageBg>
  );
}
