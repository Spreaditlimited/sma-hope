import { NextResponse } from "next/server";
import { bearerTokenFromRequest, requireAdminUser } from "@/lib/admin/server";
import { sendBookShipmentCreatedEmail } from "@/lib/book-orders/email";
import { createFezShipment, isFezConfigured } from "@/lib/fez/client";
import { runNotificationOnce } from "@/lib/notification-events";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Payload = {
  orderId?: string;
};

type BookOrderRetryRow = {
  id: string;
  email: string;
  total_ngn: number;
  quantity: number;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  note: string | null;
  paystack_reference: string;
  fez_tracking_id: string | null;
  metadata: Record<string, unknown> | null;
};

export async function POST(request: Request) {
  const token = bearerTokenFromRequest(request);
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  try {
    await requireAdminUser(token, ["admin", "ops"]);

    if (!isFezConfigured()) {
      return NextResponse.json({ ok: false, error: "FEZ credentials are missing." }, { status: 503 });
    }

    const payload = (await request.json().catch(() => null)) as Payload | null;
    const orderId = String(payload?.orderId || "").trim();
    if (!orderId) {
      return NextResponse.json({ ok: false, error: "orderId is required." }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("book_orders")
      .select("id, email, total_ngn, quantity, phone, address, city, state, note, paystack_reference, fez_tracking_id, metadata")
      .eq("id", orderId)
      .single();

    if (error) throw new Error(error.message);

    const order = data as BookOrderRetryRow | null;
    if (!order?.id) {
      return NextResponse.json({ ok: false, error: "Book order not found." }, { status: 404 });
    }

    if (String(order.fez_tracking_id || "").trim()) {
      return NextResponse.json({ ok: false, error: "This order already has a FEZ tracking ID." }, { status: 409 });
    }

    const metadata = order.metadata || {};
    const shipment = await createFezShipment({
      reference: order.paystack_reference,
      customerName: String(metadata.fullName || "").trim() || order.email,
      customerEmail: order.email,
      customerPhone: String(order.phone || "").trim(),
      address: String(order.address || "").trim(),
      city: String(order.city || "").trim(),
      state: String(order.state || "").trim(),
      note: String(order.note || "").trim(),
      quantity: Number(order.quantity || 1),
      declaredValueNgn: Number(order.total_ngn || 0),
    });

    const update = {
      fez_tracking_id: shipment.trackingId,
      fez_tracking_url: shipment.trackingUrl || null,
      fez_status: shipment.status || "pending",
    };

    const { error: updateError } = await admin.from("book_orders").update(update).eq("id", order.id);
    if (updateError) throw new Error(updateError.message);

    try {
      await runNotificationOnce(
        `notification:book_shipment_created:${shipment.trackingId}`,
        "notification.book_shipment_created",
        { orderId: order.id, email: order.email, trackingId: shipment.trackingId },
        () =>
          sendBookShipmentCreatedEmail({
            to: order.email,
            trackingId: shipment.trackingId,
            trackingUrl: shipment.trackingUrl || null,
          }),
      );
    } catch (error) {
      console.error("[Email] Book shipment-created email failed after FEZ retry.", {
        orderId: order.id,
        email: order.email,
        trackingId: shipment.trackingId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return NextResponse.json({ ok: true, orderId: order.id, ...update });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to retry FEZ order creation.";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
