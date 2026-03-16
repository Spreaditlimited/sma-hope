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
        <div className="cta-main">
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
        <form className="cta-signup-form" action="#" method="post">
          <h3 className="cta-signup-title">Be part of the mission</h3>
          <p className="cta-signup-copy">
            Join our email list for updates, awareness resources, and ways to stand with families affected by SMA.
          </p>
          <label className="cta-signup-label" htmlFor="cta-name">
            Name
          </label>
          <input id="cta-name" name="name" type="text" autoComplete="name" required className="cta-signup-input" />
          <label className="cta-signup-label" htmlFor="cta-email">
            Email
          </label>
          <input id="cta-email" name="email" type="email" autoComplete="email" required className="cta-signup-input" />
          <button type="submit" className="btn cta-signup-btn">
            Sign Up
          </button>
        </form>
      </div>
    </section>
  );
}
