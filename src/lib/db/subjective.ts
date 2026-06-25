import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { QuestionKind, SubjectiveQuestion } from "@/lib/types";

// Server-only DB accessors for the subjective question bank (B1). Flat collection
// tied to a paper + section; ordered by position.

type QuestionRow = {
  id: string;
  paper_id: string;
  section_id: string;
  kind: QuestionKind;
  marks: number;
  prompt: string;
  passage: string | null;
  word_target: number | null;
  model_answer: string | null;
  keywords: string[] | null;
};

function toQuestion(r: QuestionRow): SubjectiveQuestion {
  return {
    id: r.id,
    paperId: r.paper_id,
    sectionId: r.section_id,
    kind: r.kind,
    marks: r.marks,
    prompt: r.prompt,
    passage: r.passage ?? undefined,
    wordTarget: r.word_target ?? undefined,
    modelAnswer: r.model_answer ?? undefined,
    keywords: r.keywords ?? [],
  };
}

export async function getQuestions(): Promise<SubjectiveQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjective_questions")
    .select("*")
    .order("position");
  if (error) throw error;
  return ((data ?? []) as QuestionRow[]).map(toQuestion);
}

export async function getQuestion(
  id: string,
): Promise<SubjectiveQuestion | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjective_questions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toQuestion(data as QuestionRow) : undefined;
}
