"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/lib/types";

export type ActionResult = { ok: true } | { error: string };

function revalidate() {
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

/** Insert a new resource (appended at the end). RLS requires admin. */
export async function createResource(resource: Resource): Promise<ActionResult> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true });
  const { error } = await supabase.from("resources").insert({
    id: resource.id,
    title: resource.title,
    category: resource.category,
    url: resource.url,
    description: resource.description ?? null,
    position: count ?? 0,
  });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

/** Update an existing resource (position unchanged). RLS requires admin. */
export async function updateResource(resource: Resource): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("resources")
    .update({
      title: resource.title,
      category: resource.category,
      url: resource.url,
      description: resource.description ?? null,
    })
    .eq("id", resource.id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
