import Link from "next/link";
import { ArrowRight, BookOpen, Map, PenLine, Layers } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { STAGES, papersByStage, allUnits } from "@/data/syllabus";

const quickLinks = [
  { href: "/syllabus", label: "Syllabus Map", icon: Map, desc: "Track coverage across all papers" },
  { href: "/notes", label: "Notes", icon: BookOpen, desc: "Read study material by unit" },
  { href: "/answers", label: "Answer Writing", icon: PenLine, desc: "Stage II 10×10 practice" },
  { href: "/flashcards", label: "Flashcards", icon: Layers, desc: "Terms, treaties, organizations" },
];

export default function DashboardPage() {
  return (
    <PageShell
      title="Welcome back"
      description="Nepal Lok Sewa — Section Officer (Foreign Service). Your prep dashboard."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {STAGES.map((stage) => {
          const papers = papersByStage(stage.id);
          const marks = papers.reduce((sum, p) => sum + p.totalMarks, 0);
          return (
            <Card key={stage.id}>
              <CardContent>
                <Badge variant="primary">{papers.length} paper{papers.length > 1 ? "s" : ""}</Badge>
                <p className="mt-3 font-semibold">{stage.title}</p>
                <p className="text-sm text-muted-foreground">{stage.subtitle}</p>
                <p className="mt-3 text-2xl font-semibold">{marks}<span className="text-sm font-normal text-muted-foreground"> marks</span></p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Jump back in
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.href} href={q.href}>
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="flex items-center gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{q.label}</p>
                      <p className="truncate text-sm text-muted-foreground">{q.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Syllabus encoded · {allUnits.length} units across {STAGES.length} stages. Content and interactivity arrive feature by feature.
      </p>
    </PageShell>
  );
}
