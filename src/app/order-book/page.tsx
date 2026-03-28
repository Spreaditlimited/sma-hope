import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { OrderBookFlow } from "@/components/order-book-flow";
import { Suspense } from "react";

export const metadata = buildMetadata({
  title: "Pre-Order the Book",
  description: "Pre-order When Every Breath Matters in Nigeria. Amazon access for international readers is coming soon.",
  path: "/order-book",
});

export default function OrderBookPage() {
  // Graceful fallback if the environment variable isn't set
  const amazonBookUrl = process.env.NEXT_PUBLIC_BOOK_AMAZON_URL || "";
  const bookUnitPriceNgn = Number(process.env.PAYSTACK_BOOK_UNIT_PRICE_NGN || 15000);
  const bookVatPerUnitNgn = Number(process.env.PAYSTACK_BOOK_VAT_NGN || 1125);
  const deliveryLagosNgn = Number(process.env.PAYSTACK_BOOK_DELIVERY_LAGOS_NGN || 0);
  const deliveryOutsideLagosNgn = Number(process.env.PAYSTACK_BOOK_DELIVERY_OUTSIDE_LAGOS_NGN || 3000);

  return (
    <ContentPageBg image="/home/home-ways-to-help.png">
      <PageHeader
        title="Pre-Order the Book"
        intro="Place your Nigeria pre-order now. International Amazon ordering will be available soon."
        backgroundImage="/home/home-ways-to-help.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-12 md:space-y-16">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">When Every Breath Matters</h2>
            <p>
              This dedicated order page is designed to make purchasing clear and straightforward for both international readers and buyers in Nigeria.
            </p>
            <p className="font-medium text-gray-900 mt-4">
              Every copy read and shared helps bring much-needed awareness to Spinal Muscular Atrophy.
            </p>
            <div className="mt-4 inline-flex max-w-3xl rounded-full border border-[#c9ddec] bg-[#e7f2fb] px-5 py-2 text-sm font-semibold text-[#0f557f]">
              Pre-order is now open. The book will be released on July 31, 2026, Kamsi&apos;s 8th birthday. Be among the first to receive this medically grounded, deeply emotional book on Spinal Muscular Atrophy,
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ORDER FLOW COMPONENT */}
          <section className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-md">
            
            {/* External OrderBookFlow Component 
              Internal layout, steps, and button styling remain untouched
            */}
            <Suspense fallback={<p className="text-sm text-gray-600">Loading order flow...</p>}>
              <OrderBookFlow
                amazonUrl={amazonBookUrl}
                pricing={{
                  unitPriceNgn: bookUnitPriceNgn,
                  vatPerUnitNgn: bookVatPerUnitNgn,
                  deliveryLagosNgn,
                  deliveryOutsideLagosNgn,
                }}
              />
            </Suspense>
            
          </section>

          {/* OUTRO SECTION */}
          <section className="max-w-2xl mx-auto text-center">
            <p className="text-gray-500 text-sm md:text-base">
              Thank you for supporting the mission of SMA Hope Foundation Nigeria through your purchase. If you have any issues with your order, please reach out to us via the Contact page.
            </p>
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}
