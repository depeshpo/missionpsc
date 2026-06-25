"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Layers } from "lucide-react";
import type { Deck } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteDeck } from "@/app/(dashboard)/admin/flashcards/actions";

/** Admin manage view for the flashcards collection (from the DB): edit/delete decks. */
export function FlashcardsAdminList({ decks }: { decks: Deck[] }) {
  const router = useRouter();

  if (decks.length === 0) {
    return (
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
    );
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}” and all its cards? This removes it from the public page.`)) return;
    await deleteDeck(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {decks.length} deck{decks.length === 1 ? "" : "s"}
      </p>

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
