const donationSettingsSchema = {
  name: "donationSettings",
  title: "Donation Settings",
  type: "document",
  fields: [
    { name: "intro", type: "text" },
    { name: "suggestedAmounts", type: "array", of: [{ type: "number" }] },
    { name: "paystackNotice", type: "string" },
    { name: "stripeNotice", type: "string" },
  ],
};

export default donationSettingsSchema;
