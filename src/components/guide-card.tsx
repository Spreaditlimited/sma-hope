import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";
import type { Guide } from "@/content/guides";
export function readingMinutes(guide: Guide) {
  return Math.max(
    3,
    Math.ceil(
      guide.sections
        .map((s) => s.paragraphs.join(" "))
        .join(" ")
        .split(/\s+/).length / 180,
    ),
  );
}
const icons: Record<string, IconName> = {
  "Understanding SMA": "book",
  "Diagnosis & care": "shield",
  "Living with SMA": "people",
  "Family & community": "heart",
};
export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="guide-card">
      <Link
        href={`/blog/${guide.slug}`}
        className="guide-art"
        tabIndex={-1}
        aria-hidden="true"
        data-category={guide.category}
      >
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
      </Link>
      <div className="guide-card-copy">
        <div className="article-meta">
          <span>{guide.category}</span>
          <span>{readingMinutes(guide)} min read</span>
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
