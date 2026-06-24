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

/** Override-only papers — created from scratch, with no matching seed id. */
export function addedPapers(map: OverrideMap, seeds: Paper[]): Paper[] {
  const seedIds = new Set(seeds.map((s) => s.id));
  return Object.values(map).filter((p) => !seedIds.has(p.id));
}

/** Seed papers resolved against overrides, plus any created-from-scratch papers. */
export function resolveAllPapers(map: OverrideMap, seeds: Paper[]): Paper[] {
  return [...resolvePapers(map, seeds), ...addedPapers(map, seeds)];
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

/**
 * Editable handle for one paper by id. `seed` is the seed paper when one exists
 * (so `reset` falls back to it); created-from-scratch papers pass no seed, and
 * `reset` deletes their override outright. `paper` is undefined only when an id
 * has neither a seed nor an override (a deleted/unknown id).
 */
export function useSyllabusPaperById(id: string, seed?: Paper) {
  const [map, setMap] = useLocalProgress<OverrideMap>(SYLLABUS_OVERRIDES_KEY, EMPTY);

  const paper = map[id] ?? seed;
  const isOverridden = id in map;

  const update = useCallback(
    (next: Paper) => setMap((prev) => ({ ...prev, [id]: next })),
    [setMap, id],
  );

  const reset = useCallback(
    () =>
      setMap((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [setMap, id],
  );

  return { paper, update, reset, isOverridden };
}

export function useSyllabusPaper(seed: Paper) {
  const handle = useSyllabusPaperById(seed.id, seed);
  return { ...handle, paper: handle.paper ?? seed };
}

/** Persist a brand-new paper into the override map (keyed by its id). */
export function useCreateSyllabusPaper() {
  const [, setMap] = useLocalProgress<OverrideMap>(SYLLABUS_OVERRIDES_KEY, EMPTY);
  return useCallback(
    (paper: Paper) => setMap((prev) => ({ ...prev, [paper.id]: paper })),
    [setMap],
  );
}
