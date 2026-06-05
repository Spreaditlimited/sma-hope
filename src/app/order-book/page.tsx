import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { BookPreorderSignup } from "@/components/book-preorder-signup";

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
        intro="Pre-order opens soon. Join the email list to be notified first."
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
            <div className="mt-4 inline-flex max-w-3xl flex-wrap items-center justify-center gap-x-1 rounded-2xl border border-[#c9ddec] bg-[#e7f2fb] px-5 py-3 text-sm font-semibold leading-6 text-[#0f557f]">
              <span>
                Pre-order opens soon. We plan to release the book on July 31, 2026, Kamsi&apos;s 8th birthday.
              </span>
              <BookPreorderSignup />
              <span>to get notified when pre-order opens.</span>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* PRE-ORDER HOLD STATE */}
          <section className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-md">
            <div className="mx-auto max-w-xl text-center">
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Coming soon
              </span>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Book purchase is currently unavailable</h2>
              <p className="mt-3 text-base leading-7 text-gray-600">
                We are preparing the pre-order process. Join the email list and we will notify you as soon as ordering opens.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <BookPreorderSignup
                  disabledButtonLabel="Continue with Paystack"
                  disabledButtonClassName="btn cursor-not-allowed border border-gray-300 bg-gray-200 text-gray-500 shadow-none hover:bg-gray-200"
                />
              </div>
            </div>
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
