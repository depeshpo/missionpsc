"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/login/actions";

/**
 * Topbar account control. Reads the auth state via the browser Supabase client:
 * shows a sign-out button + avatar when signed in, a "Log in" link otherwise.
 */
export function UserMenu() {
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

  if (ready && !email) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Log in
      </Link>
    );
  }

  const initials = email ? email.slice(0, 2).toUpperCase() : "··";

  return (
    <div className="flex items-center gap-1.5">
      <span
        title={email ?? undefined}
        className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
      >
        {initials}
      </span>
      {email ? (
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sign out"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      ) : null}
    </div>
  );
}
