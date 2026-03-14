import { env } from "@/lib/env";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!env.resendApiKey) {
    console.info("Email provider not configured, skipping send.", input);
    return { ok: true, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.contactFromEmail,
      to: input.to,
      subject: input.subject,
      text: input.text,
      reply_to: input.to,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email delivery failed: ${body}`);
  }

  return { ok: true, skipped: false };
}
