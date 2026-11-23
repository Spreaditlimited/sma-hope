export const projectOneMillion = {
  name: "Project One Million",
  path: "/project-one-million",
  period: "2027–2031",
  target: 1_000_000,
  mission: "To help families understand SMA, find answers and access care through accessible education, practical support, and partnerships that improve access to genetic and carrier testing, specialist care and treatment.",
  vision: "A future where no family faces SMA without understanding, support or a route to appropriate care.",
  ambition: "Equip one million families with clear, structured SMA education, while expanding access to genetic and carrier testing, strengthening support for people living with SMA, and improving access to specialist care and treatment.",
} as const;

export const projectMilestones = [
  { year: 2027, families: 10_000, cumulative: 10_000, focus: "Establish the foundations", detail: "Learn what it costs to bring people into structured learning, support completion and establish reliable reporting." },
  { year: 2028, families: 65_000, cumulative: 75_000, focus: "Grow through trusted partners", detail: "Develop delivery with clinics, educators and community organisations, guided by the first year’s evidence." },
  { year: 2029, families: 175_000, cumulative: 250_000, focus: "Widen access to learning", detail: "Expand useful formats and partner delivery so more families can take part in a way that works for them." },
  { year: 2030, families: 300_000, cumulative: 550_000, focus: "Scale what works", detail: "Invest in approaches that demonstrate participation, completion and responsible use of resources." },
  { year: 2031, families: 450_000, cumulative: 1_000_000, focus: "Reach the million-family goal", detail: "Bring the five-year learning goal together with an honest account of outcomes and what should come next." },
] as const;

export const projectQuestions = [
  { question: "What is Project One Million?", answer: "Project One Million is SMA Hope Foundation Nigeria’s five-year ambition for 2027–2031: equip one million families with structured spinal muscular atrophy education, while developing better access to testing, family support, specialist care and treatment." },
  { question: "What counts towards the one-million-family education goal?", answer: "Meaningful participation in structured learning, supported by a recorded completion or an equivalent agreed learning activity. Seeing an advert or visiting a page does not qualify. Individual learners and households must be distinguished, and repeat participation must not be counted as new families. Until family participation can be counted reliably, individual learner results will be reported separately." },
  { question: "Does the project promise one million genetic tests or treatments?", answer: "No. One million is the family-education goal. Genetic and carrier testing, practical family support and treatment-access work will each have separate annual targets and budgets, based on available funding, clinical partnerships and delivery capacity." },
  { question: "How can I start learning about SMA?", answer: "Start with Understanding SMA, our free five-lesson online awareness course. It covers what SMA is, possible warning signs, assessment and testing, breathing and feeding concerns, and practical next steps. Create a free account to save your progress and answer the lesson questions." },
  { question: "Can SMA Hope arrange testing or provide treatment now?", answer: "The free course and information resources are available now. We are developing the clinical and laboratory relationships needed for further access work. We do not currently promise a genetic test, medicine or individual financial award. A qualified healthcare professional must guide assessment, testing and treatment decisions." },
  { question: "How can donors and organisations help?", answer: "Donations can support outreach, accessible learning resources and the foundation’s wider charitable work. Clinicians, laboratories, educators, community organisations and funders can discuss a defined partnership with us. Donations are optional and never affect access to the free course." },
] as const;
