"use client";

import { useCallback } from "react";
import type { CurrentAffairItem } from "@/lib/types";
import { currentAffairs } from "@/data/currentAffairs";
import { useLocalProgress } from "./useLocalProgress";

/**
 * localStorage override layer for the current-affairs collection. Like resources
 * (and unlike syllabus's per-id map), the override stores the whole effective
 * list — add/edit/delete of items is the point. Absent (null) = use the seed.
 * The admin editor and the public feed/detail both go through it. This is the
 * swap point for a real DB later.
 */
export const CURRENT_AFFAIRS_OVERRIDE_KEY = "current-affairs-overrides";

const NONE: CurrentAffairItem[] | null = null;

/** Newest-first; the feed groups *consecutive* same-date items, so readers sort. */
export function sortByDateDesc(list: CurrentAffairItem[]): CurrentAffairItem[] {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Distinct tags across a list, alphabetical — for the feed filter. */
export function currentAffairTags(list: CurrentAffairItem[]): string[] {
  const set = new Set<string>();
  for (const item of list) for (const t of item.tags ?? []) set.add(t);
  return [...set].sort();
}

/**
 * Public reader: the overridden list if one exists, else the seed — sorted
 * newest-first. SSR-safe (server snapshot is null → seed; first client paint
 * matches the SSR HTML before any override is applied).
 */
export function useCurrentAffairs(): CurrentAffairItem[] {
  const [override] = useLocalProgress<CurrentAffairItem[] | null>(
    CURRENT_AFFAIRS_OVERRIDE_KEY,
    NONE,
  );
  return sortByDateDesc(override ?? currentAffairs);
}

/** Admin CRUD over the current-affairs collection, persisted to the override. */
export function useCurrentAffairsAdmin() {
  const [override, setOverride] = useLocalProgress<CurrentAffairItem[] | null>(
    CURRENT_AFFAIRS_OVERRIDE_KEY,
    NONE,
  );
  const list = sortByDateDesc(override ?? currentAffairs);
  const isOverridden = override !== null;

  const add = useCallback(
    (item: CurrentAffairItem) =>
      setOverride((prev) => [...(prev ?? currentAffairs), item]),
    [setOverride],
  );

  const update = useCallback(
    (id: string, item: CurrentAffairItem) =>
      setOverride((prev) =>
        (prev ?? currentAffairs).map((i) => (i.id === id ? item : i)),
      ),
    [setOverride],
  );

  const remove = useCallback(
    (id: string) =>
      setOverride((prev) => (prev ?? currentAffairs).filter((i) => i.id !== id)),
    [setOverride],
  );

  const reset = useCallback(() => setOverride(NONE), [setOverride]);

  return { list, add, update, remove, reset, isOverridden };
}
