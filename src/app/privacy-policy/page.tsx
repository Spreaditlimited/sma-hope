import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How SMA Hope Foundation Nigeria collects, uses, shares, and protects personal data.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <ContentPageBg image="/home/home-what-is-sma.png">
      <PageHeader
        title="Privacy Policy"
        intro="How we collect, use, protect, and manage your personal information."
        backgroundImage="/home/home-what-is-sma.png"
      />
      <section className="section-tight content-page-section">
        <div className="container about-page-flow single-content-layout">
          <article className="about-panel prose">
            <p>
              <strong>Last updated:</strong> March 17, 2026
            </p>
            <p>
              SMA Hope Foundation Nigeria (&quot;SMA Hope&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
              disclose, and protect information when you use
              our website, make donations, purchase resources, submit forms, or otherwise interact with us.
            </p>
            <p>
              This policy is intended to align with applicable data protection obligations, including the Nigeria Data Protection Act (NDPA) 2023 and, where applicable, other international privacy requirements.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Who We Are</h2>
            <p>
              SMA Hope Foundation Nigeria is a nonprofit organization focused on raising awareness about Spinal Muscular Atrophy (SMA), supporting families, and mobilizing advocacy and charitable support.
            </p>
            <p>If you have any privacy questions, contact us at hello@smahope.org.</p>
          </article>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Information We Collect</h2>
              <h3>Information you provide directly</h3>
              <ul>
                <li>Contact details such as name, email address, phone number, and country.</li>
                <li>Messages, inquiries, and support requests submitted through forms or email.</li>
                <li>Donation-related details (for example donation amount and transaction reference).</li>
                <li>Book or resource purchase details, where available through our checkout flow.</li>
                <li>Any other information you choose to submit in forms or correspondence.</li>
              </ul>
              <h3>Information collected automatically</h3>
              <ul>
                <li>Device and browser metadata, IP address, language, and approximate location.</li>
                <li>Pages viewed, interaction events, referral URLs, and session information.</li>
                <li>Cookie identifiers and similar technologies, subject to your preferences where required.</li>
              </ul>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">How We Use Information</h2>
              <ul>
                <li>Respond to inquiries, requests, and support needs.</li>
                <li>Process donations and other transactions.</li>
                <li>Provide receipts, confirmations, and service communications.</li>
                <li>Operate, maintain, and improve the website and our programs.</li>
                <li>Detect fraud, abuse, security incidents, and misuse.</li>
                <li>Comply with legal, accounting, tax, and regulatory obligations.</li>
                <li>Send campaign updates and newsletters where you have opted in or where otherwise permitted.</li>
              </ul>
            </article>
          </div>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Legal Bases for Processing</h2>
            <p>Depending on the context, we process personal data on one or more of the following legal bases:</p>
            <ul>
              <li>Your consent.</li>
              <li>Performance of a contract or transaction with you.</li>
              <li>Compliance with legal obligations.</li>
              <li>Our legitimate interests, such as service security, fraud prevention, and program improvement.</li>
            </ul>
          </article>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">How We Share Information</h2>
              <p>We do not sell personal data. We may share information with:</p>
              <ul>
                <li>Payment processors and financial service providers (including Stripe and Paystack).</li>
                <li>Technology service providers that host, secure, or support our website and communications.</li>
                <li>Professional advisers, auditors, or regulators where required.</li>
                <li>Law enforcement or authorities where disclosure is legally required.</li>
              </ul>
              <p>
                Third-party providers process data under their own privacy notices and terms. We encourage you to review those notices before submitting payment or sensitive information.
              </p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">International Transfers</h2>
              <p>
                Some service providers may process data outside Nigeria. Where international transfers occur, we take reasonable steps to ensure safeguards are in place consistent with applicable data protection rules.
              </p>
            </article>
          </div>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Data Retention</h2>
              <p>
                We retain personal data for as long as necessary to fulfill the purposes described in this policy, including legal, accounting, tax, reporting, and safeguarding obligations. Retention periods vary by
                record type and legal requirements.
              </p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Data Security</h2>
              <p>
                We apply technical and organizational safeguards designed to protect personal information from unauthorized access, misuse, loss, disclosure, or alteration. No online system is completely secure, so we
                cannot guarantee absolute security.
              </p>
            </article>
          </div>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Your Privacy Rights</h2>
            <p>Subject to applicable law, you may have the right to:</p>
            <ul>
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or update of inaccurate or incomplete data.</li>
              <li>Request deletion of personal data in certain circumstances.</li>
              <li>Object to or request restriction of certain processing.</li>
              <li>Withdraw consent where processing is based on consent.</li>
              <li>Request portability of data where applicable.</li>
              <li>Complain to a relevant data protection regulator.</li>
            </ul>
            <p>To exercise your rights, email hello@smahope.org. We may request verification before fulfilling a request.</p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Children&apos;s Privacy</h2>
            <p>
              Our website is intended for general audiences and not directed to children for independent use. Where information related to children is shared in support or medical contexts, this is expected to be
              provided by parents, guardians, or authorized representatives.
            </p>
          </article>

          <article id="cookies" className="about-panel prose">
            <h2 className="section-heading-strong">Cookies</h2>
            <p>
              We use cookies and similar technologies to keep the website functioning, remember preferences, and understand usage patterns.
            </p>
            <h3>Cookie categories</h3>
            <ul>
              <li>Essential cookies: required for core site and security functionality.</li>
              <li>Analytics/performance cookies: help us understand traffic and improve content.</li>
              <li>Preference cookies: remember user settings where available.</li>
            </ul>
            <p>
              You can accept or reject optional cookies via our cookie notice where presented. You may also manage cookies through browser settings. Disabling certain cookies may affect parts of site functionality.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Third-Party Links and Services</h2>
            <p>
              Our website may link to third-party websites or services. We are not responsible for their privacy practices, content, or security. Review third-party policies before sharing personal information.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect legal, technical, or operational changes. Updates are effective when posted on this page, and the &quot;Last updated&quot; date will be
              revised.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Contact Us</h2>
            <p>If you have questions, requests, or complaints regarding this policy, contact:</p>
            <p>
              SMA Hope Foundation Nigeria
              <br />
              Email: hello@smahope.org
              <br />
              Website: https://smahope.org
            </p>
          </article>
        </div>
      </section>
    </ContentPageBg>
  );
}
