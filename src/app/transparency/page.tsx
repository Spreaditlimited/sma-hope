import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";

export const metadata = buildMetadata({
  title: "Transparency",
  description: "Our commitment to stewardship, clarity, and accountability.",
  path: "/transparency",
});

export default function TransparencyPage() {
  return (
    <ContentPageBg image="/home/home-why-foundation.png">
      <PageHeader
        title="Transparency"
        intro="Built on seriousness, compassion, and accountability"
        backgroundImage="/home/home-why-foundation.png"
      />
      <section className="section-tight content-page-section">
        <div className="container about-page-flow single-content-layout">
          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Registered Foundation Status</h2>
              <p>SMA Hope Foundation Nigeria is a registered foundation in Nigeria.</p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Commitment to Stewardship</h2>
              <p>We are committed to carrying this work with care, honesty, and responsible stewardship.</p>
            </article>
          </div>
          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">How Support Is Used</h2>
              <p>Support helps strengthen awareness, education, advocacy, family visibility, and the platform needed for long-term mission growth.</p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Growth and Reporting Commitment</h2>
              <p>As the foundation grows, reporting and communication will develop with the same seriousness that guides the mission.</p>
            </article>
          </div>
        </div>
      </section>
    </ContentPageBg>
  );
}
