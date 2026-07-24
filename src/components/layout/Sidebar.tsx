"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { dashboardNav, SIDEBAR_COOKIE } from "./nav";

/**
 * Longest-prefix match, so a hub link (/admin) doesn't stay highlighted while
 * you're inside one of its sections (/admin/notes).
 */
function useActiveHref(hrefs: string[]) {
  const pathname = usePathname();
  let best = "";
  for (const href of hrefs) {
    const hit = pathname === href || pathname.startsWith(href + "/");
    if (hit && href.length > best.length) best = href;
  }
  // Treat the app root as the dashboard.
  if (!best && pathname === "/") best = "/dashboard";
  return best;
}

export function Sidebar({
  className,
  isAdmin = false,
  defaultCollapsed = false,
}: {
  className?: string;
  isAdmin?: boolean;
  /** Read from a cookie on the server so the first paint is already correct. */
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const groups = dashboardNav
    .filter((group) => !group.adminOnly || isAdmin)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((group) => group.items.length > 0);

  const activeHref = useActiveHref(groups.flatMap((g) => g.items.map((i) => i.href)));

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    // Persist so a reload (and the server render) keeps the same width.
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <aside
      data-collapsed={collapsed ? "" : undefined}
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-out",
        collapsed ? "w-[4.5rem]" : "w-64",
        className,
      )}
    >
      {/* Brand + collapse control */}
      <div
        className={cn(
          "flex gap-2 py-4",
          collapsed ? "flex-col items-center px-2" : "items-center px-5",
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </span>
        {!collapsed ? (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">Mission PSC</p>
            <p className="truncate text-xs text-muted-foreground">Section Officer · MoFA</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className={cn("flex-1 space-y-5 overflow-y-auto py-2", collapsed ? "px-2" : "px-3")}>
        {groups.map((group, gi) => (
          <div key={group.heading ?? gi}>
            {group.heading ? (
              collapsed ? (
                // Keep the grouping legible without the label.
                <div className="mx-auto mb-2 h-px w-6 bg-border" aria-hidden />
              ) : (
                <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group.heading}
                </p>
              )
            ) : null}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = activeHref === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex min-w-0 items-center rounded-lg text-sm font-medium transition-colors",
                        collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      {collapsed ? <span className="sr-only">{item.label}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed ? (
        <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          Lok Sewa · Foreign Service
        </div>
      ) : null}
    </aside>
  );
}
