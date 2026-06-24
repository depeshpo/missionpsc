"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side auth state for chrome that needs to react to login/logout
 * (the Learn header, the dashboard Topbar). `ready` is false until the first
 * `getUser()` resolves, so callers can render a neutral placeholder and avoid
 * flashing the logged-out UI for a logged-in user.
 */
export function useSupabaseUser() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { email, ready, signedIn: !!email };
}
