import { NextResponse } from "next/server";
import { upsertFlodeskSubscriber } from "@/lib/flodesk";

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

  const segmentId = process.env.FLODESK_SEGMENT_ID?.trim() || "69b98abb2fc82aecc49f7094";
  const { firstName, lastName } = splitName(payload.name);

  const flodeskResult = await upsertFlodeskSubscriber({
    email,
    firstName,
    lastName,
    segmentId,
  });

  if (!flodeskResult.ok) {
    console.error("Flodesk subscribe failed:", flodeskResult.error);
    return NextResponse.json({ error: "Unable to subscribe right now. Please try again shortly." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
