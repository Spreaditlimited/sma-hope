import Image from "next/image";

export function EditorialSection({
  heading,
  paragraphs,
  items,
  imageAlt,
  reverse = false,
  imagePosition = "center",
}: {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  imageAlt: string;
  reverse?: boolean;
  imagePosition?: string;
}) {
  return (
    <section className="section-tight">
      <div className={`container page-flow ${reverse ? "is-reverse" : ""}`}>
        <article className="page-flow-copy">
          <h2 className="section-heading-strong">{heading}</h2>
          <div className="prose" style={{ maxWidth: "70ch" }}>
            {paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {items?.length ? (
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>

        <aside className="page-flow-media card">
          <Image
            src="/family.jpg"
            alt={imageAlt}
            width={3589}
            height={3024}
            className="page-flow-image"
            style={{ objectPosition: imagePosition }}
          />
        </aside>
      </div>
    </section>
  );
}
