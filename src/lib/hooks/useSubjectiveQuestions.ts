"use client";

import { useCallback } from "react";
import type { Paper, SubjectiveQuestion } from "@/lib/types";
import { subjectiveQuestions } from "@/data/subjective";
import { papers } from "@/data/syllabus";
import { useLocalProgress } from "./useLocalProgress";

/**
 * localStorage override layer for the subjective question bank — a flat collection
 * tied to a paper + section. Stores the whole effective list (`SubjectiveQuestion[]
 * | null`; null = seed). Admin editor + public /answers pages both read through it.
 * The future-DB swap point.
 */
export const QUESTIONS_OVERRIDE_KEY = "questions-overrides";

const NONE: SubjectiveQuestion[] | null = null;

/** Papers that have a question bank, in syllabus order — reflects the given list. */
export function answerablePapersFrom(list: SubjectiveQuestion[]): Paper[] {
  return papers.filter((p) => list.some((q) => q.paperId === p.id));
}

export function questionsByPaperFrom(
  list: SubjectiveQuestion[],
  paperId: string,
): SubjectiveQuestion[] {
  return list.filter((q) => q.paperId === paperId);
}

export function questionsBySectionFrom(
  list: SubjectiveQuestion[],
  sectionId: string,
): SubjectiveQuestion[] {
  return list.filter((q) => q.sectionId === sectionId);
}

/**
 * Public reader: the overridden list if one exists, else the seed. SSR-safe
 * (server snapshot is null → seed; first client paint matches the SSR HTML).
 */
export function useSubjectiveQuestions(): SubjectiveQuestion[] {
  const [override] = useLocalProgress<SubjectiveQuestion[] | null>(QUESTIONS_OVERRIDE_KEY, NONE);
  return override ?? subjectiveQuestions;
}

/** Admin CRUD over the question bank, persisted to the override. */
export function useSubjectiveQuestionsAdmin() {
  const [override, setOverride] = useLocalProgress<SubjectiveQuestion[] | null>(
    QUESTIONS_OVERRIDE_KEY,
    NONE,
  );
  const list = override ?? subjectiveQuestions;
  const isOverridden = override !== null;

  const add = useCallback(
    (question: SubjectiveQuestion) =>
      setOverride((prev) => [...(prev ?? subjectiveQuestions), question]),
    [setOverride],
  );

  const update = useCallback(
    (id: string, question: SubjectiveQuestion) =>
      setOverride((prev) =>
        (prev ?? subjectiveQuestions).map((q) => (q.id === id ? question : q)),
      ),
    [setOverride],
  );

  const remove = useCallback(
    (id: string) =>
      setOverride((prev) => (prev ?? subjectiveQuestions).filter((q) => q.id !== id)),
    [setOverride],
  );

  const reset = useCallback(() => setOverride(NONE), [setOverride]);

  return { list, add, update, remove, reset, isOverridden };
}
