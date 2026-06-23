"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileX } from "lucide-react";
import type { CurrentAffairItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMounted } from "@/lib/hooks/useMounted";
import { useCurrentAffairsAdmin } from "@/lib/hooks/useCurrentAffairs";
import { makeCurrentAffairId } from "@/data/currentAffairs";

type Scope = "national" | "international";
type Draft = {
  title: string;
  date: string;
  scope: Scope;
  summary: string;
  body: string;
  tags: string;
  sourceTitle: string;
  sourceHref: string;
};

const blank = (defaultDate: string): Draft => ({
  title: "",
  date: defaultDate,
  scope: "national",
  summary: "",
  body: "",
  tags: "",
  sourceTitle: "",
  sourceHref: "",
});

/** Create (no `id`) or edit (with `id`) a current-affairs item. Persists to the override. */
export function CurrentAffairForm({
  id,
  defaultDate = "",
}: {
  id?: string;
  defaultDate?: string;
}) {
  // Gate behind mount so the inner form initialises its draft from the hydrated
  // override rather than the seed (the useState initialiser runs only once).
  const mounted = useMounted();
  if (!mounted) {
    return (
      <Card>
        <CardContent className="space-y-5">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }
  return <CurrentAffairFormInner id={id} defaultDate={defaultDate} />;
}

function CurrentAffairFormInner({
  id,
  defaultDate,
}: {
  id?: string;
  defaultDate: string;
}) {
  const router = useRouter();
  const { list, add, update } = useCurrentAffairsAdmin();
  const editing = id != null;
  const existing = editing ? list.find((i) => i.id === id) : undefined;

  const [draft, setDraft] = useState<Draft>(() =>
    existing
      ? {
          title: existing.title,
          date: existing.date,
          scope: existing.scope,
          summary: existing.summary,
          body: (existing.body ?? []).join("\n\n"),
          tags: (existing.tags ?? []).join(", "),
          sourceTitle: existing.source?.title ?? "",
          sourceHref: existing.source?.href ?? "",
        }
      : blank(defaultDate),
  );

  if (editing && !existing) {
    return (
      <EmptyState
        icon={FileX}
        title="This item no longer exists"
        description="It may have been deleted. Head back to the list to manage current affairs."
        action={
          <Link
            href="/admin/current-affairs"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to current affairs
          </Link>
        }
      />
    );
  }

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const canSave =
    draft.title.trim() !== "" && draft.date.trim() !== "" && draft.summary.trim() !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = draft.title.trim();
    const date = draft.date.trim();
    const summary = draft.summary.trim();
    if (!title || !date || !summary) return;

    const body = draft.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const tags = draft.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const href = draft.sourceHref.trim();

    const item: CurrentAffairItem = {
      id: editing ? id! : makeCurrentAffairId(date, title, list.map((i) => i.id)),
      date,
      scope: draft.scope,
      title,
      summary,
      ...(body.length ? { body } : {}),
      ...(tags.length ? { tags } : {}),
      ...(href ? { source: { title: draft.sourceTitle.trim() || href, href } } : {}),
    };

    if (editing) update(id!, item);
    else add(item);
    router.push("/admin/current-affairs");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-5">
          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="e.g. Nepal addresses LDC graduation timeline at UN session"
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date" htmlFor="date" required>
              <Input
                id="date"
                type="date"
                value={draft.date}
                onChange={(e) => set({ date: e.target.value })}
                required
              />
            </Field>
            <Field label="Scope" htmlFor="scope">
              <Select
                id="scope"
                value={draft.scope}
                onChange={(e) => set({ scope: e.target.value as Scope })}
              >
                <option value="national">National</option>
                <option value="international">International</option>
              </Select>
            </Field>
          </div>

          <Field label="Summary" htmlFor="summary" required hint="Shown as the excerpt in the feed.">
            <Textarea
              id="summary"
              value={draft.summary}
              onChange={(e) => set({ summary: e.target.value })}
              placeholder="One or two sentences summarising the development."
              required
            />
          </Field>

          <Field
            label="Body"
            htmlFor="body"
            hint="Optional longer read. Separate paragraphs with a blank line."
          >
            <Textarea
              id="body"
              value={draft.body}
              onChange={(e) => set({ body: e.target.value })}
              className="min-h-40"
              placeholder={"First paragraph.\n\nSecond paragraph."}
            />
          </Field>

          <Field
            label="Tags"
            htmlFor="tags"
            hint="Optional, comma-separated. Powers the feed tag filter — e.g. UN, treaty, economic diplomacy."
          >
            <Input
              id="tags"
              value={draft.tags}
              onChange={(e) => set({ tags: e.target.value })}
              placeholder="UN, LDC, economic diplomacy"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Source title" htmlFor="sourceTitle" hint="Optional attribution label.">
              <Input
                id="sourceTitle"
                value={draft.sourceTitle}
                onChange={(e) => set({ sourceTitle: e.target.value })}
                placeholder="e.g. Ministry of Foreign Affairs"
              />
            </Field>
            <Field label="Source URL" htmlFor="sourceHref" hint="Optional link to the source.">
              <Input
                id="sourceHref"
                type="url"
                value={draft.sourceHref}
                onChange={(e) => set({ sourceHref: e.target.value })}
                placeholder="https://…"
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={!canSave}>
              {editing ? "Save changes" : "Add item"}
            </Button>
            <Link
              href="/admin/current-affairs"
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
