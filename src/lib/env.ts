export const env = {
  sanityProjectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "80lf2wvv",
  sanityDataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  sanityApiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  resendApiKey: process.env.RESEND_API_KEY || "",
  contactFromEmail: process.env.CONTACT_FROM_EMAIL || "noreply@smahope.org",
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
