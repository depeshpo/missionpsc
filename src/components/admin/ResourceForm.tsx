"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileX } from "lucide-react";
import type { Resource } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/lib/toast";
import { resourceCategories, makeResourceId } from "@/data/resources";
import {
  createResource,
  updateResource,
} from "@/app/(dashboard)/admin/resources/actions";

type Draft = { title: string; url: string; category: string; description: string };

const blank: Draft = { title: "", url: "", category: "", description: "" };

/**
 * Create (no `id`) or edit (with `id`) a single resource, persisted to the DB
 * via server actions. `resources` (the current list, from the server page)
 * powers the category datalist and unique-id generation.
 */
export function ResourceForm({
  id,
  resources,
}: {
  id?: string;
  resources: Resource[];
}) {
  const router = useRouter();
  const list = resources;
  const editing = id != null;
  const existing = editing ? list.find((r) => r.id === id) : undefined;

  const [draft, setDraft] = useState<Draft>(() =>
    existing
      ? {
          title: existing.title,
          url: existing.url,
          category: existing.category,
          description: existing.description ?? "",
        }
      : blank,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing && !existing) {
    return (
      <EmptyState
        icon={FileX}
        title="This resource no longer exists"
        description="It may have been deleted. Head back to the list to manage resources."
        action={
          <Link
            href="/admin/resources"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to resources
          </Link>
        }
      />
    );
  }

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const canSave = draft.title.trim() !== "" && draft.url.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = draft.title.trim();
    const url = draft.url.trim();
    if (!title || !url) return;
    const resource: Resource = {
      id: editing ? id! : makeResourceId(title, list.map((r) => r.id)),
      title,
      category: draft.category.trim() || "Uncategorized",
      url,
      description: draft.description.trim() || undefined,
    };
    setSaving(true);
    setError(null);
    const res = editing ? await updateResource(resource) : await createResource(resource);
    setSaving(false);
    if ("error" in res) {
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(editing ? "Resource saved" : "Resource added");
    router.push("/admin/resources");
    router.refresh();
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
              placeholder="e.g. Vienna Convention on Diplomatic Relations, 1961"
              required
            />
          </Field>

          <Field label="URL" htmlFor="url" required hint="Link learners open in a new tab.">
            <Input
              id="url"
              type="url"
              value={draft.url}
              onChange={(e) => set({ url: e.target.value })}
              placeholder="https://…"
              required
            />
          </Field>

          <Field
            label="Category"
            htmlFor="category"
            hint="Groups the resource on the page. Pick an existing one or type a new category."
          >
            <Input
              id="category"
              list="resource-categories"
              value={draft.category}
              onChange={(e) => set({ category: e.target.value })}
              placeholder="e.g. Treaties"
            />
            <datalist id="resource-categories">
              {resourceCategories(list).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Description" htmlFor="description" hint="Optional one-line summary.">
            <Textarea
              id="description"
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="What this resource is and why it matters."
            />
          </Field>

          {error ? (
            <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={!canSave || saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add resource"}
            </Button>
            <Link
              href="/admin/resources"
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
