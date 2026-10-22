import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { GuideCard } from "@/components/guide-card";
import { getGuides } from "@/lib/articles";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "What is SMA? Understanding spinal muscular atrophy",
  description:
    "Understand spinal muscular atrophy in plain language and find practical guides on diagnosis, genetic testing, and care for Nigerian families.",
  path: "/what-is-sma",
});
export default async function SmaPage() {
  const guides = await getGuides();
  return (
    <>
      <PageHeader
        title="Understanding spinal muscular atrophy."
        intro="A clear starting point for a condition that can bring many questions."
      />
      <div className="container hope-section">
        <div className="mission-layout">
          <div>
            <p className="eyebrow">Start with understanding</p>
            <h2 className="display-heading">
              A diagnosis is part
              <br />
              of a person’s story.
              <br />
              <em>It isn’t the whole story.</em>
            </h2>
          </div>
          <div className="mission-copy">
            <p>
              Spinal muscular atrophy, or SMA, is a genetic condition that causes muscle weakness.
              It can affect children and adults, and its effects vary from person to person.
            </p>
            <p>
              Movement, breathing, and swallowing can be affected. An individual assessment is
              needed to understand the person’s needs and plan care.{" "}
              <a href="https://www.nhs.uk/conditions/spinal-muscular-atrophy-sma/">
                Read the NHS overview of SMA.
              </a>
            </p>
            <p>
              Our Nigeria-focused guides help you prepare questions, organise appointments, and
              think through the practical realities around care.
            </p>
            <Link href="/blog/understanding-sma-nigeria" className="btn btn-primary">
              Read the starting guide →
            </Link>
          </div>
        </div>
        <div className="topic-paths">
          <h2>Follow the questions that matter to you.</h2>
          {[
            [
              "Understanding the diagnosis",
              "What does SMA mean, and what should we ask next?",
              "understanding-sma-nigeria",
            ],
            [
              "Genetic testing",
              "How do diagnostic and carrier tests differ?",
              "sma-genetic-testing",
            ],
            [
              "Treatment and access",
              "What should we verify when exploring options from Nigeria?",
              "sma-treatment-access-nigeria",
            ],
            [
              "Coordinating care",
              "How can we organise referrals and appointments?",
              "sma-care-team-nigeria",
            ],
          ].map(([t, d, s]) => (
            <Link href={`/blog/${s}`} key={s}>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Beyond the diagnosis</p>
            <h2 className="display-heading">Make everyday life part of the conversation.</h2>
          </div>
        </div>
        <div className="guide-grid">
          {guides
            .filter((g) =>
              ["planning-sma-care-costs", "school-and-sma", "supporting-an-sma-family"].includes(
                g.slug,
              ),
            )
            .map((g) => (
              <GuideCard guide={g} key={g.slug} />
            ))}
        </div>
      </div>
    </>
  );
}
