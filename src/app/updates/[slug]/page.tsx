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
    return buildMetadata({ 
      title: "Update Not Found", 
      description: "The requested update could not be found.", 
      path: `/updates/${slug}` 
    });
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
  // Get up to 4 other updates, excluding the current one
  const moreUpdates = allUpdates.filter((item) => item.slug !== post.slug).slice(0, 4);

  return (
    <ContentPageBg image={backgroundImage}>
      <PageHeader 
        title={post.title} 
        intro={post.excerpt} 
        backgroundImage={backgroundImage} 
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        {/* Use a 12-column grid. 
          Article takes 8 columns, Sidebar takes 4 columns on large screens. 
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* MAIN ARTICLE CONTENT */}
          <article className="lg:col-span-8 prose prose-lg md:prose-xl text-gray-700 max-w-none">
            {post.category && (
              <span className="inline-block px-3 py-1 text-sm font-semibold text-[var(--primary)] bg-[#e7f2fb] rounded-full mb-8">
                {post.category}
              </span>
            )}

            {Array.isArray(post.body) ? (
              post.body.map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>{post.body || "Content coming soon."}</p>
            )}
          </article>

          {/* SIDEBAR: MORE UPDATES */}
          {moreUpdates.length > 0 && (
            <aside 
              className="lg:col-span-4 bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 lg:sticky lg:top-8" 
              aria-label="More updates"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">
                More Updates
              </h2>
              
              <div className="space-y-8">
                {moreUpdates.map((item) => (
                  <Link key={item.slug} href={`/updates/${item.slug}`} className="block group">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {item.category} &middot; {new Date(item.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {/* group-hover applies the blue color when any part of the card is hovered */}
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors duration-200 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                      {item.excerpt}
                    </p>
                  </Link>
                ))}
              </div>

              {/* ACTION BUTTON */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link 
                  href="/updates" 
                  className="block w-full text-center px-6 py-3 bg-white hover:bg-gray-50 text-[var(--primary)] border border-[#c3d8e8] font-semibold rounded-lg shadow-sm transition-colors duration-200"
                >
                  View All Updates
                </Link>
              </div>
            </aside>
          )}

        </div>
      </main>
    </ContentPageBg>
  );
}
