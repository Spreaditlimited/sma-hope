export type BrevoSubscriberInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  listId: number;
};

export async function upsertBrevoSubscriber(input: BrevoSubscriberInput) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false as const, error: "Missing BREVO_API_KEY" };
  }

  if (!Number.isFinite(input.listId) || input.listId <= 0) {
    return { ok: false as const, error: "Missing BREVO_LIST_ID" };
  }

  const response = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email: input.email,
      attributes: {
        FIRSTNAME: input.firstName || undefined,
        LASTNAME: input.lastName || undefined,
      },
      listIds: [input.listId],
      updateEnabled: true,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.error || `Brevo error ${response.status}`;
    return { ok: false as const, error: message };
  }

  return { ok: true as const, data };
}
