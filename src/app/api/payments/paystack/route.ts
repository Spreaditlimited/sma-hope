import { NextResponse } from "next/server";
import { env } from "@/lib/env";

type DonationPayload = {
  fullName?: string;
  email?: string;
  location?: "nigeria" | "international";
  interval?: "one_time" | "monthly";
  amount?: number;
  currency?: "NGN" | "USD";
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
    const [amountRaw, codeRaw] = pair.split(":");
    const amount = Number((amountRaw || "").trim());
    const code = String(codeRaw || "").trim();
    if (Number.isFinite(amount) && amount > 0 && code) {
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
  if (env.paystackDonationMonthlyPlanCode) {
    return { code: env.paystackDonationMonthlyPlanCode, supportedAmounts: [...planMap.keys()].sort((a, b) => a - b) };
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
        error: `Monthly donations are not configured for ${amount} ${currency}.${supportedText}`,
      },
      { status: 400 },
    );
  }

  const amountMinor = Math.round(amount * 100);
  const callbackUrl = toAbsoluteUrl(env.paystackDonationSuccessUrl);
  const cancelActionUrl = toAbsoluteUrl(env.paystackDonationCancelUrl);
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
    return NextResponse.json(
      {
        ok: false,
        error: json?.message || "Unable to initialize Paystack donation checkout.",
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
