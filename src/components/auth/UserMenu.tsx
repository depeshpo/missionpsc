"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";
import { signOut } from "@/app/login/actions";

/**
 * Topbar account control. Shows a sign-out button + avatar when signed in, a
 * "Log in" link otherwise. (Inside the dashboard the user is always signed in,
 * but this stays correct during the brief logout transition.)
 */
export function UserMenu() {
  const { email, ready } = useSupabaseUser();

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
