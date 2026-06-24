"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";
import { signOut } from "@/app/login/actions";

/**
 * Auth controls for the Learn header. Logged out → a single "Login" button (no
 * Dashboard). Logged in → a "Dashboard" link + a "Logout" button. A neutral
 * placeholder holds the space until auth state is known, to avoid a flash.
 */
export function AuthNav() {
  const { signedIn, ready } = useSupabaseUser();

  if (!ready) {
    return <span aria-hidden className="h-8 w-20" />;
  }

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <LogIn className="h-4 w-4" />
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          aria-label="Logout"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </form>
    </div>
  );
}
