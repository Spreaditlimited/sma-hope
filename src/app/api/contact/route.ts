import { NextResponse } from "next/server";
import { recipientForPurpose } from "@/lib/contact-routing";
import { sendTransactionalEmail } from "@/lib/email";

type ContactPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  organisation?: string;
  purpose?: string;
  subject?: string;
  message?: string;
  company?: string;
  formStartedAt?: number;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function friendlyDeliveryError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const code = typeof error === "object" && error !== null ? String((error as { code?: string }).code || "") : "";

  if (code === "EAUTH" || /auth/i.test(message)) {
    return "Email authentication failed. Please contact support if this continues.";
  }

  if (code === "ECONNECTION" || code === "ESOCKET" || /connection|timeout|network/i.test(message)) {
    return "Email service is temporarily unavailable. Please try again shortly.";
  }

  if (/recipient|mailbox unavailable|no recipients defined/i.test(message)) {
    return "Message recipient is currently unavailable. Please try again shortly.";
  }

  if (/SMTP mailbox not configured/i.test(message)) {
    return "Contact email is not configured yet. Please try again later.";
  }

  return "Unable to send your message right now. Please try again shortly.";
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ContactPayload;

  if (payload.company) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const startedAt = Number(payload.formStartedAt || 0);
  if (!startedAt || Date.now() - startedAt < 2500) {
    return NextResponse.json({ error: "Submission blocked." }, { status: 400 });
  }

  if (!payload.fullName || !payload.email || !payload.subject || !payload.message || !payload.purpose) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!isValidEmail(payload.email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const to = recipientForPurpose(payload.purpose);
  const text = [
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "Not provided"}`,
    `Organisation: ${payload.organisation || "Not provided"}`,
    `Purpose: ${payload.purpose}`,
    "",
    payload.message,
  ].join("\n");

  try {
    await sendTransactionalEmail({
      to,
      subject: `[SMA Hope Contact] ${payload.subject}`,
      text,
      replyTo: payload.email,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: friendlyDeliveryError(error) }, { status: 500 });
  }
}
