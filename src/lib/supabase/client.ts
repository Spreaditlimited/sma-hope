import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Using permissive DB typing until generated Supabase types are added.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserClient: SupabaseClient<any> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are missing.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  browserClient = createClient<any>(url, anonKey);
  return browserClient;
}
