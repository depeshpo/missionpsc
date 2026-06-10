import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { answerablePapers, questionsByPaper } from "@/data/subjective";
import { AttemptedCount } from "@/components/answers/AttemptedBadge";

export default function AnswersPage() {
  const papers = answerablePapers();

  return (
    <PageShell
      title="Answer Writing"
      description="Stage II subjective practice — read the prompt and model answer, then draft and save your own answer."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {papers.map((paper) => {
          const questions = questionsByPaper(paper.id);
          return (
            <Link key={paper.id} href={`/answers/${paper.id}`} className="group block">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="primary">Paper {paper.code}</Badge>
                    <span className="text-sm font-medium tabular-nums text-muted-foreground">
                      {questions.length} question{questions.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="flex-1 font-semibold leading-tight">{paper.title}</p>
                  <AttemptedCount questionIds={questions.map((q) => q.id)} />
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Practice
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
