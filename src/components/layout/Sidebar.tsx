"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { dashboardNav } from "./nav";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/" || pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  // Explicit expand/collapse choices for collapsible items; absent an entry, a
  // group is open iff it's the active section (derived default avoids a
  // set-state-in-effect and still auto-expands on navigation).
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const isOpen = (href: string) => overrides[href] ?? isActive(pathname, href);

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-5 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Mission PSC</p>
          <p className="text-xs text-muted-foreground">Section Officer · MoFA</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {dashboardNav.map((group, gi) => (
          <div key={gi}>
            {group.heading ? (
              <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.heading}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                const open = item.children ? isOpen(item.href) : false;
                const rowClass = cn(
                  "flex w-full min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                );
                return (
                  <li key={item.href}>
                    {item.children ? (
                      // Whole row toggles the group; opening also navigates to the hub.
                      <button
                        type="button"
                        onClick={() => {
                          const next = !open;
                          setOverrides((prev) => ({ ...prev, [item.href]: next }));
                          if (next) router.push(item.href);
                        }}
                        aria-expanded={open}
                        className={rowClass}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            open && "rotate-90",
                          )}
                        />
                      </button>
                    ) : (
                      <Link href={item.href} className={rowClass}>
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    )}

                    {item.children && open ? (
                      <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return child.href && !child.comingSoon ? (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                aria-current={
                                  isActive(pathname, child.href) ? "page" : undefined
                                }
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                                  isActive(pathname, child.href)
                                    ? "bg-accent font-medium text-accent-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                )}
                              >
                                <ChildIcon className="h-4 w-4 shrink-0" />
                                {child.label}
                              </Link>
                            </li>
                          ) : (
                            <li
                              key={child.label}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground/60"
                            >
                              <ChildIcon className="h-4 w-4 shrink-0" />
                              <span className="flex-1">{child.label}</span>
                              <Badge variant="outline" className="text-[10px]">
                                soon
                              </Badge>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
        v1 · UI preview
      </div>
    </aside>
  );
}
