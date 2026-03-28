import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Using permissive DB typing until generated Supabase types are added.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: SupabaseClient<any> | null = null;

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient = createClient<any>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
