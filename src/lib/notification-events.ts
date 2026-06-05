import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function runNotificationOnce(
  eventKey: string,
  eventType: string,
  payload: Record<string, unknown>,
  send: () => Promise<void>,
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

  await send();
  return { sent: true, duplicate: false };
}
