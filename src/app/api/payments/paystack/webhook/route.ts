import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { recordPaymentEvent, storePaymentFromVerifiedTransaction } from "@/lib/payments/processing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type PaystackWebhookPayload = {
  event?: string;
  data?: Record<string, unknown>;
};

function isValidSignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signature || "");

  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function formatSummary(event: string, data: Record<string, unknown>) {
  const reference = String(data.reference || data.subscription_code || data.id || "n/a");
  const status = String(data.status || "n/a");
  const amount = typeof data.amount === "number" ? data.amount / 100 : null;
  const currency = String(data.currency || "");
  const email =
    typeof data.customer === "object" && data.customer !== null
      ? String((data.customer as { email?: string }).email || "")
      : String(data.email || "");

  return [
    `Event: ${event}`,
    `Reference: ${reference}`,
    `Status: ${status}`,
    `Amount: ${amount !== null ? `${amount} ${currency}` : "n/a"}`,
    `Email: ${email || "n/a"}`,
    "",
    "Raw payload:",
    JSON.stringify(data, null, 2),
  ].join("\n");
}

async function notifyOps(event: string, data: Record<string, unknown>) {
  await sendTransactionalEmail({
    to: env.helpEmailAddress,
    subject: `[Paystack Webhook] ${event}`,
    text: formatSummary(event, data),
  });
}

export async function POST(request: Request) {
  if (!env.paystackSecretKey) {
    return NextResponse.json({ ok: false, error: "PAYSTACK_SECRET_KEY is missing." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  if (!signature || !isValidSignature(rawBody, signature, env.paystackSecretKey)) {
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 401 });
  }

  let payload: PaystackWebhookPayload = {};
  try {
    payload = (JSON.parse(rawBody) as PaystackWebhookPayload | null) || {};
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const event = String(payload.event || "");
  const data = (payload.data || {}) as Record<string, unknown>;
  const metadata =
    typeof data.metadata === "object" && data.metadata !== null
      ? (data.metadata as Record<string, unknown>)
      : {};

  try {
    const id = String(data.id || data.reference || data.subscription_code || "");
    const eventKey = `${event}:${id}`;
    const recorded = await recordPaymentEvent(eventKey, event, payload as Record<string, unknown>);
    if (!recorded.created) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    if (event === "subscription.create") {
      const code = String(data.subscription_code || "");
      if (code) {
        await getSupabaseAdminClient()
          .from("subscriptions")
          .update({
            status: "active",
            next_payment_date: String(data.next_payment_date || "") || null,
          })
          .eq("subscription_code", code);
      }
      await notifyOps(event, data);
    }

    if (event === "subscription.disable" || event === "subscription.not_renew") {
      const code = String(data.subscription_code || "");
      if (code) {
        await getSupabaseAdminClient()
          .from("subscriptions")
          .update({
            status: event === "subscription.disable" ? "disabled" : "not_renewing",
            cancelled_at: new Date().toISOString(),
          })
          .eq("subscription_code", code);
      }
      await notifyOps(event, data);
    }

    if (event === "invoice.payment_failed") {
      const code = String(data.subscription_code || "");
      if (code) {
        await getSupabaseAdminClient()
          .from("subscriptions")
          .update({
            status: "payment_failed",
          })
          .eq("subscription_code", code);
      }
      await notifyOps(event, data);
    }

    if (event === "charge.success" && String(metadata.kind || "") === "donation") {
      await storePaymentFromVerifiedTransaction(data as unknown as {
        status?: string;
        reference?: string;
        amount?: number;
        currency?: string;
        paid_at?: string;
        plan?: { plan_code?: string } | null;
        subscription?: { subscription_code?: string; status?: string; next_payment_date?: string } | null;
        customer?: { email?: string; customer_code?: string } | null;
        metadata?: Record<string, unknown> | null;
      });
      await notifyOps(event, data);
    }

    if (event === "charge.success" && String(metadata.kind || "") === "book_order") {
      await storePaymentFromVerifiedTransaction(data as unknown as {
        status?: string;
        reference?: string;
        amount?: number;
        currency?: string;
        paid_at?: string;
        plan?: { plan_code?: string } | null;
        subscription?: { subscription_code?: string; status?: string; next_payment_date?: string } | null;
        customer?: { email?: string; customer_code?: string } | null;
        metadata?: Record<string, unknown> | null;
      });
      await notifyOps(event, data);
    }
  } catch (error) {
    console.error("Paystack webhook handling error:", error);
    return NextResponse.json({ ok: false, error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
