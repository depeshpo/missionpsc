import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for client components (per-user reads/writes in B2,
 * auth state on the client). Anon key only — RLS enforces access.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
