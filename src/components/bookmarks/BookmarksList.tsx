"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark as BookmarkIcon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useBookmarks, type BookmarkType } from "@/lib/hooks/useBookmarks";
import { BookmarkButton } from "./BookmarkButton";
import { resolveBookmark, TYPE_LABELS, type ResolvedBookmark } from "./resolve";

const TYPE_FILTERS: { id: BookmarkType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "current-affair", label: "Current Affairs" },
  { id: "resource", label: "Resources" },
  { id: "note", label: "Notes" },
  { id: "question", label: "Questions" },
  { id: "flashcard", label: "Flashcards" },
];

const DATE_WINDOWS = [
  { id: "all", label: "All time", days: 0 },
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
];

function dayKey(ms: number) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(ms));
}

export function BookmarksList() {
  const { bookmarks } = useBookmarks();
  const [type, setType] = useState<BookmarkType | "all">("all");
  const [windowId, setWindowId] = useState("all");
  // Cutoff computed in the (impure-allowed) event handler, not during render.
  const [cutoff, setCutoff] = useState(0);

  function selectWindow(id: string) {
    setWindowId(id);
    const days = DATE_WINDOWS.find((w) => w.id === id)?.days ?? 0;
    setCutoff(days > 0 ? Date.now() - days * 86_400_000 : 0);
  }

  const resolved = useMemo(
    () =>
      bookmarks
        .filter((b) => (type === "all" || b.type === type) && b.savedAt >= cutoff)
        .map(resolveBookmark)
        .filter((r): r is ResolvedBookmark => r !== null)
        .sort((a, b) => b.savedAt - a.savedAt),
    [bookmarks, type, cutoff],
  );

  // Group by saved date (already newest-first).
  const groups = useMemo(() => {
    const out: { day: string; items: ResolvedBookmark[] }[] = [];
    for (const r of resolved) {
      const day = dayKey(r.savedAt);
      const last = out[out.length - 1];
      if (last && last.day === day) last.items.push(r);
      else out.push({ day, items: [r] });
    }
    return out;
  }, [resolved]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                type === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={windowId}
          onChange={(e) => selectWindow(e.target.value)}
          className="h-8 rounded-lg border border-border bg-card px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {DATE_WINDOWS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={BookmarkIcon}
          title="No bookmarks yet"
          description="Save current affairs, resources, notes, questions, or flashcards and they'll gather here."
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.day}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.day}
              </h2>
              <div className="space-y-2">
                {group.items.map((r) => (
                  <Card key={`${r.type}:${r.id}`}>
                    <CardContent className="flex items-start gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{TYPE_LABELS[r.type]}</Badge>
                          {r.subtitle ? (
                            <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                          ) : null}
                        </div>
                        {r.external ? (
                          <a
                            href={r.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium hover:text-primary"
                          >
                            <span className="line-clamp-2">{r.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </a>
                        ) : (
                          <Link href={r.href} className="font-medium hover:text-primary">
                            <span className="line-clamp-2">{r.title}</span>
                          </Link>
                        )}
                      </div>
                      <BookmarkButton type={r.type} id={r.id} />
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
