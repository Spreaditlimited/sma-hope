import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";

export const metadata = buildMetadata({
  title: "Terms",
  description: "Website terms for SMA Hope Foundation Nigeria.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms" intro="Professional placeholder terms text for launch readiness" />
      <section className="section-tight">
        <div className="container about-page-flow">
          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Use of This Website</h2>
              <p>By using this website, you agree to use its content lawfully and respectfully.</p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Content Accuracy</h2>
              <p>We work to keep information accurate and current but cannot guarantee completeness at all times.</p>
            </article>
          </div>
          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Donations and Purchases</h2>
              <p>Payments are processed through third-party providers including Paystack and Stripe under their own terms.</p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Contact</h2>
              <p>For questions about these terms, contact hello@smahope.org.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
