import Link from "next/link";

export function CTASection({
  headline,
  body,
  primary,
  secondary,
}: {
  headline: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="section">
      <div className="container card cta-shell">
        <h2 className="cta-title">{headline}</h2>
        <p className="cta-body">{body}</p>
        <div className="cta-actions">
          <Link href={primary.href} className="btn cta-btn-primary">
            {primary.label}
          </Link>
          {secondary ? (
            <Link href={secondary.href} className="btn cta-btn-secondary">
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
