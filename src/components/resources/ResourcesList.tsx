"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search, Library } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";
import { useResources, resourceCategories } from "@/lib/hooks/useResources";

export function ResourcesList() {
  const resources = useResources();
  const categories = useMemo(() => resourceCategories(resources), [resources]);
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter(
      (r) =>
        (category === null || r.category === category) &&
        (q === "" ||
          r.title.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q)),
    );
  }, [resources, category, query]);

  // Group filtered results by category, preserving the given category order.
  const groups = useMemo(
    () =>
      categories
        .map((c) => ({ category: c, items: filtered.filter((r) => r.category === c) }))
        .filter((g) => g.items.length > 0),
    [categories, filtered],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources…"
            className="h-9 w-56 rounded-lg border border-border bg-card pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip active={category === null} onClick={() => setCategory(null)}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </FilterChip>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No resources match"
          description="Try a different category or clear the search."
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.category}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.items.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-medium hover:text-primary"
                        >
                          {r.title}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </a>
                        {r.description ? (
                          <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                        ) : null}
                      </div>
                      <BookmarkButton type="resource" id={r.id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
