"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileX } from "lucide-react";
import type { Paper, QuestionKind, SubjectiveQuestion } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { kindLabel, makeQuestionId } from "@/data/subjective";
import { toast } from "@/lib/toast";
import {
  createQuestion,
  updateQuestion,
} from "@/app/(dashboard)/admin/questions/actions";

const KINDS: QuestionKind[] = [
  "qa",
  "essay",
  "translation",
  "precis",
  "comprehension",
  "correspondence",
];

type Draft = {
  paperId: string;
  sectionId: string;
  kind: QuestionKind;
  marks: string;
  prompt: string;
  passage: string;
  wordTarget: string;
  modelAnswer: string;
  keywords: string;
};

function blankDraft(papers: Paper[]): Draft {
  const firstPaper = papers[0];
  return {
    paperId: firstPaper?.id ?? "",
    sectionId: firstPaper?.sections[0]?.id ?? "",
    kind: "qa",
    marks: "10",
    prompt: "",
    passage: "",
    wordTarget: "",
    modelAnswer: "",
    keywords: "",
  };
}

/**
 * Create (no `id`) or edit (with `id`) a subjective question, persisted to the DB
 * via server actions. `papers` (from the DB) powers the paper→section picker;
 * `list` powers unique-id generation + edit prefill.
 */
export function QuestionForm({
  id,
  papers,
  list,
}: {
  id?: string;
  papers: Paper[];
  list: SubjectiveQuestion[];
}) {
  const router = useRouter();
  const editing = id != null;
  const existing = editing ? list.find((q) => q.id === id) : undefined;
  const getPaper = (pid: string) => papers.find((p) => p.id === pid);

  const [draft, setDraft] = useState<Draft>(() =>
    existing
      ? {
          paperId: existing.paperId,
          sectionId: existing.sectionId,
          kind: existing.kind,
          marks: String(existing.marks),
          prompt: existing.prompt,
          passage: existing.passage ?? "",
          wordTarget: existing.wordTarget ? String(existing.wordTarget) : "",
          modelAnswer: existing.modelAnswer ?? "",
          keywords: existing.keywords.join(", "),
        }
      : blankDraft(papers),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing && !existing) {
    return (
      <EmptyState
        icon={FileX}
        title="This question no longer exists"
        description="It may have been deleted. Head back to the list to manage questions."
        action={
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to questions
          </Link>
        }
      />
    );
  }

  const sections = getPaper(draft.paperId)?.sections ?? [];

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  // Changing the paper resets the section to that paper's first section.
  const setPaper = (paperId: string) =>
    setDraft((d) => ({
      ...d,
      paperId,
      sectionId: getPaper(paperId)?.sections[0]?.id ?? "",
    }));

  const canSave =
    draft.paperId !== "" &&
    draft.sectionId !== "" &&
    draft.prompt.trim() !== "" &&
    Number(draft.marks) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    const keywords = draft.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    const passage = draft.passage.trim();
    const modelAnswer = draft.modelAnswer.trim();
    const wordTarget = Number(draft.wordTarget);

    const question: SubjectiveQuestion = {
      id: editing ? id! : makeQuestionId(draft.paperId, list.map((q) => q.id)),
      paperId: draft.paperId,
      sectionId: draft.sectionId,
      kind: draft.kind,
      marks: Number(draft.marks),
      prompt: draft.prompt.trim(),
      keywords,
      ...(passage ? { passage } : {}),
      ...(wordTarget > 0 ? { wordTarget } : {}),
      ...(modelAnswer ? { modelAnswer } : {}),
    };

    setSaving(true);
    setError(null);
    const res = editing
      ? await updateQuestion(question)
      : await createQuestion(question);
    setSaving(false);
    if ("error" in res) {
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(editing ? "Question saved" : "Question added");
    router.push("/admin/questions");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Paper" htmlFor="paper" required>
              <Select
                id="paper"
                value={draft.paperId}
                onChange={(e) => setPaper(e.target.value)}
              >
                {papers.map((p) => (
                  <option key={p.id} value={p.id}>
                    Paper {p.code} — {p.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Section" htmlFor="section" required>
              <Select
                id="section"
                value={draft.sectionId}
                onChange={(e) => set({ sectionId: e.target.value })}
              >
                {sections.length === 0 ? <option value="">No sections</option> : null}
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Kind" htmlFor="kind">
              <Select
                id="kind"
                value={draft.kind}
                onChange={(e) => set({ kind: e.target.value as QuestionKind })}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {kindLabel(k)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Marks" htmlFor="marks" required>
              <Input
                id="marks"
                type="number"
                min={1}
                value={draft.marks}
                onChange={(e) => set({ marks: e.target.value })}
              />
            </Field>
            <Field label="Word target" htmlFor="wordTarget" hint="Optional.">
              <Input
                id="wordTarget"
                type="number"
                min={0}
                value={draft.wordTarget}
                onChange={(e) => set({ wordTarget: e.target.value })}
                placeholder="e.g. 250"
              />
            </Field>
          </div>

          <Field label="Prompt" htmlFor="prompt" required>
            <Textarea
              id="prompt"
              value={draft.prompt}
              onChange={(e) => set({ prompt: e.target.value })}
              placeholder="The question as the candidate reads it."
            />
          </Field>

          <Field
            label="Passage"
            htmlFor="passage"
            hint="Optional source text for translation / précis / comprehension."
          >
            <Textarea
              id="passage"
              value={draft.passage}
              onChange={(e) => set({ passage: e.target.value })}
            />
          </Field>

          <Field
            label="Model answer"
            htmlFor="modelAnswer"
            hint="Optional reference answer or template. Blank lines separate paragraphs."
          >
            <Textarea
              id="modelAnswer"
              value={draft.modelAnswer}
              onChange={(e) => set({ modelAnswer: e.target.value })}
              className="min-h-32"
            />
          </Field>

          <Field
            label="Keywords"
            htmlFor="keywords"
            hint="Optional, comma-separated — shown as marking-cue badges."
          >
            <Input
              id="keywords"
              value={draft.keywords}
              onChange={(e) => set({ keywords: e.target.value })}
              placeholder="accountability, federalism, rule of law"
            />
          </Field>

          {error ? (
            <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={!canSave || saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add question"}
            </Button>
            <Link
              href="/admin/questions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
