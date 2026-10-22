export type GuideSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  source?: { title: string; url: string };
};
export type Guide = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  summary: string[];
  sections: GuideSection[];
  checklist: string[];
  related: string[];
  clinical: boolean;
  updatedAt: string;
};
export const guides: Guide[] = [
  {
    slug: "understanding-sma-nigeria",
    title: "Understanding SMA: a starting point for Nigerian families",
    category: "Understanding SMA",
    excerpt:
      "What SMA means, how to approach unfamiliar medical language, and where to begin when your family needs answers.",
    summary: [
      "SMA affects movement and can also affect breathing and swallowing.",
      "A specialist assessment and genetic testing help establish the diagnosis.",
      "Your next step is a clear care plan for the individual, not a prediction based on a label.",
    ],
    sections: [
      {
        title: "Start with the person, then the condition",
        paragraphs: [
          "Spinal muscular atrophy, usually shortened to SMA, is a genetic condition that causes muscle weakness. Its effects differ between people. Some need help with movement, breathing, or swallowing. It affects children and adults. A diagnosis describes a medical condition; it does not describe someone’s interests, relationships, or potential.",
        ],
        source: {
          title: "NHS: spinal muscular atrophy",
          url: "https://www.nhs.uk/conditions/spinal-muscular-atrophy-sma/",
        },
      },
      {
        title: "Make medical language usable",
        paragraphs: [
          "An appointment can introduce more new words than anyone can comfortably remember. Ask the clinician to write the diagnosis in full and explain which findings support it. If a test has been requested, ask what question it is meant to answer. Keep a copy of the result rather than relying on a verbal description.",
          "You can say: “Please explain that again in everyday language. What does it mean for what we need to do this week?” If you would prefer another language, ask whether a trusted interpreter can help. A relative can take notes, with your permission, while you concentrate on the conversation.",
        ],
      },
      {
        title: "Understand what a type label can and cannot tell you",
        paragraphs: [
          "You may hear terms such as 5q SMA, SMN1, SMN2, or SMA types 1, 2, and 3. The common form of SMA is associated with changes in SMN1. SMN2 copy number can influence the condition, but it cannot by itself predict one person’s future. Type labels traditionally describe age at onset and motor milestones. Treatment and individual variation make a personal assessment essential.",
        ],
        source: {
          title: "GeneReviews: spinal muscular atrophy",
          url: "https://www.ncbi.nlm.nih.gov/books/NBK1352/",
        },
      },
      {
        title: "Build your starting folder",
        paragraphs: [
          "Use one paper folder and, if practical, a password-protected digital copy. Put the most recent care instructions at the front. Ask before sharing medical documents in community groups; a public message can travel much further than you expect.",
        ],
        bullets: [
          "The written diagnosis and complete laboratory report.",
          "A short timeline of concerns, appointments, and referrals.",
          "Current medicines and clinician-prescribed equipment details.",
          "Clinic contacts, follow-up dates, and questions still unanswered.",
        ],
      },
      {
        title: "Find a realistic route into care in Nigeria",
        paragraphs: [
          "The Federal Ministry of Health lists teaching hospitals across Nigeria. That directory is a starting point for enquiries, not confirmation that every hospital offers SMA testing or specialist treatment. Before travelling, contact the institution through its official channels and ask about paediatric neurology or adult neurology, referral requirements, clinic days, and appointment arrangements.",
        ],
        source: {
          title: "Federal Ministry of Health: teaching hospitals in Nigeria",
          url: "https://health.gov.ng/teaching-hospitals/",
        },
      },
      {
        title: "Choose one next step",
        paragraphs: [
          "If you are still seeking a diagnosis, organise a clinical assessment and bring your records. If SMA is confirmed, ask the treating team which issues need attention first and who will coordinate follow-up. It is reasonable to ask about cost and travel constraints at the same appointment. A plan is more useful when it reflects what your household can actually arrange.",
        ],
      },
    ],
    checklist: [
      "Write down the diagnosis or the question being investigated.",
      "Keep copies of reports and a list of current medicines.",
      "Ask who is coordinating care and how to reach the team.",
      "Confirm the next appointment and what to bring.",
    ],
    related: ["after-sma-diagnosis", "sma-genetic-testing"],
    clinical: true,
    updatedAt: "2026-10-22",
  },
  {
    slug: "after-sma-diagnosis",
    title: "After an SMA diagnosis: preparing for the next appointment",
    category: "Diagnosis & care",
    excerpt:
      "Turn an overwhelming set of questions into a manageable appointment plan, with a checklist you can print and take along.",
    summary: [
      "Organise your questions by urgency rather than trying to solve everything at once.",
      "Ask for a named point of contact and a written follow-up plan.",
      "Discuss travel, cost, and home circumstances so the plan is practical.",
    ],
    sections: [
      {
        title: "Give the next appointment a clear purpose",
        paragraphs: [
          "It is easy to leave a consultation with more information but no clear next step. Before attending, write down the three things you most need to understand. Examples might be what the diagnosis means, which assessment comes next, and who to contact if your child becomes unwell. Put these questions at the top of your notes and show them to the clinician at the beginning.",
        ],
      },
      {
        title: "Bring a short, useful account",
        paragraphs: [
          "Prepare a one-page timeline with dates where possible. Describe what changed, when it changed, and how it affects everyday activities. Bring previous reports, referral letters, discharge summaries, and the medicines currently used. If there are videos that help show a concern, ask whether the clinician would find them useful. Do not delay seeking care in order to record a video.",
          "Bring another trusted adult if you want help remembering the discussion. Decide beforehand who will ask questions and who will write down answers. If the person living with SMA can participate, make space for their priorities and questions too.",
        ],
      },
      {
        title: "Ask how the team will fit together",
        paragraphs: [
          "SMA care can involve several disciplines, including neurology, respiratory care, rehabilitation, nutrition, and psychological support. Ask which professionals are relevant now, what each referral is for, and how their advice will be coordinated. A list of specialists is less helpful than a clear sequence of appointments.",
        ],
        source: {
          title: "SMA Europe: standards of care and the multidisciplinary team",
          url: "https://www.sma-europe.eu/care-standards-for-sma",
        },
      },
      {
        title: "Make the Nigerian logistics visible",
        paragraphs: [
          "Tell the team if you travel from another state, rely on someone else for transport, or need to plan time away from work. Ask which appointments can be coordinated on the same day and which must happen promptly. Before leaving, confirm where each referral goes; two clinics in the same hospital may have different booking processes.",
          "Ask for written estimates for tests and visits where available. Clarify whether a quote covers consultation alone or also laboratory work and review. If an insurer or employer scheme is involved, ask what written approval is needed before you pay. Record the answer and the person or office that provided it.",
        ],
      },
      {
        title: "Leave with an action list",
        paragraphs: [
          "Read your notes back in your own words. This is a useful way to catch misunderstandings without needing to remember every medical term. Ask the clinician to clarify anything that sounds contradictory to previous advice.",
        ],
        bullets: [
          "What is the first action, and how soon should it happen?",
          "Who arranges it: the hospital, a clinician, or our family?",
          "Which changes require urgent assessment, and where should we go?",
          "Who can answer questions between appointments?",
          "When will the plan be reviewed?",
        ],
      },
      {
        title: "Create a handover for home",
        paragraphs: [
          "After the visit, share the agreed plan only with the people who need it. Write down responsibilities: who books the appointment, collects a report, arranges transport, or supports siblings. Keep a space for unanswered questions rather than filling gaps with guesses from social media. If instructions are unclear, contact the care team for clarification.",
        ],
      },
    ],
    checklist: [
      "Top three questions written down.",
      "Reports, referral letters, and medicine list packed.",
      "Transport, clinic day, and booking requirements confirmed.",
      "Written next steps, contact details, and review date recorded.",
    ],
    related: ["planning-sma-care-costs", "understanding-sma-nigeria"],
    clinical: false,
    updatedAt: "2026-10-22",
  },
  {
    slug: "planning-sma-care-costs",
    title: "Planning the costs of SMA care in Nigeria",
    category: "Living with SMA",
    excerpt:
      "A practical way to organise care expenses, compare quotations, and ask for help without losing sight of day-to-day needs.",
    summary: [
      "Separate one-off purchases from recurring expenses.",
      "Request written quotes and verify what each includes.",
      "Keep proposed treatment costs separate from confirmed commitments.",
    ],
    sections: [
      {
        title: "Begin with the next month",
        paragraphs: [
          "When a family hears a very large treatment figure, everyday costs can disappear from the conversation. Start with the next month of actual needs. Create a simple record with six columns: item, reason, estimated cost, due date, person responsible, and payment status. Leave unknown amounts marked “quote needed”. An unknown cost is better than an invented number.",
        ],
      },
      {
        title: "Look beyond the invoice",
        paragraphs: [
          "A consultation may also involve transport, an overnight stay, meals, childcare for siblings, or time away from paid work. If a relative provides transport at no charge, note that contribution separately so the plan still makes sense if they are unavailable next time.",
        ],
        bullets: [
          "Appointments, tests, and report-review visits.",
          "Medicines and supplies prescribed by the care team.",
          "Transport, accommodation, and support for accompanying caregivers.",
          "Equipment purchase, fitting, maintenance, and replacement parts.",
          "Home arrangements, school access, and caregiver time.",
        ],
      },
      {
        title: "Separate purchase price from running cost",
        paragraphs: [
          "Before buying clinician-recommended equipment, ask who will fit it, teach you to use it, service it, and supply compatible parts. Where equipment requires electricity, discuss power and backup arrangements with the supplier and care team. A cheaper purchase may not be cheaper over its useful life if servicing is unavailable.",
          "For an imported item, ask the supplier for a written breakdown of shipping, customs-related charges, installation, warranty coverage, and expected delivery. Ask which currency the quote uses and when the price expires. Do not assume a foreign-currency price will remain unchanged in naira.",
        ],
      },
      {
        title: "Compare like with like",
        paragraphs: [
          "Two quotations may describe different packages. Before choosing, make a small comparison table: exact item or service, what is included, what is excluded, timing, after-sales support, payment terms, and refund terms. Confirm medical suitability with the clinician separately from price. A supplier’s sales recommendation is not a substitute for a prescription.",
          "For insurance or employer benefits, ask the scheme directly about the specific test or service, any authorisation needed, and reimbursement evidence. Keep the answer in writing where possible. A general statement that a scheme covers hospital care does not establish coverage for every SMA-related expense.",
        ],
      },
      {
        title: "Make requests for support specific",
        paragraphs: [
          "Instead of asking one person to solve the whole budget, identify a defined need: a booked journey, a quoted test, a week of meals, or an agreed contribution to a recurring expense. Offer a way to help without demanding access to private medical details. If you fundraise publicly, agree who can share the story and which documents must stay private.",
          "Keep a simple ledger of funds received and expenses paid. Store receipts securely. Explain any change in the intended use of donations to supporters. This protects relationships as well as the family’s recordkeeping.",
        ],
      },
      {
        title: "Review the plan without blame",
        paragraphs: [
          "Set a regular time to update the budget. Separate confirmed, pending, and optional spending. If funds are insufficient, bring the problem to the care team so priorities can be discussed; do not independently stop prescribed care to make the spreadsheet balance. Include the needs of siblings and caregivers in the conversation. A sustainable household plan supports everyone involved.",
        ],
      },
    ],
    checklist: [
      "List the next month’s known needs and unknown costs.",
      "Get dated written quotes with inclusions and exclusions.",
      "Check recurring costs, maintenance, and transport.",
      "Agree who tracks receipts and reviews the plan.",
    ],
    related: ["after-sma-diagnosis", "supporting-an-sma-family"],
    clinical: false,
    updatedAt: "2026-10-22",
  },
  {
    slug: "sma-genetic-testing",
    title: "SMA genetic testing: questions to ask before and after a test",
    category: "Diagnosis & care",
    excerpt:
      "Understand the difference between diagnostic and carrier testing, and prepare a clear set of questions for a genetics discussion.",
    summary: [
      "A diagnostic test and a carrier test answer different questions.",
      "Ask which laboratory performs the test and who explains the result.",
      "A negative result needs interpretation in the context of the test used.",
    ],
    sections: [
      {
        title: "Be clear about the question",
        paragraphs: [
          "A clinician may recommend testing to investigate suspected SMA, or a relative may ask about being a carrier. These are different purposes. Before paying for a test, ask the referring clinician to write the exact test and the question it is intended to answer. A general health screening package or routine blood count is not the same thing as an SMA genetic test.",
        ],
      },
      {
        title: "Understand the core distinction",
        paragraphs: [
          "Diagnostic testing investigates whether genetic findings explain the person’s symptoms. Carrier testing looks for a genetic change that a person may pass on without having the condition themselves. For the common SMN1-related form of SMA, genetic counselling helps families understand inheritance, test limitations, and reproductive options. Some carrier configurations can be missed by standard copy-number testing, so a negative carrier result does not remove all risk.",
        ],
        source: {
          title: "GeneReviews: spinal muscular atrophy",
          url: "https://www.ncbi.nlm.nih.gov/books/NBK1352/",
        },
      },
      {
        title: "Before the sample is taken",
        paragraphs: [
          "In Nigeria, ask whether the specimen is processed locally or sent to another laboratory. Do not infer laboratory capability from an advertisement alone. Ask for the name of the performing laboratory, the method, what is included in the report, and how the referring clinician will receive it.",
        ],
        bullets: [
          "Is this the test requested by the clinician?",
          "What sample is required, and who collects it?",
          "Does the quoted price include transport, reporting, and result interpretation?",
          "What happens if the specimen is unsuitable or delayed?",
          "What is the expected turnaround time, and how will delays be communicated?",
        ],
      },
      {
        title: "Keep a complete report",
        paragraphs: [
          "Ask for the full laboratory report rather than a screenshot of a single line. Check that the name and identifiers are correct. Keep the date, laboratory details, and ordering clinician’s information with it. If another hospital needs the report, share it through an agreed secure channel rather than posting it in an open support group.",
          "Arrange an appointment to discuss the result. Ask what the finding confirms, what it does not establish, and whether any further testing is recommended. If a result appears inconsistent with earlier advice, request clarification from the clinician and laboratory rather than choosing one interpretation yourself.",
        ],
      },
      {
        title: "Allow space for family decisions",
        paragraphs: [
          "A genetics conversation can involve parents, siblings, and future family plans. Decide who you want present. Ask for explanations that you can revisit after the appointment. These discussions should be confidential and free from blame; the purpose is to understand options and make informed decisions.",
          "If testing is being considered for another family member, ask the genetics professional what is appropriate for that person and how consent should be handled. Avoid pressuring relatives to share private results publicly.",
        ],
      },
      {
        title: "Plan the follow-through",
        paragraphs: [
          "Put the result-review appointment on the calendar and record who will contact you. Ask what should happen while the report is pending. The family should not be left to coordinate every unanswered question by itself: request a clear contact point for clinical concerns and a separate contact for laboratory administration.",
        ],
      },
    ],
    checklist: [
      "Purpose and exact test confirmed with the clinician.",
      "Performing laboratory, price, and turnaround clarified.",
      "Consent and report-sharing arrangements understood.",
      "Result-review appointment arranged.",
    ],
    related: ["understanding-sma-nigeria", "sma-treatment-access-nigeria"],
    clinical: true,
    updatedAt: "2026-10-22",
  },
  {
    slug: "sma-treatment-access-nigeria",
    title: "SMA treatment and access: a guide to asking the right questions",
    category: "Diagnosis & care",
    excerpt:
      "Separate treatment evidence, individual eligibility, and practical access when exploring options from Nigeria.",
    summary: [
      "A treatment’s existence does not establish local availability or individual eligibility.",
      "Discuss both treatment options and ongoing care with a specialist.",
      "Verify access arrangements directly before making payments or travel plans.",
    ],
    sections: [
      {
        title: "Separate three different questions",
        paragraphs: [
          "When a family reads about an SMA medicine, three questions can become mixed together: does the treatment have evidence, is it appropriate for this person, and can this family access it? Treat them as separate conversations. A news story may answer the first while telling you very little about the other two.",
        ],
      },
      {
        title: "What treatment information can tell you",
        paragraphs: [
          "Medicines used for SMA include nusinersen, risdiplam, and gene replacement therapies. They have different routes of administration, eligibility considerations, and monitoring needs. The treating specialist should discuss the potential benefits and risks for the individual. This guide is not a complete medicine catalogue and does not confirm that a particular treatment is registered, stocked, funded, or deliverable in Nigeria.",
        ],
        source: {
          title: "NHS: spinal muscular atrophy",
          url: "https://www.nhs.uk/conditions/spinal-muscular-atrophy-sma/",
        },
      },
      {
        title: "Build an evidence file, not a promise file",
        paragraphs: [
          "Save the source and date of any claim you want to discuss. Distinguish a regulator’s approval, a clinical trial result, a manufacturer programme, and a family’s personal experience. They are not interchangeable. Ask the specialist which information applies to your circumstances and whether newer guidance changes the picture.",
          "If someone advertises guaranteed access, ask for the named institution, written eligibility criteria, full costs, and official contact details. Verify the offer independently through the institution. Do not transfer money to a personal account on the strength of a forwarded message or a promise of a guaranteed outcome.",
        ],
      },
      {
        title: "Ask about the whole treatment pathway",
        paragraphs: [
          "Request an explanation that covers what happens before, during, and after treatment. A headline medicine price is not a complete care plan.",
        ],
        bullets: [
          "What assessment establishes suitability?",
          "Which tests and monitoring are required?",
          "Where would treatment take place, and who is responsible for follow-up?",
          "What costs are excluded from the quoted package?",
          "What happens if travel is delayed or eligibility changes?",
          "Who manages a complication or an interruption in treatment?",
        ],
      },
      {
        title: "If care outside Nigeria is being considered",
        paragraphs: [
          "Ask for a written clinical acceptance from the receiving team before committing to travel. Confirm the expected length of stay, follow-up arrangements, payment and cancellation terms, and what care will be needed on return. Discuss fitness to travel and transport requirements with the treating team. Keep medical decisions separate from visa agents, fundraising organisers, and equipment salespeople.",
          "A programme that helped another family may have changed, closed, or used different eligibility rules. Date every access enquiry. Record whether the answer was confirmed directly, remains under review, or has not been verified.",
        ],
      },
      {
        title: "Keep daily care in the plan",
        paragraphs: [
          "An access application can take attention away from immediate needs. Ask the team what support should continue while options are being explored. Coordinated SMA care can involve breathing, nutrition, movement, and wellbeing. Treatment decisions and supportive care belong in one individual plan.",
        ],
        source: {
          title: "SMA Europe: standards of care and the multidisciplinary team",
          url: "https://www.sma-europe.eu/care-standards-for-sma",
        },
      },
    ],
    checklist: [
      "Discuss suitability with the treating specialist.",
      "Verify provider and programme details through official channels.",
      "Request a complete, dated cost and follow-up plan.",
      "Agree ongoing care while access is being explored.",
    ],
    related: ["planning-sma-care-costs", "after-sma-diagnosis"],
    clinical: true,
    updatedAt: "2026-10-22",
  },
  {
    slug: "school-and-sma",
    title: "School and SMA: building a practical inclusion plan",
    category: "Living with SMA",
    excerpt:
      "A conversation guide for families and teachers, covering access, participation, privacy, and day-to-day arrangements.",
    summary: [
      "Start with the student’s goals and preferences.",
      "Walk through a real school day to identify practical barriers.",
      "Put responsibilities and review dates in writing.",
    ],
    sections: [
      {
        title: "Begin with participation",
        paragraphs: [
          "The first question is not simply whether a child can enter the school building. It is whether they can learn, join friends, use facilities, and participate in school life with dignity. Ask the student what matters most to them. A favourite subject, friendship, or activity may reveal barriers that adults have overlooked.",
        ],
      },
      {
        title: "Walk the whole route",
        paragraphs: [
          "Arrange a visit that follows an ordinary school day: arrival, classroom, toilets, assembly, break, lunch, and departure. Check the route on a busy day if possible. A ramp at the gate does not solve an upstairs classroom or an inaccessible toilet.",
        ],
        bullets: [
          "Can the student reach and use their desk comfortably?",
          "Is there enough space to move between rooms?",
          "How will books, bags, and learning materials be carried?",
          "What arrangements are needed for accessible toilets?",
          "Where can the student rest privately if this is part of their agreed plan?",
          "How will evacuation work, and who is responsible?",
        ],
      },
      {
        title: "Agree support without removing independence",
        paragraphs: [
          "Ask what the student can and wants to do independently. Adults should offer help rather than automatically taking over. Teachers can discuss alternatives for activities that create barriers: changing the location, adapting materials, allowing a different way to respond, or planning suitable breaks. Any physical handling or medical care arrangements should follow professional advice and training.",
          "In a Nigerian school, clarify transport, gate access, classroom allocation, and the practical roles of staff before term starts. If changes require spending, agree who is responsible and when they can realistically be completed. Avoid vague assurances that everything will be sorted after admission.",
        ],
      },
      {
        title: "Write a one-page school plan",
        paragraphs: [
          "Record the student’s preferences, agreed classroom adjustments, relevant contacts, and who will coordinate communication with the family. Medical instructions should come from the care team and be shared only with staff who need them. Decide how teachers will learn about changes without requiring the family to repeat their story to every new staff member.",
          "Include a review date. A plan that worked last term may need adjustment when classrooms, timetables, staff, or equipment change. Ask the student what is working as well as what is difficult.",
        ],
      },
      {
        title: "Protect privacy and belonging",
        paragraphs: [
          "Agree how the condition will be explained to classmates, if the student and family want it discussed. Do not share medical reports or photographs in parent messaging groups without permission. Speak to the student directly and avoid presenting them as an object of pity. Include them in invitations, group work, and leadership opportunities.",
          "If bullying or exclusion occurs, document the incident, raise it through the school’s safeguarding process, and ask what action and follow-up will take place. The family should have a named contact rather than an open-ended instruction to “let us know”.",
        ],
      },
      {
        title: "Prepare for interruptions",
        paragraphs: [
          "Ask how schoolwork will be shared if the student misses lessons for appointments or illness. Agree a manageable catch-up plan rather than automatically adding work to an already demanding week. Keep expectations ambitious but flexible, with the student involved in deciding what support helps.",
        ],
      },
    ],
    checklist: [
      "Student’s goals and preferences recorded.",
      "Arrival-to-departure access walk completed.",
      "Named school contact and responsibilities agreed.",
      "Privacy, emergency arrangements, and review date documented.",
    ],
    related: ["supporting-an-sma-family", "planning-sma-care-costs"],
    clinical: false,
    updatedAt: "2026-10-22",
  },
  {
    slug: "supporting-an-sma-family",
    title: "How to support a family living with SMA",
    category: "Family & community",
    excerpt:
      "Useful help for relatives, friends, churches, and community groups—from reliable practical support to respectful storytelling.",
    summary: [
      "Offer a specific, manageable task and follow through.",
      "Ask permission before sharing someone’s story or photograph.",
      "Make room for ordinary friendship as well as practical care.",
    ],
    sections: [
      {
        title: "Replace a broad offer with a concrete one",
        paragraphs: [
          "“Let me know if you need anything” leaves the family with another job: working out what you might mean and asking for it. Try a specific offer instead. “I can take your other child to school on Tuesday and Thursday. Would that help?” gives someone a simple choice. Accept a no without asking them to justify it.",
          "Choose something you can sustain. A reliable weekly contribution may be easier for a household to plan around than a large burst of help that disappears. Agree when you will arrive, what you will do, and how to contact each other if plans change.",
        ],
      },
      {
        title: "Offer practical support that fits",
        paragraphs: [
          "Start by asking what would actually reduce pressure. Do not buy equipment or supplements because another family used them. Medical decisions and equipment suitability belong with the treating team.",
        ],
        bullets: [
          "A planned school run or childcare for siblings.",
          "Groceries chosen by the family, rather than unsolicited dietary advice.",
          "Transport or help arranging an appointment journey.",
          "A household task at a time that does not disrupt care.",
          "Administrative help with organising receipts or appointment records, with permission.",
          "Company, a phone call, or an ordinary shared activity.",
        ],
      },
      {
        title: "Respect the home’s routines",
        paragraphs: [
          "Visits can be welcome and still require planning. Ask when to come, how long to stay, and whether the family has any visitor precautions. If you are unwell, tell them before visiting and follow their wishes. Avoid treating their boundaries as a personal rejection.",
          "When help involves care tasks, do only what has been agreed and what you have been appropriately taught. Watching a caregiver once does not automatically make someone ready to take over. Ask what to do if a problem arises and who should be contacted.",
        ],
      },
      {
        title: "Let faith and medical care coexist respectfully",
        paragraphs: [
          "Churches, mosques, and other communities can offer companionship, practical assistance, and a place of belonging. Ask the family what kind of support they welcome. Avoid blame, promises of a guaranteed cure, or pressure to stop treatment. A family should not have to defend its medical choices to remain part of a community.",
          "Community leaders can organise a small, consent-based rota rather than a public discussion of private medical information. Choose one coordinator so the household is not receiving repeated calls about the same task.",
        ],
      },
      {
        title: "Ask before making the story public",
        paragraphs: [
          "Consent to tell one friend is not consent to publish on social media. Explain exactly what you want to share, where it will appear, and who may see it. Give the family a chance to review the wording and images. A child’s dignity matters even when a fundraising appeal feels urgent.",
          "Do not publish full laboratory reports, home routines, contact details, or identifiable documents to prove that a family deserves help. Ask what information can be shared and use the minimum necessary. If you are collecting funds, agree the purpose and how you will account for the money.",
        ],
      },
      {
        title: "Stay interested in the whole family",
        paragraphs: [
          "Ask about school, interests, work, friendships, and ordinary life. Include siblings and caregivers without making every conversation a medical update. Let the family decide when they want to talk about the condition. Support is also the quiet message that they still belong, without having to explain or perform resilience.",
        ],
      },
    ],
    checklist: [
      "Make one specific offer you can reliably keep.",
      "Agree timing, boundaries, and a contact person.",
      "Ask permission for stories, photographs, and fundraising.",
      "Check in again without demanding a medical update.",
    ],
    related: ["school-and-sma", "after-sma-diagnosis"],
    clinical: false,
    updatedAt: "2026-10-22",
  },
  {
    slug: "sma-care-team-nigeria",
    title: "Finding and coordinating an SMA care team in Nigeria",
    category: "Diagnosis & care",
    excerpt:
      "A practical referral and appointment framework for families navigating several clinics, providers, and care priorities.",
    summary: [
      "Confirm the relevant service before travelling.",
      "Ask who coordinates the overall plan.",
      "Keep an up-to-date record that follows the person between clinics.",
    ],
    sections: [
      {
        title: "Start with a clinical referral",
        paragraphs: [
          "If SMA is suspected or has been diagnosed, ask the current clinician which specialist assessment is needed next and how urgent it is. Request a referral letter that explains the concern, relevant findings, and tests already performed. A clear handover can reduce the need to retell the whole story at each visit.",
        ],
      },
      {
        title: "Verify the service, not just the hospital name",
        paragraphs: [
          "Nigeria’s Federal Ministry of Health publishes a teaching-hospital directory. It can help you identify institutions to contact, but it does not establish that every institution offers a specific SMA service. Use the hospital’s official contact route and ask for the department that handles your enquiry.",
        ],
        source: {
          title: "Federal Ministry of Health: teaching hospitals in Nigeria",
          url: "https://health.gov.ng/teaching-hospitals/",
        },
      },
      {
        title: "Use a short enquiry script",
        paragraphs: [
          "You could say: “We have a referral for suspected or confirmed SMA. Does your clinic assess this condition for a child or adult of this age? What documents do you need, how do we book, and what costs should we confirm before travelling?” Write down the response, the department, and the date.",
          "If the person answering cannot confirm the service, ask which department can. Avoid relying solely on an old social-media post or a third-party directory. Confirm clinic days and referral arrangements again shortly before a long journey.",
        ],
      },
      {
        title: "Map the team around actual needs",
        paragraphs: [
          "Ask the clinician which assessments are priorities now and which can be planned later. SMA Europe describes a multidisciplinary approach that may include neuromuscular, respiratory, rehabilitation, nutrition, and psychological expertise. The individual plan should determine the sequence rather than a family trying to book every possible specialist at once.",
        ],
        source: {
          title: "SMA Europe: standards of care and the multidisciplinary team",
          url: "https://www.sma-europe.eu/care-standards-for-sma",
        },
      },
      {
        title: "Create a single coordination sheet",
        paragraphs: [
          "Use one page with columns for clinician or service, role, next action, appointment date, contact route, and unresolved question. Keep the latest version with your medical folder. If advice appears inconsistent, ask the clinicians to clarify it; do not choose between conflicting instructions on your own.",
        ],
        bullets: [
          "Who is responsible for the overall clinical plan?",
          "Who sends reports to the other clinicians?",
          "Who reviews test results and contacts the family?",
          "Where should urgent concerns be taken?",
          "Which advice replaces an earlier instruction?",
        ],
      },
      {
        title: "Plan for changes and gaps",
        paragraphs: [
          "If a service is unavailable, ask the referring clinician for an alternative route and what to do while waiting. Explain transport, cost, or accommodation constraints early. Ask whether administrative questions or report reviews can be handled remotely when clinically appropriate.",
          "Before leaving any clinic, check that you know the next action and who owns it. If a call is promised, record when to follow up. Keep clinical contacts separate from accounts and booking contacts so you know where to direct each question. This small amount of organisation can make a complicated care journey easier to navigate.",
        ],
      },
    ],
    checklist: [
      "Referral letter and reports ready.",
      "Service, clinic date, booking process, and costs checked.",
      "Named coordinator and result-review process agreed.",
      "One-page contact and action sheet updated.",
    ],
    related: ["after-sma-diagnosis", "planning-sma-care-costs"],
    clinical: false,
    updatedAt: "2026-10-22",
  },
];
