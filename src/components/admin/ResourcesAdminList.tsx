"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Trash2, Library } from "lucide-react";
import type { Resource } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { resourceCategories } from "@/data/resources";
import { deleteResource } from "@/app/(dashboard)/admin/resources/actions";
import { toast } from "@/lib/toast";

/** Admin manage view for the resources collection (from the DB): edit/delete rows. */
export function ResourcesAdminList({ resources }: { resources: Resource[] }) {
  const router = useRouter();
  const list = resources;

  if (list.length === 0) {
    return (
      <EmptyState
        icon={Library}
        title="No resources yet"
        description="Add your first resource to show it on the public Resources page."
        action={
          <Link href="/admin/resources/new" className="text-sm font-medium text-primary">
            New resource
          </Link>
        }
      />
    );
  }

  const groups = resourceCategories(list).map((category) => ({
    category,
    items: list.filter((r) => r.category === category),
  }));

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This removes it from the public page.`)) return;
    const res = await deleteResource(id);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success("Resource deleted");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {list.length} resource{list.length === 1 ? "" : "s"}
      </p>

      {groups.map((group) => (
        <section key={group.category} className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {group.category}
          </h2>
          <div className="space-y-2">
            {group.items.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium hover:text-primary"
                    >
                      {r.title}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </a>
                    {r.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/resources/${r.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`Edit ${r.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.title)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
                      aria-label={`Delete ${r.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
