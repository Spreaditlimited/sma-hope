import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({
  title: "Our editorial approach",
  description: "How SMA Hope prepares, sources, and reviews its family guides.",
  path: "/editorial-policy",
});
export default function EditorialPolicy() {
  return (
    <>
      <PageHeader
        title="Clarity comes with responsibility."
        intro="Our approach to information, lived experience, and trust."
      />
      <div className="container policy-content prose">
        <h2>What our guides are for</h2>
        <p>
          We help families prepare questions, organise practical decisions, and understand
          unfamiliar language. Our information is educational and does not replace individual
          clinical advice.
        </p>
        <h2>Sources and local context</h2>
        <p>
          We link clinical statements to established health organisations and clinical references.
          Practical checklists are our own planning suggestions. An overseas treatment approval or
          service listing is not evidence of availability in Nigeria. Provider details, costs, and
          access programmes require direct, dated confirmation.
        </p>
        <h2>Stories belong to people</h2>
        <p>
          Lived experience adds context; it does not establish what will happen to another person.
          We seek consent for personal stories and identifiable photographs, protect children’s
          dignity, and avoid publishing private medical documents.
        </p>
        <h2>Corrections and updates</h2>
        <p>
          Each guide shows its date. Clinical and access-related material needs review when relevant
          evidence or service arrangements change. If you notice an error,{" "}
          <Link href="/contact">contact the foundation</Link> with the page address, the issue, and
          a supporting source where possible.
        </p>
        <h2>Books, testing enquiries and commercial interests</h2>
        <p>The foundation promotes its own book, When Every Breath Matters. Book invitations are identified in the guides and are separate from clinical evidence. Buying a book is not a condition of receiving educational information or asking a support question.</p>
        <p>Testing partnerships are being explored. No partnership, subsidised price or diagnostic service is announced unless it has been confirmed. Any future commercial testing arrangement should identify the laboratory, explain charges and the foundation’s role, and preserve appropriate clinical advice and patient choice.</p>
        <h2>Clear boundaries</h2>
        <p>
          We do not promise treatment, funding, a referral, or a particular health outcome.
          Educational pages and foundation announcements are kept separate so readers can understand
          the purpose of each.
        </p>
      </div>
    </>
  );
}
