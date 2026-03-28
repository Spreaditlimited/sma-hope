import { NextResponse } from "next/server";
import { storePaymentFromVerifiedTransaction, verifyPaystackTransaction } from "@/lib/payments/processing";

type Payload = {
  reference?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Payload | null;
  const reference = String(payload?.reference || "").trim();

  if (!reference) {
    return NextResponse.json({ ok: false, error: "Payment reference is required." }, { status: 400 });
  }

  try {
    const tx = await verifyPaystackTransaction(reference);
    const result = await storePaymentFromVerifiedTransaction(tx);
    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to complete payment processing.",
      },
      { status: 500 },
    );
  }
}
