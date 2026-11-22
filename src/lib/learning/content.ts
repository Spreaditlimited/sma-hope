export const SMA_COURSE_SLUG = "understanding-sma"
export const SMA_COURSE_TITLE = "Understanding SMA: Recognise the Signs and Take the Next Step"
export const SMA_SPONSOR = "Spinal Muscular Atrophy Hope Foundation, Nigeria"
export const SMA_QUIZ_VERSION = "2026-11-v1"

export const smaCourseLessons = [
  { slug: "what-sma-is", title: "What SMA is—and why recognising it matters", summary: "Understand muscle weakness, motor neurons and the person beyond the diagnosis.",
    questions: [
      { id: "movement", question: "What does the common form of SMA primarily affect?", options: ["Nerve cells that help control muscle movement", "A person's intelligence", "The colour of the skin"], correct: 0, explanation: "SMA affects motor neurons and causes muscle weakness. It does not reduce a person's intelligence." },
      { id: "appearance", question: "A child is alert and engaged but has persistent weakness. What follows?", options: ["Being alert rules out SMA", "The weakness still deserves medical assessment", "A video can confirm the diagnosis"], correct: 1, explanation: "An alert, engaged child can still have a neuromuscular condition. Assessment is needed to establish the cause." },
      { id: "purpose", question: "What is the purpose of this course?", options: ["To diagnose SMA at home", "To select medicines without a doctor", "To recognise concerns and seek appropriate assessment"], correct: 2, explanation: "Recognising concerns is useful; confirming SMA requires an appropriate clinical and genetic investigation." }
    ] },
  { slug: "noticing-weakness", title: "Recognising weakness and lost movement skills", summary: "Notice patterns, take concerns seriously and know why losing a skill needs attention.",
    questions: [
      { id: "regression", question: "A child loses a movement skill they previously had. What should you do?", options: ["Wait several months without seeking help", "Seek prompt medical assessment", "Assume it proves SMA"], correct: 1, explanation: "Losing an acquired movement skill deserves prompt medical assessment. It has several possible causes and does not establish SMA by itself." },
      { id: "pattern", question: "Which observation is useful to share with a doctor?", options: ["When a difficulty began and how it has changed", "Only a comparison with the strongest child you know", "A label chosen from social media"], correct: 0, explanation: "Specific observations and their timing help the clinician understand the pattern of difficulty." },
      { id: "blame", question: "A child struggles to rise from the floor repeatedly. What is the most useful response?", options: ["Call the child lazy", "Force repeated attempts until they improve", "Describe the difficulty and arrange an assessment"], correct: 2, explanation: "Repeated difficulty may reflect weakness. Avoid blame or forcing a physical test; seek assessment." }
    ] },
  { slug: "assessment-and-testing", title: "Assessment, diagnosis and carrier testing", summary: "Understand the next step, family history and the limits of a screening result.",
    questions: [
      { id: "confirm", question: "How is suspected common SMA investigated?", options: ["By a photograph alone", "Through clinical assessment and appropriate genetic testing", "By checking whether a child is cheerful"], correct: 1, explanation: "A clinician assesses symptoms and may arrange SMN1 testing and specialist input." },
      { id: "carrier", question: "Does a negative carrier-screening result always remove every possibility of being a carrier?", options: ["Yes, regardless of the method", "No; the method and family history matter", "It means the person has SMA"], correct: 1, explanation: "Some carrier screens have limitations, including silent-carrier arrangements. A genetics professional can explain the relevant residual risk." },
      { id: "question", question: "Which question is useful when discussing a genetic report?", options: ["What did this test check, and what might it miss?", "Can I ignore persistent symptoms now?", "Can the report replace every future assessment?"], correct: 0, explanation: "Knowing the method, limitations and appropriate next steps helps a family understand a result." }
    ] },
  { slug: "breathing-and-feeding", title: "Breathing, feeding and signs that need urgent help", summary: "Recognise concerns beyond walking and distinguish follow-up from an emergency.",
    questions: [
      { id: "emergency", question: "Someone has serious difficulty breathing now. What comes first?", options: ["Finish the course", "Wait for a reply from the foundation", "Seek emergency medical care immediately"], correct: 2, explanation: "Serious breathing difficulty is an emergency. Do not wait for online information or a foundation response." },
      { id: "feeding", question: "Repeated coughing during meals or feeds should lead to what?", options: ["Discussion with the care team and appropriate assessment", "An automatic home diagnosis of aspiration", "Copying another family's feeding plan"], correct: 0, explanation: "These concerns can need swallowing and nutrition assessment. Feeding support must be individual." },
      { id: "devices", question: "How should breathing equipment and settings be chosen?", options: ["From a popular video", "By the person's clinical team after assessment", "By choosing the highest setting"], correct: 1, explanation: "Respiratory support and settings need individual clinical assessment and advice." }
    ] },
  { slug: "taking-the-next-step", title: "Taking the next step and supporting a family", summary: "Prepare for a consultation, follow up unanswered concerns and support inclusion.",
    questions: [
      { id: "prepare", question: "What is helpful to take to an appointment?", options: ["A timeline, relevant reports and specific questions", "Only an assumed diagnosis", "A demand for the same treatment as another child"], correct: 0, explanation: "A clear timeline and existing reports help clinicians assess concerns and avoid repeating information." },
      { id: "persistent", question: "Concerns persist after an initial appointment. What is appropriate?", options: ["Never raise them again", "Seek follow-up and ask whether specialist assessment is needed", "Stop observing any changes"], correct: 1, explanation: "Explain persistent or worsening concerns and ask for a clear follow-up or referral plan." },
      { id: "inclusion", question: "How can you support a child with SMA?", options: ["Assume physical weakness means limited understanding", "Exclude them from learning", "Ask what support helps them participate and respect their abilities"], correct: 2, explanation: "SMA does not diminish intelligence. Participation and support should reflect the individual." }
    ] }
] as const

export function gradeSmaQuiz(slug: string, answers: unknown) {
  const lesson = smaCourseLessons.find((item) => item.slug === slug)
  if (!lesson || !Array.isArray(answers) || answers.length !== lesson.questions.length || answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 2)) {
    throw new Error("Please answer every question before submitting.")
  }
  const results = lesson.questions.map((question, i) => ({ id: question.id, correct: answers[i] === question.correct, correctOption: question.correct, explanation: question.explanation }))
  const score = results.filter((result) => result.correct).length
  return { score, total: results.length, passed: score >= 2, results }
}
