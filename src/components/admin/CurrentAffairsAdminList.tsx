"use client";

import Link from "next/link";
import { Pencil, Trash2, RotateCcw, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMounted } from "@/lib/hooks/useMounted";
import { useCurrentAffairsAdmin } from "@/lib/hooks/useCurrentAffairs";
import { formatDate } from "@/data/currentAffairs";

/** Admin manage view for the current-affairs collection: edit/delete rows + reset. */
export function CurrentAffairsAdminList() {
  const mounted = useMounted();
  const { list, remove, reset, isOverridden } = useCurrentAffairsAdmin();

  if (!mounted) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="space-y-4">
        {isOverridden ? <ResetButton onReset={reset} /> : null}
        <EmptyState
          icon={Newspaper}
          title="No current affairs yet"
          description="Add your first item to show it on the public Current Affairs feed."
          action={
            <Link href="/admin/current-affairs/new" className="text-sm font-medium text-primary">
              New item
            </Link>
          }
        />
      </div>
    );
  }

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Delete “${title}”? This removes it from the public feed.`)) {
      remove(id);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {list.length} item{list.length === 1 ? "" : "s"}
          {isOverridden ? (
            <Badge variant="warning" className="ml-2">Customised</Badge>
          ) : null}
        </p>
        {isOverridden ? <ResetButton onReset={reset} /> : null}
      </div>

      <div className="space-y-2">
        {list.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant={item.scope === "international" ? "primary" : "outline"}>
                    {item.scope}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                  {(item.tags ?? []).map((t) => (
                    <Badge key={t} variant="default">
                      {t}
                    </Badge>
                  ))}
                </div>
                <p className="font-medium leading-tight">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/admin/current-affairs/${item.id}/edit`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`Edit ${item.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (window.confirm("Reset all current affairs to the defaults? Your changes will be lost.")) {
          onReset();
        }
      }}
    >
      <RotateCcw className="h-4 w-4" />
      Reset to default
    </Button>
  );
}
