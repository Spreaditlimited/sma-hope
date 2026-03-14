const faqItemSchema = {
  name: "faqItem",
  title: "FAQ Item",
  type: "document",
  fields: [
    { name: "category", type: "string" },
    { name: "orderRank", type: "number" },
    { name: "question", type: "string", validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: "answer", type: "text", validation: (Rule: { required: () => unknown }) => Rule.required() },
  ],
};

export default faqItemSchema;
