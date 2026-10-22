"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="container empty-state" style={{ marginBlock: 70 }}>
      <h1 className="display-heading">We couldn’t load this page.</h1>
      <p>Please try again. If the problem continues, contact the foundation.</p>
      <div className="button-row">
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/contact" className="btn btn-secondary">
          Contact us
        </Link>
      </div>
    </section>
  );
}
