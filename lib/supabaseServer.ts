import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Database = Record<string, never>;

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseServiceClient() {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service credentials");
  }

  cached = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });

  return cached;
}
