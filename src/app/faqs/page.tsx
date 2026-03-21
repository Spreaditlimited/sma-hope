import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { FAQAccordion } from "@/components/faq-accordion";
import { getFaqItems } from "@/lib/content";
import { ContentPageBg } from "@/components/content-page-bg";

export const metadata = buildMetadata({
  title: "FAQs",
  description: "Frequently asked questions about SMA Hope Foundation Nigeria, SMA, support, donations, and the book.",
  path: "/faqs",
});

export default async function FAQsPage() {
  const items = await getFaqItems();

  return (
    <ContentPageBg image="/home/home-who-we-are.png">
      <PageHeader 
        title="FAQs" 
        intro="Answers to common questions about SMA, the foundation, and how to help" 
        backgroundImage="/home/home-who-we-are.png" 
      />
      
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-24">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto md:text-center">
            <p className="font-medium text-gray-900">
              Understanding Spinal Muscular Atrophy and the work of supporting affected families can bring up many questions. 
            </p>
            <p>
              We have gathered the most common enquiries we receive about the condition, our foundation, the book <em>When Every Breath Matters</em>, and how you can offer meaningful support. 
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* FAQ ACCORDION WRAPPER */}
          <section className="max-w-3xl mx-auto">
            {items && items.length > 0 ? (
              <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm">
                {/* External FAQ component - Internal styling remains untouched */}
                <FAQAccordion faqs={items.map((item) => ({ question: item.question, answer: item.answer }))} />
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-lg text-gray-600 font-medium">
                  FAQs are currently being updated. Please check back shortly.
                </p>
              </div>
            )}
          </section>

          {/* MEDICAL DISCLAIMER - CONTEXTUAL EXPANSION */}
          <section className="max-w-3xl mx-auto bg-[#edf5fb] p-8 md:p-10 rounded-2xl border border-[#d4e4ef] shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">A Note on Medical Information</h2>
            <p className="text-gray-700 text-lg">
              While we strive to provide clear and accurate information about Spinal Muscular Atrophy based on lived experience and established medical consensus, the content provided by SMA Hope Foundation Nigeria is for educational and awareness purposes only. 
            </p>
            <p className="text-gray-900 text-lg mt-4 font-semibold">
              It should never replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding your child&apos;s specific health needs.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* OUTRO & CTAS (NATIVE BUTTONS STRICTLY MAINTAINED) */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Still Have Questions?</h2>
            <p className="mb-8">
              If you couldn&apos;t find the answer you were looking for, or if you are a family needing specific guidance, please do not hesitate to reach out to us directly.
            </p>
            
            <div className="section-actions page-end-actions" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/contact" className="btn btn-primary">
                Contact Us
              </Link>
              <Link href="/donate" className="btn btn-secondary">
                Support the Foundation
              </Link>
            </div>
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}