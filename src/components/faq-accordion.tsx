"use client";

import { useState } from "react";

type FAQ = {
  question: string;
  answer: string;
};

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      {faqs.map((faq, idx) => (
        <article key={faq.question} className="card" style={{ marginBottom: "0.7rem", overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setOpen(open === idx ? null : idx)}
            style={{ width: "100%", textAlign: "left", background: "none", border: 0, padding: "0.9rem 1rem", fontWeight: 600, cursor: "pointer" }}
            aria-expanded={open === idx}
          >
            {faq.question}
          </button>
          {open === idx ? <p style={{ margin: 0, padding: "0 1rem 1rem", color: "var(--text-soft)" }}>{faq.answer}</p> : null}
        </article>
      ))}
    </div>
  );
}
