export function CardsGrid({ items }: { items: Array<{ title: string; text: string }> }) {
  return (
    <div className="grid-2">
      {items.map((item) => (
        <article key={item.title} className="card" style={{ padding: "1.1rem" }}>
          <h3 style={{ marginTop: 0 }}>{item.title}</h3>
          <p style={{ marginBottom: 0, color: "var(--text-soft)" }}>{item.text}</p>
        </article>
      ))}
    </div>
  );
}
