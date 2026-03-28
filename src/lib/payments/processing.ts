import { randomBytes } from "crypto";
import { env } from "@/lib/env";
import { sendTransactionalEmail } from "@/lib/email";
import { createFezShipment, isFezConfigured } from "@/lib/fez/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type TransactionData = {
  id?: number;
  status?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  paid_at?: string;
  plan?: { plan_code?: string } | null;
  subscription?: { subscription_code?: string; status?: string; next_payment_date?: string; email_token?: string } | null;
  customer?: { email?: string; customer_code?: string } | null;
  metadata?: Record<string, unknown> | null;
};

function toMajorAmount(amountMinor: number) {
  return Math.round(amountMinor) / 100;
}

function generateTemporaryPassword() {
  return `SMA-${randomBytes(8).toString("hex")}!`;
}

async function lookupAuthUserIdByEmail(email: string) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);
  const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  return match?.id || "";
}

async function findDonorAccountByEmail(email: string) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("donor_accounts")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ? String(data.id) : "";
}

export async function ensureDonorAccount(input: { email: string; fullName?: string }) {
  const email = input.email.trim().toLowerCase();
  const fullName = (input.fullName || "").trim();
  const admin = getSupabaseAdminClient();

  const { data: existing } = await admin
    .from("donor_accounts")
    .select("id, email, auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (existing?.id) {
    return { donorAccountId: String(existing.id), created: false, tempPassword: "" };
  }

  let authUserId = await lookupAuthUserIdByEmail(email);
  let tempPassword = "";
  let createdAuthUser = false;

  if (!authUserId) {
    tempPassword = generateTemporaryPassword();
    const created = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName || undefined },
    });

    if (created.error) {
      throw new Error(created.error.message);
    }

    authUserId = created.data.user.id;
    createdAuthUser = true;
  }

  const { data: account, error: accountError } = await admin
    .from("donor_accounts")
    .upsert(
      {
        email,
        full_name: fullName || null,
        auth_user_id: authUserId || null,
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (accountError) {
    throw new Error(accountError.message);
  }

  if (createdAuthUser && tempPassword) {
    const recovery = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${env.siteUrl.replace(/\/$/, "")}/account/reset-password`,
      },
    });

    const resetLink = recovery.data?.properties?.action_link || `${env.siteUrl.replace(/\/$/, "")}/account/reset-password`;

    await sendTransactionalEmail({
      to: email,
      subject: "Your SMA Hope donor account is ready",
      text: [
        `Hello${fullName ? ` ${fullName}` : ""},`,
        "",
        "Thank you for your payment. We have created your donor account.",
        `Temporary password: ${tempPassword}`,
        "",
        "Please sign in and reset your password immediately.",
        `Password reset link: ${resetLink}`,
        "",
        `Login page: ${env.siteUrl.replace(/\/$/, "")}/account/login`,
      ].join("\n"),
    });
  }

  return { donorAccountId: String(account.id), created: createdAuthUser, tempPassword };
}

export async function verifyPaystackTransaction(reference: string) {
  if (!env.paystackSecretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is missing.");
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.paystackSecretKey}` },
  });

  const json = (await res.json().catch(() => null)) as
    | { status?: boolean; message?: string; data?: TransactionData }
    | null;

  if (!res.ok || !json?.status || !json.data) {
    throw new Error(json?.message || "Unable to verify Paystack transaction.");
  }

  return json.data;
}

export async function storePaymentFromVerifiedTransaction(tx: TransactionData) {
  const reference = String(tx.reference || "").trim();
  const status = String(tx.status || "").trim().toLowerCase();
  const metadata = (tx.metadata || {}) as Record<string, unknown>;
  const kind = String(metadata.kind || "");
  const email = String(tx.customer?.email || "").trim().toLowerCase();
  const fullName = String(metadata.fullName || "");
  const paidAt = tx.paid_at || new Date().toISOString();
  const amountMinor = Number(tx.amount || 0);
  const amountMajor = toMajorAmount(amountMinor);
  const currency = String(tx.currency || "");
  const source = String(metadata.source || "public").toLowerCase();

  if (!reference || !email) {
    throw new Error("Transaction reference or email is missing.");
  }

  if (status !== "success") {
    throw new Error(`Transaction is not successful (status: ${status || "unknown"}).`);
  }

  const admin = getSupabaseAdminClient();
  let donorAccountId = "";
  let accountCreated = false;

  if (source === "account") {
    donorAccountId = await findDonorAccountByEmail(email);
    if (!donorAccountId) {
      throw new Error("No existing dashboard account found for this payment email.");
    }
  } else {
    const account = await ensureDonorAccount({ email, fullName });
    donorAccountId = account.donorAccountId;
    accountCreated = account.created;
  }

  if (kind === "donation") {
    const interval = String(metadata.interval || "one_time");
    const planCode = tx.plan?.plan_code || null;
    const subscriptionCode = tx.subscription?.subscription_code || null;

    const { error: donationError } = await admin.from("donations").upsert(
      {
        donor_account_id: donorAccountId,
        email,
        paystack_reference: reference,
        amount_major: amountMajor,
        currency,
        donation_interval: interval,
        status,
        plan_code: planCode,
        subscription_code: subscriptionCode,
        paid_at: paidAt,
        metadata,
      },
      { onConflict: "paystack_reference" },
    );

    if (donationError) throw new Error(donationError.message);

    if (subscriptionCode) {
      const { error: subscriptionError } = await admin.from("subscriptions").upsert(
        {
          donor_account_id: donorAccountId,
          email,
          subscription_code: subscriptionCode,
          customer_code: tx.customer?.customer_code || null,
          plan_code: planCode,
          email_token: tx.subscription?.email_token || null,
          status: tx.subscription?.status || "active",
          next_payment_date: tx.subscription?.next_payment_date || null,
          metadata,
        },
        { onConflict: "subscription_code" },
      );

      if (subscriptionError) throw new Error(subscriptionError.message);
    }

    return {
      kind: "donation" as const,
      accountCreated,
      recurring: Boolean(subscriptionCode || interval === "monthly"),
      fullName: fullName || "",
    };
  }

  if (kind === "book_order") {
    const totalNgn = Number(metadata.totalNgn || amountMajor);
    const quantity = Number(metadata.quantity || 1);

    const { data: orderRow, error: orderError } = await admin.from("book_orders").upsert(
      {
        donor_account_id: donorAccountId,
        email,
        paystack_reference: reference,
        status,
        total_ngn: totalNgn,
        quantity,
        delivery_area: String(metadata.deliveryArea || ""),
        phone: String(metadata.phone || ""),
        address: String(metadata.address || ""),
        city: String(metadata.city || ""),
        state: String(metadata.state || ""),
        note: String(metadata.note || ""),
        metadata,
      },
      { onConflict: "paystack_reference" },
    ).select("id, fez_tracking_id").single();

    if (orderError) throw new Error(orderError.message);

    if (orderRow?.id && !String(orderRow.fez_tracking_id || "").trim() && isFezConfigured()) {
      try {
        const shipment = await createFezShipment({
          reference,
          customerName: String(metadata.fullName || "").trim() || email,
          customerEmail: email,
          customerPhone: String(metadata.phone || "").trim(),
          address: String(metadata.address || "").trim(),
          city: String(metadata.city || "").trim(),
          state: String(metadata.state || "").trim(),
          note: String(metadata.note || "").trim(),
          quantity,
          declaredValueNgn: totalNgn,
        });

        await admin
          .from("book_orders")
          .update({
            fez_tracking_id: shipment.trackingId,
            fez_tracking_url: shipment.trackingUrl || null,
            fez_status: shipment.status || "pending",
          })
          .eq("id", String(orderRow.id));
      } catch {
        await admin
          .from("book_orders")
          .update({
            fez_status: "dispatch_pending",
          })
          .eq("id", String(orderRow.id));
      }
    }

    return {
      kind: "book_order" as const,
      accountCreated,
      recurring: false,
      fullName: fullName || "",
    };
  }

  return {
    kind: "unknown" as const,
    accountCreated,
    recurring: false,
    fullName: fullName || "",
  };
}

export async function recordPaymentEvent(eventKey: string, eventType: string, payload: Record<string, unknown>) {
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("payment_events").insert({
    event_key: eventKey,
    event_type: eventType,
    payload,
  });

  if (!error) return { created: true };
  if ((error as { code?: string }).code === "23505") return { created: false };
  throw new Error(error.message);
}
