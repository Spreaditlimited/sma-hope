import { sendTransactionalEmail } from "@/lib/email";
import { env } from "@/lib/env";

export async function sendBookShipmentCreatedEmail(input: {
  to: string;
  trackingId: string;
  trackingUrl?: string | null;
}) {
  const siteUrl = env.siteUrl.replace(/\/$/, "");
  const trackingUrl = String(input.trackingUrl || "").trim();

  await sendTransactionalEmail({
    to: input.to,
    subject: "Your SMA Hope book order is ready for delivery",
    text: [
      "Your book shipment has been created with FEZ Delivery.",
      "",
      `Tracking ID: ${input.trackingId}`,
      trackingUrl ? `FEZ tracking interface: ${trackingUrl}` : "",
      siteUrl ? `SMA Hope order dashboard: ${siteUrl}/account/orders` : "",
      "",
      "You can use the tracking details above to follow delivery progress.",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
