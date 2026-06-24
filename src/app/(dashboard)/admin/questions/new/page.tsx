import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { QuestionForm } from "@/components/admin/QuestionForm";

export default function NewQuestionPage() {
  return (
    <AdminPageShell
      floatCrumbs
      title="New question"
      description="Add a subjective question to the answer-writing bank."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Questions", href: "/admin/questions" },
        { label: "New" },
      ]}
    >
      <QuestionForm />
    </AdminPageShell>
  );
}
