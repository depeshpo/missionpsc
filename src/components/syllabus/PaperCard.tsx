import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Paper } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Coverage } from "./Coverage";

/** Index-page card for one paper: code, title, weight, and live coverage. */
export function PaperCard({ paper }: { paper: Paper }) {
  const unitIds = paper.sections.flatMap((s) => s.units.map((u) => u.id));
  const sectionCount = paper.sections.length;

  return (
    <Link href={`/syllabus/${paper.id}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="primary">Paper {paper.code}</Badge>
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {paper.totalMarks} marks
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold leading-tight">{paper.title}</p>
            {paper.note ? (
              <p className="mt-1 text-xs text-muted-foreground">{paper.note}</p>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {sectionCount} section{sectionCount > 1 ? "s" : ""} · {unitIds.length} units
          </p>
          <Coverage unitIds={unitIds} />
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Open paper
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
