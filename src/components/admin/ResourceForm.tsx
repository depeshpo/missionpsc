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
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMounted } from "@/lib/hooks/useMounted";
import { useResourcesAdmin, resourceCategories } from "@/lib/hooks/useResources";
import { makeResourceId } from "@/data/resources";

type Draft = { title: string; url: string; category: string; description: string };

const blank: Draft = { title: "", url: "", category: "", description: "" };

/** Create (no `id`) or edit (with `id`) a single resource. Persists to the override. */
export function ResourceForm({ id }: { id?: string }) {
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
  return <ResourceFormInner id={id} />;
}

function ResourceFormInner({ id }: { id?: string }) {
  const router = useRouter();
  const { list, add, update } = useResourcesAdmin();
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

  function handleSubmit(e: React.FormEvent) {
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
    if (editing) update(id!, resource);
    else add(resource);
    router.push("/admin/resources");
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

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={!canSave}>
              {editing ? "Save changes" : "Add resource"}
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
