import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json();

  if (!env.stripeSecretKey) {
    return NextResponse.json({
      ok: false,
      message: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and price IDs.",
      payload: body,
    }, { status: 503 });
  }

  return NextResponse.json({ ok: true, message: "Stripe session endpoint scaffold is ready for live checkout implementation." });
}
