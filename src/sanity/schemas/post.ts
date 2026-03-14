const postSchema = {
  name: "post",
  title: "Updates Post",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: "slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (Rule: { required: () => unknown }) => Rule.required() },
    { name: "excerpt", type: "text" },
    { name: "featuredImage", type: "image", options: { hotspot: true } },
    { name: "category", type: "string" },
    { name: "publishedAt", type: "datetime" },
    { name: "body", type: "array", of: [{ type: "block" }] },
  ],
};

export default postSchema;
