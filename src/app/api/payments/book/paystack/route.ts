import { NextResponse } from "next/server";
import { env } from "@/lib/env";

type BookOrderPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  quantity?: number;
  city?: string;
  state?: string;
  address?: string;
  deliveryArea?: "lagos" | "outside_lagos";
  note?: string;
  source?: "public" | "account";
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${env.siteUrl.replace(/\/$/, "")}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
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

  const payload = (await request.json().catch(() => null)) as BookOrderPayload | null;
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const fullName = String(payload.fullName || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const phone = String(payload.phone || "").trim();
  const city = String(payload.city || "").trim();
  const state = String(payload.state || "").trim();
  const address = String(payload.address || "").trim();
  const note = String(payload.note || "").trim();
  const source = payload.source === "account" ? "account" : "public";
  const quantity = Number(payload.quantity || 0);
  const deliveryArea = payload.deliveryArea === "outside_lagos" ? "outside_lagos" : payload.deliveryArea === "lagos" ? "lagos" : "";

  if (!fullName || !email || !phone || !city || !state || !address || !deliveryArea) {
    return NextResponse.json({ ok: false, error: "Please complete all required order fields." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "A valid email address is required." }, { status: 400 });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ ok: false, error: "Quantity must be at least 1." }, { status: 400 });
  }

  const unitPrice = env.paystackBookUnitPriceNgn;
  const vatPerUnit = env.paystackBookVatNgn;
  const deliveryFee = deliveryArea === "lagos" ? env.paystackBookDeliveryLagosNgn : env.paystackBookDeliveryOutsideLagosNgn;
  const totalNgn = (unitPrice + vatPerUnit) * quantity + deliveryFee;
  const amountMinor = Math.round(totalNgn * 100);
  const callbackUrl = toAbsoluteUrl(source === "account" ? "/account/orders?status=success" : env.paystackBookSuccessUrl);
  const cancelActionUrl = toAbsoluteUrl(source === "account" ? "/account/orders?status=cancelled" : env.paystackBookCancelUrl);

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountMinor,
      currency: "NGN",
      callback_url: callbackUrl,
      metadata: {
        kind: "book_order",
        fullName,
        phone,
        quantity,
        city,
        state,
        address,
        deliveryArea,
        deliveryFeeNgn: deliveryFee,
        unitPriceNgn: unitPrice,
        vatPerUnitNgn: vatPerUnit,
        totalNgn,
        note,
        source,
        cancelActionUrl,
      },
    }),
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
        error: json?.message || "Unable to initialize Paystack book checkout.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    type: "book",
    provider: "paystack",
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code || "",
    reference: json.data.reference || "",
    totalNgn,
  });
}
