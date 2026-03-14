export function PageHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <section className="section-tight">
      <div className="container">
        <p className="kicker">SMA Hope Foundation Nigeria</p>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.1rem)", marginBottom: "0.8rem" }}>{title}</h1>
        <p className="lead" style={{ maxWidth: "60ch", margin: 0 }}>{intro}</p>
      </div>
    </section>
  );
}
