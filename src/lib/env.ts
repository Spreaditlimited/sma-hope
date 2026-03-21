export const env = {
  sanityProjectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "80lf2wvv",
  sanityDataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  sanityApiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
  smtpPort: Number(process.env.SMTP_PORT || 465),
  helpEmailAddress: process.env.HELP_EMAIL_ADDRESS || "help@smahope.org",
  helpEmailPassword: process.env.HELP_EMAIL_PASSWORD || "",
  partnershipsEmailAddress: process.env.PARTNERSHIPS_EMAIL_ADDRESS || "partnerships@smahope.org",
  partnershipsEmailPassword: process.env.PARTNERSHIPS_EMAIL_PASSWORD || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeBookPriceId: process.env.STRIPE_BOOK_PRICE_ID || "",
  stripeDonationPriceId: process.env.STRIPE_DONATION_PRICE_ID || "",
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || "",
  paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  flodeskApiKey: process.env.FLODESK_API_KEY || "",
  flodeskSegmentId: process.env.FLODESK_SEGMENT_ID || "",
};

export function hasSanityConfig() {
  return Boolean(env.sanityProjectId && env.sanityDataset);
}
