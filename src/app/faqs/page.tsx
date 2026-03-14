import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { FAQAccordion } from "@/components/faq-accordion";
import { getFaqItems } from "@/lib/content";

export const metadata = buildMetadata({
  title: "FAQs",
  description: "Frequently asked questions about SMA Hope Foundation Nigeria, SMA, support, donations, and the book.",
  path: "/faqs",
});

export default async function FAQsPage() {
  const items = await getFaqItems();

  return (
    <>
      <PageHeader title="FAQs" intro="Frequently asked questions" />
      <section className="section">
        <div className="container" style={{ maxWidth: "60rem" }}>
          <FAQAccordion faqs={items.map((item) => ({ question: item.question, answer: item.answer }))} />
        </div>
      </section>
    </>
  );
}
