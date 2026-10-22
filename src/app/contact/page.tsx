import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "Contact SMA Hope Foundation Nigeria",
  description:
    "Contact SMA Hope for family enquiries, partnerships, donations, and conversations about spinal muscular atrophy awareness in Nigeria.",
  path: "/contact",
});
export default function Contact() {
  return (
    <>
      <PageHeader
        title="A conversation can be a beginning."
        intro="For family enquiries, thoughtful partnerships, and people who want to help."
      />
      <section className="container hope-section action-page-grid">
        <div className="action-page-copy">
          <p className="eyebrow">You’re welcome to reach out</p>
          <h2 className="display-heading">Let’s connect.</h2>
          <p>
            Tell us what brings you here. Select the most relevant subject in the form so your
            message reaches the right place.
          </p>
          <div className="contact-addresses">
            <div>
              <span>General & family enquiries</span>
              <a href="mailto:help@smahope.org">help@smahope.org</a>
            </div>
            <div>
              <span>Partnerships & collaborations</span>
              <a href="mailto:partnerships@smahope.org">partnerships@smahope.org</a>
            </div>
            <div>
              <span>Our address</span>
              <p>
                5 Olutosin Ajayi Street,
                <br />
                Ajao Estate, Lagos, Nigeria.
              </p>
            </div>
          </div>
          <div className="giving-trust">
            <h3>For families reaching out</h3>
            <p>
              We welcome your enquiry. Please avoid sending sensitive medical documents in your
              first message. This channel does not provide emergency care or individual medical
              advice.
            </p>
            <Link href="/support-for-families" className="text-link">
              Browse family resources →
            </Link>
          </div>
        </div>
        <div className="action-form-card">
          <h2>Send a message</h2>
          <p className="form-intro">
            We’ll do our best to respond thoughtfully. Some enquiries may take time to answer.
          </p>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
