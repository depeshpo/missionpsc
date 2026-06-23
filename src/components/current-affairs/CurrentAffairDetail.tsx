"use client";

import Link from "next/link";
import { ExternalLink, ArrowRight, Newspaper } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";
import { useCurrentAffairs } from "@/lib/hooks/useCurrentAffairs";
import { formatDate } from "@/data/currentAffairs";

/**
 * Public reader for a single current-affairs item. Resolves through the override
 * (so admin-added/edited items appear); a missing id shows an empty state rather
 * than a 404, mirroring the syllabus UnitView.
 */
export function CurrentAffairDetail({ id }: { id: string }) {
  const items = useCurrentAffairs();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <PageShell
        title="Item not available"
        breadcrumbs={[{ label: "Current Affairs", href: "/current-affairs" }]}
      >
        <EmptyState
          icon={Newspaper}
          title="This item is no longer available"
          description="It may have been removed. Browse the latest in the feed."
          action={
            <Link
              href="/current-affairs"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Back to Current Affairs
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={item.title}
      breadcrumbs={[
        { label: "Current Affairs", href: "/current-affairs" },
        { label: item.title },
      ]}
      actions={<BookmarkButton type="current-affair" id={item.id} labeled />}
    >
      <div className="max-w-2xl space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.scope === "international" ? "primary" : "outline"}>
            {item.scope}
          </Badge>
          <span className="text-sm text-muted-foreground">{formatDate(item.date)}</span>
        </div>

        <p className="text-base leading-relaxed">{item.summary}</p>

        {item.body?.length ? (
          <div className="space-y-4">
            {item.body.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {para}
              </p>
            ))}
          </div>
        ) : null}

        {item.tags?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <Badge key={t} variant="default">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}

        {item.source ? (
          <a
            href={item.source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
          >
            <ExternalLink className="h-4 w-4" />
            Source: {item.source.title}
          </a>
        ) : null}
      </div>
    </PageShell>
  );
}
