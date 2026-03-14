import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json();

  if (!env.paystackSecretKey) {
    return NextResponse.json({
      ok: false,
      message: "Paystack is not configured yet. Add PAYSTACK_SECRET_KEY.",
      payload: body,
    }, { status: 503 });
  }

  return NextResponse.json({ ok: true, message: "Paystack transaction endpoint scaffold is ready for live implementation." });
}
