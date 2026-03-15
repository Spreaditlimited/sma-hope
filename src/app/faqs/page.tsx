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
      <PageHeader title="FAQs" intro="Frequently asked questions" backgroundImage="/home/home-who-we-are.png" />
      <section className="section content-page-section">
        <div className="container" style={{ maxWidth: "60rem" }}>
          <FAQAccordion faqs={items.map((item) => ({ question: item.question, answer: item.answer }))} />
        </div>
      </section>
    </ContentPageBg>
  );
}
