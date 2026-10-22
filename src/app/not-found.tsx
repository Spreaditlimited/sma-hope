import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container empty-state" style={{ marginBlock: 70 }}>
      <p className="eyebrow">404 / A different next step</p>
      <h1 className="display-heading">Let’s find your way back.</h1>
      <p>This page may have moved, or the address may be incomplete.</p>
      <div className="button-row">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/blog" className="btn btn-secondary">
          Explore the knowledge hub
        </Link>
      </div>
    </section>
  );
}
