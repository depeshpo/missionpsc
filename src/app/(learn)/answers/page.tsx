import { PageShell } from "@/components/layout/PageShell";
import { AnswersIndex } from "@/components/answers/AnswersIndex";

export default function AnswersPage() {
  return (
    <PageShell
      title="Answer Writing"
      description="Stage II subjective practice — read the prompt and model answer, then draft and save your own answer."
    >
      <AnswersIndex />
    </PageShell>
  );
}
