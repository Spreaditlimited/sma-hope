import { PageHeader } from "@/components/page-header";
import { DonationOptions } from "@/components/donation-options";
import { ContentPageBg } from "@/components/content-page-bg";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Donate",
  description: "Support the work of SMA Hope Foundation Nigeria.",
  path: "/donate",
});

const sections = [
  {
    heading: "Why Support Matters",
    paragraphs: [
      "For many people, SMA is still unfamiliar. For many families, it is a daily reality that affects breathing, feeding, movement, medical care, emotional strength, finances, and the rhythm of the whole home.",
      "This gap between what families carry and what society understands is one of the reasons SMA Hope Foundation Nigeria exists.",
      "Support matters because awareness matters. Education matters. Advocacy matters. Family dignity matters.",
    ],
  },
  {
    heading: "What Your Support Helps Make Possible",
    paragraphs: ["Your support helps us continue building a serious and compassionate public platform for:"],
    items: [
      "SMA awareness in plain language",
      "family-centred education and support-building",
      "advocacy shaped by lived experience",
      "public trust and visibility around the realities of SMA",
      "the long-term growth of the foundation's mission",
    ],
  },
  {
    heading: "Ways to Give",
    paragraphs: [
      "Give from Nigeria: supporters in Nigeria will be able to give securely through Paystack.",
      "Give internationally: supporters outside Nigeria, including the diaspora, will be able to give securely through Stripe.",
      "One-time support and ongoing recurring support are both available.",
    ],
  },
  {
    heading: "Give With Confidence",
    paragraphs: [
      "Trust matters in work like this.",
      "SMA Hope Foundation Nigeria is a registered foundation in Nigeria, and we are committed to carrying this work with seriousness, clarity, and a strong sense of responsibility.",
      "We do not want people to support this mission based only on emotion. We want people to support it with understanding and confidence.",
    ],
  },
  {
    heading: "There Are Other Ways to Support",
    paragraphs: ["Not everyone will support in the same way, and that is fine. Below are ways you can support:"],
    items: [
      "buying the book",
      "sharing awareness content",
      "telling others about SMA Hope Foundation Nigeria",
      "partnering with the foundation",
      "helping more people understand what SMA really means for families",
    ],
  },
];

function renderPanel(section: { heading: string; paragraphs?: string[]; items?: string[] }) {
  return (
    <article className="about-panel prose" key={section.heading}>
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
    </article>
  );
}

export default function DonatePage() {
  return (
    <ContentPageBg image="/home/home-trust-transparency.png">
      <PageHeader
        title="Donate"
        intro="Support the work of SMA Hope Foundation Nigeria"
        backgroundImage="/home/home-trust-transparency.png"
      />

      <section className="section-tight content-page-section">
        <div className="container about-page-flow">
          <article className="about-panel prose">
            <p>
              SMA Hope Foundation Nigeria exists because the burden families carry is real, and because awareness, dignity, support, and informed public understanding do not grow on their own. They have to be built deliberately.
            </p>
            <p>
              When you support this foundation, you are helping to strengthen a platform shaped by real family experience and committed to turning painful reality into meaningful public work.
            </p>
          </article>

          <div className="about-two-col">
            {renderPanel(sections[0])}
            {renderPanel(sections[1])}
          </div>

          <div className="about-two-col">
            {renderPanel(sections[2])}
            {renderPanel(sections[3])}
          </div>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">There Are Other Ways to Support</h2>
              <p>Not everyone will support in the same way, and that is fine. Below are ways you can support:</p>
              <ul className="support-bullets">
                <li>buying the book</li>
                <li>sharing awareness content</li>
                <li>telling others about SMA Hope Foundation Nigeria</li>
                <li>partnering with the foundation</li>
                <li>helping more people understand what SMA really means for families</li>
              </ul>
            </article>

            <article className="about-panel">
              <DonationOptions />
              <p style={{ fontSize: "0.9rem", color: "var(--text-soft)", marginBottom: 0 }}>
                Secure payments powered by Paystack and Stripe.
              </p>
            </article>
          </div>

          <article className="about-panel prose">
            <p>
              To support SMA Hope Foundation Nigeria is to support a mission rooted in truth, dignity, awareness, and lived experience.
            </p>
            <p>
              It is to stand with families affected by Spinal Muscular Atrophy. It is to help grow public understanding. It is to strengthen a foundation that was born from real burden and is being built with real seriousness.
            </p>
            <p>We are grateful for every person who chooses to help carry this work forward.</p>
          </article>
        </div>
      </section>
    </ContentPageBg>
  );
}
