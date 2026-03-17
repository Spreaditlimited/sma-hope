import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms governing access to and use of SMA Hope Foundation Nigeria website and services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ContentPageBg image="/home/home-our-story.png">
      <PageHeader
        title="Terms of Use"
        intro="Rules and conditions for using this website, making donations, and engaging with our content."
        backgroundImage="/home/home-our-story.png"
      />
      <section className="section-tight content-page-section">
        <div className="container about-page-flow">
          <article className="about-panel prose">
            <p>
              <strong>Last updated:</strong> March 17, 2026
            </p>
            <p>
              These Terms of Use (&quot;Terms&quot;) govern your access to and use of the SMA Hope Foundation Nigeria website and related services. By accessing or using this website, you agree to be bound by these
              Terms. If
              you do not agree, do not use the website.
            </p>
          </article>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Use of This Website</h2>
              <p>You agree to use this website lawfully and in a manner that does not infringe the rights of others or restrict anyone else&apos;s use of the website.</p>
              <h3>You must not:</h3>
              <ul>
                <li>Use the website for unlawful, fraudulent, abusive, or harmful purposes.</li>
                <li>Attempt unauthorized access to systems, data, or user accounts.</li>
                <li>Introduce malware, harmful code, or disruptive automated traffic.</li>
                <li>Misrepresent your identity or affiliation.</li>
                <li>Copy, scrape, or republish content in ways that violate law or these Terms.</li>
              </ul>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Eligibility and Accounts</h2>
              <p>
                You may use this website only if you can form a binding legal agreement under applicable law. If you submit information on behalf of an organization, you confirm that you are authorized to do so.
              </p>
            </article>
          </div>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Medical and Educational Disclaimer</h2>
            <p>
              Content on this website is for awareness and general educational purposes only and is not medical advice, diagnosis, or treatment. Always seek guidance from qualified healthcare professionals regarding
              medical concerns.
            </p>
          </article>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Donations and Payments</h2>
              <p>
                We facilitate donations and, where available, purchases through third-party payment providers, including Stripe and Paystack. By making a payment, you authorize the transaction through the selected
                provider under that provider&apos;s terms.
              </p>
              <ul>
                <li>All payments are subject to payment provider authorization and anti-fraud checks.</li>
                <li>We are not liable for payment provider outages or processing errors outside our control.</li>
                <li>You are responsible for ensuring payment details submitted are accurate and authorized.</li>
              </ul>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Donation Receipts and Refunds</h2>
              <p>
                Donation acknowledgments are issued after successful processing. If you believe a donation was made in error, contact hello@smahope.org promptly with transaction details.
              </p>
              <p>
                We review refund requests case-by-case, subject to legal obligations, payment processor rules, and whether funds have already been allocated or disbursed for charitable use.
              </p>
            </article>
          </div>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Book and Resource Orders</h2>
            <p>
              Where physical or digital resources are offered, availability, pricing, delivery windows, and order conditions may change without notice. Specific details shown at checkout or in the order flow apply to
              that transaction.
            </p>
          </article>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Intellectual Property</h2>
              <p>
                Unless otherwise stated, website content including text, graphics, logos, design elements, and media is owned by or licensed to SMA Hope Foundation Nigeria and protected by applicable intellectual
                property laws.
              </p>
              <p>
                You may view and share content for personal, non-commercial, and awareness purposes with proper attribution. Any commercial use, modification, reproduction, or distribution requires prior written
                permission.
              </p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">User Submissions</h2>
              <p>
                By submitting messages, stories, testimonials, or other content to us, you confirm you have the right to provide it and grant us a non-exclusive, worldwide, royalty-free license to use, display,
                reproduce, and adapt that content for foundation activities and communications, subject to applicable privacy commitments.
              </p>
            </article>
          </div>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Third-Party Links and Services</h2>
              <p>
                This website may contain links to external websites, platforms, or services. We do not control and are not responsible for third-party content, policies, or practices. Accessing third-party services
                is at your own risk.
              </p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Content Accuracy and Availability</h2>
              <p>
                We strive to keep website information accurate and up to date. However, content may be incomplete, outdated, or changed without notice. We do not guarantee uninterrupted or error-free website
                availability.
              </p>
            </article>
          </div>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Disclaimer of Warranties</h2>
            <p>
              To the extent permitted by law, this website and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, express or implied, including implied
              warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, SMA Hope Foundation Nigeria and its officers, trustees, staff, volunteers, partners, and agents are not liable for indirect, incidental, special, consequential,
              or punitive damages, or for loss of data, goodwill, revenue, or profits arising from or related to your use of this website.
            </p>
            <p>
              Where liability cannot be excluded by law, our liability is limited to the minimum amount permitted under applicable law.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Indemnity</h2>
            <p>
              You agree to indemnify and hold harmless SMA Hope Foundation Nigeria from claims, liabilities, damages, losses, and expenses arising out of your breach of these Terms or misuse of the website.
            </p>
          </article>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Changes to These Terms</h2>
              <p>
                We may update these Terms at any time by posting revised text on this page. Continued use of the website after updates are posted constitutes acceptance of the revised Terms.
              </p>
            </article>
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Termination</h2>
              <p>
                We may suspend or terminate access to the website for users who violate these Terms or engage in activity that may harm the website, users, or the foundation.
              </p>
            </article>
          </div>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria. You agree that competent courts in Nigeria will have jurisdiction over disputes arising out of or related to these Terms or the
              website, subject to any mandatory rights under applicable law.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Contact</h2>
            <p>For questions regarding these Terms, contact:</p>
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
