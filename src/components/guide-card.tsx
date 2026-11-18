import Link from "next/link";
import { GuideImage } from "@/components/guide-image";
import { getGuideImage } from "@/lib/guide-images";
import { Icon, type IconName } from "@/components/icon";
import type { Guide } from "@/content/guides";
import { guideReadingMinutes, type GuidePreview } from "@/lib/guide-preview";
export const readingMinutes = guideReadingMinutes;
const icons: Record<string, IconName> = {
  "Understanding SMA": "book",
  "Diagnosis & care": "shield",
  "Living with SMA": "people",
  "Family & community": "heart",
};
export function GuideCard({ guide }: { guide: Guide | GuidePreview }) {
  const image = getGuideImage(guide.slug);
  return (
    <article className="guide-card">
      <Link
        href={`/blog/${guide.slug}`}
        className={`guide-art${image ? " guide-art--image" : ""}`}
        tabIndex={-1}
        aria-label={`Read ${guide.title}`}
        data-category={guide.category}
      >
        {image ? <GuideImage slug={guide.slug} variant="card" /> : <>
        <Icon name={icons[guide.category] || "book"} size={60} />
        <span>SMA HOPE / FIELD GUIDE</span>
        <span className="guide-art-word">
          {guide.category === "Diagnosis & care"
            ? "Clarity."
            : guide.category === "Living with SMA"
              ? "Everyday."
              : guide.category === "Family & community"
                ? "Together."
                : "Understand."}
        </span>
        </>}
      </Link>
      <div className="guide-card-copy">
        <div className="article-meta">
          <span>{guide.audience || "Nigeria"} · {guide.category}</span>
          <span>{"minutes" in guide ? guide.minutes : readingMinutes(guide)} min read</span>
        </div>
        <h3>
          <Link href={`/blog/${guide.slug}`}>{guide.title}</Link>
        </h3>
        <p>{guide.excerpt}</p>
        <Link className="text-link" href={`/blog/${guide.slug}`}>
          Read the guide <Icon name="arrow" size={17} />
        </Link>
      </div>
    </article>
  );
}
