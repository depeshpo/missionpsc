"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileX, Plus, Trash2 } from "lucide-react";
import type { Deck, Flashcard } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMounted } from "@/lib/hooks/useMounted";
import { useFlashcardsAdmin } from "@/lib/hooks/useFlashcards";
import { makeDeckId, makeCardId } from "@/data/flashcards";

type CardDraft = { id?: string; front: string; back: string; tags: string };
type Draft = { title: string; description: string; cards: CardDraft[] };

const blankCard: CardDraft = { front: "", back: "", tags: "" };
const blank: Draft = { title: "", description: "", cards: [{ ...blankCard }] };

/** Create (no `id`) or edit (with `id`) a deck and its cards. Persists to the override. */
export function DeckForm({ id }: { id?: string }) {
  // Gate behind mount so the inner form initialises from the hydrated override.
  const mounted = useMounted();
  if (!mounted) {
    return (
      <Card>
        <CardContent className="space-y-5">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }
  return <DeckFormInner id={id} />;
}

function DeckFormInner({ id }: { id?: string }) {
  const router = useRouter();
  const { decks, getDeck, cardsOf, saveDeck } = useFlashcardsAdmin();
  const editing = id != null;
  const existing = editing ? getDeck(id) : undefined;

  const [draft, setDraft] = useState<Draft>(() => {
    if (!existing) return { ...blank, cards: [{ ...blankCard }] };
    const cards = cardsOf(existing.id).map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      tags: c.tags.join(", "),
    }));
    return {
      title: existing.title,
      description: existing.description ?? "",
      cards: cards.length ? cards : [{ ...blankCard }],
    };
  });

  if (editing && !existing) {
    return (
      <EmptyState
        icon={FileX}
        title="This deck no longer exists"
        description="It may have been deleted. Head back to the list to manage decks."
        action={
          <Link
            href="/admin/flashcards"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to flashcards
          </Link>
        }
      />
    );
  }

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const setCard = (i: number, patch: Partial<CardDraft>) =>
    setDraft((d) => ({
      ...d,
      cards: d.cards.map((c, j) => (j === i ? { ...c, ...patch } : c)),
    }));
  const addCard = () => setDraft((d) => ({ ...d, cards: [...d.cards, { ...blankCard }] }));
  const removeCard = (i: number) =>
    setDraft((d) => ({ ...d, cards: d.cards.filter((_, j) => j !== i) }));

  const canSave = draft.title.trim() !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = draft.title.trim();
    if (!title) return;

    const deckId = editing ? id! : makeDeckId(title, decks.map((d) => d.id));
    const taken: string[] = [];
    const cards: Flashcard[] = draft.cards
      .filter((c) => c.front.trim() !== "" && c.back.trim() !== "")
      .map((c) => {
        const cardId = c.id ?? makeCardId(deckId, taken);
        taken.push(cardId);
        return {
          id: cardId,
          deckId,
          front: c.front.trim(),
          back: c.back.trim(),
          tags: c.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        };
      });

    const deck: Deck = {
      id: deckId,
      title,
      ...(draft.description.trim() ? { description: draft.description.trim() } : {}),
      cardCount: cards.length,
    };

    saveDeck(deck, cards);
    router.push("/admin/flashcards");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card>
        <CardContent className="space-y-5">
          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="e.g. Diplomatic Terminology"
              required
            />
          </Field>
          <Field label="Description" htmlFor="description" hint="Optional one-line summary.">
            <Textarea
              id="description"
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="What this deck covers."
            />
          </Field>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight">
            Cards{" "}
            <span className="font-normal text-muted-foreground">
              ({draft.cards.length})
            </span>
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addCard}>
            <Plus className="h-4 w-4" />
            Add card
          </Button>
        </div>

        {draft.cards.map((c, i) => (
          <Card key={i}>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Card {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCard(i)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
                  aria-label={`Remove card ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Front" htmlFor={`front-${i}`}>
                  <Textarea
                    id={`front-${i}`}
                    value={c.front}
                    onChange={(e) => setCard(i, { front: e.target.value })}
                    placeholder="Prompt / term"
                  />
                </Field>
                <Field label="Back" htmlFor={`back-${i}`}>
                  <Textarea
                    id={`back-${i}`}
                    value={c.back}
                    onChange={(e) => setCard(i, { back: e.target.value })}
                    placeholder="Answer / definition"
                  />
                </Field>
              </div>
              <Field label="Tags" htmlFor={`tags-${i}`} hint="Optional, comma-separated.">
                <Input
                  id={`tags-${i}`}
                  value={c.tags}
                  onChange={(e) => setCard(i, { tags: e.target.value })}
                  placeholder="protocol, VCDR"
                />
              </Field>
            </CardContent>
          </Card>
        ))}
        <p className="text-xs text-muted-foreground">
          Empty cards (no front or back) are skipped on save.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!canSave}>
          {editing ? "Save changes" : "Add deck"}
        </Button>
        <Link
          href="/admin/flashcards"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
