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
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Email delivery failed." }, { status: 500 });
  }
}
