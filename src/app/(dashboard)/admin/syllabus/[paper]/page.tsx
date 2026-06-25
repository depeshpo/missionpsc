import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { PaperOverview } from "@/components/admin/PaperOverview";
import { getPaper } from "@/lib/db/syllabus";

export default async function PaperOverviewPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  const paper = await getPaper(paperId);
  if (!paper) notFound();

  return (
    <AdminPageShell
      title={paper.title}
      description={`Paper ${paper.code} · ${paper.totalMarks} marks`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Syllabus", href: "/admin/syllabus" },
        { label: `Paper ${paper.code}` },
      ]}
      actions={
        <Link
          href={`/admin/syllabus/${paper.id}/edit`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pencil className="h-4 w-4" />
          Edit paper
        </Link>
      }
    >
      <PaperOverview paper={paper} />
    </AdminPageShell>
  );
}
