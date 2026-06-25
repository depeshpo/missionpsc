import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminSyllabusList } from "@/components/admin/AdminSyllabusList";
import { STAGES } from "@/data/syllabus";
import { getPapers } from "@/lib/db/syllabus";

export default async function AdminSyllabusPage() {
  const papers = await getPapers();
  return (
    <AdminPageShell
      title="Syllabus"
      description="Manage papers, sections and units."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Syllabus" },
      ]}
      actions={
        <Link
          href="/admin/syllabus/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          New paper
        </Link>
      }
    >
      <AdminSyllabusList stages={STAGES} papers={papers} />
    </AdminPageShell>
  );
}
