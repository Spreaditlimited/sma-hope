export const purposeRouting: Record<string, string> = {
  "General enquiry": "help@smahope.org",
  "Family support": "help@smahope.org",
  "Book enquiry": "help@smahope.org",
  "Partnership / collaboration": "partnerships@smahope.org",
  "Donation enquiry": "help@smahope.org",
  "Media / speaking invitation": "partnerships@smahope.org",
};

export function recipientForPurpose(purpose: string) {
  return purposeRouting[purpose] || "help@smahope.org";
}
