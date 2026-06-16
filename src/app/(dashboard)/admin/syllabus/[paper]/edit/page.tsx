import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { PaperForm } from "@/components/admin/PaperForm";
import { getPaper } from "@/data/syllabus";

export default async function EditPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  const paper = getPaper(paperId);
  if (!paper) notFound();

  return (
    <AdminPageShell
      title={`Edit ${paper.title}`}
      description={`Paper ${paper.code} · ${paper.totalMarks} marks`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Syllabus", href: "/admin/syllabus" },
        { label: `Paper ${paper.code}`, href: `/admin/syllabus/${paper.id}` },
        { label: "Edit" },
      ]}
    >
      <PaperForm initial={paper} />
    </AdminPageShell>
  );
}
