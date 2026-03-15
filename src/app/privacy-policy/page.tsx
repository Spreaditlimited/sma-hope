import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How SMA Hope Foundation Nigeria handles personal data and privacy.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" intro="Professional placeholder policy text for launch readiness" />
      <section className="section-tight">
        <div className="container about-page-flow">
          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Information We Collect</h2>
              <p>We collect contact details and message content you provide through the website forms.</p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">How We Use Information</h2>
              <p>Information is used to respond to enquiries, improve website services, and communicate updates where consent exists.</p>
            </article>
          </div>
          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Data Security</h2>
              <p>We use reasonable safeguards for data processing and storage and review our approach as the platform grows.</p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Your Rights</h2>
              <p>You may request updates, corrections, or deletion of your data by contacting hello@smahope.org.</p>
            </article>
          </div>
          <article id="cookies" className="about-panel prose">
            <h2 className="section-heading-strong">Cookies</h2>
            <p>
              We use essential cookies required for core website functionality. Where enabled, optional cookies may be used to improve performance and user experience.
            </p>
            <p>
              You can accept or decline optional cookies through the cookie notice. Your preference is saved and can be updated by clearing cookies in your browser.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
