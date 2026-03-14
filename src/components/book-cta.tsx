import Link from "next/link";

export function BookCTA() {
  return (
    <div className="card" style={{ padding: "1.1rem" }}>
      <h3 style={{ marginTop: 0 }}>A book shaped by truth, family, and hard-won understanding</h3>
      <p style={{ color: "var(--text-soft)" }}>
        The book is launching alongside the foundation website to deepen public understanding of SMA through lived family reality.
      </p>
      <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
        <Link href="/book" className="btn btn-primary">
          Explore the Book
        </Link>
        <Link href="/contact" className="btn btn-secondary">
          Bulk Orders
        </Link>
      </div>
    </div>
  );
}
