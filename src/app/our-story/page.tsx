import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Our Story",
  description: "The story behind SMA Hope Foundation Nigeria.",
  path: "/our-story",
});

export default function OurStoryPage() {
  return (
    <ContentPageBg image="/home/home-our-story.png">
      <PageHeader
        title="Our Story"
        intro="The story behind SMA Hope Foundation Nigeria"
        backgroundImage="/home/home-our-story.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-24">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto md:text-left">
            <p className="font-medium text-gray-900">
              SMA Hope Foundation Nigeria did not begin as an organisation first. It began as a family&apos;s long and painful education in what Spinal Muscular Atrophy really means.
            </p>
            <p>
              For many people, SMA is just a name they have never heard before. For us, it became part of the structure of our lives.
            </p>
            <p className="text-xl font-semibold text-gray-900 mt-6">
              Our first daughter, Kamsi, and later her younger sister, Kachi, were both diagnosed with Spinal Muscular Atrophy. That single reality changed everything.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ROW 1: THE BEGINNING & THE BURDEN */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">When the Journey Began</h2>
              <p className="font-medium text-gray-900">No family begins this kind of journey prepared.</p>
              <p>
                You begin with love, expectation, and the ordinary hopes parents carry for their children. You expect growth, milestones, movement, and the little progressions that families celebrate without thinking twice. But when those things begin to shift, when a child is not doing what should normally come, when weakness begins to show itself in ways you cannot explain, life starts to change.
              </p>
              <p>
                At first, it is concern. Then it becomes questions. Then tests. Then consultations. Then the heavy moment when the thing you feared becomes named.
              </p>
              <p className="font-bold text-gray-900">For us, that name was Spinal Muscular Atrophy.</p>
              <p className="italic">
                And once SMA enters a family&apos;s life, it does not sit in one corner. It reaches into everything.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">What SMA Brought Into Our Home</h2>
              <p className="font-medium text-gray-900">
                SMA is not simply a diagnosis on paper. It is an ongoing burden of care.
              </p>
              <p>
                It affects movement, strength, breathing, feeding, posture, sleep, and stability. It introduces a kind of vigilance that many people will never fully understand unless they have lived inside it.
              </p>
              <p>
                We have lived with the reality of respiratory compromise. We have lived with the reality of ventilator support. We have lived with the weight of watching a child fight for stability in ways no child should have to.
              </p>
            </div>
          </section>

          {/* ROW 2: THE ROAD & THE FIGHT */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">The Long Road Across Countries</h2>
              <p>Our journey with SMA has also taken us across borders.</p>
              <p>
                Kamsi was diagnosed in Dubai in 2020. In 2021, we moved to Dubai and did our best to manage her condition in one of the best hospitals in the Middle East. But even with strong medical care, we still could not access the medication that could help slow or stop progression.
              </p>
              <p>
                We moved back briefly to Lagos, and then on to the United Kingdom, where our daughters could finally access the medication they needed. That treatment costs about £10,000 per month per child, which means roughly £20,000 every month for both Kamsi and Kachi.
              </p>
              <p className="italic border-l-4 border-blue-500 pl-4 my-6 bg-gray-50 py-2 rounded-r-lg">
                Families facing SMA are dealing with systems, access, relocation, medical infrastructure, impossible decisions, and costs that would crush most people.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Kamsi&apos;s Fight</h2>
              <p>
                Kamsi&apos;s story carries a special kind of weight in our family because we have watched her fight again and again.
              </p>
              <p>
                There have been seasons where her body was under intense pressure. There have been moments when breathing support became central to survival. There have been stretches where the smallest signs of improvement felt enormous because they came at the end of so much strain.
              </p>
              <p>
                We have watched Kamsi stay off ventilator support for longer stretches, recover from isolation to the bay, and stay away from the ventilator for up to four hours at a time.
              </p>
              <p>
                We have also seen the effect of proper nutrition and multidisciplinary care. Kamsi, who was terribly underweight one year ago, was later weighed at 19.2kg.
              </p>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ROW 3: KACHI & THE COST */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Then Came Kachi</h2>
              <p>As painful as one SMA diagnosis is, our family&apos;s burden did not stop there.</p>
              <p className="text-xl font-bold text-blue-800 my-4">
                Kachi, Kamsi&apos;s younger sister, also has SMA.
              </p>
              <p>
                That reality multiplies the emotional burden, practical burden, cost, attention, decisions, exhaustion, fear, and the need for endurance.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">What This Journey Has Cost</h2>
              <p>
                SMA has cost us simplicity. It has cost us ease. It has cost us sleep, emotional steadiness, and the kind of carefree parenting many people take for granted.
              </p>
              <p>
                It has forced us into difficult relocations and impossible calculations. It has required us to learn a world of medical realities we never asked to know.
              </p>
              <p className="font-medium text-gray-900">
                But beyond all of that, it has cost us the innocence of not knowing.
              </p>
            </div>
          </section>

          {/* ROW 4: LESSONS & THE FOUNDATION */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">What This Journey Has Also Taught Us</h2>
              <p>This story is painful, but it has also formed us.</p>
              <ul className="space-y-3 list-none pl-0">
                <li className="pl-4 border-l-2 border-blue-300">
                  It has taught us that children living with SMA must never be reduced to pity. They carry dignity, personality, intelligence, presence, and worth. They deserve to be seen properly.
                </li>
                <li className="pl-4 border-l-2 border-blue-300">
                  It has taught us that support must go beyond kind words. Families need understanding that is informed, practical, and sustained.
                </li>
                <li className="pl-4 border-l-2 border-blue-300">
                  It has taught us that hope must be serious. Not shallow. Not decorative. Not the kind of hope that denies pain. The kind that tells the truth about suffering and still keeps building.
                </li>
              </ul>
            </div>

            <div className="prose prose-lg text-gray-700 bg-blue-50 p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-blue-200 pb-2">Why We Started SMA Hope Foundation Nigeria</h2>
              <p>
                At some point, it became clear to us that this journey should not remain only our private pain.
              </p>
              <p>
                If our daughters&apos; lives had brought us face to face with the reality of SMA, then that reality should be spoken about more clearly in public.
              </p>
              <p className="font-semibold text-gray-900">
                That is why SMA Hope Foundation Nigeria exists.
              </p>
              <p>
                This foundation is our effort to turn lived experience into meaningful public work. To raise awareness about SMA in plain language. To help families feel less alone. To advocate for dignity.
              </p>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* CONCLUSION & CTAs */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">A Word About Hope</h2>
            <p>Hope is in our name because we have had to learn what real hope means.</p>
            <p>
              It is not denial. It is not pretending things are easier than they are. It is not refusing to look at suffering. Real hope tells the truth fully and still refuses to surrender.
            </p>
            <p className="font-medium text-gray-900">
              It keeps loving. It keeps learning. It keeps advocating. It keeps caring. It keeps building.
            </p>
            <p className="italic text-gray-600 mb-12">
              That is the kind of hope we want this foundation to carry.
            </p>

            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 mb-8 text-left">
              <p>
                SMA Hope Foundation Nigeria was born from the real lives of Kamsi and Kachi, and from the long journey our family has walked with them.
              </p>
              <p>
                Their lives have changed us. Their journey has taught us. Their burden has given shape to this mission.
              </p>
              <p>
                We know how heavy this road can be. We know how lonely it can feel. We know how much families need understanding, dignity, support, and truth.
              </p>
              <p className="font-semibold text-gray-900 mt-4">That is why this foundation exists.</p>
            </div>
            
            {/* EXACT MATCH BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
              <Link 
                href="/donate" 
                className="btn btn-primary w-full sm:w-auto"
              >
                Support the Foundation
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
