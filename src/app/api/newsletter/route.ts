import { NextResponse } from "next/server";
import { upsertBrevoSubscriber } from "@/lib/brevo";

type NewsletterPayload = {
  name?: string;
  email?: string;
  company?: string;
  formStartedAt?: number;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function splitName(name?: string) {
  const cleaned = (name || "").trim().replace(/\s+/g, " ");
  if (!cleaned) return { firstName: undefined, lastName: undefined };
  const [firstName, ...rest] = cleaned.split(" ");
  return {
    firstName,
    lastName: rest.length ? rest.join(" ") : undefined,
  };
}

export async function POST(request: Request) {
  const payload = (await request.json()) as NewsletterPayload;

  if (payload.company) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const startedAt = Number(payload.formStartedAt || 0);
  if (!startedAt || Date.now() - startedAt < 1500) {
    return NextResponse.json({ error: "Submission blocked." }, { status: 400 });
  }

  const email = (payload.email || "").trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const listId = Number((process.env.BREVO_LIST_ID || process.env.BREVO_LISt_ID || "").trim());
  const { firstName, lastName } = splitName(payload.name);

  const brevoResult = await upsertBrevoSubscriber({
    email,
    firstName,
    lastName,
    listId,
  });

  if (!brevoResult.ok) {
    console.error("Brevo subscribe failed:", brevoResult.error);
    return NextResponse.json({ error: "Unable to subscribe right now. Please try again shortly." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
