"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileX,
  Plus,
  Trash2,
  Upload,
  Video,
  FileText,
  Link2,
} from "lucide-react";
import type { Note, NoteFile, NoteLink, NoteSection, NoteVideo, Paper } from "@/lib/types";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/hooks/useMounted";
import { findUnit } from "@/lib/notes";
import { toast } from "@/lib/toast";
import { saveNote } from "@/app/(dashboard)/admin/notes/actions";
import { putNoteFile, deleteNoteFile } from "@/lib/noteFiles";
import { youtubeId } from "@/lib/youtube";
import { RichTextEditor } from "./RichTextEditor";
import { SortableList } from "./SortableList";

type SectionDraft = {
  id: string;
  heading: string;
  html: string;
  videos: NoteVideo[];
  files: NoteFile[];
  links: NoteLink[];
};
type Draft = {
  paperId: string;
  sectionId: string;
  unitId: string;
  title: string;
  sections: SectionDraft[];
};

function htmlText(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function newSection(): SectionDraft {
  return { id: crypto.randomUUID(), heading: "", html: "", videos: [], files: [], links: [] };
}

function freshDraft(papers: Paper[]): Draft {
  const paper = papers[0];
  const section = paper?.sections[0];
  return {
    paperId: paper?.id ?? "",
    sectionId: section?.id ?? "",
    unitId: section?.units[0]?.id ?? "",
    title: "",
    sections: [newSection()],
  };
}

/** Create (no `id`) or edit (with `id`) a note. Notes and papers come from the DB
 *  via the page. Owns the AdminPageShell so the header/breadcrumb title tracks the
 *  live draft title (and condenses on scroll).
 *
 *  The form is mount-gated: the draft mints ids with `crypto.randomUUID()` and
 *  dnd-kit assigns its own instance ids, neither of which can agree between a
 *  server render and the client one — rendering it only after mount avoids the
 *  hydration mismatch. */
export function NoteEditor({
  id,
  notes,
  papers,
}: {
  id?: string;
  notes: Note[];
  papers: Paper[];
}) {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <AdminPageShell
        floatCrumbs
        title={id ? "Edit note" : "New note"}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Notes", href: "/admin/notes" },
          { label: id ? "Edit" : "New" },
        ]}
      >
        <Card>
          <CardContent className="space-y-5">
            <Skeleton className="h-16" />
            <Skeleton className="h-40" />
          </CardContent>
        </Card>
      </AdminPageShell>
    );
  }
  return <NoteEditorInner id={id} notes={notes} papers={papers} />;
}

function NoteEditorInner({
  id,
  notes,
  papers,
}: {
  id?: string;
  notes: Note[];
  papers: Paper[];
}) {
  const router = useRouter();
  const editing = id != null;
  const existing = editing ? notes.find((n) => n.id === id) : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);

  const getPaper = (paperId: string) => papers.find((p) => p.id === paperId);

  const [draft, setDraft] = useState<Draft>(() => {
    if (!existing) return freshDraft(papers);
    const found = findUnit(papers, existing.unitId);
    return {
      paperId: found?.paper.id ?? "",
      sectionId: found?.section.id ?? "",
      unitId: existing.unitId,
      title: existing.title,
      sections: existing.sections.map((s) => ({
        id: s.id,
        heading: s.heading,
        html: s.html,
        videos: s.videos,
        files: s.files,
        links: s.links,
      })),
    };
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const title = draft.title.trim();
  const shellTitle = title || (editing ? "Edit note" : "New note");
  const crumbs = [
    { label: "Admin", href: "/admin" },
    { label: "Notes", href: "/admin/notes" },
    { label: shellTitle },
  ];

  if (editing && !existing) {
    return (
      <AdminPageShell floatCrumbs title={shellTitle} breadcrumbs={crumbs}>
        <EmptyState
          icon={FileX}
          title="This note no longer exists"
          description="It may have been deleted. Head back to the list to manage notes."
          action={
            <Link
              href="/admin/notes"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to notes
            </Link>
          }
        />
      </AdminPageShell>
    );
  }

  // --- unit picker (create mode) ---
  const syllabusSections = getPaper(draft.paperId)?.sections ?? [];
  const units = syllabusSections.find((s) => s.id === draft.sectionId)?.units ?? [];
  const setPaper = (paperId: string) => {
    const first = getPaper(paperId)?.sections[0];
    setDraft((d) => ({ ...d, paperId, sectionId: first?.id ?? "", unitId: first?.units[0]?.id ?? "" }));
  };
  const setSyllabusSection = (sectionId: string) => {
    const sec = getPaper(draft.paperId)?.sections.find((s) => s.id === sectionId);
    setDraft((d) => ({ ...d, sectionId, unitId: sec?.units[0]?.id ?? "" }));
  };

  // --- section ops ---
  const patchSection = (sid: string, patch: Partial<SectionDraft>) =>
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === sid ? { ...s, ...patch } : s)),
    }));
  const reorderSections = (sections: SectionDraft[]) => setDraft((d) => ({ ...d, sections }));
  const addSection = () => setDraft((d) => ({ ...d, sections: [...d.sections, newSection()] }));
  const removeSection = (sid: string) => {
    const sec = draft.sections.find((s) => s.id === sid);
    if (sec) void deleteNoteFile(...sec.files.map((f) => f.ref));
    setDraft((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== sid) }));
  };

  // --- video ops ---
  const setVideos = (sid: string, videos: NoteVideo[]) => patchSection(sid, { videos });
  const addVideo = (sid: string) => {
    const sec = draft.sections.find((s) => s.id === sid);
    if (sec) setVideos(sid, [...sec.videos, { id: crypto.randomUUID(), url: "" }]);
  };

  // --- link ops ---
  const setLinks = (sid: string, links: NoteLink[]) => patchSection(sid, { links });
  const addLink = (sid: string) => {
    const sec = draft.sections.find((s) => s.id === sid);
    if (sec) setLinks(sid, [...sec.links, { id: crypto.randomUUID(), title: "", url: "" }]);
  };

  // --- file ops ---
  const setFiles = (sid: string, files: NoteFile[]) => patchSection(sid, { files });
  // Uploads go to Supabase Storage, so they can fail (network, RLS, size limit) —
  // surface that rather than dropping the file silently.
  async function handleFiles(sid: string, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading((u) => ({ ...u, [sid]: true }));
    setUploadError(null);

    const added: NoteFile[] = [];
    for (const file of Array.from(fileList)) {
      try {
        const ref = await putNoteFile(file);
        added.push({
          id: crypto.randomUUID(),
          name: file.name,
          mime: file.type || "application/octet-stream",
          size: file.size,
          ref,
        });
      } catch (err) {
        setUploadError(
          `Couldn't upload ${file.name}: ${err instanceof Error ? err.message : "upload failed"}`,
        );
      }
    }

    setUploading((u) => {
      const next = { ...u };
      delete next[sid];
      return next;
    });
    if (added.length) {
      setDraft((d) => ({
        ...d,
        sections: d.sections.map((s) =>
          s.id === sid ? { ...s, files: [...s.files, ...added] } : s,
        ),
      }));
    }
  }
  const removeFile = (sid: string, file: NoteFile) => {
    void deleteNoteFile(file.ref);
    const sec = draft.sections.find((s) => s.id === sid);
    if (sec) setFiles(sid, sec.files.filter((f) => f.id !== file.id));
  };

  const keptSections = draft.sections.filter((s) => htmlText(s.html) !== "");
  const canSave = title !== "" && draft.unitId !== "" && keptSections.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave || saving) return;
    const sections: NoteSection[] = keptSections.map((s) => ({
      id: s.id,
      heading: s.heading.trim(),
      html: s.html,
      videos: s.videos.filter((v) => v.url.trim() !== "").map((v) => ({ ...v, url: v.url.trim() })),
      files: s.files,
      links: s.links
        .filter((l) => l.url.trim() !== "")
        .map((l) => ({ ...l, title: l.title.trim() || l.url.trim(), url: l.url.trim() })),
    }));
    const note: Note = {
      id: `note-${draft.unitId}`,
      unitId: draft.unitId,
      title,
      sections,
    };

    setSaving(true);
    setSaveError(null);
    const res = await saveNote(note);
    if ("error" in res) {
      setSaveError(res.error);
      toast.error(res.error);
      setSaving(false);
      return;
    }
    toast.success(editing ? "Note saved" : "Note added");
    router.push("/admin/notes");
    router.refresh();
  }

  const existingUnit = editing ? findUnit(papers, draft.unitId) : undefined;

  return (
    <AdminPageShell floatCrumbs title={shellTitle} breadcrumbs={crumbs}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* hidden file input shared by all section dropzones */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const sid = uploadTarget.current;
            if (sid) void handleFiles(sid, e.target.files);
            e.target.value = "";
          }}
        />

        <Card>
          <CardContent className="space-y-5">
            {editing ? (
              <Field label="Unit" hint="A note is identified by its unit; create a new note to use a different unit.">
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                  {existingUnit
                    ? `Paper ${existingUnit.paper.code} · ${existingUnit.section.label} · ${
                        existingUnit.unit.number !== "—" ? `${existingUnit.unit.number}. ` : ""
                      }${existingUnit.unit.title}`
                    : draft.unitId}
                </div>
              </Field>
            ) : (
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Paper" htmlFor="paper" required>
                  <Select id="paper" value={draft.paperId} onChange={(e) => setPaper(e.target.value)}>
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
                    onChange={(e) => setSyllabusSection(e.target.value)}
                  >
                    {syllabusSections.length === 0 ? <option value="">No sections</option> : null}
                    {syllabusSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Unit" htmlFor="unit" required>
                  <Select
                    id="unit"
                    value={draft.unitId}
                    onChange={(e) => setDraft((d) => ({ ...d, unitId: e.target.value }))}
                  >
                    {units.length === 0 ? <option value="">No units</option> : null}
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.number !== "—" ? `${u.number}. ` : ""}
                        {u.title}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            )}

            <Field label="Main title" htmlFor="title" required>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Constitution and Law"
                required
              />
            </Field>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-tight">
              Subtitles{" "}
              <span className="font-normal text-muted-foreground">({draft.sections.length})</span>
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addSection}>
              <Plus className="h-4 w-4" />
              Add subtitle
            </Button>
          </div>

          <SortableList
            items={draft.sections}
            onReorder={reorderSections}
            handleLabel="Drag to reorder subtitle"
            renderItem={(section, index) => (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Subtitle {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
                    aria-label={`Remove subtitle ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Field label="Subtitle heading" htmlFor={`heading-${section.id}`}>
                  <Input
                    id={`heading-${section.id}`}
                    value={section.heading}
                    onChange={(e) => patchSection(section.id, { heading: e.target.value })}
                    placeholder="e.g. Guiding principles"
                  />
                </Field>

                <Field label="Content" required>
                  <RichTextEditor
                    key={section.id}
                    initialHtml={section.html}
                    onChange={(html) => patchSection(section.id, { html })}
                  />
                </Field>

                {/* Videos */}
                <Collection
                  icon={Video}
                  label="YouTube videos"
                  count={section.videos.length}
                  onAdd={() => addVideo(section.id)}
                  addLabel="Add video"
                >
                  <SortableList
                    items={section.videos}
                    onReorder={(videos) => setVideos(section.id, videos)}
                    handleLabel="Drag to reorder video"
                    renderItem={(v) => (
                      <div className="flex items-center gap-2">
                        <Input
                          value={v.url}
                          onChange={(e) =>
                            setVideos(
                              section.id,
                              section.videos.map((x) => (x.id === v.id ? { ...x, url: e.target.value } : x)),
                            )
                          }
                          placeholder="YouTube URL"
                        />
                        {youtubeId(v.url) ? (
                          <span className="shrink-0 text-xs text-success">embeds ✓</span>
                        ) : v.url.trim() ? (
                          <span className="shrink-0 text-xs text-warning">not a YT url</span>
                        ) : null}
                        <RemoveBtn
                          label="Remove video"
                          onClick={() =>
                            setVideos(section.id, section.videos.filter((x) => x.id !== v.id))
                          }
                        />
                      </div>
                    )}
                  />
                </Collection>

                {/* Files */}
                <Collection
                  icon={FileText}
                  label="Attachments"
                  count={section.files.length}
                  onAdd={() => {
                    uploadTarget.current = section.id;
                    fileInputRef.current?.click();
                  }}
                  addLabel="Upload"
                >
                  <Dropzone onFiles={(files) => handleFiles(section.id, files)} />
                  {uploading[section.id] ? (
                    <p className="mt-2 text-xs text-muted-foreground">Uploading…</p>
                  ) : null}
                  {uploadError ? (
                    <p className="mt-2 text-xs text-warning">{uploadError}</p>
                  ) : null}
                  <SortableList
                    items={section.files}
                    onReorder={(files) => setFiles(section.id, files)}
                    handleLabel="Drag to reorder attachment"
                    className="mt-2"
                    renderItem={(f) => (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                        <RemoveBtn label="Remove attachment" onClick={() => removeFile(section.id, f)} />
                      </div>
                    )}
                  />
                </Collection>

                {/* Links */}
                <Collection
                  icon={Link2}
                  label="Reference links"
                  count={section.links.length}
                  onAdd={() => addLink(section.id)}
                  addLabel="Add link"
                >
                  <SortableList
                    items={section.links}
                    onReorder={(links) => setLinks(section.id, links)}
                    handleLabel="Drag to reorder link"
                    renderItem={(l) => (
                      <div className="grid items-center gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
                        <Input
                          value={l.title}
                          onChange={(e) =>
                            setLinks(
                              section.id,
                              section.links.map((x) => (x.id === l.id ? { ...x, title: e.target.value } : x)),
                            )
                          }
                          placeholder="Label"
                        />
                        <Input
                          value={l.url}
                          onChange={(e) =>
                            setLinks(
                              section.id,
                              section.links.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)),
                            )
                          }
                          placeholder="https://…"
                        />
                        <RemoveBtn
                          label="Remove link"
                          onClick={() => setLinks(section.id, section.links.filter((x) => x.id !== l.id))}
                        />
                      </div>
                    )}
                  />
                </Collection>
              </div>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Each subtitle needs content to be saved; empty subtitles are dropped. Videos, attachments
            and links are optional and reorderable by dragging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!canSave || saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add note"}
          </Button>
          <Link
            href="/admin/notes"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
          {saveError ? <p className="text-sm text-warning">{saveError}</p> : null}
        </div>
      </form>
    </AdminPageShell>
  );
}

function Collection({
  icon: Icon,
  label,
  count,
  onAdd,
  addLabel,
  children,
}: {
  icon: typeof FileText;
  label: string;
  count: number;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium">
          {label} <span className="text-muted-foreground">({count})</span>
        </span>
        <Button type="button" variant="ghost" size="sm" className="ml-auto h-7" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </Button>
      </div>
      {children}
    </div>
  );
}

function RemoveBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function Dropzone({ onFiles }: { onFiles: (files: FileList) => void }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-4 text-xs text-muted-foreground transition-colors",
        over ? "border-primary bg-primary/5 text-foreground" : "border-border",
      )}
    >
      <Upload className="h-4 w-4" />
      Drag &amp; drop files here, or use Upload above
    </div>
  );
}
