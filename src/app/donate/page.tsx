import { PageHeader } from "@/components/page-header";
import { DonationOptions } from "@/components/donation-options";
import { ContentPageBg } from "@/components/content-page-bg";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Donate",
  description: "Support the work of SMA Hope Foundation Nigeria.",
  path: "/donate",
});

export default function DonatePage() {
  return (
    <ContentPageBg image="/home/home-trust-transparency.png">
      <PageHeader
        title="Donate"
        intro="Support the work of SMA Hope Foundation Nigeria"
        backgroundImage="/home/home-trust-transparency.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-24">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto md:text-left">
            <p className="font-medium text-gray-900">
              SMA Hope Foundation Nigeria exists because the burden families carry is real, and because awareness, dignity, support, and informed public understanding do not grow on their own. They have to be built deliberately.
            </p>
            <p>
              When you support this foundation, you are helping to strengthen a platform shaped by real family experience and committed to turning painful reality into meaningful public work.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ROW 1: WHY & WHAT IT MAKES POSSIBLE */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Why Support Matters</h2>
              <p>
                For many people, SMA is still unfamiliar. For many families, it is a daily reality that affects breathing, feeding, movement, medical care, emotional strength, finances, and the rhythm of the whole home.
              </p>
              <p>
                This gap between what families carry and what society understands is one of the reasons SMA Hope Foundation Nigeria exists.
              </p>
              <p className="font-semibold text-gray-900 mt-4">
                Support matters because awareness matters. Education matters. Advocacy matters. Family dignity matters.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700 bg-[#edf5fb] p-6 md:p-8 rounded-2xl border border-[#d4e4ef] shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-[#c3d8e8] pb-2">What Your Support Helps Make Possible</h2>
              <p>Your support helps us continue building a serious and compassionate public platform for:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-[var(--primary)] font-medium text-gray-800">
                <li>SMA awareness in plain language</li>
                <li>family-centred education and support-building</li>
                <li>advocacy shaped by lived experience</li>
                <li>public trust and visibility around the realities of SMA</li>
                <li>the long-term growth of the foundation&apos;s mission</li>
              </ul>
            </div>
          </section>

          {/* ROW 2: WAYS TO GIVE & CONFIDENCE */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Ways to Give</h2>
              <ul className="space-y-4 list-none pl-0">
                <li className="pl-4 border-l-2 border-gray-300">
                  <strong className="text-gray-900">Give from Nigeria:</strong> supporters in Nigeria will be able to give securely through Paystack.
                </li>
                <li className="pl-4 border-l-2 border-gray-300">
                  <strong className="text-gray-900">Give internationally:</strong> supporters outside Nigeria, including the diaspora, can give securely in USD through Paystack.
                </li>
              </ul>
              <p className="mt-4 italic text-gray-600">
                One-time support and ongoing recurring support are both available.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Give With Confidence</h2>
              <p className="font-medium text-gray-900">Trust matters in work like this.</p>
              <p>
                SMA Hope Foundation Nigeria is a registered foundation in Nigeria, and we are committed to carrying this work with seriousness, clarity, and a strong sense of responsibility.
              </p>
              <p>
                We do not want people to support this mission based only on emotion. We want people to support it with understanding and confidence.
              </p>
            </div>
          </section>

          {/* ROW 3: DONATION WIDGET & OTHER WAYS TO SUPPORT */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
            <div className="lg:col-span-5 prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">There Are Other Ways to Support</h2>
              <p>Not everyone will support in the same way, and that is fine. Below are ways you can support:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-400">
                <li>buying the book</li>
                <li>sharing awareness content</li>
                <li>telling others about SMA Hope Foundation Nigeria</li>
                <li>partnering with the foundation</li>
                <li>helping more people understand what SMA really means for families</li>
              </ul>
            </div>

            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-md">
              {/* External Donation Component handles its own styling */}
              <DonationOptions />
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* CONCLUSION SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center">
            <p className="font-medium text-gray-900">
              To support SMA Hope Foundation Nigeria is to support a mission rooted in truth, dignity, awareness, and lived experience.
            </p>
            <p>
              It is to stand with families affected by Spinal Muscular Atrophy. It is to help grow public understanding. It is to strengthen a foundation that was born from real burden and is being built with real seriousness.
            </p>
            <p className="font-bold text-gray-900 mt-8">
              We are grateful for every person who chooses to help carry this work forward.
            </p>
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}
