import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { parseFezWebhookTracking } from "@/lib/fez/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function isAuthorized(request: Request) {
  if (!env.fezWebhookToken) return true;
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("token") || "";
  const fromHeader = request.headers.get("x-fez-webhook-token") || "";
  return fromQuery === env.fezWebhookToken || fromHeader === env.fezWebhookToken;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized webhook call." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as unknown;
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const tracking = parseFezWebhookTracking(payload);
  if (!tracking.trackingId) {
    return NextResponse.json({ ok: false, error: "Missing FEZ order/tracking id in webhook payload." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const updatePayload: Record<string, unknown> = {};
  if (tracking.status) updatePayload.fez_status = tracking.status;
  if (tracking.trackingUrl) updatePayload.fez_tracking_url = tracking.trackingUrl;
  if (!Object.keys(updatePayload).length) {
    updatePayload.fez_status = "updated";
  }

  const { error } = await admin
    .from("book_orders")
    .update(updatePayload)
    .eq("fez_tracking_id", tracking.trackingId);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, trackingId: tracking.trackingId, status: tracking.status || "updated" });
}
