import Link from "next/link";

export function BookCTA() {
  return (
    <div className="card" style={{ padding: "1.1rem" }}>
      <h3 style={{ marginTop: 0 }}>A book shaped by truth, family, and hard-won understanding</h3>
      <p style={{ color: "var(--text-soft)" }}>
        When Every Breath Matters shares Tochukwu and Ijeoma Nkwocha’s family story alongside clear explanations of SMA, treatment access and daily care.
      </p>
      <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
        <Link href="/book" className="btn btn-primary">
          Explore the Book
        </Link>
        <Link href="/our-story" className="btn btn-secondary">
          Meet the family
        </Link>
      </div>
    </div>
  );
}
