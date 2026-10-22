const postSchema = {
  name: "post",
  title: "Foundation article",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    { name: "excerpt", type: "text" },
    { name: "featuredImage", type: "image", options: { hotspot: true } },
    { name: "category", type: "string" },
    { name: "publishedAt", type: "datetime" },
    { name: "author", title: "Author name", type: "string" },
    { name: "updatedAt", title: "Last substantive update", type: "datetime" },
    {
      name: "reviewStatus",
      type: "string",
      options: { list: ["Not clinical", "Clinical review pending", "Clinically reviewed"] },
    },
    { name: "reviewer", title: "Actual reviewer name and credentials", type: "string" },
    { name: "reviewedAt", type: "datetime" },
    {
      name: "sources",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string" },
            { name: "url", type: "url" },
          ],
        },
      ],
    },
    { name: "body", type: "array", of: [{ type: "block" }] },
  ],
};

export default postSchema;
