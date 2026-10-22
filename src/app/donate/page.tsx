import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { DonationOptions } from "@/components/donation-options";
import { Icon } from "@/components/icon";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "Donate to SMA Hope Foundation Nigeria",
  description:
    "Support SMA awareness, family education, and advocacy in Nigeria. Give once or explore recurring support through SMA Hope Foundation.",
  path: "/donate",
});
export default function Donate() {
  return (
    <>
      <PageHeader
        title="Help understanding grow."
        intro="Your support helps us build a more informed and compassionate response to SMA in Nigeria."
      />
      <section className="container hope-section action-page-grid">
        <div className="action-page-copy">
          <p className="eyebrow">A shared commitment</p>
          <h2 className="display-heading">
            Give with purpose.
            <br />
            <em>Stand with families.</em>
          </h2>
          <p>
            Support the foundation’s work in awareness, family-centred education, and advocacy
            shaped by lived experience.
          </p>
          <ul className="giving-purpose">
            {[
              "Clear, accessible information about SMA",
              "Practical resources for families and communities",
              "A stronger public voice for dignity and understanding",
            ].map((t) => (
              <li key={t}>
                <Icon name="check" size={18} />
                {t}
              </li>
            ))}
          </ul>
          <div className="giving-trust">
            <Icon name="shield" size={25} />
            <h3>Trust is part of the work.</h3>
            <p>
              Your donation supports the foundation’s mission. It is not a payment for medical
              treatment or a guarantee of individual financial support.
            </p>
            <Link href="/transparency" className="text-link">
              Our approach to transparency →
            </Link>
          </div>
          <p className="action-footnote">
            Questions about giving or a larger partnership?{" "}
            <Link href="/contact">Get in touch.</Link>
          </p>
        </div>
        <div className="action-form-card">
          <Suspense fallback={<p role="status">Loading donation options…</p>}>
            <DonationOptions />
          </Suspense>
        </div>
      </section>
      <section className="container other-support">
        <h2>There are many ways to give hope.</h2>
        <p>
          Sharing a useful guide, making an introduction, or offering practical help can also make a
          difference.
        </p>
        <Link href="/blog/supporting-an-sma-family" className="text-link">
          Explore practical ways to support a family →
        </Link>
      </section>
    </>
  );
}
