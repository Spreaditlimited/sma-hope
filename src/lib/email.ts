import { env } from "@/lib/env";
import { renderEmailTemplate, type EmailDesign } from "@/lib/email-template";
export { renderEmailTemplate } from "@/lib/email-template";
import nodemailer, { type Transporter } from "nodemailer";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  design?: EmailDesign;
  headers?: Record<string,string>;
  messageId?: string;
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
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const html = renderEmailTemplate({
    subject: input.subject,
    text: input.text,
    siteUrl: env.siteUrl,
    design: input.design,
  });

  await transporter.sendMail({
    from: `"SMA Hope Foundation" <${smtpUser}>`,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html,
    ...(input.headers ? {headers:input.headers} : {}),
    ...(input.messageId ? {messageId:input.messageId} : {}),
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  });

  return { ok: true, skipped: false };
}
