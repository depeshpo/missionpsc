import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { NotesAdminList } from "@/components/admin/NotesAdminList";

export default function AdminNotesPage() {
  return (
    <AdminPageShell
      title="Notes"
      description="Manage the study notes learners read, organised by syllabus unit."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Notes" },
      ]}
      actions={
        <Link
          href="/admin/notes/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          New note
        </Link>
      }
    >
      <NotesAdminList />
    </AdminPageShell>
  );
}
