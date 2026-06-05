import { sendTransactionalEmail } from "@/lib/email";
import { env } from "@/lib/env";

function formatAmount(amount: number, currency: string) {
  const normalized = currency.toUpperCase();
  if (normalized === "NGN") return `NGN ${amount.toLocaleString()}`;
  if (normalized === "USD") return `USD ${amount.toLocaleString()}`;
  return `${normalized} ${amount.toLocaleString()}`;
}

export async function sendDonationThankYouEmail(input: {
  to: string;
  fullName?: string;
  amountMajor: number;
  currency: string;
  interval: string;
  reference: string;
  paidAt: string;
  subscriptionCode?: string | null;
}) {
  const siteUrl = env.siteUrl.replace(/\/$/, "");
  const recurring = input.interval === "monthly" || Boolean(input.subscriptionCode);
  const paidAt = Number.isNaN(Date.parse(input.paidAt))
    ? input.paidAt
    : new Date(input.paidAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  await sendTransactionalEmail({
    to: input.to,
    subject: recurring ? "Thank you for your recurring SMA Hope donation" : "Thank you for your SMA Hope donation",
    text: [
      `Hello${input.fullName ? ` ${input.fullName}` : ""},`,
      "",
      "Thank you for supporting SMA Hope Foundation. Your payment was received successfully.",
      "",
      `Donation type: ${recurring ? "Recurring monthly donation" : "One-time donation"}`,
      `Amount: ${formatAmount(input.amountMajor, input.currency)}`,
      `Payment reference: ${input.reference}`,
      `Paid at: ${paidAt}`,
      input.subscriptionCode ? `Subscription code: ${input.subscriptionCode}` : "",
      siteUrl ? `Dashboard: ${siteUrl}/account/donations` : "",
      "",
      "Your support helps us continue practical awareness, advocacy, and family support work around Spinal Muscular Atrophy.",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
