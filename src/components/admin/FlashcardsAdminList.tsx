"use client";

import Link from "next/link";
import { Pencil, Trash2, RotateCcw, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMounted } from "@/lib/hooks/useMounted";
import { useFlashcardsAdmin } from "@/lib/hooks/useFlashcards";

/** Admin manage view for the flashcards collection: edit/delete decks + reset. */
export function FlashcardsAdminList() {
  const mounted = useMounted();
  const { decks, removeDeck, reset, isOverridden } = useFlashcardsAdmin();

  if (!mounted) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="space-y-4">
        {isOverridden ? <ResetButton onReset={reset} /> : null}
        <EmptyState
          icon={Layers}
          title="No decks yet"
          description="Add your first deck to show it on the public Flashcards page."
          action={
            <Link href="/admin/flashcards/new" className="text-sm font-medium text-primary">
              New deck
            </Link>
          }
        />
      </div>
    );
  }

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Delete “${title}” and all its cards? This removes it from the public page.`)) {
      removeDeck(id);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {decks.length} deck{decks.length === 1 ? "" : "s"}
          {isOverridden ? (
            <Badge variant="warning" className="ml-2">Customised</Badge>
          ) : null}
        </p>
        {isOverridden ? <ResetButton onReset={reset} /> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {decks.map((deck) => (
          <Card key={deck.id}>
            <CardContent className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <Layers className="h-4 w-4" />
                  </span>
                  <Badge variant="outline">{deck.cardCount} cards</Badge>
                </div>
                <p className="font-semibold leading-tight">{deck.title}</p>
                {deck.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {deck.description}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/admin/flashcards/${deck.id}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`Edit ${deck.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(deck.id, deck.title)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
                  aria-label={`Delete ${deck.title}`}
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
        if (window.confirm("Reset all flashcards to the defaults? Your changes will be lost.")) {
          onReset();
        }
      }}
    >
      <RotateCcw className="h-4 w-4" />
      Reset to default
    </Button>
  );
}
