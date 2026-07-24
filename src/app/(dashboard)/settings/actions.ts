"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { error: string };

/**
 * Wipe the signed-in user's study progress: completed units, read notes, known
 * cards, attempted flags, answer drafts and bookmarks. Authored content is not
 * touched. RLS already scopes every table to `auth.uid()`; the explicit user_id
 * filter is belt-and-braces (and PostgREST needs a filter on delete).
 */
export async function resetProgress(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are not signed in." };

  for (const table of ["user_progress", "answer_drafts", "user_bookmarks"] as const) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) return { error: error.message };
  }

  // Progress shows up across the learn surface and the dashboard.
  revalidatePath("/", "layout");
  return { ok: true };
}
