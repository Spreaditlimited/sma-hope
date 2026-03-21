import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Support for Families",
  description: "For families living with the reality of SMA.",
  path: "/support-for-families",
});

export default function SupportForFamiliesPage() {
  return (
    <ContentPageBg image="/home/home-support-families.png">
      <PageHeader
        title="Support for Families"
        intro="For families living with the reality of SMA"
        backgroundImage="/home/home-support-families.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-24">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto md:text-left">
            <p className="font-medium text-gray-900">
              If your child has been diagnosed with Spinal Muscular Atrophy, or if you are currently trying to understand symptoms, weakness, delayed milestones, feeding difficulties, breathing concerns, or a diagnosis you never expected, we want to begin by saying this clearly: <strong className="text-[var(--primary)]">you are not alone.</strong>
            </p>
            <p>
              SMA can make a family feel as though life has suddenly split into two parts. The life before the diagnosis, and the life after it.
            </p>
            <p>
              At SMA Hope Foundation Nigeria, we understand that this burden is not only medical. It is emotional, practical, financial, relational, and deeply human.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ROW 1: DIAGNOSIS & EARLY DAYS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">If Your Child Has Just Been Diagnosed</h2>
              <p>The early days after diagnosis can be deeply disorienting.</p>
              <p>
                For some families, there is shock. For others, there is confusion. For some, there is a painful mix of relief and grief.
              </p>
              <p>
                You may be asking questions you never expected to ask. What does this mean for my child? What kind of life will they have? What treatment exists? What support will be needed? How do we cope? How do we keep going?
              </p>
              <p className="font-semibold text-gray-900">
                These are real questions. They do not make you weak. They make you human.
              </p>
              <p className="italic">
                When SMA enters a family&apos;s life, clarity matters. Families need truthful information, not empty reassurance. They need compassion, but they also need substance.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">What the First Days and Months Can Feel Like</h2>
              <p>
                Many parents describe the early period after diagnosis as one of the hardest stretches of their lives.
              </p>
              <p>
                There is a lot to take in. Medical language suddenly becomes part of your daily world. Decisions may need to be made quickly.
              </p>
              <p>
                At the same time, ordinary life does not pause. The home still needs to function. Work may still demand attention. Other children still need care.
              </p>
              <p className="font-medium text-gray-900 border-l-4 border-[#7faac6] pl-4 bg-gray-50 py-2 rounded-r-lg">
                It is not unusual for parents to feel exhausted, frightened, confused, numb, or stretched beyond what they thought they could carry. That does not mean you are failing. It means the burden is real.
              </p>
            </div>
          </section>

          {/* ROW 2: PRACTICAL & EMOTIONAL REALITY */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">The Practical Reality of SMA Care</h2>
              <p>
                Depending on the child&apos;s condition, care may involve close attention to breathing, feeding, muscle weakness, posture, fatigue, respiratory infections, cough strength, sleep quality, mobility, nutrition, and overall stability.
              </p>
              <p>
                Parents can quickly find themselves carrying a level of medical and practical responsibility they never trained for.
              </p>
              <p className="font-medium text-gray-900">
                What may look ordinary from the outside can involve extraordinary labour behind the scenes.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">The Emotional Weight on Families</h2>
              <p>SMA does not only affect the body. It affects the atmosphere of a home.</p>
              <p>
                There is the strain of uncertainty. The fear that can rise during illness. The pressure of decision-making. The fatigue that comes from long-term vigilance.
              </p>
              <p className="font-medium text-gray-900">
                All of this is real. It deserves to be acknowledged honestly.
              </p>
            </div>
          </section>

          {/* ROW 3: WIDER FAMILY & THE FOUNDATION'S HOPE */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">For Marriages, Siblings, and the Wider Family</h2>
              <p>
                A condition like SMA does not touch only one relationship. It can affect the whole family system.
              </p>
              <p>
                That is why support for families must be broader than medicine alone. Families need space for truth, patience, support, and practical help.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">What We Hope This Foundation Can Become</h2>
              <p>
                SMA Hope Foundation Nigeria is being built from lived experience, and part of our hope is that this foundation becomes a meaningful source of clarity, encouragement, visibility, and support for families affected by SMA.
              </p>
              <p>
                Over time, we hope this foundation will grow into an even stronger support platform through awareness, education, advocacy, family-centred resources, and a more informed community around SMA.
              </p>
            </div>
          </section>

          {/* HIGHLIGHT BOX: WHAT IS AVAILABLE NOW */}
          <section className="max-w-4xl mx-auto bg-[#edf5fb] p-8 md:p-12 rounded-2xl border border-[#d4e4ef] shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">What Is Available Now</h2>
            <p className="text-lg text-gray-700 mb-6">We want to be careful and truthful here. Currently, the foundation provides:</p>
            <ul className="space-y-4 list-none pl-0">
              <li className="pl-4 border-l-2 border-[#7faac6] text-lg font-medium text-gray-800">
                A voice shaped by lived experience
              </li>
              <li className="pl-4 border-l-2 border-[#7faac6] text-lg font-medium text-gray-800">
                Growing public education around SMA
              </li>
              <li className="pl-4 border-l-2 border-[#7faac6] text-lg font-medium text-gray-800">
                Honest storytelling that helps families feel seen
              </li>
              <li className="pl-4 border-l-2 border-[#7faac6] text-lg font-medium text-gray-800">
                A platform that is working to build awareness and informed support
              </li>
              <li className="pl-4 border-l-2 border-[#7faac6] text-lg font-medium text-gray-800">
                A point of contact for families who want to reach out
              </li>
            </ul>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* CONCLUSION & CTAs */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Support Begins with Truth</h2>
            <p>
              It begins with recognising that SMA is not a small burden. It begins with seeing the child clearly, seeing the family clearly, and refusing to reduce either one to pity or silence.
            </p>
            <p className="font-medium text-gray-900 mb-10">
              We hope SMA Hope Foundation Nigeria becomes a place where families affected by SMA find understanding, dignity, and a growing sense that they are not alone.
            </p>
            
            {/* EXACT MATCH BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
              <Link 
                href="/contact" 
                className="btn btn-primary w-full sm:w-auto"
              >
                Contact the Foundation
              </Link>
              <Link 
                href="/what-is-sma" 
                className="btn btn-secondary w-full sm:w-auto"
              >
                Learn About SMA
              </Link>
            </div>
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}
