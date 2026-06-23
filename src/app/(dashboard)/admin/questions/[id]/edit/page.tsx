import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { QuestionForm } from "@/components/admin/QuestionForm";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AdminPageShell
      title="Edit question"
      description="Update this question. Changes show on the public Answer Writing pages."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Questions", href: "/admin/questions" },
        { label: "Edit" },
      ]}
    >
      <QuestionForm id={id} />
    </AdminPageShell>
  );
}
