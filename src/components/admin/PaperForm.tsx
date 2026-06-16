"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Info, Check, X } from "lucide-react";
import type { Paper, PaperCode, Section, Stage, Unit } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSyllabusPaper } from "@/lib/hooks/useSyllabusPaper";
import { useMounted } from "@/lib/hooks/useMounted";

// --- Author-friendly draft shapes (ids carried so edits preserve identity) ---
type UnitDraft = { id?: string; number: string; title: string; subtopics: string[] };
type SectionDraft = {
  id?: string;
  label: string;
  marks: string;
  pattern: string;
  units: UnitDraft[];
};
type PaperDraft = {
  stage: Stage;
  code: PaperCode;
  title: string;
  totalMarks: string;
  durationMins: string;
  note: string;
  sections: SectionDraft[];
};

const STAGE_OPTIONS: { value: Stage; label: string }[] = [
  { value: "main", label: "Main" },
  { value: "interview", label: "Interview" },
];
const CODE_OPTIONS: PaperCode[] = ["I", "II", "III", "IV", "V"];

function emptyUnit(): UnitDraft {
  return { number: "", title: "", subtopics: [""] };
}
function emptySection(): SectionDraft {
  return { label: "", marks: "", pattern: "", units: [emptyUnit()] };
}

function toDraft(paper?: Paper): PaperDraft {
  if (!paper) {
    return {
      stage: "main",
      code: "II",
      title: "",
      totalMarks: "100",
      durationMins: "180",
      note: "",
      sections: [emptySection()],
    };
  }
  return {
    stage: paper.stage,
    code: paper.code,
    title: paper.title,
    totalMarks: String(paper.totalMarks),
    durationMins: paper.durationMins != null ? String(paper.durationMins) : "",
    note: paper.note ?? "",
    sections: paper.sections.map((s) => ({
      id: s.id,
      label: s.label,
      marks: String(s.marks),
      pattern: s.pattern ?? "",
      units: s.units.map((u) => ({
        id: u.id,
        number: u.number,
        title: u.title,
        subtopics: u.subtopics.length ? [...u.subtopics] : [""],
      })),
    })),
  };
}

// Build a typed Paper from the draft. Preserves carried ids; generates fresh
// ones for newly added sections/units (called from a submit handler, never
// during render, so crypto.randomUUID is fine).
function draftToPaper(draft: PaperDraft, base?: Paper): Paper {
  const paperId = base?.id ?? `${draft.stage}-p${draft.code.toLowerCase()}`;
  const sections: Section[] = draft.sections.map((s) => {
    const sectionId = s.id ?? `${paperId}-s-${crypto.randomUUID().slice(0, 8)}`;
    const units: Unit[] = s.units.map((u) => ({
      id: u.id ?? `${sectionId}-u-${crypto.randomUUID().slice(0, 8)}`,
      sectionId,
      number: u.number.trim(),
      title: u.title.trim(),
      subtopics: u.subtopics.map((t) => t.trim()).filter(Boolean),
    }));
    return {
      id: sectionId,
      paperId,
      label: s.label.trim(),
      marks: Number(s.marks) || 0,
      pattern: s.pattern.trim() || undefined,
      units,
    };
  });
  return {
    id: paperId,
    stage: draft.stage,
    code: draft.code,
    title: draft.title.trim(),
    totalMarks: Number(draft.totalMarks) || 0,
    durationMins: draft.durationMins.trim() ? Number(draft.durationMins) : undefined,
    note: draft.note.trim() || undefined,
    sections,
  };
}

/**
 * Syllabus paper editor. Edit mode persists to the syllabus override store;
 * create mode (`/admin/syllabus/new`) stays a non-persisting preview for now.
 */
export function PaperForm({ initial }: { initial?: Paper }) {
  if (initial) return <EditPaperForm seed={initial} />;
  return <PaperFormEditor mode="create" onSave={() => {}} />;
}

/**
 * Edit wrapper: loads the current (override-or-seed) paper and gates the inner
 * form behind mount, so its one-time draft initialises from hydrated data.
 */
function EditPaperForm({ seed }: { seed: Paper }) {
  const { paper, update } = useSyllabusPaper(seed);
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return <PaperFormEditor mode="edit" current={paper} onSave={update} />;
}

function PaperFormEditor({
  mode,
  current,
  onSave,
}: {
  mode: "create" | "edit";
  current?: Paper;
  onSave: (paper: Paper) => void;
}) {
  const [draft, setDraft] = useState<PaperDraft>(() => toDraft(current));
  const [saved, setSaved] = useState(false);
  const persists = mode === "edit";

  // Stable id of the paper being edited (or derived preview id for create).
  const paperId = current?.id ?? `${draft.stage}-p${draft.code.toLowerCase()}`;

  function setPaper<K extends keyof PaperDraft>(key: K, value: PaperDraft[K]) {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateSection(si: number, patch: Partial<SectionDraft>) {
    setSaved(false);
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === si ? { ...s, ...patch } : s)),
    }));
  }
  function addSection() {
    setSaved(false);
    setDraft((d) => ({ ...d, sections: [...d.sections, emptySection()] }));
  }
  function removeSection(si: number) {
    setSaved(false);
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, i) => i !== si) }));
  }

  function updateUnit(si: number, ui: number, patch: Partial<UnitDraft>) {
    setSaved(false);
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) =>
        i !== si
          ? s
          : { ...s, units: s.units.map((u, j) => (j === ui ? { ...u, ...patch } : u)) },
      ),
    }));
  }
  function addUnit(si: number) {
    setSaved(false);
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) =>
        i === si ? { ...s, units: [...s.units, emptyUnit()] } : s,
      ),
    }));
  }
  function removeUnit(si: number, ui: number) {
    setSaved(false);
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) =>
        i === si ? { ...s, units: s.units.filter((_, j) => j !== ui) } : s,
      ),
    }));
  }

  function setSubtopic(si: number, ui: number, ti: number, value: string) {
    updateUnit(si, ui, {
      subtopics: draft.sections[si].units[ui].subtopics.map((t, i) =>
        i === ti ? value : t,
      ),
    });
  }
  function addSubtopic(si: number, ui: number) {
    updateUnit(si, ui, { subtopics: [...draft.sections[si].units[ui].subtopics, ""] });
  }
  function removeSubtopic(si: number, ui: number, ti: number) {
    updateUnit(si, ui, {
      subtopics: draft.sections[si].units[ui].subtopics.filter((_, i) => i !== ti),
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(draftToPaper(draft, current));
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paper-level fields */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Paper</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Stage" htmlFor="stage" required>
              <Select
                id="stage"
                value={draft.stage}
                onChange={(e) => setPaper("stage", e.target.value as Stage)}
              >
                {STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Paper code" htmlFor="code" required>
              <Select
                id="code"
                value={draft.code}
                onChange={(e) => setPaper("code", e.target.value as PaperCode)}
              >
                {CODE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    Paper {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field
            label="Title"
            htmlFor="title"
            required
            hint={
              <>
                id will be <code className="font-mono">{paperId}</code>
              </>
            }
          >
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setPaper("title", e.target.value)}
              placeholder="e.g. Governance Systems"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Total marks" htmlFor="totalMarks" required>
              <Input
                id="totalMarks"
                type="number"
                value={draft.totalMarks}
                onChange={(e) => setPaper("totalMarks", e.target.value)}
              />
            </Field>
            <Field label="Duration (mins)" htmlFor="durationMins">
              <Input
                id="durationMins"
                type="number"
                value={draft.durationMins}
                onChange={(e) => setPaper("durationMins", e.target.value)}
                placeholder="e.g. 180"
              />
            </Field>
          </div>
          <Field label="Note" htmlFor="note" hint="Short tag shown under the title.">
            <Input
              id="note"
              value={draft.note}
              onChange={(e) => setPaper("note", e.target.value)}
              placeholder="e.g. Main · 10×10 · Sections A–D"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Sections ({draft.sections.length})
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addSection}>
            <Plus className="h-4 w-4" />
            Add section
          </Button>
        </div>

        {draft.sections.map((section, si) => (
          <Card key={si}>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Section {si + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(si)}
                  aria-label={`Remove section ${si + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Field label="Label" htmlFor={`s${si}-label`} required>
                <Input
                  id={`s${si}-label`}
                  value={section.label}
                  onChange={(e) => updateSection(si, { label: e.target.value })}
                  placeholder="e.g. Section A — State and Governance"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Marks" htmlFor={`s${si}-marks`} required>
                  <Input
                    id={`s${si}-marks`}
                    type="number"
                    value={section.marks}
                    onChange={(e) => updateSection(si, { marks: e.target.value })}
                  />
                </Field>
                <Field label="Pattern" htmlFor={`s${si}-pattern`}>
                  <Input
                    id={`s${si}-pattern`}
                    value={section.pattern}
                    onChange={(e) => updateSection(si, { pattern: e.target.value })}
                    placeholder="e.g. 10×3=30"
                  />
                </Field>
              </div>

              {/* Units */}
              <div className="space-y-3 border-l-2 border-border pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Units ({section.units.length})
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addUnit(si)}
                  >
                    <Plus className="h-4 w-4" />
                    Add unit
                  </Button>
                </div>

                {section.units.map((unit, ui) => (
                  <div
                    key={ui}
                    className="space-y-3 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-20 shrink-0">
                        <Field label="No." htmlFor={`s${si}-u${ui}-num`}>
                          <Input
                            id={`s${si}-u${ui}-num`}
                            value={unit.number}
                            onChange={(e) =>
                              updateUnit(si, ui, { number: e.target.value })
                            }
                            placeholder="1"
                          />
                        </Field>
                      </div>
                      <div className="flex-1">
                        <Field label="Unit title" htmlFor={`s${si}-u${ui}-title`}>
                          <Input
                            id={`s${si}-u${ui}-title`}
                            value={unit.title}
                            onChange={(e) =>
                              updateUnit(si, ui, { title: e.target.value })
                            }
                            placeholder="e.g. State and Governance"
                          />
                        </Field>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUnit(si, ui)}
                        aria-label="Remove unit"
                        className="mt-7 rounded-md p-1.5 text-muted-foreground hover:bg-border hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Subtopics */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Subtopics
                      </span>
                      {unit.subtopics.map((topic, ti) => (
                        <div key={ti} className="flex items-center gap-2">
                          <Input
                            value={topic}
                            onChange={(e) => setSubtopic(si, ui, ti, e.target.value)}
                            placeholder="A subtopic line"
                          />
                          <button
                            type="button"
                            onClick={() => removeSubtopic(si, ui, ti)}
                            aria-label="Remove subtopic"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-border hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addSubtopic(si, ui)}
                      >
                        <Plus className="h-4 w-4" />
                        Add subtopic
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save status */}
      {saved ? (
        persists ? (
          <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>Saved — changes are stored on this device.</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-border bg-accent/50 p-3 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Preview only — creating new papers isn&apos;t wired up yet. Editing an
              existing paper does persist.
            </span>
          </div>
        )
      ) : null}
      <div className="flex items-center gap-3">
        <Button type="submit">
          <Save className="h-4 w-4" />
          {persists ? "Save changes" : "Create paper"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {persists ? "Changes save to this device" : "UI preview · nothing is saved"}
        </span>
      </div>
    </form>
  );
}
