"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NoteHeading } from "@/data/notes";
import { useLocalIdSet } from "@/lib/hooks/useLocalProgress";
import { NoteReadProgress } from "./NoteReadProgress";
import { NOTES_READ_KEY } from "./progress";

export interface SidebarItem {
  unitId: string;
  href: string;
  number: string;
  title: string;
  headings: NoteHeading[];
}

/**
 * Left rail for a paper's notes: read progress + a collapsible tree of topics.
 * Each topic expands to reveal its (nested) section headings; topics are
 * independently expandable and the active one auto-expands.
 */
export function NotesSidebar({
  paperTitle,
  paperHref,
  items,
}: {
  paperTitle: string;
  paperHref: string;
  items: SidebarItem[];
}) {
  const pathname = usePathname();
  const { has } = useLocalIdSet(NOTES_READ_KEY);

  const activeId = items.find((i) => i.href === pathname)?.unitId;

  // Explicit user choices; absent an entry, a topic is open iff it's active.
  // (Derived default avoids a set-state-in-effect and still auto-expands on nav.)
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const isOpen = (unitId: string) => overrides[unitId] ?? unitId === activeId;

  function toggle(unitId: string) {
    setOverrides((prev) => ({ ...prev, [unitId]: !isOpen(unitId) }));
  }

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <Link
        href={paperHref}
        className={cn(
          "block text-sm font-semibold tracking-tight hover:text-primary",
          pathname === paperHref && "text-primary",
        )}
      >
        {paperTitle}
      </Link>
      <div className="mt-3">
        <NoteReadProgress unitIds={items.map((i) => i.unitId)} />
      </div>

      <nav className="mt-4 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const open = isOpen(item.unitId);
          const hasHeadings = item.headings.length > 0;
          const minLevel = hasHeadings
            ? Math.min(...item.headings.map((h) => h.level))
            : 0;

          return (
            <div key={item.unitId}>
              <div className="flex items-center">
                {hasHeadings ? (
                  <button
                    type="button"
                    onClick={() => toggle(item.unitId)}
                    aria-expanded={open}
                    aria-label={open ? "Collapse" : "Expand"}
                    className="grid h-7 w-6 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight
                      className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")}
                    />
                  </button>
                ) : (
                  <span className="w-6 shrink-0" />
                )}
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      has(item.unitId) ? "bg-success" : "bg-border",
                    )}
                  />
                  <span className="truncate">
                    {item.number !== "—" ? `${item.number}. ` : ""}
                    {item.title}
                  </span>
                </Link>
              </div>

              {open && hasHeadings ? (
                <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-border pl-2">
                  {item.headings.map((h) => (
                    <li key={h.id} style={{ paddingLeft: `${(h.level - minLevel) * 0.75}rem` }}>
                      <Link
                        href={`${item.href}#${h.id}`}
                        className="block truncate rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {h.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
