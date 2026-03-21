import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { SectionDivider } from "@/components/section-divider";
import { UpdateCard } from "@/components/update-card";
import { getLatestUpdates } from "@/lib/content";

export const metadata = buildMetadata({
  title: "Home",
  description: "Building Awareness and Support for Spinal Muscular Atrophy in Nigeria",
  path: "/",
});

// Refactored SectionArt to use Tailwind instead of inline styles
function SectionArt({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-6 mt-4 aspect-[16/9]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

export default async function HomePage() {
  const updates = await getLatestUpdates();
  const homepageUpdates = updates.filter(
    (item) => item.category !== "Book" && !item.title.toLowerCase().includes("book")
  );

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative bg-white pt-12 pb-14 sm:pt-14 sm:pb-16 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Hero Copy */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="inline-block px-4 py-1.5 text-sm font-bold text-[var(--primary)] bg-[#e7f2fb] rounded-full tracking-wide uppercase border border-[#c9ddec]">
                SMA Hope Foundation Nigeria
              </span>
              <div>
                <h1 className="text-[1.95rem] sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.14]">
                  Building Awareness and Support for Spinal Muscular Atrophy in Nigeria
                </h1>
                <p className="mt-8 sm:mt-6 text-[1rem] sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  SMA Hope Foundation Nigeria is a registered foundation shaped by real family experience with Spinal Muscular Atrophy. We exist to raise awareness, share knowledge, support families, and help more people understand the weight this condition places on children and those who care for them.
                </p>
              </div>
              
              {/* Native Buttons Restored */}
              <div className="section-actions mt-2 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
                <Link href="/what-is-sma" className="btn btn-primary w-full sm:w-auto text-center">
                  <span className="sm:hidden">About SMA</span>
                  <span className="hidden sm:inline">Learn About SMA</span>
                </Link>
                <Link href="/donate" className="btn btn-secondary w-full sm:w-auto text-center">
                  <span className="sm:hidden">Support</span>
                  <span className="hidden sm:inline">Support the Foundation</span>
                </Link>
              </div>
            </div>

            {/* Hero Media */}
            <aside className="lg:col-span-6 -mt-1 sm:mt-0">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 relative">
                <Image
                  src="/family.jpg"
                  alt="Family photo related to SMA Hope Foundation"
                  width={3589}
                  height={3024}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
              <div className="mt-4 sm:mt-5 text-left lg:text-left px-1 sm:px-2">
                <p className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-1">
                  Real Family Journey
                </p>
                <p className="text-gray-500 text-sm font-medium">
                  This foundation is rooted in lived experience with Kamsi and Kachi.
                </p>
              </div>
            </aside>

          </div>
        </div>
      </section>

      <SectionDivider />

      {/* MAIN CONTENT SECTIONS */}
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
        <div className="space-y-20 md:space-y-32">

          {/* BLOCK 1: INTRO */}
          <section className="max-w-4xl mx-auto prose prose-lg md:prose-xl text-gray-700 text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              A foundation born from lived experience
            </h2>
            <SectionArt src="/home/home-who-we-are.png" alt="Abstract visual for who we are section" />
            <p className="font-medium text-gray-900 mt-8">
              SMA Hope Foundation Nigeria did not begin as an idea on paper. It grew out of real life, real questions, real pain, and the long journey of caring for children living with Spinal Muscular Atrophy.
            </p>
            <p>
              For many families, SMA is not just a medical term. It changes daily life. It affects breathing, feeding, movement, sleep, finances, emotions, and the future a family once imagined. It can be deeply isolating, especially in places where awareness is low and support is limited.
            </p>
            <p className="italic">
              We started this foundation because we know that burden firsthand. We also know that families need more than sympathy. They need understanding. They need honest information. They need dignity. They need support. And they need to know they are not alone.
            </p>
          </section>

          {/* BLOCK 2: WHAT IS SMA & WHY BEGIN (2-Col) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
            <article className="prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">What is Spinal Muscular Atrophy?</h2>
              <SectionArt src="/home/home-what-is-sma.png" alt="Abstract visual for what is SMA section" />
              <p>
                Spinal Muscular Atrophy, often called SMA, is a serious genetic condition that affects the muscles of the body. It weakens muscle strength over time and can make it difficult for a child to sit, stand, move, swallow, or breathe well without support.
              </p>
              <p>
                SMA is not always widely understood, but for affected families, its impact is immediate and far-reaching. It can shape nearly every part of daily life and often requires ongoing medical care, close monitoring, and constant adjustment.
              </p>
              <div className="mt-8">
                <Link href="/what-is-sma" className="btn btn-secondary">
                  What Is SMA?
                </Link>
              </div>
            </article>

            <article className="prose prose-lg text-gray-700 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Why this work had to begin</h2>
              <SectionArt src="/home/home-why-foundation.png" alt="Abstract visual for why this foundation exists section" />
              <p>
                In many places, families affected by SMA are carrying an enormous burden in silence. Some are still searching for answers. Some are trying to understand a diagnosis they never expected. Some are learning, day by day, how much care a child may need just to breathe, feed, sleep, or stay stable.
              </p>
              <p>
                Awareness is still low. Public understanding is limited. The emotional and financial strain on families can be overwhelming. Too often, people only see a small part of what the condition really means.
              </p>
            </article>
          </section>

          {/* BLOCK 3: STORY & FAMILIES (2-Col) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
            <article className="prose prose-lg text-gray-700 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">The story behind the foundation</h2>
              <SectionArt src="/home/home-our-story.png" alt="Abstract visual for our story section" />
              <p className="font-medium text-gray-900">Behind this foundation is a real family journey with Spinal Muscular Atrophy.</p>
              <p>
                What we have lived through has shaped how we speak about SMA, how we think about support, and why this foundation matters so much to us. This work is personal, but it is not only personal.
              </p>
              <div className="mt-8">
                <Link href="/our-story" className="btn btn-secondary">
                  Read Our Story
                </Link>
              </div>
            </article>

            <article className="prose prose-lg text-gray-700 bg-blue-50 p-6 md:p-8 rounded-3xl border border-blue-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-blue-200 pb-2">For families carrying this burden</h2>
              <SectionArt src="/home/home-support-families.png" alt="Abstract visual for support for families section" />
              <p>
                If your child has been diagnosed with SMA, or if your family is trying to make sense of symptoms, fear, medical appointments, and difficult decisions, this space is for you too.
              </p>
              <p>
                This foundation exists in part to help families feel less alone. We want to provide clear information, compassionate guidance, and a growing platform of support shaped by lived understanding.
              </p>
              <div className="mt-8">
                <Link href="/support-for-families" className="btn btn-secondary">
                  Support for Families
                </Link>
              </div>
            </article>
          </section>

          <hr className="border-gray-200" />

          {/* BLOCK 4: BOOK & WAYS TO HELP */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* The Book - Takes up 5 columns on large screens */}
            <article className="lg:col-span-5 prose prose-lg text-gray-700 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">A book shaped by truth, family, and hard-won understanding</h2>
              <div className="relative w-full max-w-sm mx-auto md:mx-0 rounded-xl overflow-hidden shadow-2xl border border-gray-200 mb-8 transition-transform hover:-translate-y-2 duration-300">
                <Image
                  src="/Book-v3.PNG"
                  alt="When Every Breath Matters book cover"
                  width={1681}
                  height={2448}
                  className="w-full h-auto object-cover"
                />
              </div>
              <p>
                We are also launching a book that explores Spinal Muscular Atrophy more deeply through the lens of real family experience. 
              </p>
              <p className="italic text-gray-600">
                The aim is not only to tell a story, but to help people understand the condition, the burden families carry, and the kind of support and awareness that are still needed.
              </p>
              <div className="mt-6 flex justify-center md:justify-start">
                <Link href="/book" className="btn btn-primary">
                  Explore the Book
                </Link>
              </div>
            </article>

            {/* Ways to Help - Takes up 7 columns on large screens */}
            <article className="lg:col-span-7 prose prose-lg text-gray-700 bg-gray-50 p-6 md:p-10 rounded-3xl border border-gray-100">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 border-b pb-2">There are meaningful ways to help</h2>
              <SectionArt src="/home/home-ways-to-help.png" alt="Abstract visual for ways to help section" />
              <p>
                Some people will want to support by giving. Others will want to learn more, buy the book, share awareness, or partner with the foundation in a deeper way. All of these matter.
              </p>
              <ul className="space-y-4 list-none pl-0 mt-6">
                <li className="pl-4 border-l-2 border-blue-400">
                  <strong className="text-gray-900">Support the Foundation:</strong> Your support can help strengthen awareness, education, advocacy, and the foundation&apos;s work over time.
                </li>
                <li className="pl-4 border-l-2 border-blue-400">
                  <strong className="text-gray-900">Buy the Book:</strong> The book is one of the ways this mission will reach more people and deepen understanding.
                </li>
                <li className="pl-4 border-l-2 border-blue-400">
                  <strong className="text-gray-900">Share Awareness:</strong> Sometimes help begins with helping others understand what SMA is and why affected families need support.
                </li>
                <li className="pl-4 border-l-2 border-blue-400">
                  <strong className="text-gray-900">Get Involved:</strong> There may be opportunities to partner, volunteer, collaborate, or support the foundation in practical ways.
                </li>
              </ul>
            </article>
          </section>

          {/* BLOCK 5: TRUST & TRANSPARENCY */}
          <section className="max-w-4xl mx-auto prose prose-lg text-gray-700 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Built on seriousness, compassion, and accountability</h2>
            <SectionArt src="/home/home-trust-transparency.png" alt="Abstract visual for trust and transparency section" />
            <p>
              SMA Hope Foundation Nigeria is a registered foundation. We believe that work like this must be carried out with care, honesty, and a strong sense of responsibility.
            </p>
            <p className="font-semibold text-xl text-gray-900 my-6">
              Trust matters. Families need it. Donors need it. Partners need it. The public needs it.
            </p>
            <p>
              That is why we are committed to building this foundation on clear purpose, responsible stewardship, and a sincere desire to be useful to the people this mission is meant to serve.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/transparency" className="btn btn-secondary">
                Our Commitment to Transparency
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* LATEST UPDATES SECTION */}
      <section className="bg-gray-50 py-16 md:py-24 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="mb-12 max-w-3xl">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Latest updates and reflections</h2>
              <p>
                As the foundation grows, this website will also serve as a place for updates, reflections, awareness resources, and important conversations around SMA, family care, advocacy, and hope.
              </p>
              <p>
                We want this to be a living platform, not a static website. A place where people can keep learning, stay connected to the mission, and follow the work as it develops.
              </p>
            </div>
          </div>

          {/* Updates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homepageUpdates.map((item) => (
              <UpdateCard key={item.slug} item={item} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/updates" className="btn btn-secondary">
              Read All Updates
            </Link>
          </div>
          
        </div>
      </section>
    </>
  );
}
