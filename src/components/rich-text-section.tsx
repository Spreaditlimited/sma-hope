export type RichSection = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

export function RichTextSection({ section }: { section: RichSection }) {
  return (
    <section className="section-tight">
      <div className="container prose" style={{ maxWidth: "72ch" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>{section.heading}</h2>
        {section.paragraphs?.map((text) => (
          <p key={text}>{text}</p>
        ))}
        {section.items ? (
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
