import Link from "next/link";
import { activeSupportItem } from "@/lib/support-catalog-server";
import { supportCostLabel } from "@/lib/support-catalog";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { DonationOptions } from "@/components/donation-options";
import { Icon } from "@/components/icon";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "Donate to SMA Hope Foundation Nigeria",
  description:
    "Donate to SMA Hope in Nigeria. Support free SMA education, clinical assessment, genetic testing, equipment, nutrition and practical family support.",
  path: "/donate",
});
export default async function Donate({ searchParams }: { searchParams: Promise<{ item?: string }> }) {
  const params = await searchParams;
  const selectedItem = params.item ? await activeSupportItem(params.item) : null;
  return (
    <>
      <PageHeader
        title="Help a family take the next step."
        intro="Support clear SMA education, clinical assessment, testing, equipment, nutrition and practical help for families in Nigeria."
      />
      <section className="container hope-section" aria-label="Explore support needs"><div className="giving-trust"><h2>See what your support can help cover.</h2><p>Explore equipment prices, clinical assessment, nutrition and other areas of care. Each listing explains its cost basis and what is still being confirmed.</p><Link href="/support-sma-care" className="btn btn-secondary">Explore support needs</Link></div></section>
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
            Support the foundation’s work in SMA education and family support, from first questions
            to clinical assessment and practical care.
          </p>
          <ul className="giving-purpose">
            {[
              "Clear, accessible information about SMA",
              "Clinical assessment and access to appropriate testing",
              "Equipment, nutrition and practical family support",
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
        <div className="action-form-card" id="donation-checkout" style={{scrollMarginTop:"2rem"}}>
          <Suspense fallback={<p role="status">Loading donation options…</p>}>
            {params.item && !selectedItem && <p role="status" className="auth-note">That support option is not currently accepting donations. You can make a general donation below or <Link href="/support-sma-care">choose another need</Link>.</p>}
            {selectedItem && <div className="giving-trust"><p className="eyebrow">Your support preference</p><h3>{selectedItem.title}</h3><p>{selectedItem.costNaira === null && selectedItem.costUsd == null ? "The cost is being confirmed. You can contribute any amount." : `${supportCostLabel(selectedItem)} ${selectedItem.unit}. You can contribute part of this cost.${selectedItem.costUsd != null ? " This budget is shown in US dollars; checkout below accepts naira. Choose the naira amount you wish to give." : ""}`}</p><p>Your choice is recorded as a preference. Standard online donations support the foundation’s charitable work and are not restricted to this item. Please contact us before giving if you need a restricted agreement.</p><Link href="/donate#give" className="text-link">Give where needed most instead</Link></div>}
            <DonationOptions key={selectedItem?.id || "general"} selectedItem={selectedItem ? {id:selectedItem.id,title:selectedItem.title,costNaira:selectedItem.costNaira} : undefined} />
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
