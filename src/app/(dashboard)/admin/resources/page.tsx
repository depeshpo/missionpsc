import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ResourcesAdminList } from "@/components/admin/ResourcesAdminList";
import { getResources } from "@/lib/db/resources";

export default async function AdminResourcesPage() {
  const resources = await getResources();
  return (
    <AdminPageShell
      title="Resources"
      description="Manage the curated links learners see on the Resources page."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Resources" },
      ]}
      actions={
        <Link
          href="/admin/resources/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          New resource
        </Link>
      }
    >
      <ResourcesAdminList resources={resources} />
    </AdminPageShell>
  );
}
