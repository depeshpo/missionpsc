import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { getPapers } from "@/lib/db/syllabus";
import { getQuestions } from "@/lib/db/subjective";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [papers, list] = await Promise.all([getPapers(), getQuestions()]);
  return (
    <AdminPageShell
      floatCrumbs
      title="Edit question"
      description="Update this question. Changes show on the public Answer Writing pages."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Questions", href: "/admin/questions" },
        { label: "Edit" },
      ]}
    >
      <QuestionForm id={id} papers={papers} list={list} />
    </AdminPageShell>
  );
}
