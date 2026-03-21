import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { OrderBookFlow } from "@/components/order-book-flow";

export const metadata = buildMetadata({
  title: "Order the Book",
  description: "Order When Every Breath Matters in Nigeria or buy on Amazon for international delivery.",
  path: "/order-book",
});

export default function OrderBookPage() {
  const amazonBookUrl = process.env.NEXT_PUBLIC_BOOK_AMAZON_URL || "";

  return (
    <ContentPageBg image="/home/home-ways-to-help.png">
      <PageHeader
        title="Order the Book"
        intro="Choose your location to buy on Amazon internationally or place a Nigeria hard-copy order"
        backgroundImage="/home/home-ways-to-help.png"
      />

      <section className="section-tight content-page-section">
        <div className="container about-page-flow single-content-layout">
          <article className="about-panel prose">
            <h2 className="section-heading-strong">When Every Breath Matters</h2>
            <p>
              This dedicated order page is designed to make purchasing clear and straightforward for both international readers and buyers in Nigeria.
            </p>
          </article>

          <OrderBookFlow amazonUrl={amazonBookUrl} />
        </div>
      </section>
    </ContentPageBg>
  );
}
