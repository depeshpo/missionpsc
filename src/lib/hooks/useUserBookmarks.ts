"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { registerUserReset } from "./useUserProgress";

/** Content types that can be bookmarked. */
export type BookmarkType =
  | "current-affair"
  | "resource"
  | "note"
  | "question"
  | "flashcard";

export interface Bookmark {
  type: BookmarkType;
  id: string;
  /** Epoch ms when saved — powers the Bookmarks date filter. */
  savedAt: number;
}

/**
 * Per-user bookmarks, backed by the `user_bookmarks` Supabase table (B2).
 * Same `{ bookmarks, isBookmarked, toggle }` API as the old localStorage
 * `useBookmarks`, with one shared module-level cache + optimistic writes.
 */
type Store = {
  bookmarks: Bookmark[];
  loaded: boolean;
  loading: boolean;
  listeners: Set<() => void>;
};

const EMPTY: Bookmark[] = [];
const store: Store = { bookmarks: EMPTY, loaded: false, loading: false, listeners: new Set() };

function emit() {
  store.listeners.forEach((l) => l());
}

async function load() {
  if (store.loaded || store.loading) return;
  store.loading = true;
  const { data, error } = await createClient()
    .from("user_bookmarks")
    .select("type, item_id, saved_at");
  store.loading = false;
  if (error) return;
  store.bookmarks = (data ?? []).map((r) => ({
    type: r.type as BookmarkType,
    id: r.item_id as string,
    savedAt: new Date(r.saved_at as string).getTime(),
  }));
  store.loaded = true;
  emit();
}

async function toggle(type: BookmarkType, id: string) {
  const existing = store.bookmarks.find((b) => b.type === type && b.id === id);
  if (existing) {
    store.bookmarks = store.bookmarks.filter((b) => !(b.type === type && b.id === id));
  } else {
    store.bookmarks = [...store.bookmarks, { type, id, savedAt: Date.now() }];
  }
  emit();

  const supabase = createClient();
  const res = existing
    ? await supabase.from("user_bookmarks").delete().eq("type", type).eq("item_id", id)
    : await supabase.from("user_bookmarks").insert({ type, item_id: id });

  if (res.error) {
    // revert
    if (existing) store.bookmarks = [...store.bookmarks, existing];
    else store.bookmarks = store.bookmarks.filter((b) => !(b.type === type && b.id === id));
    emit();
  }
}

// Clear when the auth user changes (shares the listener wired in useUserProgress).
registerUserReset(() => {
  store.bookmarks = EMPTY;
  store.loaded = false;
  emit();
});

function subscribe(cb: () => void) {
  store.listeners.add(cb);
  void load();
  return () => {
    store.listeners.delete(cb);
  };
}

export function useUserBookmarks() {
  const bookmarks = useSyncExternalStore(
    subscribe,
    () => store.bookmarks,
    () => EMPTY,
  );

  const isBookmarked = useCallback(
    (type: BookmarkType, id: string) =>
      bookmarks.some((b) => b.type === type && b.id === id),
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (type: BookmarkType, id: string) => void toggle(type, id),
    [],
  );

  return { bookmarks, isBookmarked, toggle: toggleBookmark };
}
