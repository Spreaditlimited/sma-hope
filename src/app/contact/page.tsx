import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Contact Us",
  description: "Get in touch with SMA Hope Foundation Nigeria.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact Us" intro="Get in touch with SMA Hope Foundation Nigeria" />

      <section className="section-tight">
        <div className="container about-page-flow">
          <article className="about-panel prose">
            <p>Thank you for reaching out.</p>
            <p>
              Whether your enquiry is about the foundation, family support, the book, partnerships, media, or donations, we want to make it easy for you to contact the right part of our team.
            </p>
            <p>
              SMA Hope Foundation Nigeria is being built as a serious, compassionate, and trustworthy public platform. Clear communication is part of that.
            </p>
          </article>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">How to Reach Us</h2>
              <p>The easiest way to contact us is through the form on this page.</p>
              <p>When filling the form, choose the reason for your message so it reaches the right inbox.</p>
              <ul>
                <li>General enquiry</li>
                <li>Family support</li>
                <li>Book enquiry</li>
                <li>Partnership / collaboration</li>
                <li>Donation enquiry</li>
                <li>Media / speaking invitation</li>
              </ul>
            </article>

            <article className="about-panel prose">
              <h2 className="section-heading-strong">Direct Email Contacts</h2>
              <p>General enquiries and family support: hello@smahope.org</p>
              <p>Book-related enquiries: book@smahope.org</p>
              <p>Partnerships, collaborations, media, and speaking invitations: partnerships@smahope.org</p>
              <p>Donation-related enquiries and sponsorship conversations: donate@smahope.org</p>
            </article>
          </div>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">For Families Reaching Out</h2>
              <p>
                If you are a parent, caregiver, or family member reaching out because SMA has touched your home, your message is welcome.
              </p>
              <p>
                We may not have every answer immediately, but we want this foundation to be a place where families feel able to reach out without feeling invisible.
              </p>
            </article>

            <article className="about-panel prose">
              <h2 className="section-heading-strong">For Donation Enquiries</h2>
              <p>
                If your message relates to giving, donor questions, sponsorship, larger support conversations, or donation logistics, please select Donation enquiry in the form or email donate@smahope.org.
              </p>
              <p>
                As the foundation grows, we want our giving structure to remain clear, respectful, and trustworthy for both Nigerian and international supporters.
              </p>
            </article>
          </div>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">For Partnerships and Institutional Enquiries</h2>
            <p>
              If you represent an organisation, church, school, healthcare institution, advocacy body, media platform, or any group interested in partnering with SMA Hope Foundation Nigeria, we would be glad to hear from you.
            </p>
            <ul>
              <li>awareness collaborations</li>
              <li>institutional partnerships</li>
              <li>event invitations</li>
              <li>speaking requests</li>
              <li>media features</li>
              <li>book-related partnerships</li>
              <li>sponsorship conversations</li>
            </ul>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Response Note</h2>
            <p>We will do our best to respond to enquiries as promptly as possible.</p>
            <p>
              Some messages may take a little time to answer properly, especially where the subject requires attention or sensitivity. We appreciate your patience and understanding.
            </p>
          </article>

          <article className="about-panel" style={{ maxWidth: "58rem" }}>
            <h2 className="section-heading-strong" style={{ marginTop: 0 }}>Send Message</h2>
            <ContactForm />
          </article>

          <article className="about-panel prose">
            <p>Thank you for taking the time to reach out to SMA Hope Foundation Nigeria.</p>
            <p>
              Whether you are contacting us to ask a question, seek support, discuss a partnership, talk about the book, or explore how to help, we appreciate your interest in the mission and the work this foundation exists to do.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
