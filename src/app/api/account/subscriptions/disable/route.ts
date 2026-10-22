import { requireAccount } from "@/lib/auth/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getDatabase } from "@/lib/database/store";

type Payload = {
  subscriptionCode?: string;
};


export async function POST(request: Request) {
  if (!env.paystackSecretKey) {
    return NextResponse.json({ ok: false, error: "PAYSTACK_SECRET_KEY is missing." }, { status: 503 });
  }

  const payload = (await request.json().catch(() => null)) as Payload | null;
  const subscriptionCode = String(payload?.subscriptionCode || "").trim();
  if (!subscriptionCode) {
    return NextResponse.json({ ok: false, error: "subscriptionCode is required." }, { status: 400 });
  }

  let user;
  try { user = await requireAccount(request); }
  catch {return NextResponse.json({ok:false,error:"Unauthorized."},{status:401});}
  const admin = getDatabase();

  const donorLookup = await admin
    .from("donor_accounts")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  const donorAccount = donorLookup.data as { id: string } | null;
  const donorError = donorLookup.error;

  if (donorError || !donorAccount?.id) {
    return NextResponse.json({ ok: false, error: "Donor account not found." }, { status: 404 });
  }

  const subscriptionLookup = await admin
    .from("subscriptions")
    .select("id, email_token")
    .eq("subscription_code", subscriptionCode)
    .eq("donor_account_id", donorAccount.id)
    .single();
  const subscription = subscriptionLookup.data as { id: string; email_token: string | null } | null;
  const subscriptionError = subscriptionLookup.error;

  if (subscriptionError || !subscription?.email_token) {
    return NextResponse.json({ ok: false, error: "Subscription not found or cannot be disabled yet." }, { status: 404 });
  }

  const response = await fetch("https://api.paystack.co/subscription/disable", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: subscriptionCode,
      token: subscription.email_token,
    }),
  });

  const json = (await response.json().catch(() => null)) as { status?: boolean; message?: string } | null;
  if (!response.ok || !json?.status) {
    return NextResponse.json(
      {
        ok: false,
        error: json?.message || "Unable to disable subscription.",
      },
      { status: 502 },
    );
  }

  await admin
    .from("subscriptions")
    .update({
      status: "disabled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", subscription.id);

  return NextResponse.json({ ok: true });
}
