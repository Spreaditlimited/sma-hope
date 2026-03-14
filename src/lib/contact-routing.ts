export const purposeRouting: Record<string, string> = {
  "General enquiry": "hello@smahope.org",
  "Family support": "hello@smahope.org",
  "Book enquiry": "book@smahope.org",
  "Partnership / collaboration": "partnerships@smahope.org",
  "Donation enquiry": "donate@smahope.org",
  "Media / speaking invitation": "partnerships@smahope.org",
};

export function recipientForPurpose(purpose: string) {
  return purposeRouting[purpose] || "hello@smahope.org";
}
