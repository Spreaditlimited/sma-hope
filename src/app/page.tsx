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

function HeroSection() {
  return (
    <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-24 overflow-hidden bg-[var(--bg)]">
      {/* Subtle background decoration for depth */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[#eef3f5] to-transparent pointer-events-none rounded-bl-[120px]" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left: Premium Typography Copy */}
          <div className="lg:col-span-6 lg:pr-8 space-y-10 text-left">
            {/* Elegant Kicker */}
            <div className="inline-flex items-center gap-4">
              <span className="w-8 h-[2px] bg-[var(--accent-gold)] rounded-full"></span>
              <span className="text-xs font-bold text-[var(--primary)] tracking-[0.18em] uppercase">
                SMA Hope Foundation Nigeria
              </span>
            </div>

            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-[#102637] tracking-tight leading-[1.08] text-balance">
                Building awareness & support for Spinal Muscular Atrophy.
              </h1>
              
              <p className="text-lg md:text-xl text-[#42586a] leading-relaxed max-w-xl font-medium">
                Shaped by real family experience, we exist to raise awareness, share honest knowledge, and support families navigating the weight of SMA.
              </p>
            </div>

            {/* Refined Actions */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/what-is-sma" className="btn btn-primary px-8 py-3.5 text-[0.95rem] shadow-[0_12px_30px_rgba(15,85,127,0.22)] hover:-translate-y-0.5 transition-transform text-center">
                Learn About SMA
              </Link>
              <Link href="/donate" className="btn btn-secondary bg-white px-8 py-3.5 text-[0.95rem] border-[#d9e1e6] shadow-[0_4px_14px_rgba(0,0,0,0.03)] hover:border-[var(--primary)] hover:bg-[#f8fcfd] hover:-translate-y-0.5 transition-all text-center">
                Support the Foundation
              </Link>
            </div>
          </div>

          {/* Right: Editorial Media Treatment */}
          <div className="lg:col-span-6 relative mt-0 lg:mt-0">
            {/* Soft decorative backdrop angle */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-strong)] rounded-[2rem] transform rotate-3 opacity-[0.06]"></div>
            
            {/* The Matted Frame */}
            <div className="relative rounded-[1.5rem] overflow-hidden bg-white p-2.5 sm:p-3.5 shadow-[0_24px_50px_rgba(16,37,55,0.08)] border border-[#eef3f5] group">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] sm:aspect-[4/3] border border-black/5">
                <Image
                  src="/family.jpg"
                  alt="Family photo related to SMA Hope Foundation"
                  width={1200}
                  height={900}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                  priority
                />
              </div>
              
              {/* Integrated Caption */}
              <div className="pt-5 pb-3 px-3 flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-rose)] shadow-[0_0_10px_rgba(147,26,99,0.3)]"></div>
                </div>
                <div>
                  <p className="font-bold text-[#102637] uppercase tracking-[0.1em] text-[0.7rem] sm:text-xs mb-1">
                    Real Family Journey
                  </p>
                  <p className="text-[#42586a] text-xs sm:text-sm font-medium leading-relaxed">
                    This foundation is rooted in lived experience with Kamsi and Kachi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden flex flex-col sm:flex-row gap-4 pt-2">
            <Link href="/what-is-sma" className="btn btn-primary px-8 py-3.5 text-[0.95rem] shadow-[0_12px_30px_rgba(15,85,127,0.22)] hover:-translate-y-0.5 transition-transform text-center">
              Learn About SMA
            </Link>
            <Link href="/donate" className="btn btn-secondary bg-white px-8 py-3.5 text-[0.95rem] border-[#d9e1e6] shadow-[0_4px_14px_rgba(0,0,0,0.03)] hover:border-[var(--primary)] hover:bg-[#f8fcfd] hover:-translate-y-0.5 transition-all text-center">
              Support the Foundation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const updates = await getLatestUpdates();
  const homepageUpdates = updates.filter(
    (item) => item.category !== "Book" && !item.title.toLowerCase().includes("book")
  );

  return (
    <>
      <HeroSection />

      <SectionDivider />

      <main className="container mx-auto px-4 pt-14 pb-10 md:pt-20 md:pb-14 max-w-7xl">
        <div className="space-y-20 md:space-y-28">

          {/* BLOCK 1: INTRO (Editorial Statement) */}
          <section className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-1 bg-[var(--accent-gold)] mx-auto mb-8 rounded-full"></div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#102637] mb-10 tracking-tight text-balance">
              A foundation born from lived experience.
            </h2>
            <div className="prose prose-lg md:prose-xl text-[#42586a] mx-auto text-left md:text-center leading-relaxed space-y-5">
              <p className="font-medium text-[#102637]">
                SMA Hope Foundation Nigeria did not begin as an idea on paper. It grew out of real life, real questions, real pain, and the long journey of caring for children living with Spinal Muscular Atrophy.
              </p>
              <p>
                For many families, SMA is not just a medical term. It changes daily life. It affects breathing, feeding, movement, sleep, finances, emotions, and the future a family once imagined. It can be deeply isolating, especially in places where awareness is low and support is limited.
              </p>
              <p className="italic font-medium border-l-4 border-[var(--accent-rose)] md:border-l-0 md:border-t-4 md:border-[var(--accent-rose)] md:pt-8 pl-6 md:pl-0 mt-10">
                We started this foundation because we know that burden firsthand. We also know that families need more than sympathy. They need understanding, honest information, dignity, and to know they are not alone.
              </p>
            </div>
          </section>

          {/* BLOCK 2: WHAT IS SMA & WHY BEGIN (Elevated Cards) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <article className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_10px_40px_rgba(16,37,55,0.05)] border border-[#eef3f5] flex flex-col relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(16,37,55,0.08)] transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f0f5f8] to-transparent rounded-bl-full pointer-events-none"></div>
              <div className="w-10 h-10 rounded-full bg-[#f8f8f6] flex items-center justify-center mb-6">
                <div className="w-3 h-3 rounded-full bg-[var(--accent-rose)]"></div>
              </div>
              <h2 className="text-2xl font-bold text-[#102637] mb-6">What is Spinal Muscular Atrophy?</h2>
              <div className="prose text-[#42586a] mb-10 flex-grow space-y-4">
                <p>
                  Spinal Muscular Atrophy, often called SMA, is a serious genetic condition that affects the muscles of the body. It weakens muscle strength over time and can make it difficult for a child to sit, stand, move, swallow, or breathe well without support.
                </p>
                <p>
                  SMA is not always widely understood, but for affected families, its impact is immediate and far-reaching. It shapes nearly every part of daily life and requires ongoing medical care.
                </p>
              </div>
              <div className="mt-auto pt-6 border-t border-[#eef3f5]">
                <Link href="/what-is-sma" className="text-[var(--primary-strong)] font-bold hover:underline underline-offset-4 flex items-center gap-2">
                  Read more about SMA <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </article>

            <article className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_10px_40px_rgba(16,37,55,0.05)] border border-[#eef3f5] flex flex-col relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(16,37,55,0.08)] transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f0f5f8] to-transparent rounded-bl-full pointer-events-none"></div>
              <div className="w-10 h-10 rounded-full bg-[#f8f8f6] flex items-center justify-center mb-6">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>
              </div>
              <h2 className="text-2xl font-bold text-[#102637] mb-6">Why this work had to begin</h2>
              <div className="prose text-[#42586a] mb-10 flex-grow space-y-4">
                <p>
                  In many places, families affected by SMA are carrying an enormous burden in silence. Some are still searching for answers. Some are learning, day by day, how much care a child may need just to breathe, feed, sleep, or stay stable.
                </p>
                <p>
                  Awareness is still low. Public understanding is limited. The emotional and financial strain on families can be overwhelming. Too often, people only see a small part of what the condition really means.
                </p>
              </div>
            </article>
          </section>

          {/* BLOCK 3: STORY & FAMILIES */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <article className="bg-white rounded-3xl p-8 md:p-12 border border-[#eef3f5] flex flex-col">
              <div className="w-10 h-10 rounded-full bg-[#f8f8f6] flex items-center justify-center mb-6">
                <div className="w-3 h-3 rounded-full bg-[var(--accent-gold)]"></div>
              </div>
              <h2 className="text-2xl font-bold text-[#102637] mb-6">The story behind the foundation</h2>
              <div className="prose text-[#42586a] mb-10 flex-grow space-y-4">
                <p className="font-medium text-[#102637]">Behind this foundation is a real family journey with Spinal Muscular Atrophy.</p>
                <p>
                  What we have lived through has shaped how we speak about SMA, how we think about support, and why this foundation matters so much to us. This work is personal, but it is not only personal.
                </p>
              </div>
              <div className="mt-auto">
                <Link href="/our-story" className="btn btn-secondary bg-white text-center w-full sm:w-auto">
                  Read Our Story
                </Link>
              </div>
            </article>

            <article className="bg-gradient-to-br from-[#f8fcff] to-[#eaf4fb] rounded-3xl p-8 md:p-12 border border-[#cce0ef] shadow-[0_10px_30px_rgba(15,85,127,0.06)] flex flex-col">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                <div className="w-3 h-3 rounded-full bg-[var(--accent-green)]"></div>
              </div>
              <h2 className="text-2xl font-bold text-[#102637] mb-6">For families carrying this burden</h2>
              <div className="prose text-[#42586a] mb-10 flex-grow space-y-4">
                <p>
                  If your child has been diagnosed with SMA, or if your family is trying to make sense of symptoms, fear, medical appointments, and difficult decisions, this space is for you too.
                </p>
                <p>
                  This foundation exists in part to help families feel less alone. We want to provide clear information, compassionate guidance, and a growing platform of support shaped by lived understanding.
                </p>
              </div>
              <div className="mt-auto">
                <Link href="/support-for-families" className="btn btn-primary text-center w-full sm:w-auto">
                  Support for Families
                </Link>
              </div>
            </article>
          </section>

          {/* BLOCK 4: BOOK & WAYS TO HELP */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* The Book Showcase */}
            <article className="lg:col-span-5 relative w-full">
              <div className="relative rounded-[2.5rem] bg-gradient-to-b from-[#f4f9fd] to-[#eef5fb] p-10 md:p-14 flex flex-col items-center text-center border border-[#dce8f2] shadow-[inset_0_0_40px_rgba(255,255,255,0.9)] overflow-hidden">
                {/* Subtle background glow to make the book pop */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-[var(--primary)] rounded-full filter blur-[90px] opacity-15 pointer-events-none"></div>

                {/* Book Image with enhanced physicality */}
                <div className="relative w-full max-w-[220px] mx-auto rounded-md shadow-[0_30px_60px_rgba(16,37,55,0.25)] transition-transform hover:-translate-y-4 duration-700 mb-10 border border-white/50 group cursor-pointer">
                  <Image
                    src="/Book-v3.PNG"
                    alt="When Every Breath Matters book cover"
                    width={800}
                    height={1200}
                    className="w-full h-auto object-cover rounded-md"
                  />
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-md"></div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-[#102637] mb-4 text-balance">
                  A book shaped by truth and family
                </h2>

                <p className="text-[#42586a] text-base leading-relaxed mb-10 text-balance">
                  We are launching a book that explores SMA deeply through the lens of real family experience, aiming to help people understand the condition and the burden families carry.
                </p>

                <Link href="/book" className="btn btn-secondary w-full bg-white border-[#dce8f2] hover:border-[var(--primary)] hover:bg-[#f8fcff] py-4 text-[0.95rem] shadow-[0_8px_20px_rgba(16,37,55,0.04)]">
                  Explore the Book
                </Link>
              </div>
            </article>

            {/* Ways to Help Dashboard */}
            <article className="lg:col-span-7 lg:pl-4">
              <div className="mb-10 lg:mb-12 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#102637] mb-6 tracking-tight text-balance">
                  There are meaningful ways to help
                </h2>

                <p className="text-lg md:text-xl text-[#42586a] leading-relaxed max-w-2xl mx-auto lg:mx-0 text-balance">
                  Some people will want to support by giving. Others will want to learn more, share awareness, or partner with the foundation. All of these matter.
                </p>
              </div>

              {/* 2x2 Grid for a more premium, dashboard-like feel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                {[
                  {
                    title: "Support the Foundation",
                    dotColor: "bg-[var(--primary)]",
                    haloColor: "bg-[#eaf3f8]",
                    desc: "Your support strengthens awareness, education, advocacy, and our long-term work.",
                  },
                  {
                    title: "Buy the Book",
                    dotColor: "bg-[var(--accent-gold)]",
                    haloColor: "bg-[#fcf5e5]",
                    desc: "The book is one of the key ways this mission will reach more people and deepen understanding.",
                  },
                  {
                    title: "Share Awareness",
                    dotColor: "bg-[var(--accent-rose)]",
                    haloColor: "bg-[#faebf4]",
                    desc: "Help begins with helping others understand what SMA is and why families need support.",
                  },
                  {
                    title: "Get Involved",
                    dotColor: "bg-[var(--accent-green)]",
                    haloColor: "bg-[#f1f6ed]",
                    desc: "Partner, volunteer, collaborate, or support the foundation in practical, everyday ways.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col p-6 md:p-8 rounded-[1.5rem] bg-white border border-[#eef3f5] shadow-[0_10px_30px_rgba(16,37,55,0.03)] hover:shadow-[0_20px_40px_rgba(16,37,55,0.08)] hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Enhanced Icon Container */}
                    <div className={`w-12 h-12 rounded-full mb-5 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${item.haloColor}`}>
                      <div className={`w-3.5 h-3.5 rounded-full shadow-sm ${item.dotColor}`} />
                    </div>

                    <h3 className="font-bold text-[#102637] text-xl mb-3">
                      {item.title === "Support the Foundation" || item.title === "Buy the Book" ? (
                        <Link href={item.title === "Support the Foundation" ? "/donate" : "/book"} className="text-[var(--primary-strong)] underline decoration-2 underline-offset-4 hover:text-[var(--primary)]">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h3>
                    <p className="text-[#42586a] text-sm md:text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>

        </div>
      </main>

      {/* LATEST UPDATES SECTION */}
      <section className="bg-gradient-to-b from-[#f8f8f6] to-[#eef3f5] py-14 md:py-20 border-t border-[#e0e8ed]">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-[#102637] mb-6">Latest updates & reflections</h2>
              <p className="text-[#42586a] text-lg leading-relaxed">
                As the foundation grows, this serves as a place for updates, awareness resources, and important conversations around family care, advocacy, and hope.
              </p>
            </div>
            <Link href="/updates" className="text-[var(--primary-strong)] font-bold hover:underline underline-offset-4 decoration-2 shrink-0 pb-1 flex items-center gap-2">
              Read All Updates <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {/* Updates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homepageUpdates.slice(0, 3).map((item) => (
              <UpdateCard key={item.slug} item={item} />
            ))}
          </div>
          
        </div>
      </section>
    </>
  );
}
