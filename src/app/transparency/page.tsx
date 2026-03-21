import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";

export const metadata = buildMetadata({
  title: "Transparency",
  description: "Our commitment to stewardship, clarity, and accountability.",
  path: "/transparency",
});

export default function TransparencyPage() {
  return (
    <ContentPageBg image="/home/home-why-foundation.png">
      <PageHeader
        title="Transparency"
        intro="Built on seriousness, compassion, and accountability"
        backgroundImage="/home/home-why-foundation.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-24">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto md:text-left">
            <p className="font-medium text-gray-900">
              Trust is the foundation of any meaningful public work. 
            </p>
            <p>
              Because SMA Hope Foundation Nigeria was born from lived family experience, we deeply understand the vulnerability of families facing an SMA diagnosis and the generosity of those who choose to stand with them. 
            </p>
            <p>
              We believe transparency is not simply a legal requirement. It is a moral commitment to the families we advocate for and the community that supports this mission.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ROW 1: REGISTRATION & STEWARDSHIP */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Registered Foundation Status</h2>
              <p>
                SMA Hope Foundation Nigeria is a formally registered foundation in Nigeria. 
              </p>
              <p>
                This structure matters to us because it ensures we operate with proper oversight, a clear legal framework, and public accountability. We did not want this platform to be a temporary project; we established it as a registered entity because the work of supporting SMA families requires long-term seriousness and stability.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700 bg-[#edf5fb] p-6 md:p-8 rounded-2xl border border-[#d4e4ef] shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-[#c3d8e8] pb-2">Commitment to Stewardship</h2>
              <p className="font-medium text-gray-900">
                We are committed to carrying this work with care, honesty, and responsible stewardship.
              </p>
              <p>
                Stewardship, for us, goes beyond finances. We are stewards of public trust, of resources, and most importantly, of the stories and dignity of children living with Spinal Muscular Atrophy. Every decision made by the foundation is weighed against this responsibility.
              </p>
            </div>
          </section>

          {/* ROW 2: HOW SUPPORT IS USED & REPORTING */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">How Support Is Used</h2>
              <p>
                Every form of support helps us strengthen the foundation&apos;s core mission. Currently, resources are directed toward:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gray-500 font-medium text-gray-800">
                <li>Creating plain-language educational resources about SMA</li>
                <li>Expanding awareness campaigns to bridge the gap in public understanding</li>
                <li>Building visibility and advocacy platforms for affected families</li>
                <li>Maintaining and growing the foundation&apos;s long-term operational capacity</li>
              </ul>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Growth and Reporting Commitment</h2>
              <p>
                Meaningful work is built step by step. As a growing foundation, we are laying down the infrastructure for long-term impact.
              </p>
              <p>
                As the foundation&apos;s capacity and initiatives grow, our reporting and public communication will develop alongside it. We are committed to maintaining the same seriousness, clarity, and honesty in our operational reporting that currently guides our mission and storytelling.
              </p>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* CONCLUSION & CTAs */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center">
            <p className="font-semibold text-gray-900 text-2xl mb-8">
              Trust takes time to build, and we are committed to earning it every day.
            </p>
            
            {/* NATIVE BUTTON STYLES RESTORED */}
            <div className="section-actions page-end-actions" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/donate" className="btn btn-primary">
                Support the Foundation
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Contact Us
              </Link>
            </div>
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}