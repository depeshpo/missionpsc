"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CurrentAffairItem } from "@/lib/types";

export type ActionResult = { ok: true } | { error: string };

function row(item: CurrentAffairItem) {
  return {
    id: item.id,
    date: item.date,
    scope: item.scope,
    title: item.title,
    summary: item.summary,
    body: item.body ?? null,
    source_title: item.source?.title ?? null,
    source_href: item.source?.href ?? null,
    tags: item.tags ?? [],
  };
}

function revalidate(id?: string) {
  revalidatePath("/current-affairs");
  revalidatePath("/admin/current-affairs");
  if (id) revalidatePath(`/current-affairs/${id}`);
}

export async function createCurrentAffair(
  item: CurrentAffairItem,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("current_affairs").insert(row(item));
  if (error) return { error: error.message };
  revalidate(item.id);
  return { ok: true };
}

export async function updateCurrentAffair(
  item: CurrentAffairItem,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { id, ...fields } = row(item);
  const { error } = await supabase
    .from("current_affairs")
    .update(fields)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidate(item.id);
  return { ok: true };
}

export async function deleteCurrentAffair(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("current_affairs").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate(id);
  return { ok: true };
}
