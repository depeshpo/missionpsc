"use client";

import { useCallback } from "react";
import type { Paper } from "@/lib/types";
import { useLocalProgress } from "./useLocalProgress";

/**
 * localStorage override layer for syllabus papers. Admin edits/reorders/deletes
 * are stored as a whole-`Paper` override keyed by paper id; reads fall back to
 * the seed. This is the swap point for a real DB later. Both the admin editor
 * (`useSyllabusPaper`) and the public /syllabus reader (`useSyllabusOverrides` +
 * `resolvePaper`) go through this same map, so edits show up on the study side.
 */
export const SYLLABUS_OVERRIDES_KEY = "syllabus-overrides";

export type OverrideMap = Record<string, Paper>;
const EMPTY: OverrideMap = {};

/** Pure read: the overridden paper if one exists, else the seed. */
export function resolvePaper(map: OverrideMap, seed: Paper): Paper {
  return map[seed.id] ?? seed;
}

/** Pure read: resolve a list of seed papers against the override map. */
export function resolvePapers(map: OverrideMap, seeds: Paper[]): Paper[] {
  return seeds.map((seed) => resolvePaper(map, seed));
}

/**
 * Read-only subscription to the whole override map, for the public reader.
 * SSR-safe: `useLocalProgress` returns the seed/initial on the server, so the
 * first client paint matches the SSR HTML before any override is applied.
 */
export function useSyllabusOverrides(): OverrideMap {
  const [map] = useLocalProgress<OverrideMap>(SYLLABUS_OVERRIDES_KEY, EMPTY);
  return map;
}

export function useSyllabusPaper(seed: Paper) {
  const [map, setMap] = useLocalProgress<OverrideMap>(SYLLABUS_OVERRIDES_KEY, EMPTY);

  const paper = map[seed.id] ?? seed;
  const isOverridden = seed.id in map;

  const update = useCallback(
    (next: Paper) => setMap((prev) => ({ ...prev, [seed.id]: next })),
    [setMap, seed.id],
  );

  const reset = useCallback(
    () =>
      setMap((prev) => {
        if (!(seed.id in prev)) return prev;
        const next = { ...prev };
        delete next[seed.id];
        return next;
      }),
    [setMap, seed.id],
  );

  return { paper, update, reset, isOverridden };
}
