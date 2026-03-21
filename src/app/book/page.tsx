import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { ContentPageBg } from "@/components/content-page-bg";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "The Book",
  description: "A book born from real experience, written to help more people understand SMA.",
  path: "/book",
});

export default function BookPage() {
  return (
    <ContentPageBg image="/home/home-ways-to-help.png" className="book-page-bg">
      <PageHeader
        title="The Book"
        intro="A book born from real experience, written to help more people understand SMA"
        backgroundImage="/home/home-ways-to-help.png"
      />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-[var(--primary)] bg-[#e7f2fb] border border-[#c9ddec] rounded-full">
              Launching Soon
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              When Every Breath Matters
            </h2>
            <p className="text-xl text-gray-700 font-medium">
              Understanding Spinal Muscular Atrophy Through Medicine, Family, Faith, and Survival
            </p>
            <p className="text-lg text-gray-500">By Tochukwu and Ijeoma Nkwocha</p>

            <blockquote className="border-l-4 border-[var(--primary)] pl-6 py-2 my-8 italic text-xl text-gray-800 bg-gray-50 rounded-r-lg">
              <p>Some books are written from a distance.</p>
              <p className="font-semibold mt-2">This one was not.</p>
            </blockquote>

            <div className="prose prose-lg text-gray-600">
              <p>
                <em>When Every Breath Matters</em> was born out of lived experience. It comes from the reality of raising children affected by Spinal Muscular Atrophy and carrying the weight this condition brings into a family&apos;s life. This is a book about SMA, but it is also a book about love, fear, medicine, survival, endurance, and the unseen work families do every day.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl space-y-2 text-sm text-gray-700 border border-gray-100 mt-8">
              <p><strong>Status:</strong> Pre-launch release window</p>
              <p><strong>Focus:</strong> Medical clarity + lived family reality</p>
              <p><strong>Audience:</strong> Families, clinicians, communities, advocates</p>
            </div>
          </div>

          {/* BOOK COVER MEDIA */}
          <aside className="lg:col-span-5 lg:sticky lg:top-8" aria-label="Book cover preview">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 transition-transform hover:scale-[1.02] duration-300">
              <Image
                src="/Book-v3.PNG"
                alt="When Every Breath Matters book cover"
                width={1681}
                height={2448}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">Official Cover Preview</p>
          </aside>
        </section>

        {/* CONTENT SECTIONS */}
        <div className="max-w-3xl mx-auto space-y-16">
          <section className="prose prose-lg md:prose-xl text-gray-700">
            <p>
              For many people, SMA is a rare condition they know little about. For some families, it becomes the reality that changes everything. It changes how they think about breathing, feeding, sleep, treatment, hospital visits, finances, marriage, movement across countries, and the future itself.
            </p>
            <p className="font-semibold text-gray-900">This book was written to help bridge that gap.</p>
            <p>
              It explains what SMA is in clear, plain language, but it also tells the deeper human story behind the diagnosis. It helps readers understand what happens when a serious medical condition moves from a hospital file into a home and stays there.
            </p>
            <p>This is not a cold medical manual. It is not a sentimental story without substance.</p>
            <p className="font-medium text-gray-900">
              It is a serious, human, medically grounded, and deeply personal book written to help people understand what SMA really means.
            </p>
          </section>

          <hr className="border-gray-200" />

          <section className="prose prose-lg text-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why This Book Matters</h2>
            <p>
              Spinal Muscular Atrophy is still poorly understood by many people, especially in places where awareness remains low and families often carry the burden with too little support.
            </p>
            <p>
              This book matters because families need language for what they are living through. Relatives and friends need help understanding the true weight of the condition. Doctors, churches, communities, and the wider public need a clearer and more compassionate understanding of what SMA does to a child and to a family.
            </p>
            <p className="font-semibold mt-6 text-gray-900">Most of all, this book matters because silence does not help families.</p>
            <ul className="list-disc pl-6 space-y-2 mt-4 font-medium text-gray-800">
              <li>Truth helps.</li>
              <li>Understanding helps.</li>
              <li>Compassion helps.</li>
              <li>Serious support helps.</li>
            </ul>
          </section>

          <section className="prose prose-lg text-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What You&apos;ll Find Inside</h2>
            <p>Inside this book, we explore:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 list-disc pl-6 marker:text-[var(--primary)]">
              <li>What Spinal Muscular Atrophy really is</li>
              <li>Early signs many families miss</li>
              <li>Diagnosis and genetics in plain language</li>
              <li>The different types of SMA and why they matter</li>
              <li>Breathing, feeding, nutrition, and daily care</li>
              <li>Treatment, medication, and the painful issue of access</li>
              <li>The strain on marriage and family life</li>
              <li>Siblings, home, and the hidden meaning of love</li>
              <li>Faith in the middle of fear</li>
              <li>Money, migration, and impossible decisions</li>
              <li>Our own story as a family</li>
              <li>What the world needs to understand about SMA</li>
            </ul>
            <p className="mt-6 italic">
              This book is both practical and personal. It is written for people who need clarity, and for people who need to feel seen.
            </p>
          </section>

          <hr className="border-gray-200" />

          <section className="prose prose-lg text-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">A Personal Note from the Authors</h2>
            <p>We did not write this book because this subject is interesting to us.</p>
            <p className="font-bold text-xl text-gray-900">We wrote it because it is our life.</p>
            <p>
              We have lived the confusion, the fear, the hospital admissions, the movement across countries, the treatment struggles, the respiratory battles, the financial weight, the long prayers, and the slow, precious victories that many people outside this world will never fully see.
            </p>
            <p>We wrote this book because children living with SMA deserve to be understood with truth and dignity.</p>
            <p>We wrote it because families carrying this burden should not have to remain invisible.</p>
            <p className="text-2xl font-semibold text-gray-900 mt-6">We wrote it because every breath matters.</p>
            <p className="mt-4 font-medium">— Tochukwu and Ijeoma Nkwocha</p>
          </section>

          {/* CALL TO ACTION BLOCK */}
          <section className="bg-[#edf5fb] rounded-2xl p-8 md:p-12 text-center mt-12 border border-[#d4e4ef] shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900">Support the Mission</h2>
            <div className="h-4" aria-hidden="true" />
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Read the book. Share it with your community. Help us spread awareness and provide serious, compassionate support to families through the SMA Hope Foundation Nigeria.
            </p>
            <div className="h-8" aria-hidden="true" />
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/order-book" 
                className="btn btn-primary w-full sm:w-auto"
              >
                Buy the Book
              </Link>
              <Link 
                href="/donate" 
                className="btn btn-secondary w-full sm:w-auto"
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
