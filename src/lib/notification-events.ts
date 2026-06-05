import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function runNotificationOnce(
  eventKey: string,
  eventType: string,
  payload: Record<string, unknown>,
  send: () => Promise<{ skipped?: boolean } | void>,
) {
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("payment_events").insert({
    event_key: eventKey,
    event_type: eventType,
    payload,
  });

  if (error) {
    if ((error as { code?: string }).code === "23505") return { sent: false, duplicate: true };
    throw new Error(error.message);
  }

  try {
    const result = await send();
    if (result?.skipped) {
      await admin.from("payment_events").delete().eq("event_key", eventKey);
      throw new Error("Notification email was skipped because the SMTP mailbox is not configured.");
    }
  } catch (error) {
    await admin.from("payment_events").delete().eq("event_key", eventKey);
    throw error;
  }

  return { sent: true, duplicate: false };
}
