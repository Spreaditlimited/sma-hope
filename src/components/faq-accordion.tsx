"use client";

import { useState } from "react";

type FAQ = {
  question: string;
  answer: string;
};

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  // It's often good practice to let all accordions start closed, 
  // but if you prefer the first one open by default, you can leave this as `useState<number | null>(0)`
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4 w-full">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;

        return (
          <article 
            key={faq.question} 
            className={`border border-gray-200 rounded-xl bg-white overflow-hidden transition-all duration-200 ${
              isOpen ? "shadow-md border-gray-300" : "shadow-sm hover:border-gray-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-gray-900 text-lg pr-4">
                {faq.question}
              </span>
              
              {/* Chevron Icon that rotates when open */}
              <svg
                className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ${
                  isOpen ? "rotate-180 text-gray-600" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Smooth expansion wrapper using CSS Grid */}
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-gray-600 leading-relaxed text-lg">
                  {faq.answer}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}