"use client";

import { useCallback } from "react";
import type { Paper } from "@/lib/types";
import { useLocalProgress } from "./useLocalProgress";

/**
 * localStorage override layer for syllabus papers. Admin edits/reorders/deletes
 * are stored as a whole-`Paper` override keyed by paper id; reads fall back to
 * the seed. This is the swap point for a real DB later — the public /syllabus
 * pages still read the seed directly for now.
 */
export const SYLLABUS_OVERRIDES_KEY = "syllabus-overrides";

type OverrideMap = Record<string, Paper>;
const EMPTY: OverrideMap = {};

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
