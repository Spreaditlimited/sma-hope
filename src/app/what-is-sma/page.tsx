import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "What Is SMA?",
  description: "Understanding Spinal Muscular Atrophy in plain language.",
  path: "/what-is-sma",
});

export default function WhatIsSmaPage() {
  return (
    <ContentPageBg image="/home/home-what-is-sma.png">
      <PageHeader
        title="What Is SMA?"
        intro="Understanding Spinal Muscular Atrophy in plain language"
        backgroundImage="/home/home-what-is-sma.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16 md:space-y-24">
          
          {/* INTRO SECTION */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto md:text-left">
            <p className="font-medium text-gray-900">
              Spinal Muscular Atrophy, often called SMA, is a serious genetic condition that affects the muscles of the body. It happens when the nerves that control muscle movement do not work properly, which causes muscles to become weak over time.
            </p>
            <p>
              In simple terms, SMA makes it harder for a child to do things the body would normally do with strength and control. Depending on the type and severity, it can affect sitting, standing, crawling, walking, swallowing, coughing, and even breathing.
            </p>
            <p>
              For many families, SMA is not something they had ever heard of before diagnosis. That is one reason awareness matters so much. A condition can carry a heavy burden and still remain poorly understood by the wider public.
            </p>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ROW 1: BODY & BREATHING */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">What SMA Does in the Body</h2>
              <p>
                The body depends on nerve cells called motor neurons to send signals from the brain and spinal cord to the muscles. In SMA, these nerve cells are damaged or lost because of a genetic problem involving a protein the body needs in order for those cells to survive.
              </p>
              <p>
                When those nerve signals are weakened, the muscles do not receive the support they need. Over time, this causes muscle weakness and loss of strength.
              </p>
              <p>
                This is why a child with SMA may struggle with movements that other children do naturally. It is not because the child is not trying. It is because the body is dealing with a condition that directly affects muscle control and strength.
              </p>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Why Breathing, Feeding, and Movement Can Be Affected</h2>
              <p>
                Many people hear about muscle weakness and assume it only means difficulty with walking or standing. But SMA can affect much more than that.
              </p>
              <p>
                The muscles involved in breathing can become weak. The muscles needed for swallowing and feeding can also be affected. Neck control, posture, coughing, and the ability to clear secretions may become difficult too.
              </p>
              <p>
                That is why SMA often requires much more than routine medical care. It can involve respiratory support, feeding support, close monitoring, therapy, and constant attention to changes in a child&apos;s condition.
              </p>
              <p className="font-medium text-gray-900">
                This is also why families affected by SMA often live with a level of responsibility that others may not immediately see.
              </p>
            </div>
          </section>

          {/* ROW 2: CHILDREN & FAMILIES */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">How SMA Can Affect Children</h2>
              <p>
                SMA does not affect every child in exactly the same way, but it can significantly shape a child&apos;s daily life. Children may:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-blue-500 text-gray-800">
                <li>have weak muscle tone</li>
                <li>struggle to meet physical milestones</li>
                <li>need help sitting, moving, swallowing, or breathing</li>
                <li>require medical devices or support systems</li>
                <li>need regular specialist care and monitoring</li>
              </ul>
            </div>

            <div className="prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">How SMA Affects Families</h2>
              <p className="font-medium text-gray-900">
                SMA is not only something a child lives with. It is also something a family lives around.
              </p>
              <p>
                Parents often have to learn new medical terms, new care routines, new fears, and new responsibilities very quickly. Daily life may begin to revolve around appointments, equipment, medication, therapy, feeding, sleep monitoring, and respiratory concerns.
              </p>
              <p>
                It can affect work, finances, rest, mental strength, marriage, family rhythm, and long-term planning. It can be deeply exhausting, even in a loving and determined home.
              </p>
              <p className="italic border-l-4 border-blue-500 pl-4 my-6 bg-gray-50 py-2 rounded-r-lg">
                That is one reason public understanding matters. Families should not be left to carry such a heavy burden while the world around them remains largely unaware of what SMA really means.
              </p>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* ROW 3: TYPES & EARLY DIAGNOSIS */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
            <div className="lg:col-span-7 prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Different Types of SMA</h2>
              <p>
                There are different types of SMA, and they are often described based on when symptoms begin and how severely movement is affected.
              </p>
              <div className="space-y-4 mt-4">
                <p><strong className="text-gray-900">SMA Type 1:</strong> This is one of the most severe forms and often begins in infancy. Children with SMA Type 1 may have significant muscle weakness and may struggle with breathing, swallowing, and meeting early movement milestones such as sitting unsupported.</p>
                <p><strong className="text-gray-900">SMA Type 2:</strong> This type usually appears a little later. Children with SMA Type 2 may be able to sit but often do not walk independently. They may still face serious physical and respiratory challenges and often need long-term support.</p>
                <p><strong className="text-gray-900">SMA Type 3:</strong> This form is often milder than Types 1 and 2. Children with SMA Type 3 may be able to walk at some stage, though muscle weakness can still progress and create ongoing difficulties.</p>
                <p><strong className="text-gray-900">SMA Type 4:</strong> This is a rarer adult-onset form and is usually milder than the childhood types.</p>
              </div>
              <p className="italic mt-6 text-gray-600">
                Even though these categories are useful, every child&apos;s experience still has its own complexity. The label alone does not always capture the full reality of care.
              </p>
            </div>

            <div className="lg:col-span-5 prose prose-lg text-gray-700 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Why Early Diagnosis Matters</h2>
              <p>
                Early diagnosis matters because the earlier SMA is identified, the sooner a child can begin to receive the right kind of medical attention, monitoring, and support.
              </p>
              <p>
                Families also need clarity. When symptoms are unexplained, parents can spend painful months moving from one question to another without knowing what they are really facing. A clear diagnosis, difficult as it may be, can help a family begin to understand the condition, seek proper care, and make informed decisions.
              </p>
              <p className="font-semibold text-gray-900 mt-4">
                In conditions like SMA, time matters. Awareness matters too, because many people cannot act on what they do not yet recognise.
              </p>
            </div>
          </section>

          {/* ROW 4: TREATMENT & MISUNDERSTANDINGS */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
            <div className="lg:col-span-5 prose prose-lg text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Treatment and Ongoing Support</h2>
              <p>
                SMA is a serious condition, but care and treatment have improved in important ways in recent years. Depending on where a family lives and what is accessible to them, support may include medication, respiratory care, physiotherapy, feeding support, nutritional support, and regular specialist monitoring.
              </p>
              <p>
                Even where treatment exists, the reality is often still demanding. Access can be difficult. Costs can be high. Daily care remains complex. Progress still requires close attention and sustained support.
              </p>
              <p className="font-medium text-gray-900">
                So while medical progress matters, it does not remove the deep practical and emotional burden many families continue to carry.
              </p>
            </div>

            <div className="lg:col-span-7 bg-blue-50 p-8 rounded-2xl border border-blue-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Misunderstandings About SMA</h2>
              <ul className="space-y-4 list-none pl-0">
                <li className="pl-4 border-l-2 border-blue-300">
                  <strong className="text-gray-900">SMA is not caused by poor parenting.</strong> It is a genetic condition.
                </li>
                <li className="pl-4 border-l-2 border-blue-300">
                  <strong className="text-gray-900">SMA is not simply delayed development.</strong> It is a serious neuromuscular condition that needs proper medical attention.
                </li>
                <li className="pl-4 border-l-2 border-blue-300">
                  <strong className="text-gray-900">SMA is not only about movement.</strong> It can also affect breathing, feeding, posture, and many areas of daily care.
                </li>
                <li className="pl-4 border-l-2 border-blue-300">
                  <strong className="text-gray-900">A child with SMA is not defined only by weakness.</strong> That child still has dignity, personality, presence, and worth.
                </li>
                <li className="pl-4 border-l-2 border-blue-300">
                  <strong className="text-gray-900">Families living with SMA do not only need pity.</strong> They need understanding, informed support, and compassionate action.
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-200 max-w-3xl mx-auto" />

          {/* CONCLUSION & CTAs */}
          <section className="prose prose-lg md:prose-xl text-gray-700 max-w-3xl mx-auto text-center">
            <p className="font-medium text-gray-900">
              Spinal Muscular Atrophy is a serious condition, but it should never be discussed in a way that removes the humanity of the child or the dignity of the family.
            </p>
            <p>
              The more people understand SMA clearly, the more possible it becomes to respond with truth, compassion, and useful support.
            </p>
            <p className="italic mb-12">That is part of why this foundation exists.</p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
              <Link 
                href="/our-story" 
                className="btn btn-secondary w-full sm:w-auto"
              >
                Read Our Story
              </Link>
              <Link 
                href="/donate" 
                className="btn btn-primary w-full sm:w-auto"
              >
                Support the Foundation
              </Link>
            </div>
          </section>

        </div>
      </main>
    </ContentPageBg>
  );
}
