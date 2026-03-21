import { env } from "@/lib/env";
import nodemailer, { type Transporter } from "nodemailer";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const to = input.to.trim().toLowerCase();
  const usePartnershipMailbox = to === env.partnershipsEmailAddress.trim().toLowerCase();

  const smtpUser = usePartnershipMailbox ? env.partnershipsEmailAddress : env.helpEmailAddress;
  const smtpPass = usePartnershipMailbox ? env.partnershipsEmailPassword : env.helpEmailPassword;

  if (!smtpUser || !smtpPass) {
    console.info("SMTP mailbox not configured, skipping send.", { to: input.to });
    return { ok: true, skipped: true };
  }

  const transporter: Transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: smtpUser,
    to: input.to,
    subject: input.subject,
    text: input.text,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  });

  return { ok: true, skipped: false };
}
