import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "What Is SMA?",
  description: "Understanding Spinal Muscular Atrophy in plain language.",
  path: "/what-is-sma",
});

const sections = [
  {
    heading: "What SMA Does in the Body",
    paragraphs: [
      "The body depends on nerve cells called motor neurons to send signals from the brain and spinal cord to the muscles. In SMA, these nerve cells are damaged or lost because of a genetic problem involving a protein the body needs in order for those cells to survive.",
      "When those nerve signals are weakened, the muscles do not receive the support they need. Over time, this causes muscle weakness and loss of strength.",
      "This is why a child with SMA may struggle with movements that other children do naturally. It is not because the child is not trying. It is because the body is dealing with a condition that directly affects muscle control and strength.",
    ],
  },
  {
    heading: "Why Breathing, Feeding, and Movement Can Be Affected",
    paragraphs: [
      "Many people hear about muscle weakness and assume it only means difficulty with walking or standing. But SMA can affect much more than that.",
      "The muscles involved in breathing can become weak. The muscles needed for swallowing and feeding can also be affected. Neck control, posture, coughing, and the ability to clear secretions may become difficult too.",
      "That is why SMA often requires much more than routine medical care. It can involve respiratory support, feeding support, close monitoring, therapy, and constant attention to changes in a child's condition.",
      "This is also why families affected by SMA often live with a level of responsibility that others may not immediately see.",
    ],
  },
  {
    heading: "How SMA Can Affect Children",
    paragraphs: ["SMA does not affect every child in exactly the same way, but it can significantly shape a child's daily life."],
    items: [
      "have weak muscle tone",
      "struggle to meet physical milestones",
      "need help sitting, moving, swallowing, or breathing",
      "require medical devices or support systems",
      "need regular specialist care and monitoring",
    ],
  },
  {
    heading: "How SMA Affects Families",
    paragraphs: [
      "SMA is not only something a child lives with. It is also something a family lives around.",
      "Parents often have to learn new medical terms, new care routines, new fears, and new responsibilities very quickly. Daily life may begin to revolve around appointments, equipment, medication, therapy, feeding, sleep monitoring, and respiratory concerns.",
      "It can affect work, finances, rest, mental strength, marriage, family rhythm, and long-term planning. It can be deeply exhausting, even in a loving and determined home.",
      "That is one reason public understanding matters. Families should not be left to carry such a heavy burden while the world around them remains largely unaware of what SMA really means.",
    ],
  },
  {
    heading: "Different Types of SMA",
    paragraphs: [
      "There are different types of SMA, and they are often described based on when symptoms begin and how severely movement is affected.",
      "SMA Type 1: This is one of the most severe forms and often begins in infancy. Children with SMA Type 1 may have significant muscle weakness and may struggle with breathing, swallowing, and meeting early movement milestones such as sitting unsupported.",
      "SMA Type 2: This type usually appears a little later. Children with SMA Type 2 may be able to sit but often do not walk independently. They may still face serious physical and respiratory challenges and often need long-term support.",
      "SMA Type 3: This form is often milder than Types 1 and 2. Children with SMA Type 3 may be able to walk at some stage, though muscle weakness can still progress and create ongoing difficulties.",
      "SMA Type 4: This is a rarer adult-onset form and is usually milder than the childhood types.",
      "Even though these categories are useful, every child's experience still has its own complexity. The label alone does not always capture the full reality of care.",
    ],
  },
  {
    heading: "Why Early Diagnosis Matters",
    paragraphs: [
      "Early diagnosis matters because the earlier SMA is identified, the sooner a child can begin to receive the right kind of medical attention, monitoring, and support.",
      "Families also need clarity. When symptoms are unexplained, parents can spend painful months moving from one question to another without knowing what they are really facing. A clear diagnosis, difficult as it may be, can help a family begin to understand the condition, seek proper care, and make informed decisions.",
      "In conditions like SMA, time matters. Awareness matters too, because many people cannot act on what they do not yet recognise.",
    ],
  },
  {
    heading: "Treatment and Ongoing Support",
    paragraphs: [
      "SMA is a serious condition, but care and treatment have improved in important ways in recent years. Depending on where a family lives and what is accessible to them, support may include medication, respiratory care, physiotherapy, feeding support, nutritional support, and regular specialist monitoring.",
      "Even where treatment exists, the reality is often still demanding. Access can be difficult. Costs can be high. Daily care remains complex. Progress still requires close attention and sustained support.",
      "So while medical progress matters, it does not remove the deep practical and emotional burden many families continue to carry.",
    ],
  },
  {
    heading: "Common Misunderstandings About SMA",
    items: [
      "SMA is not caused by poor parenting. It is a genetic condition.",
      "SMA is not simply delayed development. It is a serious neuromuscular condition that needs proper medical attention.",
      "SMA is not only about movement. It can also affect breathing, feeding, posture, and many areas of daily care.",
      "A child with SMA is not defined only by weakness. That child still has dignity, personality, presence, and worth.",
      "Families living with SMA do not only need pity. They need understanding, informed support, and compassionate action.",
    ],
  },
];

function renderPanel(section: { heading: string; paragraphs?: string[]; items?: string[] }) {
  return (
    <article className="about-panel prose" key={section.heading}>
      <h2 className="section-heading-strong">{section.heading}</h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.items ? (
        <ul>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function WhatIsSmaPage() {
  return (
    <>
      <PageHeader title="What Is SMA?" intro="Understanding Spinal Muscular Atrophy in plain language" />

      <section className="section-tight">
        <div className="container about-page-flow">
          <article className="about-panel prose">
            <p>
              Spinal Muscular Atrophy, often called SMA, is a serious genetic condition that affects the muscles of the body. It happens when the nerves that control muscle movement do not work properly, which causes muscles to become weak over time.
            </p>
            <p>
              In simple terms, SMA makes it harder for a child to do things the body would normally do with strength and control. Depending on the type and severity, it can affect sitting, standing, crawling, walking, swallowing, coughing, and even breathing.
            </p>
            <p>
              For many families, SMA is not something they had ever heard of before diagnosis. That is one reason awareness matters so much. A condition can carry a heavy burden and still remain poorly understood by the wider public.
            </p>
          </article>

          <div className="about-two-col">
            {renderPanel(sections[0])}
            {renderPanel(sections[1])}
          </div>

          <div className="about-two-col">
            {renderPanel(sections[2])}
            {renderPanel(sections[3])}
          </div>

          <div className="about-two-col">
            {renderPanel(sections[4])}
            {renderPanel(sections[5])}
          </div>

          <div className="about-two-col">
            {renderPanel(sections[6])}
            {renderPanel(sections[7])}
          </div>

          <article className="about-panel prose">
            <p>
              Spinal Muscular Atrophy is a serious condition, but it should never be discussed in a way that removes the humanity of the child or the dignity of the family.
            </p>
            <p>
              The more people understand SMA clearly, the more possible it becomes to respond with truth, compassion, and useful support.
            </p>
            <p>That is part of why this foundation exists.</p>
          </article>
          <div className="section-actions page-end-actions" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link href="/our-story" className="btn btn-secondary">
              Read Our Story
            </Link>
            <Link href="/donate" className="btn btn-primary">
              Support the Foundation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
