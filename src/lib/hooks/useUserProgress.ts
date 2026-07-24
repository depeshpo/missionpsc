"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Per-user progress id-sets, backed by the `user_progress` Supabase table (B2).
 * Drop-in replacement for `useLocalIdSet` — same `{ ids, has, toggle }` shape —
 * but rows are scoped to the logged-in user by RLS instead of living in
 * localStorage.
 *
 * Each `kind` has one module-level cache shared by every component that reads it
 * (so MarkReadButton's toggle updates NoteReadProgress and the sidebar live), and
 * a `useSyncExternalStore` subscription. Mutations are optimistic: the cache
 * updates and notifies immediately, then the DB write happens; a failed write
 * reverts. The cache is cleared when the auth user changes.
 */
export type ProgressKind = "unit_complete" | "card_known" | "note_read" | "answer_attempted";

type Entry = {
  set: Set<string>;
  ids: string[]; // stable snapshot; only rebuilt on change
  loaded: boolean;
  loading: boolean;
  listeners: Set<() => void>;
};

const EMPTY: string[] = [];
const cache = new Map<ProgressKind, Entry>();

function entry(kind: ProgressKind): Entry {
  let e = cache.get(kind);
  if (!e) {
    e = { set: new Set(), ids: EMPTY, loaded: false, loading: false, listeners: new Set() };
    cache.set(kind, e);
  }
  return e;
}

function emit(e: Entry) {
  e.ids = [...e.set];
  e.listeners.forEach((l) => l());
}

async function load(kind: ProgressKind) {
  const e = entry(kind);
  if (e.loaded || e.loading) return;
  e.loading = true;
  const { data, error } = await createClient()
    .from("user_progress")
    .select("item_id")
    .eq("kind", kind);
  e.loading = false;
  if (error) return; // leave unloaded so a later mount retries
  e.set = new Set((data ?? []).map((r) => r.item_id as string));
  e.loaded = true;
  emit(e);
}

async function toggle(kind: ProgressKind, id: string) {
  const e = entry(kind);
  const had = e.set.has(id);
  if (had) e.set.delete(id);
  else e.set.add(id);
  emit(e);

  const supabase = createClient();
  const res = had
    ? await supabase.from("user_progress").delete().eq("kind", kind).eq("item_id", id)
    : await supabase.from("user_progress").insert({ kind, item_id: id });

  if (res.error) {
    // revert on failure
    if (had) e.set.add(id);
    else e.set.delete(id);
    emit(e);
  }
}

// --- auth reset: drop cached per-user state when the user changes ------------
const externalResets = new Set<() => void>();

/** Let sibling per-user stores (bookmarks) clear on the same auth change. */
export function registerUserReset(cb: () => void) {
  wireAuth(); // ensure the auth listener exists even if no id-set is subscribed
  externalResets.add(cb);
  return () => externalResets.delete(cb);
}

/**
 * Drop every cached per-user store and notify subscribers. Used when the auth
 * user changes, and by Settings after wiping progress — without it the shared
 * caches would keep showing ticks for rows that no longer exist.
 */
export function clearUserStateCaches() {
  for (const e of cache.values()) {
    e.set = new Set();
    e.ids = EMPTY;
    e.loaded = false;
    emit(e);
  }
  externalResets.forEach((r) => r());
}

let authWired = false;
let lastUserId: string | null = null;
function wireAuth() {
  if (authWired) return;
  authWired = true;
  const supabase = createClient();
  supabase.auth.getUser().then(({ data }) => {
    lastUserId = data.user?.id ?? null;
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    const uid = session?.user?.id ?? null;
    if (uid !== lastUserId) {
      lastUserId = uid;
      clearUserStateCaches();
    }
  });
}

function subscribe(kind: ProgressKind, cb: () => void) {
  wireAuth();
  const e = entry(kind);
  e.listeners.add(cb);
  void load(kind);
  return () => {
    e.listeners.delete(cb);
  };
}

/** Per-user id set for a progress `kind`. Same API as `useLocalIdSet`. */
export function useUserIdSet(kind: ProgressKind) {
  const ids = useSyncExternalStore(
    (cb) => subscribe(kind, cb),
    () => entry(kind).ids,
    () => EMPTY,
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggleId = useCallback((id: string) => void toggle(kind, id), [kind]);

  return { ids, has, toggle: toggleId };
}
