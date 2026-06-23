"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { CurrentAffairItem } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";
import { useCurrentAffairs, currentAffairTags } from "@/lib/hooks/useCurrentAffairs";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
}

type Scope = "all" | "national" | "international";

const scopeTabs = [
  { id: "all", label: "All" },
  { id: "national", label: "National" },
  { id: "international", label: "International" },
];

export function CurrentAffairsFeed() {
  const items = useCurrentAffairs();
  const tags = useMemo(() => currentAffairTags(items), [items]);
  const [scope, setScope] = useState<Scope>("all");
  const [tag, setTag] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (scope === "all" || i.scope === scope) &&
          (tag === null || (i.tags ?? []).includes(tag)),
      ),
    [items, scope, tag],
  );

  // Items arrive sorted newest-first; group consecutive items by date.
  const groups = useMemo(() => {
    const out: { date: string; items: CurrentAffairItem[] }[] = [];
    for (const item of filtered) {
      const last = out[out.length - 1];
      if (last && last.date === item.date) last.items.push(item);
      else out.push({ date: item.date, items: [item] });
    }
    return out;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs tabs={scopeTabs} value={scope} onValueChange={(id) => setScope(id as Scope)} />
        {tags.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((t) => {
              const active = tag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(active ? null : t)}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No items match"
          description="Try a different scope or clear the tag filter."
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {formatDate(group.date)}
              </h2>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <Link key={item.id} href={`/current-affairs/${item.id}`} className="group block">
                    <Card className="transition-colors group-hover:border-primary/40">
                      <CardContent className="flex items-start gap-3 py-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge variant={item.scope === "international" ? "primary" : "outline"}>
                              {item.scope}
                            </Badge>
                            {(item.tags ?? []).map((t) => (
                              <Badge key={t} variant="default">
                                {t}
                              </Badge>
                            ))}
                          </div>
                          <p className="font-medium leading-tight">{item.title}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {item.summary}
                          </p>
                        </div>
                        <BookmarkButton type="current-affair" id={item.id} />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
