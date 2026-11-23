import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { DonationOptions } from "@/components/donation-options";
import { Icon } from "@/components/icon";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "Donate to SMA Hope Foundation Nigeria",
  description:
    "Help more people in Nigeria access our free SMA course. Support awareness, family education and the work of SMA Hope Foundation.",
  path: "/donate",
});
export default function Donate() {
  return (
    <>
      <PageHeader
        title="Help understanding grow."
        intro="Help more parents and caregivers understand SMA, recognise possible warning signs and know when to seek medical help."
      />
      <section className="container course-giving-intro" aria-labelledby="course-giving-heading">
        <div>
          <p className="eyebrow">Project One Million · Start with learning</p>
          <h2 id="course-giving-heading">Free to learn.<br /><em>Worth helping others find.</em></h2>
          <p>Our five-lesson Understanding SMA course gives parents, caregivers and communities a clear place to start. Your support can help us reach people who have never heard of SMA and keep useful information accessible.</p>
          <Link href="/project-one-million" className="text-link">Explore Project One Million →</Link>
        </div>
        <div className="course-giving-detail">
          <h3>What your support can help cover</h3>
          <ul>
            <li>Outreach that introduces the course to more people in Nigeria.</li>
            <li>Video delivery, captions and accessible learning resources.</li>
            <li>Keeping information useful and understanding what learners gain.</li>
          </ul>
          <p>We can report enrolments, lesson completion and quiz results without publishing learners’ personal information. Donations support SMA Hope’s wider charitable work, including the course; they are not restricted to a particular lesson or learner.</p>
          <a href="#give" className="btn btn-primary">Support this work <Icon name="arrow" size={17} /></a>
        </div>
      </section>
      <section className="container hope-section action-page-grid" id="give" aria-label="Make a donation">
        <div className="action-page-copy">
          <p className="eyebrow">A shared commitment</p>
          <h2 className="display-heading">
            Give with purpose.
            <br />
            <em>Stand with families.</em>
          </h2>
          <p>
            Support the foundation’s work in awareness, family-centred education, and advocacy
            shaped by lived experience.
          </p>
          <ul className="giving-purpose">
            {[
              "Clear, accessible information about SMA",
              "Practical resources for families and communities",
              "A stronger public voice for dignity and understanding",
            ].map((t) => (
              <li key={t}>
                <Icon name="check" size={18} />
                {t}
              </li>
            ))}
          </ul>
          <div className="giving-trust">
            <Icon name="shield" size={25} />
            <h3>Trust is part of the work.</h3>
            <p>
              Your donation supports the foundation’s mission. It is not a payment for medical
              treatment or a guarantee of individual financial support.
            </p>
            <Link href="/transparency" className="text-link">
              Our approach to transparency →
            </Link>
          </div>
          <p className="action-footnote">
            Questions about giving or a larger partnership?{" "}
            <Link href="/contact">Get in touch.</Link>
          </p>
        </div>
        <div className="action-form-card">
          <Suspense fallback={<p role="status">Loading donation options…</p>}>
            <DonationOptions />
          </Suspense>
        </div>
      </section>
      <section className="container other-support">
        <h2>There are many ways to give hope.</h2>
        <p>
          Sharing a useful guide, making an introduction, or offering practical help can also make a
          difference.
        </p>
        <Link href="/blog/supporting-an-sma-family" className="text-link">
          Explore practical ways to support a family →
        </Link>
      </section>
    </>
  );
}
