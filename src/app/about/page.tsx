import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "About the Foundation",
  description: "A foundation shaped by lived experience, committed to awareness, dignity, and support.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ContentPageBg image="/home/home-who-we-are.png">
      <PageHeader
        title="About the Foundation"
        intro="A foundation shaped by lived experience, committed to awareness, dignity, and support"
        backgroundImage="/home/home-who-we-are.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-24">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center md:text-left">
            <p className="font-medium text-gray-900">
              SMA Hope Foundation Nigeria is a registered foundation born out of real family experience with Spinal Muscular Atrophy. We exist because SMA is not only a medical condition. It is a life-altering reality that affects children, parents, siblings, caregivers, finances, emotions, and the future a family once imagined.
            </p>
            <p>
              In many places, awareness is still low. Families can spend too long searching for answers, carrying heavy burdens in private, and trying to navigate a condition that few people around them truly understand. We started this foundation because we know that reality firsthand, and we believe families affected by SMA deserve more understanding, more visibility, and more support than they often receive.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* WHY WE EXIST */}
          <section className="prose prose-lg text-gray-700 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why We Exist</h2>
            <p className="font-semibold text-gray-900">
              SMA Hope Foundation Nigeria exists to help close a serious gap.
            </p>
            <p>
              That gap is the gap between diagnosis and understanding. The gap between sympathy and informed support. The gap between what families are carrying and what society is able to see.
            </p>
            <p>
              For many people, SMA is still unfamiliar. For many families, it becomes part of everyday life in ways that are exhausting, costly, and deeply emotional. A child&apos;s breathing, feeding, strength, movement, and stability may all require close attention. Parents may be forced to learn complex care realities very quickly. Even where love is abundant, the burden can still be overwhelming.
            </p>
            <p className="italic border-l-4 border-blue-500 pl-4 my-6 bg-gray-50 py-2 rounded-r-lg">
              This foundation exists because families should not have to carry that weight in silence, and because awareness must grow if support is ever going to deepen.
            </p>
          </section>

          {/* MISSION & VISION - TWO COLUMN */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Our Mission</h2>
              <p>
                Our mission is to raise awareness about Spinal Muscular Atrophy, support affected families with compassion and clarity, promote dignity for children living with the condition, and help build a more informed and humane response around SMA in Nigeria and beyond.
              </p>
              <p>
                We want to make SMA easier to understand in plain language. We want to help families feel seen. We want to create a public voice that is grounded in truth, not pity. And we want to encourage a kind of support that is thoughtful, practical, and respectful.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Our Vision</h2>
              <p className="font-medium text-gray-900">
                We envision a future where families affected by SMA are better understood, better supported, and less alone.
              </p>
              <p>
                We want to see a stronger culture of awareness, more informed public conversation, deeper compassion, and more serious attention given to the realities families face. We believe no child living with SMA should be reduced to a diagnosis, and no family walking this road should feel invisible.
              </p>
            </div>
          </section>

          {/* VALUES & FOCUS - TWO COLUMN */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
            <div className="md:col-span-7 prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Stand For</h2>
              <ul className="space-y-4 list-none pl-0">
                <li className="pl-4 border-l-2 border-gray-300">
                  <strong className="text-gray-900 block mb-1">Compassion</strong>
                  Real compassion goes beyond feeling sorry for people. It listens, learns, understands, and responds with care.
                </li>
                <li className="pl-4 border-l-2 border-gray-300">
                  <strong className="text-gray-900 block mb-1">Dignity</strong>
                  Every child living with SMA deserves to be seen with worth, humanity, and honour. Every family deserves the same.
                </li>
                <li className="pl-4 border-l-2 border-gray-300">
                  <strong className="text-gray-900 block mb-1">Truth</strong>
                  We believe this work must be rooted in honesty. SMA is difficult. The burden is real. Awareness must begin there.
                </li>
                <li className="pl-4 border-l-2 border-gray-300">
                  <strong className="text-gray-900 block mb-1">Responsibility</strong>
                  A public-facing foundation must be serious about trust, stewardship, and the way it carries its work.
                </li>
                <li className="pl-4 border-l-2 border-gray-300">
                  <strong className="text-gray-900 block mb-1">Hope</strong>
                  Not shallow hope. Not decorative hope. The kind of hope that tells the truth about suffering and still chooses to build, support, and stand with others.
                </li>
              </ul>
            </div>

            <div className="md:col-span-5 bg-blue-50 p-8 rounded-2xl border border-blue-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Focus On</h2>
              <ul className="list-disc pl-6 space-y-3 marker:text-blue-600 font-semibold text-gray-800 text-lg">
                <li>Awareness</li>
                <li>Education</li>
                <li>Family Support</li>
                <li>Advocacy</li>
                <li>Trust-Building</li>
              </ul>
            </div>
          </section>

          {/* HISTORY & REGISTRATION - TWO COLUMN */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How This Foundation Began</h2>
              <p>
                SMA Hope Foundation Nigeria did not begin as a formal project first. It began in the lived realities of a family trying to understand, manage, and respond to Spinal Muscular Atrophy.
              </p>
              <p>
                What we have seen and carried has shaped this foundation deeply. The long days. The medical decisions. The fears families rarely explain fully. The need for endurance. The search for help. The weight of trying to hold on to dignity and hope while facing a condition many people do not understand.
              </p>
              <p>
                Over time, it became clear to us that our experience should not remain private if it could help others understand SMA more clearly and support affected families more meaningfully. That conviction is what gave rise to this foundation.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Registered & Serious About the Work</h2>
              <p>
                SMA Hope Foundation Nigeria is a registered foundation in Nigeria. That matters to us because this work deserves structure, accountability, and long-term seriousness.
              </p>
              <p>
                We do not want this platform to be a place of vague promises or emotional language without substance. We want it to be a credible public space where people can learn, connect, support, and follow the growth of a mission built on real experience and genuine commitment.
              </p>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* LOOKING AHEAD */}
          <section className="prose prose-lg text-gray-700 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Looking Ahead</h2>
            <p>
              We know that meaningful work is built over time. This foundation is being built with care, clarity, and a strong sense of responsibility. Some parts of the work will grow gradually, but the purpose is already clear: to raise awareness, support families, protect dignity, and help build a more informed response to SMA.
            </p>
            <p className="font-semibold text-xl text-gray-900 mt-8">
              We are committed to doing this work in a way that is deeply human, publicly responsible, and worthy of trust.
            </p>
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}