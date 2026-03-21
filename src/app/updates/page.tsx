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
      <PageHeader 
        title="Updates" 
        intro="Latest updates and reflections" 
        backgroundImage="/home/home-final-cta.png" 
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-12 md:space-y-16">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center">
            <p>
              Follow our journey, read our reflections, and stay informed about the latest awareness resources and initiatives from SMA Hope Foundation Nigeria.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* UPDATES GRID */}
          <section className="max-w-4xl mx-auto">
            {updates && updates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {updates.map((item) => (
                  /* External UpdateCard Component - Internal styling remains untouched */
                  <UpdateCard key={item.slug} item={item} />
                ))}
              </div>
            ) : (
              /* Graceful Empty State */
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-lg text-gray-600 font-medium">
                  We are currently preparing our first updates. Please check back soon.
                </p>
              </div>
            )}
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}