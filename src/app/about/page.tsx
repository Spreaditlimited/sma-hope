import { PageHeader } from "@/components/page-header";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "About the Foundation",
  description: "A foundation shaped by lived experience, committed to awareness, dignity, and support.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About the Foundation"
        intro="A foundation shaped by lived experience, committed to awareness, dignity, and support"
      />

      <section className="section-tight">
        <div className="container about-page-flow">
          <article className="about-panel prose">
            <p>
              SMA Hope Foundation Nigeria is a registered foundation born out of real family experience with Spinal Muscular Atrophy. We exist because SMA is not only a medical condition. It is a life-altering reality that affects children, parents, siblings, caregivers, finances, emotions, and the future a family once imagined.
            </p>
            <p>
              In many places, awareness is still low. Families can spend too long searching for answers, carrying heavy burdens in private, and trying to navigate a condition that few people around them truly understand. We started this foundation because we know that reality firsthand, and we believe families affected by SMA deserve more understanding, more visibility, and more support than they often receive.
            </p>
          </article>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Why We Exist</h2>
            <p>SMA Hope Foundation Nigeria exists to help close a serious gap.</p>
            <p>
              That gap is the gap between diagnosis and understanding. The gap between sympathy and informed support. The gap between what families are carrying and what society is able to see.
            </p>
            <p>
              For many people, SMA is still unfamiliar. For many families, it becomes part of everyday life in ways that are exhausting, costly, and deeply emotional. A child&apos;s breathing, feeding, strength, movement, and stability may all require close attention. Parents may be forced to learn complex care realities very quickly. Even where love is abundant, the burden can still be overwhelming.
            </p>
            <p>
              This foundation exists because families should not have to carry that weight in silence, and because awareness must grow if support is ever going to deepen.
            </p>
          </article>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">Our Mission</h2>
              <p>
                Our mission is to raise awareness about Spinal Muscular Atrophy, support affected families with compassion and clarity, promote dignity for children living with the condition, and help build a more informed and humane response around SMA in Nigeria and beyond.
              </p>
              <p>
                We want to make SMA easier to understand in plain language. We want to help families feel seen. We want to create a public voice that is grounded in truth, not pity. And we want to encourage a kind of support that is thoughtful, practical, and respectful.
              </p>
            </article>

            <article className="about-panel prose">
              <h2 className="section-heading-strong">Our Vision</h2>
              <p>We envision a future where families affected by SMA are better understood, better supported, and less alone.</p>
              <p>
                We want to see a stronger culture of awareness, more informed public conversation, deeper compassion, and more serious attention given to the realities families face. We believe no child living with SMA should be reduced to a diagnosis, and no family walking this road should feel invisible.
              </p>
            </article>
          </div>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">What We Stand For</h2>
              <ul>
                <li>Compassion: Real compassion goes beyond feeling sorry for people. It listens, learns, understands, and responds with care.</li>
                <li>Dignity: Every child living with SMA deserves to be seen with worth, humanity, and honour. Every family deserves the same.</li>
                <li>Truth: We believe this work must be rooted in honesty. SMA is difficult. The burden is real. Awareness must begin there.</li>
                <li>Responsibility: A public-facing foundation must be serious about trust, stewardship, and the way it carries its work.</li>
                <li>Hope: Not shallow hope. Not decorative hope. The kind of hope that tells the truth about suffering and still chooses to build, support, and stand with others.</li>
              </ul>
            </article>

            <article className="about-panel prose">
              <h2 className="section-heading-strong">What We Focus On</h2>
              <ul>
                <li>Awareness</li>
                <li>Education</li>
                <li>Family Support</li>
                <li>Advocacy</li>
                <li>Trust-Building</li>
              </ul>
            </article>
          </div>

          <div className="about-two-col">
            <article className="about-panel prose">
              <h2 className="section-heading-strong">How This Foundation Began</h2>
              <p>
                SMA Hope Foundation Nigeria did not begin as a formal project first. It began in the lived realities of a family trying to understand, manage, and respond to Spinal Muscular Atrophy.
              </p>
              <p>
                What we have seen and carried has shaped this foundation deeply. The long days. The medical decisions. The fears families rarely explain fully. The need for endurance. The search for help. The weight of trying to hold on to dignity and hope while facing a condition many people do not understand.
              </p>
              <p>
                Over time, it became clear to us that our experience should not remain private if it could help others understand SMA more clearly and support affected families more meaningfully. That conviction is what gave rise to this foundation.
              </p>
            </article>

            <article className="about-panel prose">
              <h2 className="section-heading-strong">Registered and Serious About the Work</h2>
              <p>
                SMA Hope Foundation Nigeria is a registered foundation in Nigeria. That matters to us because this work deserves structure, accountability, and long-term seriousness.
              </p>
              <p>
                We do not want this platform to be a place of vague promises or emotional language without substance. We want it to be a credible public space where people can learn, connect, support, and follow the growth of a mission built on real experience and genuine commitment.
              </p>
            </article>
          </div>

          <article className="about-panel prose">
            <h2 className="section-heading-strong">Looking Ahead</h2>
            <p>
              We know that meaningful work is built over time. This foundation is being built with care, clarity, and a strong sense of responsibility. Some parts of the work will grow gradually, but the purpose is already clear: to raise awareness, support families, protect dignity, and help build a more informed response to SMA.
            </p>
            <p>
              We are committed to doing this work in a way that is deeply human, publicly responsible, and worthy of trust.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
