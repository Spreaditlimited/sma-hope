import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { GuideCard } from "@/components/guide-card";
import { getGuides } from "@/lib/articles";
import { Icon } from "@/components/icon";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "Support for families",
  description:
    "A practical starting point for Nigerian families navigating SMA, appointments, costs, school, and community support.",
  path: "/support-for-families",
});
export default async function Families() {
  const guides = await getGuides();
  return (
    <>
      <PageHeader
        title="A next step. A little more clarity."
        intro="For families living with SMA, and the people who stand beside them."
      />
      <section className="container hope-section">
        <div className="family-intro">
          <div>
            <p className="eyebrow">You are welcome here</p>
            <h2 className="display-heading">Start where you are.</h2>
            <p>
              You don’t need to understand everything today. Use these starting points to find the
              information most useful to your family right now.
            </p>
          </div>
          <div className="support-note">
            <Icon name="heart" size={28} />
            <h3>What we can offer today</h3>
            <p>
              Educational guides, lived-experience perspectives, and a contact channel for
              enquiries. We are building our support work carefully; we cannot guarantee clinical
              referrals, treatment funding, or emergency assistance.
            </p>
            <Link className="text-link" href="/contact">
              Contact the foundation →
            </Link>
          </div>
        </div>
        <div className="journey-list">
          {[
            [
              "01",
              "We’re looking for answers",
              "Organise concerns and prepare for an assessment.",
              "understanding-sma-nigeria",
            ],
            [
              "02",
              "We’ve received a diagnosis",
              "Make the next appointment more manageable.",
              "after-sma-diagnosis",
            ],
            [
              "03",
              "We’re planning everyday care",
              "Think through costs, travel, school, and support.",
              "planning-sma-care-costs",
            ],
            [
              "04",
              "I want to support someone",
              "Offer practical help with care and respect.",
              "supporting-an-sma-family",
            ],
          ].map(([n, t, d, s]) => (
            <Link key={s} href={`/blog/${s}`}>
              <span>{n}</span>
              <div>
                <h2>{t}</h2>
                <p>{d}</p>
              </div>
              <Icon name="arrow" />
            </Link>
          ))}
        </div>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">For the days ahead</p>
            <h2 className="display-heading">Keep these close.</h2>
          </div>
          <Link href="/blog" className="text-link">
            All family guides →
          </Link>
        </div>
        <div className="guide-grid">
          {guides
            .filter((g) =>
              ["sma-care-team-nigeria", "school-and-sma", "supporting-an-sma-family"].includes(
                g.slug,
              ),
            )
            .map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
        </div>
      </section>
    </>
  );
}
