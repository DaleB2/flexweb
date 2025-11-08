import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to create Supabase browser client", error);
    return null;
  }
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRole) {
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase admin client", error);
    return null;
  }
}
