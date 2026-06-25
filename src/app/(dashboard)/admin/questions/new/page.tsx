import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { getPapers } from "@/lib/db/syllabus";
import { getQuestions } from "@/lib/db/subjective";

export default async function NewQuestionPage() {
  const [papers, list] = await Promise.all([getPapers(), getQuestions()]);
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
      <QuestionForm papers={papers} list={list} />
    </AdminPageShell>
  );
}
