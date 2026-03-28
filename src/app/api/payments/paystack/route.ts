import { NextResponse } from "next/server";
import { env } from "@/lib/env";

type DonationPayload = {
  fullName?: string;
  email?: string;
  location?: "nigeria" | "international";
  interval?: "one_time" | "monthly";
  amount?: number;
  currency?: "NGN" | "USD";
  source?: "public" | "account";
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${env.siteUrl.replace(/\/$/, "")}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function isCurrencyAllowedForLocation(location: "nigeria" | "international", currency: "NGN" | "USD") {
  if (location === "nigeria") return currency === "NGN";
  return currency === "USD";
}

function parsePlanMap(raw: string): Map<number, string> {
  const map = new Map<number, string>();
  const pairs = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const pair of pairs) {
    const separatorIndex = pair.indexOf(":");
    if (separatorIndex <= 0) continue;

    const amountRaw = pair.slice(0, separatorIndex).trim();
    const codeRaw = pair.slice(separatorIndex + 1).trim();
    const amount = Number(amountRaw);
    const code = String(codeRaw);
    const looksLikePlanCode = /^PLN_[A-Za-z0-9]+$/.test(code);

    if (Number.isFinite(amount) && amount > 0 && looksLikePlanCode) {
      map.set(amount, code);
    }
  }
  return map;
}

function monthlyPlanCodeFor(currency: "NGN" | "USD", amount: number) {
  const raw = currency === "NGN" ? env.paystackDonationMonthlyPlanCodesNgn : env.paystackDonationMonthlyPlanCodesUsd;
  const planMap = parsePlanMap(raw);
  const exactPlan = planMap.get(amount);
  if (exactPlan) {
    return { code: exactPlan, supportedAmounts: [...planMap.keys()].sort((a, b) => a - b) };
  }
  return { code: "", supportedAmounts: [...planMap.keys()].sort((a, b) => a - b) };
}

export async function POST(request: Request) {
  if (!env.paystackSecretKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Paystack is not configured yet. Add PAYSTACK_SECRET_KEY.",
      },
      { status: 503 },
    );
  }

  const payload = (await request.json().catch(() => null)) as DonationPayload | null;
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const fullName = String(payload.fullName || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const location = payload.location === "international" ? "international" : "nigeria";
  const interval = payload.interval === "monthly" ? "monthly" : "one_time";
  const currency = payload.currency === "USD" ? "USD" : "NGN";
  const source = payload.source === "account" ? "account" : "public";
  const amount = Number(payload.amount || 0);
  const minAmount = currency === "USD" ? env.paystackDonationUsdMin : env.paystackDonationNgnMin;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "A valid email address is required." }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Donation amount must be greater than zero." }, { status: 400 });
  }

  if (amount < minAmount) {
    return NextResponse.json(
      {
        ok: false,
        error: `Minimum donation for ${currency} is ${minAmount}.`,
      },
      { status: 400 },
    );
  }

  if (!isCurrencyAllowedForLocation(location, currency)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Selected currency does not match the selected location.",
      },
      { status: 400 },
    );
  }

  const monthlyPlan = interval === "monthly" ? monthlyPlanCodeFor(currency, amount) : null;
  if (interval === "monthly" && !monthlyPlan?.code) {
    const amounts = monthlyPlan?.supportedAmounts || [];
    const supportedText = amounts.length ? ` Supported amounts: ${amounts.join(", ")} ${currency}.` : "";
    return NextResponse.json(
      {
        ok: false,
        error: `Monthly donations are not configured for ${amount} ${currency}.${supportedText} Check PAYSTACK_DONATION_MONTHLY_PLAN_CODES_${currency}.`,
      },
      { status: 400 },
    );
  }

  const amountMinor = Math.round(amount * 100);
  const callbackUrl = toAbsoluteUrl(source === "account" ? "/account/donations?status=success" : env.paystackDonationSuccessUrl);
  const cancelActionUrl = toAbsoluteUrl(source === "account" ? "/account/donations?status=cancelled" : env.paystackDonationCancelUrl);
  const initializePayload: Record<string, unknown> = {
    email,
    amount: amountMinor,
    currency,
    callback_url: callbackUrl,
    metadata: {
      kind: "donation",
      fullName,
      location,
      interval,
      requestedAmount: amount,
      requestedCurrency: currency,
      source,
      cancelActionUrl,
    },
  };

  if (interval === "monthly" && monthlyPlan?.code) {
    initializePayload.plan = monthlyPlan.code;
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(initializePayload),
  });

  const json = (await response.json().catch(() => null)) as
    | {
        status?: boolean;
        message?: string;
        data?: {
          authorization_url?: string;
          access_code?: string;
          reference?: string;
        };
      }
    | null;

  if (!response.ok || !json?.status || !json?.data?.authorization_url) {
    const message = String(json?.message || "");
    if (interval === "monthly" && monthlyPlan?.code && /plan not found/i.test(message)) {
      const keyMode = env.paystackSecretKey.startsWith("sk_live_") ? "live" : env.paystackSecretKey.startsWith("sk_test_") ? "test" : "unknown";
      return NextResponse.json(
        {
          ok: false,
          error: `Paystack returned 'plan not found' for ${monthlyPlan.code}. Confirm this plan exists in your ${keyMode} Paystack account and matches ${amount} ${currency}.`,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: message || "Unable to initialize Paystack donation checkout.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code || "",
    reference: json.data.reference || "",
  });
}
