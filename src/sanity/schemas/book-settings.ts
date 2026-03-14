const bookSettingsSchema = {
  name: "bookSettings",
  title: "Book Settings",
  type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "subtitle", type: "string" },
    { name: "coverImage", type: "image", options: { hotspot: true } },
    { name: "priceNGN", type: "number" },
    { name: "priceUSD", type: "number" },
    { name: "priceGBP", type: "number" },
    { name: "formats", type: "array", of: [{ type: "string" }] },
  ],
};

export default bookSettingsSchema;
