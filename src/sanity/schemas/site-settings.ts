const siteSettingsSchema = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    { name: "title", title: "Site Title", type: "string" },
    { name: "description", title: "Site Description", type: "text" },
    { name: "seo", title: "SEO", type: "object", fields: [{ name: "metaTitle", type: "string" }, { name: "metaDescription", type: "text" }] },
  ],
};

export default siteSettingsSchema;
