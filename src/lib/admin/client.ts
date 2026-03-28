"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token || "";
  if (!token) {
    throw new Error("Not signed in.");
  }

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const json = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const message =
      json && typeof json === "object" && "error" in json && typeof json.error === "string"
        ? json.error
        : "Request failed.";
    throw new Error(message);
  }

  return json as T;
}
