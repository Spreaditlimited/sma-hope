import Image from "next/image";
import Link from "next/link";
import { GuideCard } from "@/components/guide-card";
import { getGuides } from "@/lib/articles";
import { buildMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import { book } from "@/lib/book";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "What is spinal muscular atrophy (SMA)? Symptoms, types and care",
  description: "What SMA means, early signs in babies and adults, types, inheritance, genetic testing and treatment. Clear next steps for families in Nigeria and beyond.",
  path: "/what-is-sma",
});
const sections = [
  ["understanding", "SMA, simply explained"], ["symptoms", "Symptoms by age"],
  ["types", "Understanding the types"], ["inheritance", "Genes and inheritance"],
  ["diagnosis", "Getting a diagnosis"], ["treatment", "Treatment and daily care"],
  ["nigeria", "Next steps in Nigeria"], ["questions", "Common questions"], ["sources", "Sources and further reading"],
];
const questions = [
  { question: "What does SMA stand for?", answer: "SMA stands for spinal muscular atrophy. In the common SMN1-related form, a shortage of an essential protein damages the motor nerve cells that control movement, leading to muscle weakness." },
  { question: "Is SMA contagious or caused by something a parent did?", answer: "No. SMA is a genetic condition. It cannot be passed through touch, sharing food or caring for someone. It is not caused by parenting choices, and parents can carry an altered SMN1 gene without having symptoms themselves." },
  { question: "Does SMA affect intelligence?", answer: "SMA itself does not cause intellectual disability. Someone who needs help to move, speak or use equipment may understand fully. Learning, relationships, school and work should be supported around the person’s abilities and access needs." },
  { question: "Can adults develop SMA?", answer: "Yes. Some people first develop symptoms as teenagers or adults. Persistent weakness, increasing difficulty with stairs or getting up from a chair, or a loss of previously manageable movement deserves assessment. These symptoms can also have other causes." },
  { question: "Can a routine blood test rule out SMA?", answer: "No. A routine blood count is different from an SMA genetic test. Ask what the laboratory actually analysed. If symptoms or family history remain concerning, the clinician may need to request more specific testing or specialist interpretation." },
  { question: "Can two parents with no symptoms have a child with SMA?", answer: "Yes. In the common recessive form, both parents can be carriers without having SMA. Each pregnancy has its own chance of an affected child. Previous healthy children or no known family history do not rule out the possibility." },
  { question: "Is SMA curable, and what does it mean for life expectancy?", answer: "There is currently no cure, but treatments and coordinated care can change outcomes. There is no single life-expectancy figure for everyone with SMA. Age at onset, breathing and swallowing needs, treatment timing and response, and access to care all matter. A type label alone cannot predict an individual’s future." },
  { question: "Can SMA Hope arrange a diagnosis or provide emergency care?", answer: "SMA Hope supports awareness, understanding and practical questions. Our support chat does not diagnose SMA, prescribe treatment or provide an emergency response. A clinician should assess symptoms and interpret tests; seek emergency medical care for serious breathing difficulty or another acute emergency." },
];
const sources = [
  ["NHS", "Symptoms, diagnosis and treatment overview", "https://www.nhs.uk/conditions/spinal-muscular-atrophy-sma/"],
  ["MedlinePlus Genetics", "SMN1, SMN2 and the genetics of SMA", "https://medlineplus.gov/genetics/condition/spinal-muscular-atrophy/"],
  ["Cure SMA", "Understanding traditional types and current function", "https://www.curesma.org/describing-sma/"],
  ["Cure SMA", "Testing and diagnosis", "https://www.curesma.org/testing-diagnosis/"],
  ["Cure SMA", "Treatment approaches and further information", "https://www.curesma.org/spinal-muscular-atrophy-treatment/"],
  ["SMA Europe", "Standards of care and multidisciplinary teams", "https://www.sma-europe.eu/care-standards-for-sma"],
];
export default async function SmaPage() {
  const guides = await getGuides();
  const selected = ["understanding-sma-nigeria", "sma-genetic-testing", "sma-care-team-nigeria"];
  const url = `${siteConfig.url}/what-is-sma`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "MedicalWebPage", "@id": `${url}#page`, name: "What is spinal muscular atrophy (SMA)?", url, inLanguage: "en", dateModified: "2026-11-19", publisher: { "@id": `${siteConfig.url}/#organization` }, about: { "@type": "MedicalCondition", name: "Spinal muscular atrophy", alternateName: "SMA" }, citation: sources.map(([name, description, source]) => ({ "@type": "CreativeWork", name: `${name}: ${description}`, url: source })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url }, { "@type": "ListItem", position: 2, name: "What is SMA?", item: url }] },
  ] };
  return <div className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className={styles.hero}>
      <div className={`container ${styles.heroGrid}`}>
        <div>
          <Link href="/" className="eyebrow">SMA Hope Foundation / Understanding SMA</Link>
          <h1><span className={styles.headlineLine}>Spinal muscular</span><span className={styles.headlineLine}>atrophy (SMA),</span><span className={styles.headlineAccent}>clearly explained.</span></h1>
          <p className={styles.deck}>Understand the condition. Recognise the signs. Know what to ask next.</p>
          <p>Spinal muscular atrophy is a genetic condition that damages the nerve cells controlling muscles, causing weakness. It can affect movement, breathing and swallowing. It can begin in infancy, childhood or adulthood.</p>
          <div className={styles.actions}><a href="#symptoms" className="btn btn-primary">Symptoms and signs</a><a href="#nigeria" className="btn btn-secondary">Next steps</a></div>
          <p className={styles.meta}>By SMA Hope Foundation · References checked <time dateTime="2026-11-19">19 November 2026</time></p>
        </div>
        <aside className={styles.summary} aria-labelledby="essentials-title">
          <p className="eyebrow">The essentials</p><h2 id="essentials-title">A condition.<br/>A person. A life.</h2>
          <p>A diagnosis explains a medical need. It does not define someone’s intelligence, personality or potential.</p>
          <dl><div><dt>Genetic</dt><dd>Not contagious. Not a parenting failure.</dd></div><div><dt>Individual</dt><dd>Symptoms and care needs differ.</dd></div><div><dt>Time matters</dt><dd>Persistent weakness deserves assessment.</dd></div></dl>
        </aside>
      </div>
    </header>
    <div className={`container ${styles.layout}`}>
      <aside className={styles.sidebar}><nav aria-label="On this page"><p className="eyebrow">In this guide</p><ul>{sections.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul></nav><Link className={styles.sideLink} href="/faqs">Explore the full SMA FAQ library</Link></aside>
      <article className={styles.article}>
        <aside className={styles.urgent} aria-labelledby="urgent-title"><h2 id="urgent-title">When to seek emergency help</h2><p>Severe breathing difficulty, choking with trouble breathing, blue or grey lips, or being difficult to wake needs emergency medical care. Do not wait for a support chat or social media reply.</p></aside>
        <section id="understanding"><p className="eyebrow">Start here</p><h2>SMA, simply explained</h2>
          <p>Motor neurons carry messages that tell muscles to move. In the most common form of SMA, changes in the <strong>SMN1 gene</strong> leave the body with too little survival motor neuron (SMN) protein. Without enough of this protein, motor neurons are lost and the muscles they serve become weaker.</p>
          <div className={styles.explainer} aria-label="Simplified explanation of common SMN1-related SMA"><div><strong>SMN1 gene changes</strong><span>Too little SMN protein</span></div><div><strong>Motor neurons affected</strong><span>Movement signals are disrupted</span></div><div><strong>Muscles become weaker</strong><span>Support needs vary</span></div></div>
          <p>A second gene, <strong>SMN2</strong>, also makes some working SMN protein. Its copy number can influence severity and helps inform specialist assessment, but it cannot tell the whole story of a person’s future. Rarer forms of SMA involve other genes.</p>
          <p>Muscle weakness is not a measure of understanding. People with SMA have their own interests, ambitions and relationships; care and access should support a full life.</p>
        </section>
        <section id="symptoms"><p className="eyebrow">What to notice</p><h2>What are the symptoms of SMA?</h2><p>Signs depend on when weakness begins and which movements are affected. These examples are reasons to seek assessment, not a checklist that can diagnose SMA at home.</p>
          <div className={styles.symptoms}>
            <div><h3>In babies</h3><ul><li>Unusual floppiness or poor head control.</li><li>Less movement in the arms or legs.</li><li>Feeding or swallowing difficulty, or a weak cry.</li><li>Breathing concerns.</li></ul></div>
            <div><h3>In children</h3><ul><li>Difficulty sitting, standing or walking.</li><li>Increasing difficulty getting up or using stairs.</li><li>Frequent falls or loss of a skill already learned.</li><li>A need for more support with movement.</li></ul></div>
            <div><h3>In teenagers and adults</h3><ul><li>Persistent or increasing muscle weakness.</li><li>Difficulty rising from a chair or climbing stairs.</li><li>Changes in walking or repeated falls.</li><li>Movement that becomes harder over time.</li></ul></div>
          </div>
          <div className={styles.note}><h3>A lost skill is worth reporting</h3><p>If someone could previously hold their head up, sit, stand or walk and is losing that ability, tell a clinician. Arrange an assessment for persistent concerns; do not delay while trying to collect a perfect history.</p></div>
          <p>Other conditions can cause similar symptoms. A doctor can assess development, muscle strength and reflexes and decide what investigations or referrals are needed.</p>
        </section>
        <section id="types"><p className="eyebrow">Making sense of a label</p><h2>What do SMA types 1, 2, 3 and 4 mean?</h2><p>Traditional labels describe when symptoms began and the highest movement milestones achieved without treatment. There is overlap between groups. Treatment has changed what many people can achieve, so current abilities and care needs matter alongside the label.</p>
          <div className={styles.tableWrap} role="region" aria-label="SMA types comparison" tabIndex={0}><table><caption>Traditional patterns of common SMN1-related SMA</caption><thead><tr><th scope="col">Type</th><th scope="col">Usual onset</th><th scope="col">Traditional description</th></tr></thead><tbody>
            <tr><th scope="row">Type 1</th><td>Before 6 months</td><td>Weakness in early infancy; sitting independently is not achieved without treatment.</td></tr>
            <tr><th scope="row">Type 2</th><td>Usually 6–18 months</td><td>Sitting independently is achieved, but independent walking is not.</td></tr>
            <tr><th scope="row">Type 3</th><td>After 18 months, often childhood</td><td>Independent walking is achieved; it may become harder or be lost later.</td></tr>
            <tr><th scope="row">Type 4</th><td>Adulthood</td><td>A later-onset pattern, usually with milder weakness.</td></tr>
          </tbody></table></div>
          <p>Type 0 describes a rare, very early presentation beginning before birth. Other genetic forms also exist. These descriptions are <strong>not a prediction of life expectancy</strong> or a ceiling on someone’s potential. Ask what the diagnosis means for the individual today.</p>
        </section>
        <section id="inheritance"><p className="eyebrow">Genes, without blame</p><h2>How is SMA inherited?</h2><p>The common SMN1-related form usually follows an <strong>autosomal recessive</strong> pattern: a child has an SMA-causing change in both copies of SMN1. Parents can each carry one altered copy without having symptoms.</p><p>When both parents are carriers, each pregnancy has these chances:</p>
          <div className={styles.odds}><div><strong>25%</strong><span>Child has SMA</span></div><div><strong>50%</strong><span>Child is a carrier</span></div><div><strong>25%</strong><span>Neither affected nor a carrier of those changes</span></div></div>
          <p>Each pregnancy is a new event; these percentages do not mean that one in every four children in a particular family will be affected. A genetics professional should explain the actual family results, including uncommon exceptions.</p>
          <h3>Why a negative carrier result may need another look</h3><p>No screening method removes every possible risk. Some carrier configurations can be missed by tests that count SMN1 copies alone. Ask which method was used, what residual risk remains and whether family history changes how the result should be interpreted.</p><Link href="/blog/sma-genetic-testing" className="text-link">Understand diagnostic tests, carrier screening and silent carriers</Link>
        </section>
        <section id="diagnosis"><p className="eyebrow">From concern to answers</p><h2>How is SMA diagnosed?</h2><p>A specifically requested genetic test is central to confirming common SMN1-related SMA. A routine blood count or general health screen is a different test.</p>
          <ol className={styles.steps}><li><h3>Describe the changes</h3><p>Tell the clinician what is difficult, when it began and whether an ability has been lost. Bring previous reports and, if useful, a short video of the movement concern. Seek care first if symptoms are urgent.</p></li><li><h3>Ask about specialist assessment and testing</h3><p>A paediatrician or doctor may arrange a neurology referral and appropriate genetic analysis. Ask whether the test is intended to diagnose SMA, assess carrier status or investigate another condition.</p></li><li><h3>Get the full result explained</h3><p>Keep the complete report. Ask what it confirms, what the method could miss, whether further investigation is needed and who will discuss the care plan with you.</p></li></ol>
          <p>If the initial result does not explain continuing symptoms, return to the clinician rather than assuming the concern has been resolved. <Link href="/blog/after-sma-diagnosis">Our after-diagnosis guide</Link> helps you prepare for the questions that follow.</p>
        </section>
        <section id="treatment"><p className="eyebrow">A coordinated plan</p><h2>How is SMA treated?</h2><p>Treatment brings together medicines, where suitable and accessible, and support for everyday health and function. A neuromuscular specialist should discuss the available options, expected benefits, risks and monitoring.</p>
          <h3>Medicines that change the disease course</h3><p>Some treatments help the body produce more working SMN protein; others deliver a working copy of the gene. Names families may encounter include <strong>nusinersen (Spinraza)</strong>, <strong>risdiplam (Evrysdi)</strong> and <strong>onasemnogene abeparvovec</strong> gene therapy. These are examples, not a complete list or a recommendation for an individual.</p><p>Eligibility, formulations, approvals and funding differ by country and can change. A product’s approval abroad does not establish its availability in Nigeria. Ask the specialist about the person’s circumstances and the actual access route.</p>
          <h3>Supportive care belongs in the same plan</h3><div className={styles.careGrid}><div><h4>Breathing and sleep</h4><p>Respiratory assessment and an individual plan for breathing support, cough assistance or illness when needed.</p></div><div><h4>Eating and swallowing</h4><p>Assessment of safe swallowing, nutrition and growth, with feeding support where appropriate.</p></div><div><h4>Movement and comfort</h4><p>Physiotherapy, occupational therapy, seating, mobility equipment and attention to joints and the spine.</p></div><div><h4>Everyday participation</h4><p>Support for school, work, communication, emotional wellbeing and family routines.</p></div></div>
          <p>Ask who coordinates the different professionals and when the plan will be reviewed. <Link href="/blog/sma-treatment-access-nigeria">Explore treatment and access questions in Nigeria</Link>.</p>
        </section>
        <section id="nigeria"><p className="eyebrow">A practical starting point</p><h2>What should a family in Nigeria do next?</h2><p>Start with a qualified doctor or paediatrician and ask about an appropriate referral. Before travelling, confirm directly that the receiving clinic can assess the concern and what documents it needs.</p><ul><li><strong>For a test:</strong> ask for the exact analysis, performing laboratory, sample arrangements, expected turnaround, written cost and who will interpret the result.</li><li><strong>For care:</strong> explain breathing, feeding or movement concerns alongside transport, cost and home circumstances.</li><li><strong>For the next appointment:</strong> keep reports and referral letters together, and write down the three questions you most need answered.</li><li><strong>For follow-up:</strong> ask who reviews the next result, how to reach the service and what to do if symptoms change.</li></ul><p>SMA Hope can help you organise practical questions and find clear information. We do not replace a clinical assessment or guarantee testing, treatment or funding.</p><div className={styles.actions}><Link href="/blog/understanding-sma-nigeria" className="btn btn-primary">Read the Nigerian family guide</Link><Link href="/contact" className="btn btn-secondary">Contact SMA Hope</Link></div>
          <div className={styles.countries}><h3>Looking for information where you live?</h3><p>Health systems and access arrangements differ. Start with the guide for your location.</p><div><Link href="/blog/sma-treatment-support-uk">United Kingdom</Link><Link href="/blog/sma-treatment-support-canada">Canada</Link><Link href="/blog/sma-treatment-support-usa">United States</Link><Link href="/blog/sma-testing-care-africa">Other African countries</Link></div></div>
        </section>
        <aside className={styles.book} aria-labelledby="sma-book-title"><Image src={book.cover} alt="Cream cover of When Every Breath Matters by Tochukwu and Ijeoma Nkwocha" width={120} height={186} sizes="120px"/><div><p className="eyebrow">The story behind SMA Hope</p><h2 id="sma-book-title">When Every Breath Matters</h2><p>Tochukwu and Ijeoma Nkwocha share their family’s experience of SMA, medicine, faith and daily caregiving. For families, friends and anyone who wants to understand the life behind the diagnosis.</p><Link href="/book#editions" className="text-link">Explore Kindle, paperback and hardcover</Link></div></aside>
        <section id="questions"><p className="eyebrow">Clear answers</p><h2>Frequently asked questions about SMA</h2><div className={styles.faqs}>{questions.map(f => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</div><Link href="/faqs" className="text-link">Find more answers in our SMA FAQ library</Link></section>
        <section id="sources" className={styles.sources}><h2>Sources and further reading</h2><p>This guide provides general education to support conversations with a qualified clinician. References checked 19 November 2026.</p><ul>{sources.map(([name, description, source]) => <li key={source}><a href={source}>{name}: {description}</a></li>)}</ul><p>Read our <Link href="/editorial-policy">editorial approach</Link> or <Link href="/contact">suggest a correction</Link>.</p></section>
      </article>
    </div>
    <section className={`container ${styles.guides}`} aria-labelledby="sma-guides-title"><p className="eyebrow">Keep learning</p><h2 id="sma-guides-title" className="display-heading">Your next question, explored.</h2><div className="guide-grid">{selected.map(slug => guides.find(g => g.slug === slug)).filter((g): g is NonNullable<typeof g> => Boolean(g)).map(guide => <GuideCard key={guide.slug} guide={guide} />)}</div></section>
  </div>;
}
