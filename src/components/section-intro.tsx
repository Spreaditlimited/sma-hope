export function SectionIntro({ heading, body }: { heading: string; body: string }) {
  return (
    <header style={{ marginBottom: "1rem" }}>
      <h2 style={{ fontSize: "clamp(1.5rem, 2.7vw, 2.2rem)", marginBottom: "0.6rem" }}>{heading}</h2>
      <p className="lead" style={{ margin: 0 }}>{body}</p>
    </header>
  );
}
