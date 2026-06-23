"use client";

import { useCallback } from "react";
import type { Resource } from "@/lib/types";
import { resources } from "@/data/resources";
import { useLocalProgress } from "./useLocalProgress";

/**
 * localStorage override layer for the resources collection. Unlike syllabus
 * (a fixed set of papers, overridden per id), resources is a user-managed list
 * where add/edit/delete of items is the point — so the override stores the whole
 * effective list. Absent (null) = use the seed. This is the swap point for a real
 * DB later; the admin editor and the public /resources reader both go through it.
 */
export const RESOURCES_OVERRIDE_KEY = "resources-overrides";

const NONE: Resource[] | null = null;

/** Distinct categories of a list, in encounter order (display order). */
export function resourceCategories(list: Resource[]): string[] {
  const out: string[] = [];
  for (const r of list) if (!out.includes(r.category)) out.push(r.category);
  return out;
}

/**
 * Public reader: the overridden list if one exists, else the seed. SSR-safe —
 * the server snapshot is null → seed, so the first client paint matches the SSR
 * HTML before any override is applied.
 */
export function useResources(): Resource[] {
  const [override] = useLocalProgress<Resource[] | null>(RESOURCES_OVERRIDE_KEY, NONE);
  return override ?? resources;
}

/** Admin CRUD over the resources collection, persisted to the override. */
export function useResourcesAdmin() {
  const [override, setOverride] = useLocalProgress<Resource[] | null>(
    RESOURCES_OVERRIDE_KEY,
    NONE,
  );
  const list = override ?? resources;
  const isOverridden = override !== null;

  const add = useCallback(
    (resource: Resource) =>
      setOverride((prev) => [...(prev ?? resources), resource]),
    [setOverride],
  );

  const update = useCallback(
    (id: string, resource: Resource) =>
      setOverride((prev) =>
        (prev ?? resources).map((r) => (r.id === id ? resource : r)),
      ),
    [setOverride],
  );

  const remove = useCallback(
    (id: string) =>
      setOverride((prev) => (prev ?? resources).filter((r) => r.id !== id)),
    [setOverride],
  );

  const reset = useCallback(() => setOverride(NONE), [setOverride]);

  return { list, add, update, remove, reset, isOverridden };
}
