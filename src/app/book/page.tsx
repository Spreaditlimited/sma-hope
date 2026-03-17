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
    <ContentPageBg image="/home/home-ways-to-help.png">
      <PageHeader
        title="The Book"
        intro="A book born from real experience, written to help more people understand SMA"
        backgroundImage="/home/home-ways-to-help.png"
      />

      <section className="section-tight content-page-section">
        <div className="container about-page-flow">
          <article className="about-panel prose book-intro-card">
            <h2 className="section-heading-strong">When Every Breath Matters</h2>
            <p className="book-intro-subtitle">Understanding Spinal Muscular Atrophy Through Medicine, Family, Faith, and Survival</p>
            <p className="book-intro-author">By Tochukwu and Ijeoma Nkwocha</p>

            <div className="book-intro-grid">
              <div className="book-intro-media">
                <div className="book-showcase-frame">
                  <Image
                    src="/Book-v3.PNG"
                    alt="When Every Breath Matters book cover"
                    width={1681}
                    height={2448}
                    className="book-showcase-image"
                  />
                </div>
              </div>
              <div className="book-intro-copy">
                <p className="book-intro-pull">Some books are written from a distance.</p>
                <p className="book-intro-pull">This one was not.</p>
                <p>
                  When Every Breath Matters was born out of lived experience. It comes from the reality of raising children affected by Spinal Muscular Atrophy and carrying the weight this condition brings into a family&apos;s life. This is a
                  book about SMA, but it is also a book about love, fear, medicine, survival, endurance, and the unseen work families do every day.
                </p>
                <p>
                  For many people, SMA is a rare condition they know little about. For some families, it becomes the reality that changes everything. It changes how they think about breathing, feeding, sleep, treatment, hospital visits,
                  finances, marriage, movement across countries, and the future itself.
                </p>
              </div>
            </div>

            <p>This book was written to help bridge that gap.</p>
            <p>
              It explains what SMA is in clear, plain language, but it also tells the deeper human story behind the diagnosis. It helps readers understand what happens when a serious medical condition moves from a hospital file into a home and
              stays there.
            </p>
            <p>This is not a cold medical manual.</p>
            <p>It is not a sentimental story without substance.</p>
            <p>It is a serious, human, medically grounded, and deeply personal book written to help people understand what SMA really means.</p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Why This Book Matters</h2>
            <p>
              Spinal Muscular Atrophy is still poorly understood by many people, especially in places where awareness remains low and families often carry the burden with too little support.
            </p>
            <p>
              This book matters because families need language for what they are living through. Relatives and friends need help understanding the true weight of the condition. Doctors, churches, communities, and the wider public need a
              clearer and more compassionate understanding of what SMA does to a child and to a family.
            </p>
            <p>Most of all, this book matters because silence does not help families.</p>
            <p>Truth helps.</p>
            <p>Understanding helps.</p>
            <p>Compassion helps.</p>
            <p>Serious support helps.</p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">What You&apos;ll Find Inside</h2>
            <p>Inside this book, we explore:</p>
            <ul>
              <li>what Spinal Muscular Atrophy really is</li>
              <li>the early signs many families miss</li>
              <li>diagnosis and genetics in plain language</li>
              <li>the different types of SMA and why they matter</li>
              <li>breathing, feeding, nutrition, and daily care</li>
              <li>treatment, medication, and the painful issue of access</li>
              <li>the strain on marriage and family life</li>
              <li>siblings, home, and the hidden meaning of love</li>
              <li>faith in the middle of fear</li>
              <li>money, migration, and the impossible decisions families sometimes face</li>
              <li>our own story as a family</li>
              <li>what families need to know as early as possible</li>
              <li>what the world needs to understand about SMA</li>
            </ul>
            <p>This book is both practical and personal. It is written for people who need clarity, and for people who need to feel seen.</p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Who This Book Is For</h2>
            <p>This book is for:</p>
            <ul>
              <li>parents and families living with SMA</li>
              <li>caregivers and relatives</li>
              <li>doctors, nurses, therapists, and other health professionals</li>
              <li>pastors, churches, and support communities</li>
              <li>donors, advocates, and policymakers</li>
              <li>anyone who wants to understand the real weight of this condition</li>
            </ul>
            <p>Whether you are facing SMA directly or trying to understand it from the outside, this book was written to help you see more clearly and respond more thoughtfully.</p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">More Than a Book</h2>
            <p>When Every Breath Matters is part of a larger mission.</p>
            <p>
              It is one of the ways SMA Hope Foundation Nigeria is working to increase awareness, deepen understanding, support affected families, and encourage a more compassionate and informed response to Spinal Muscular Atrophy.
            </p>
            <p>
              This book exists because the subject is not distant to us. It is personal. It is urgent. And it deserves far more awareness, dignity, and structured support than it currently receives.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">A Personal Note from the Authors</h2>
            <p>We did not write this book because this subject is interesting to us.</p>
            <p>We wrote it because it is our life.</p>
            <p>
              We have lived the confusion, the fear, the hospital admissions, the movement across countries, the treatment struggles, the respiratory battles, the financial weight, the long prayers, and the slow, precious victories that many
              people outside this world will never fully see.
            </p>
            <p>We wrote this book because children living with SMA deserve to be understood with truth and dignity.</p>
            <p>We wrote it because families carrying this burden should not have to remain invisible.</p>
            <p>We wrote it because every breath matters.</p>
            <p>Tochukwu and Ijeoma Nkwocha</p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Get Your Copy</h2>
            <p>Read the book.</p>
            <p>Share it with others.</p>
            <p>Help more people understand SMA with seriousness, compassion, and dignity.</p>
            <p>
              <strong>Buy the Book</strong>
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Support the Mission</h2>
            <p>If this message speaks to you, there are other ways to help.</p>
            <p>Buy a copy for someone else.</p>
            <p>Share this book with your church, hospital, or community.</p>
            <p>Support SMA Hope Foundation Nigeria.</p>
            <p>Help us spread awareness about Spinal Muscular Atrophy.</p>
            <p>
              <strong>Support the Foundation</strong>
            </p>
          </article>

          <div className="section-actions page-end-actions" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn btn-primary" type="button">
              Buy the Book
            </button>
            <Link href="/donate" className="btn btn-secondary">
              Support the Foundation
            </Link>
          </div>
        </div>
      </section>
    </ContentPageBg>
  );
}
