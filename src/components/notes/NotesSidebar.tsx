"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useLocalIdSet } from "@/lib/hooks/useLocalProgress";
import { NoteReadProgress } from "./NoteReadProgress";
import { NOTES_READ_KEY } from "./progress";

export interface SidebarItem {
  unitId: string;
  href: string;
  number: string;
  title: string;
}

/**
 * Left rail for a paper's notes: the read progress + a link per note-unit,
 * highlighting the active one and showing a read dot.
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

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
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
          return (
            <Link
              key={item.unitId}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
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
          );
        })}
      </nav>
    </aside>
  );
}
