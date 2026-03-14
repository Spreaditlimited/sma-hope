const footerSettingsSchema = {
  name: "footerSettings",
  title: "Footer Settings",
  type: "document",
  fields: [
    { name: "copyright", type: "string" },
    { name: "links", type: "array", of: [{ type: "object", fields: [{ name: "label", type: "string" }, { name: "href", type: "string" }] }] },
  ],
};

export default footerSettingsSchema;
