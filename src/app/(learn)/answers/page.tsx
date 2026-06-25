import { PageShell } from "@/components/layout/PageShell";
import { AnswersIndex } from "@/components/answers/AnswersIndex";
import { getPapers } from "@/lib/db/syllabus";
import { getQuestions } from "@/lib/db/subjective";

export default async function AnswersPage() {
  const [papers, list] = await Promise.all([getPapers(), getQuestions()]);
  const answerable = papers.filter((p) => list.some((q) => q.paperId === p.id));
  return (
    <PageShell
      title="Answer Writing"
      description="Stage II subjective practice — read the prompt and model answer, then draft and save your own answer."
    >
      <AnswersIndex papers={answerable} list={list} />
    </PageShell>
  );
}
