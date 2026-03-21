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
      
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-20">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto md:text-left">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Last updated: March 17, 2026
            </p>
            <p className="font-medium text-gray-900">
              SMA Hope Foundation Nigeria (&quot;SMA Hope&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. 
            </p>
            <p>
              This Privacy Policy explains how we collect, use, disclose, and protect information when you use our website, make donations, purchase resources, submit forms, or otherwise interact with us.
            </p>
            <p className="italic text-gray-600">
              This policy is intended to align with applicable data protection obligations, including the Nigeria Data Protection Act (NDPA) 2023 and, where applicable, other international privacy requirements.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* WHO WE ARE & LEGAL BASES */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Who We Are</h2>
              <p>
                SMA Hope Foundation Nigeria is a nonprofit organization focused on raising awareness about Spinal Muscular Atrophy (SMA), supporting families, and mobilizing advocacy and charitable support.
              </p>
              <p>
                If you have any privacy questions, contact us at <a href="mailto:help@smahope.org" className="text-[var(--primary)] hover:underline">help@smahope.org</a>.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Legal Bases for Processing</h2>
              <p>Depending on the context, we process personal data on one or more of the following legal bases:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-400">
                <li>Your consent.</li>
                <li>Performance of a contract or transaction with you.</li>
                <li>Compliance with legal obligations.</li>
                <li>Our legitimate interests, such as service security, fraud prevention, and program improvement.</li>
              </ul>
            </div>
          </section>

          {/* ROW 2: COLLECTION & USAGE */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Information We Collect</h2>
              <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Information you provide directly:</h3>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-400">
                <li>Contact details such as name, email address, phone number, and country.</li>
                <li>Messages, inquiries, and support requests submitted through forms or email.</li>
                <li>Donation-related details (for example, donation amount and transaction reference).</li>
                <li>Book or resource purchase details, where available through our checkout flow.</li>
                <li>Any other information you choose to submit in forms or correspondence.</li>
              </ul>
              
              <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Information collected automatically:</h3>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-400">
                <li>Device and browser metadata, IP address, language, and approximate location.</li>
                <li>Pages viewed, interaction events, referral URLs, and session information.</li>
                <li>Cookie identifiers and similar technologies, subject to your preferences where required.</li>
              </ul>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">How We Use Information</h2>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-400">
                <li>Respond to inquiries, requests, and support needs.</li>
                <li>Process donations and other transactions.</li>
                <li>Provide receipts, confirmations, and service communications.</li>
                <li>Operate, maintain, and improve the website and our programs.</li>
                <li>Detect fraud, abuse, security incidents, and misuse.</li>
                <li>Comply with legal, accounting, tax, and regulatory obligations.</li>
                <li>Send campaign updates and newsletters where you have opted in or where otherwise permitted.</li>
              </ul>
            </div>
          </section>

          {/* ROW 3: SHARING & INTERNATIONAL TRANSFERS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">How We Share Information</h2>
              <p className="font-medium text-gray-900">We do not sell personal data.</p>
              <p>We may share information with:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-400">
                <li>Payment processors and financial service providers (including Stripe and Paystack).</li>
                <li>Technology service providers that host, secure, or support our website and communications.</li>
                <li>Professional advisers, auditors, or regulators where required.</li>
                <li>Law enforcement or authorities where disclosure is legally required.</li>
              </ul>
              <p className="italic text-sm mt-4">
                Third-party providers process data under their own privacy notices and terms. We encourage you to review those notices before submitting payment or sensitive information.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">International Transfers</h2>
              <p>
                Some service providers may process data outside Nigeria. Where international transfers occur, we take reasonable steps to ensure safeguards are in place consistent with applicable data protection rules.
              </p>
            </div>
          </section>

          {/* HIGHLIGHT: YOUR PRIVACY RIGHTS */}
          <section className="max-w-4xl mx-auto bg-[#edf5fb] p-8 md:p-10 rounded-2xl border border-[#d4e4ef] shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-[#c3d8e8] pb-2">Your Privacy Rights</h2>
            <p className="text-gray-800 mb-4">Subject to applicable law, you may have the right to:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 list-disc pl-6 marker:text-[var(--primary)] font-medium text-gray-800 mb-6">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or update of inaccurate or incomplete data.</li>
              <li>Request deletion of personal data in certain circumstances.</li>
              <li>Object to or request restriction of certain processing.</li>
              <li>Withdraw consent where processing is based on consent.</li>
              <li>Request portability of data where applicable.</li>
              <li>Complain to a relevant data protection regulator.</li>
            </ul>
            <p className="text-gray-800 font-medium bg-white p-4 rounded-lg inline-block border border-[#c3d8e8]">
              To exercise your rights, email <a href="mailto:help@smahope.org" className="text-[var(--primary)] hover:underline">help@smahope.org</a>. We may request verification before fulfilling a request.
            </p>
          </section>

          {/* ROW 4: RETENTION & SECURITY */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Data Retention</h2>
              <p>
                We retain personal data for as long as necessary to fulfill the purposes described in this policy, including legal, accounting, tax, reporting, and safeguarding obligations. Retention periods vary by record type and legal requirements.
              </p>
            </div>
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Data Security</h2>
              <p>
                We apply technical and organizational safeguards designed to protect personal information from unauthorized access, misuse, loss, disclosure, or alteration. No online system is completely secure, so we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* ROW 5: COOKIES & CHILDREN */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 id="cookies" className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Cookies</h2>
              <p>
                We use cookies and similar technologies to keep the website functioning, remember preferences, and understand usage patterns.
              </p>
              <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Cookie categories:</h3>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-400">
                <li><strong className="text-gray-900">Essential cookies:</strong> required for core site and security functionality.</li>
                <li><strong className="text-gray-900">Analytics/performance cookies:</strong> help us understand traffic and improve content.</li>
                <li><strong className="text-gray-900">Preference cookies:</strong> remember user settings where available.</li>
              </ul>
              <p className="italic text-sm mt-4">
                You can accept or reject optional cookies via our cookie notice where presented. You may also manage cookies through browser settings. Disabling certain cookies may affect parts of site functionality.
              </p>
            </div>

            <div className="space-y-12">
              <div className="prose prose-lg text-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Children&apos;s Privacy</h2>
                <p>
                  Our website is intended for general audiences and not directed to children for independent use. Where information related to children is shared in support or medical contexts, this is expected to be provided by parents, guardians, or authorized representatives.
                </p>
              </div>

              <div className="prose prose-lg text-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Third-Party Links</h2>
                <p>
                  Our website may link to third-party websites or services. We are not responsible for their privacy practices, content, or security. Review third-party policies before sharing personal information.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* CHANGES & CONTACT */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect legal, technical, or operational changes. Updates are effective when posted on this page, and the &quot;Last updated&quot; date will be revised.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Contact Us</h2>
              <p className="mb-2">If you have questions, requests, or complaints regarding this policy, contact:</p>
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