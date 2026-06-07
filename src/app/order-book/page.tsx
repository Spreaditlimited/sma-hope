import Image from "next/image";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { OrderBookFlow } from "@/components/order-book-flow";

export const metadata = buildMetadata({
  title: "Pre-Order the Book",
  description: "Pre-order When Every Breath Matters in Nigeria. Amazon access for international readers is coming soon.",
  path: "/order-book",
});

export default function OrderBookPage() {
  return (
    <ContentPageBg image="/home/home-ways-to-help.png">
      <PageHeader
        title="Pre-Order the Book"
        intro="Pre-order When Every Breath Matters in Nigeria. Amazon access for international readers is coming soon."
        backgroundImage="/home/home-ways-to-help.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        
        {/* PREMIUM ANNOUNCEMENT CARD */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(16,37,55,0.06)] border border-[#eef3f5] overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch">
            
            {/* Left: Book Visual */}
            <div className="md:col-span-5 bg-gradient-to-b from-[#f8fcff] to-[#eef5fb] p-10 md:p-14 flex items-center justify-center border-b md:border-b-0 md:border-r border-[#eef3f5] relative overflow-hidden">
              {/* Soft background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--primary)] rounded-full filter blur-[100px] opacity-10 pointer-events-none"></div>
              
              <div className="relative w-full max-w-[260px] mx-auto rounded-md shadow-[0_30px_60px_rgba(16,37,55,0.25)] border border-black/5 transform transition-transform hover:-translate-y-2 duration-700">
                <Image
                  src="/Book-v3.PNG"
                  alt="When Every Breath Matters book cover"
                  width={800}
                  height={1200}
                  className="w-full h-auto object-cover rounded-md"
                  priority
                />
              </div>
            </div>

            {/* Right: Messaging & Actions */}
            <div className="md:col-span-7 p-10 md:p-14 lg:p-16 flex flex-col justify-center">
              
              {/* Commemorative Date Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-bold text-[var(--accent-gold)] bg-[#fdfaf2] rounded-full border border-[#faeac0] w-fit shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Releasing July 31, 2026 — Kamsi&apos;s 8th Birthday
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-[#102637] mb-4 tracking-tight text-balance">
                When Every Breath Matters
              </h2>

              <div className="prose prose-lg text-[#42586a] leading-relaxed text-balance">
                <p>
                  Every copy read and shared helps bring much-needed awareness to Spinal Muscular Atrophy. This dedicated order page allows buyers in Nigeria to place a hard-copy pre-order securely.
                </p>
                <p className="font-medium text-[#102637]">
                  International Amazon purchase will be enabled soon.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ORDER FORM */}
        <section className="mb-16">
          <Suspense fallback={<p className="text-sm text-[#42586a]">Loading book order form...</p>}>
            <OrderBookFlow />
          </Suspense>
        </section>

        {/* LOGISTICS & SUPPORT EXPECTATIONS */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-[#f4f9fd] flex items-center justify-center border border-[#dce8f2]">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#102637] mb-2">Orders within Nigeria</h3>
              <p className="text-[#42586a] text-sm md:text-base leading-relaxed">
                Purchases within Nigeria will be processed securely via Paystack, with delivery options available across the country.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-[#fdfcf8] flex items-center justify-center border border-[#f5ead2]">
                <div className="w-3 h-3 rounded-full bg-[var(--accent-gold)]"></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#102637] mb-2">International Orders</h3>
              <p className="text-[#42586a] text-sm md:text-base leading-relaxed">
                For our international supporters, the book will be made available globally via Amazon on the release date. 
              </p>
            </div>
          </div>
        </div>

        <hr className="border-[#eef3f5] max-w-2xl mx-auto mb-10" />

        {/* OUTRO SECTION */}
        <section className="max-w-2xl mx-auto text-center">
          <p className="text-[#8da2b3] font-medium text-sm md:text-base text-balance">
            Thank you for supporting the mission of SMA Hope Foundation Nigeria through your purchase. If you have any questions ahead of the release, please reach out via our Contact page.
          </p>
        </section>

      </main>
    </ContentPageBg>
  );
}
