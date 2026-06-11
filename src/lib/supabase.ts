import { createClient } from "@supabase/supabase-js";

// Publishable credentials: safe to expose in the client, data access is
// enforced by Row Level Security. Env vars take precedence when configured.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://lcurdrsvexvjwfeekrxi.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_d2jJJVIah3UT8n3eyVI2Hw_n7URpRnc";

export const supabase = createClient(supabaseUrl, supabaseKey);
