"use client";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type Database = Record<string, never>;

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase credentials are not configured");
  }

  cached = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
    },
  });

  return cached;
}
