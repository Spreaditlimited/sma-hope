import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Support for Families",
  description: "For families living with the reality of SMA.",
  path: "/support-for-families",
});

const sections = [
  {
    heading: "If Your Child Has Just Been Diagnosed",
    paragraphs: [
      "The early days after diagnosis can be deeply disorienting.",
      "For some families, there is shock. For others, there is confusion. For some, there is a painful mix of relief and grief.",
      "You may be asking questions you never expected to ask. What does this mean for my child? What kind of life will they have? What treatment exists? What support will be needed? How do we cope? How do we keep going?",
      "These are real questions. They do not make you weak. They make you human.",
      "When SMA enters a family's life, clarity matters. Families need truthful information, not empty reassurance. They need compassion, but they also need substance.",
    ],
  },
  {
    heading: "What the First Days and Months Can Feel Like",
    paragraphs: [
      "Many parents describe the early period after diagnosis as one of the hardest stretches of their lives.",
      "There is a lot to take in. Medical language suddenly becomes part of your daily world. Decisions may need to be made quickly.",
      "At the same time, ordinary life does not pause. The home still needs to function. Work may still demand attention. Other children still need care.",
      "It is not unusual for parents to feel exhausted, frightened, confused, numb, or stretched beyond what they thought they could carry. That does not mean you are failing. It means the burden is real.",
    ],
  },
  {
    heading: "The Practical Reality of SMA Care",
    paragraphs: [
      "Depending on the child's condition, care may involve close attention to breathing, feeding, muscle weakness, posture, fatigue, respiratory infections, cough strength, sleep quality, mobility, nutrition, and overall stability.",
      "Parents can quickly find themselves carrying a level of medical and practical responsibility they never trained for.",
      "What may look ordinary from the outside can involve extraordinary labour behind the scenes.",
    ],
  },
  {
    heading: "The Emotional Weight on Families",
    paragraphs: [
      "SMA does not only affect the body. It affects the atmosphere of a home.",
      "There is the strain of uncertainty. The fear that can rise during illness. The pressure of decision-making. The fatigue that comes from long-term vigilance.",
      "All of this is real. It deserves to be acknowledged honestly.",
    ],
  },
  {
    heading: "For Marriages, Siblings, and the Wider Family",
    paragraphs: [
      "A condition like SMA does not touch only one relationship. It can affect the whole family system.",
      "That is why support for families must be broader than medicine alone. Families need space for truth, patience, support, and practical help.",
    ],
  },
  {
    heading: "What We Hope This Foundation Can Become for Families",
    paragraphs: [
      "SMA Hope Foundation Nigeria is being built from lived experience, and part of our hope is that this foundation becomes a meaningful source of clarity, encouragement, visibility, and support for families affected by SMA.",
      "Over time, we hope this foundation will grow into an even stronger support platform through awareness, education, advocacy, family-centred resources, and a more informed community around SMA.",
    ],
  },
  {
    heading: "What Is Available Now",
    paragraphs: ["We want to be careful and truthful here."],
    items: [
      "a voice shaped by lived experience",
      "growing public education around SMA",
      "honest storytelling that helps families feel seen",
      "a platform that is working to build awareness and informed support",
      "a point of contact for families who want to reach out",
    ],
  },
];

function renderSection(section: { heading: string; paragraphs?: string[]; items?: string[] }) {
  return (
    <section key={section.heading}>
      <h2 className="section-heading-strong">{section.heading}</h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.items ? (
        <ul>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export default function SupportForFamiliesPage() {
  return (
    <ContentPageBg image="/home/home-support-families.png">
      <PageHeader
        title="Support for Families"
        intro="For families living with the reality of SMA"
        backgroundImage="/home/home-support-families.png"
      />

      <section className="section-tight content-page-section">
        <div className="container about-page-flow single-content-layout">
          <article className="about-panel prose">
            <p>
              If your child has been diagnosed with Spinal Muscular Atrophy, or if you are currently trying to understand symptoms, weakness, delayed milestones, feeding difficulties, breathing concerns, or a diagnosis you never expected, we want to begin by saying this clearly: you are not alone.
            </p>
            <p>
              SMA can make a family feel as though life has suddenly split into two parts. The life before the diagnosis, and the life after it.
            </p>
            <p>
              At SMA Hope Foundation Nigeria, we understand that this burden is not only medical. It is emotional, practical, financial, relational, and deeply human.
            </p>
            {sections.map((section) => renderSection(section))}

            <p>Support for families begins with truth.</p>
            <p>
              It begins with recognising that SMA is not a small burden. It begins with seeing the child clearly, seeing the family clearly, and refusing to reduce either one to pity or silence.
            </p>
            <p>
              We hope SMA Hope Foundation Nigeria becomes a place where families affected by SMA find understanding, dignity, and a growing sense that they are not alone.
            </p>
            <div className="section-actions page-end-actions" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <Link href="/contact" className="btn btn-primary">
                Contact the Foundation
              </Link>
              <Link href="/what-is-sma" className="btn btn-secondary">
                Learn About SMA
              </Link>
            </div>
          </article>
        </div>
      </section>
    </ContentPageBg>
  );
}
