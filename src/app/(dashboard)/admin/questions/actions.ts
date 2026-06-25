"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SubjectiveQuestion } from "@/lib/types";

export type ActionResult = { ok: true } | { error: string };

function fields(q: SubjectiveQuestion) {
  return {
    paper_id: q.paperId,
    section_id: q.sectionId,
    kind: q.kind,
    marks: q.marks,
    prompt: q.prompt,
    passage: q.passage ?? null,
    word_target: q.wordTarget ?? null,
    model_answer: q.modelAnswer ?? null,
    keywords: q.keywords,
  };
}

function revalidate(q: SubjectiveQuestion) {
  revalidatePath("/answers");
  revalidatePath(`/answers/${q.paperId}`);
  revalidatePath(`/answers/${q.paperId}/${q.id}`);
  revalidatePath("/admin/questions");
}

export async function createQuestion(q: SubjectiveQuestion): Promise<ActionResult> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("subjective_questions")
    .select("*", { count: "exact", head: true });
  const { error } = await supabase
    .from("subjective_questions")
    .insert({ id: q.id, ...fields(q), position: count ?? 0 });
  if (error) return { error: error.message };
  revalidate(q);
  return { ok: true };
}

export async function updateQuestion(q: SubjectiveQuestion): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("subjective_questions")
    .update(fields(q))
    .eq("id", q.id);
  if (error) return { error: error.message };
  revalidate(q);
  return { ok: true };
}

export async function deleteQuestion(
  id: string,
  paperId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("subjective_questions")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/answers");
  revalidatePath(`/answers/${paperId}`);
  revalidatePath("/admin/questions");
  return { ok: true };
}
