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
      
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-20">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto md:text-left">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Last updated: March 17, 2026
            </p>
            <p className="font-medium text-gray-900">
              These Terms of Use (&quot;Terms&quot;) govern your access to and use of the SMA Hope Foundation Nigeria website and related services. 
            </p>
            <p>
              By accessing or using this website, you agree to be bound by these Terms. If you do not agree, do not use the website.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ROW 1: WEBSITE USE & ELIGIBILITY */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Use of This Website</h2>
              <p>
                You agree to use this website lawfully and in a manner that does not infringe the rights of others or restrict anyone else&apos;s use of the website.
              </p>
              <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">You must not:</h3>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-400">
                <li>Use the website for unlawful, fraudulent, abusive, or harmful purposes.</li>
                <li>Attempt unauthorized access to systems, data, or user accounts.</li>
                <li>Introduce malware, harmful code, or disruptive automated traffic.</li>
                <li>Misrepresent your identity or affiliation.</li>
                <li>Copy, scrape, or republish content in ways that violate law or these Terms.</li>
              </ul>
            </div>

            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Eligibility and Accounts</h2>
              <p>
                You may use this website only if you can form a binding legal agreement under applicable law. If you submit information on behalf of an organization, you confirm that you are authorized to do so.
              </p>
            </div>
          </section>

          {/* HIGHLIGHT: MEDICAL DISCLAIMER */}
          <section className="max-w-4xl mx-auto bg-[#edf5fb] p-8 md:p-10 rounded-2xl border border-[#d4e4ef] shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-[#c3d8e8] pb-2">Medical and Educational Disclaimer</h2>
            <p className="text-lg text-gray-800 font-medium">
              Content on this website is for awareness and general educational purposes only and is not medical advice, diagnosis, or treatment. Always seek guidance from qualified healthcare professionals regarding medical concerns.
            </p>
          </section>

          {/* ROW 2: DONATIONS & PAYMENTS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Donations and Payments</h2>
              <p>
                We facilitate donations and, where available, purchases through third-party payment providers, including Stripe and Paystack. By making a payment, you authorize the transaction through the selected provider under that provider&apos;s terms.
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-400">
                <li>All payments are subject to payment provider authorization and anti-fraud checks.</li>
                <li>We are not liable for payment provider outages or processing errors outside our control.</li>
                <li>You are responsible for ensuring payment details submitted are accurate and authorized.</li>
              </ul>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Donation Receipts and Refunds</h2>
              <p>
                Donation acknowledgments are issued after successful processing. If you believe a donation was made in error, contact <a href="mailto:help@smahope.org" className="text-[var(--primary)] hover:underline">help@smahope.org</a> promptly with transaction details.
              </p>
              <p>
                We review refund requests case-by-case, subject to legal obligations, payment processor rules, and whether funds have already been allocated or disbursed for charitable use.
              </p>
            </div>
          </section>

          {/* ROW 3: BOOKS & IP */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Book and Resource Orders</h2>
              <p>
                Where physical or digital resources are offered, availability, pricing, delivery windows, and order conditions may change without notice. Specific details shown at checkout or in the order flow apply to that transaction.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Intellectual Property</h2>
              <p>
                Unless otherwise stated, website content including text, graphics, logos, design elements, and media is owned by or licensed to SMA Hope Foundation Nigeria and protected by applicable intellectual property laws.
              </p>
              <p>
                You may view and share content for personal, non-commercial, and awareness purposes with proper attribution. Any commercial use, modification, reproduction, or distribution requires prior written permission.
              </p>
            </div>
          </section>

          {/* ROW 4: SUBMISSIONS, THIRD-PARTY & ACCURACY */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">User Submissions</h2>
              <p>
                By submitting messages, stories, testimonials, or other content to us, you confirm you have the right to provide it and grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and adapt that content for foundation activities and communications, subject to applicable privacy commitments.
              </p>
            </div>

            <div className="space-y-12">
              <div className="prose prose-lg text-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Third-Party Links and Services</h2>
                <p>
                  This website may contain links to external websites, platforms, or services. We do not control and are not responsible for third-party content, policies, or practices. Accessing third-party services is at your own risk.
                </p>
              </div>

              <div className="prose prose-lg text-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Content Accuracy and Availability</h2>
                <p>
                  We strive to keep website information accurate and up to date. However, content may be incomplete, outdated, or changed without notice. We do not guarantee uninterrupted or error-free website availability.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* DISCLAIMERS & LIABILITY */}
          <section className="prose prose-lg text-gray-700 max-w-3xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Disclaimer of Warranties</h2>
              <p>
                To the extent permitted by law, this website and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, SMA Hope Foundation Nigeria and its officers, trustees, staff, volunteers, partners, and agents are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, goodwill, revenue, or profits arising from or related to your use of this website.
              </p>
              <p>
                Where liability cannot be excluded by law, our liability is limited to the minimum amount permitted under applicable law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Indemnity</h2>
              <p>
                You agree to indemnify and hold harmless SMA Hope Foundation Nigeria from claims, liabilities, damages, losses, and expenses arising out of your breach of these Terms or misuse of the website.
              </p>
            </div>
          </section>

          {/* ROW 5: CHANGES & TERMINATION */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Changes to These Terms</h2>
              <p>
                We may update these Terms at any time by posting revised text on this page. Continued use of the website after updates are posted constitutes acceptance of the revised Terms.
              </p>
            </div>
            
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Termination</h2>
              <p>
                We may suspend or terminate access to the website for users who violate these Terms or engage in activity that may harm the website, users, or the foundation.
              </p>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* LAW & CONTACT */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Governing Law and Disputes</h2>
              <p>
                These Terms are governed by the laws of the Federal Republic of Nigeria. You agree that competent courts in Nigeria will have jurisdiction over disputes arising out of or related to these Terms or the website, subject to any mandatory rights under applicable law.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Contact</h2>
              <p className="mb-2">For questions regarding these Terms, contact:</p>
              <address className="not-italic font-medium text-gray-900">
                SMA Hope Foundation Nigeria<br />
                Email: <a href="mailto:help@smahope.org" className="text-[var(--primary)] hover:underline">help@smahope.org</a><br />
                Website: <a href="https://smahope.org" className="text-[var(--primary)] hover:underline">https://smahope.org</a>
              </address>
            </div>
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}