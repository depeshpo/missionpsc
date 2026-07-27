"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { dashboardNav } from "./nav";

/**
 * Mobile navigation for the Dashboard surface. The real <Sidebar> is `hidden
 * md:flex`, so below md this hamburger opens an off-canvas drawer with the same
 * nav. Admin-only groups/items are filtered by `isAdmin`. Closes on backdrop tap
 * or link tap. md:hidden — never shown on desktop.
 *
 * The overlay is portalled to <body>: the Topbar has `backdrop-blur`, and
 * `backdrop-filter` makes an ancestor a containing block for `position: fixed`
 * descendants — so rendered inline the drawer would be trapped inside the 56px
 * header instead of covering the screen.
 */
export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const groups = dashboardNav
    .filter((g) => !g.adminOnly || isAdmin)
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.adminOnly || isAdmin) }));

  // Longest-prefix match so /admin doesn't stay lit inside /admin/notes.
  const activeHref = groups
    .flatMap((g) => g.items.map((i) => i.href))
    .filter((h) => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const overlay = (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/50 animate-page-in"
      />
      <div className="absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col overflow-y-auto border-r border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">Mission PSC</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {groups.map((group, gi) => (
            <div key={group.heading ?? gi} className="flex flex-col gap-1">
              {group.heading ? (
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group.heading}
                </p>
              ) : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      item.href === activeHref
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && typeof document !== "undefined" ? createPortal(overlay, document.body) : null}
    </>
  );
}
