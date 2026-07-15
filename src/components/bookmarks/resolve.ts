import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getPapers } from "@/lib/db/syllabus";
import { getNotes } from "@/lib/db/notes";
import { getQuestions } from "@/lib/db/subjective";
import { getFlashcardsData } from "@/lib/db/flashcards";
import { getCurrentAffairs } from "@/lib/db/currentAffairs";
import { getResources } from "@/lib/db/resources";
import { findUnit } from "@/lib/notes";
import { formatDate } from "@/data/currentAffairs";
import { kindLabel } from "@/data/subjective";
import type { BookmarkType } from "@/lib/hooks/useUserBookmarks";
import type { ResolvedBookmark } from "./types";

type BookmarkRow = { type: BookmarkType; item_id: string; saved_at: string };

/**
 * Read the current user's bookmarks (RLS-scoped) and resolve each to display
 * data against DB content. A bookmark whose target no longer exists is dropped,
 * exactly as the old seed-based resolver did. Server-only — the content lives in
 * the DB now, so resolution can't happen in the client bundle.
 */
export async function getResolvedBookmarks(): Promise<ResolvedBookmark[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("user_bookmarks")
    .select("type, item_id, saved_at")
    .order("saved_at", { ascending: false });
  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  const [papers, notes, questions, flashcards, currentAffairs, resources] = await Promise.all([
    getPapers(),
    getNotes(),
    getQuestions(),
    getFlashcardsData(),
    getCurrentAffairs(),
    getResources(),
  ]);

  const resolved: ResolvedBookmark[] = [];
  for (const row of rows as BookmarkRow[]) {
    const base = { type: row.type, id: row.item_id, savedAt: new Date(row.saved_at).getTime() };

    switch (row.type) {
      case "current-affair": {
        const item = currentAffairs.find((c) => c.id === row.item_id);
        if (item)
          resolved.push({
            ...base,
            title: item.title,
            subtitle: formatDate(item.date),
            href: `/current-affairs/${item.id}`,
          });
        break;
      }
      case "resource": {
        const r = resources.find((x) => x.id === row.item_id);
        if (r)
          resolved.push({ ...base, title: r.title, subtitle: r.category, href: r.url, external: true });
        break;
      }
      case "note": {
        const note = notes.find((n) => n.unitId === row.item_id);
        const found = findUnit(papers, row.item_id);
        if (note && found)
          resolved.push({
            ...base,
            title: note.title,
            subtitle: `Paper ${found.paper.code}`,
            href: `/notes/${found.paper.id}/${row.item_id}`,
          });
        break;
      }
      case "question": {
        const q = questions.find((x) => x.id === row.item_id);
        if (q) {
          const paper = papers.find((p) => p.id === q.paperId);
          resolved.push({
            ...base,
            title: q.prompt,
            subtitle: paper ? `Paper ${paper.code} · ${kindLabel(q.kind)}` : kindLabel(q.kind),
            href: `/answers/${q.paperId}/${q.id}`,
          });
        }
        break;
      }
      case "flashcard": {
        const card = flashcards.cards.find((c) => c.id === row.item_id);
        if (card) {
          const deck = flashcards.decks.find((d) => d.id === card.deckId);
          resolved.push({
            ...base,
            title: card.front,
            subtitle: deck?.title,
            href: `/flashcards/${card.deckId}`,
          });
        }
        break;
      }
    }
  }

  return resolved;
}
