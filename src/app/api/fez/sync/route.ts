import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getFezShipmentTracking, isFezConfigured } from "@/lib/fez/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type SyncRow = {
  id: string;
  fez_tracking_id: string | null;
};

function isAuthorized(request: Request) {
  if (!env.fezSyncSecret) return false;
  const authHeader = request.headers.get("authorization") || "";
  return authHeader === `Bearer ${env.fezSyncSecret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  if (!isFezConfigured()) {
    return NextResponse.json({ ok: false, error: "FEZ is not configured." }, { status: 503 });
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("book_orders")
    .select("id, fez_tracking_id")
    .not("fez_tracking_id", "is", null)
    .or("fez_status.is.null,fez_status.not.in.(delivered,failed,cancelled,returned)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (data || []) as SyncRow[];
  let updated = 0;
  let failed = 0;

  for (const row of rows) {
    const trackingId = String(row.fez_tracking_id || "").trim();
    if (!trackingId) continue;

    try {
      const tracking = await getFezShipmentTracking(trackingId);
      const updatePayload: Record<string, unknown> = {};
      if (tracking.status) updatePayload.fez_status = tracking.status;
      if (tracking.trackingUrl) updatePayload.fez_tracking_url = tracking.trackingUrl;
      if (!Object.keys(updatePayload).length) continue;

      const { error: updateError } = await admin
        .from("book_orders")
        .update(updatePayload)
        .eq("id", row.id);
      if (updateError) throw updateError;
      updated += 1;
    } catch {
      failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: rows.length,
    updated,
    failed,
  });
}
