import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { ContentPageBg } from "@/components/content-page-bg";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Contact Us",
  description: "Get in touch with SMA Hope Foundation Nigeria.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ContentPageBg image="/home/home-latest-updates.png">
      <PageHeader
        title="Contact Us"
        intro="Get in touch with SMA Hope Foundation Nigeria"
        backgroundImage="/home/home-latest-updates.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-24">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto md:text-left">
            <p className="font-medium text-gray-900">Thank you for reaching out.</p>
            <p>
              Whether your enquiry is about the foundation, family support, the book, partnerships, media, or donations, we want to make it easy for you to contact the right part of our team.
            </p>
            <p>
              SMA Hope Foundation Nigeria is being built as a serious, compassionate, and trustworthy public platform. Clear communication is part of that.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ROW 1: HOW TO REACH US & DIRECT EMAILS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">How to Reach Us</h2>
              <p>The easiest way to contact us is through the form on this page.</p>
              <p>When filling the form, choose the reason for your message so it reaches the right inbox.</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-blue-500 font-medium text-gray-800">
                <li>General Enquiries &amp; Guidance</li>
                <li>Family Care &amp; Support</li>
                <li>Book Enquiries &amp; Orders</li>
                <li>Partnerships &amp; Strategic Collaboration</li>
                <li>Giving, Sponsorship &amp; Philanthropy</li>
                <li>Media &amp; Speaking Invitations</li>
              </ul>
            </div>

            <div className="prose prose-lg text-gray-700 bg-blue-50 p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-blue-200 pb-2">Direct Email Contacts</h2>
              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">General enquiries, family support, book enquiries, and donations:</p>
                  <a href="mailto:help@smahope.org" className="text-blue-700 font-bold hover:underline">help@smahope.org</a>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Partnerships, collaborations, media, and speaking invitations:</p>
                  <a href="mailto:partnerships@smahope.org" className="text-blue-700 font-bold hover:underline">partnerships@smahope.org</a>
                </div>
              </div>
            </div>
          </section>

          {/* ROW 2: FAMILIES & DONATIONS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">For Families Reaching Out</h2>
              <p>
                If you are a parent, caregiver, or family member reaching out because SMA has touched your home, your message is welcome.
              </p>
              <p className="font-medium text-gray-900">
                We may not have every answer immediately, but we want this foundation to be a place where families feel able to reach out without feeling invisible.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">For Donation Enquiries</h2>
              <p>
                If your message relates to giving, donor questions, sponsorship, larger support conversations, or donation logistics, please select <strong className="text-gray-900">Giving, Sponsorship &amp; Philanthropy</strong> in the form or email us directly.
              </p>
              <p>
                As the foundation grows, we want our giving structure to remain clear, respectful, and trustworthy for both Nigerian and international supporters.
              </p>
            </div>
          </section>

          {/* ROW 3: PARTNERSHIPS & RESPONSE NOTE */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
            <div className="lg:col-span-7 prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">For Partnerships &amp; Institutional Enquiries</h2>
              <p>
                If you represent an organisation, church, school, healthcare institution, advocacy body, media platform, or any group interested in partnering with SMA Hope Foundation Nigeria, we would be glad to hear from you.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-disc pl-6 marker:text-gray-400 mt-4">
                <li>Awareness collaborations</li>
                <li>Institutional partnerships</li>
                <li>Event invitations</li>
                <li>Speaking requests</li>
                <li>Media features</li>
                <li>Book-related partnerships</li>
                <li>Sponsorship conversations</li>
              </ul>
            </div>

            <div className="lg:col-span-5 prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Response Note</h2>
              <p>We will do our best to respond to enquiries as promptly as possible.</p>
              <p className="italic text-gray-600">
                Some messages may take a little time to answer properly, especially where the subject requires attention or sensitivity. We appreciate your patience and understanding.
              </p>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* FORM SECTION */}
          <section className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Send a Message</h2>
            
            {/* External Form Component - Styling determined internally */}
            <ContactForm />
            
          </section>

          {/* OUTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center">
            <p className="font-semibold text-gray-900">
              Thank you for taking the time to reach out to SMA Hope Foundation Nigeria.
            </p>
            <p>
              Whether you are contacting us to ask a question, seek support, discuss a partnership, talk about the book, or explore how to help, we appreciate your interest in the mission and the work this foundation exists to do.
            </p>
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}