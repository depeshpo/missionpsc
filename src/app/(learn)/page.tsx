import Link from "next/link";
import { ArrowRight, Map, BookOpen, LayoutDashboard } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPapers } from "@/lib/db/syllabus";
import { papersByStage, allUnits } from "@/lib/syllabus";

// Landing page for the Learn surface. Introduces the portal and surfaces the
// subjective Main-stage papers, read from the DB so admin edits show here.
export default async function LandingPage() {
  const papers = await getPapers();
  const mainPapers = papersByStage(papers, "main");
  const totalMarks = mainPapers.reduce((sum, p) => sum + p.totalMarks, 0);
  const unitCount = allUnits(papers).length;

  return (
    <PageShell
      title="Mission PSC — Foreign Service"
      description="A focused study portal for the Nepal Lok Sewa Section Officer (Foreign Service) subjective examination — Stage II Main papers and the interview."
      actions={
        <Link
          href="/syllabus"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Start with the syllabus
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Badge variant="primary">{mainPapers.length} Main papers</Badge>
        <Badge>{totalMarks} marks</Badge>
        <Badge>{unitCount} units</Badge>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Stage II — Main papers
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {mainPapers.map((paper) => (
          <Link key={paper.id} href={`/syllabus/${paper.id}`}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="primary">Paper {paper.code}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {paper.totalMarks} marks
                  </span>
                </div>
                <p className="mt-3 font-semibold">{paper.title}</p>
                <p className="text-sm text-muted-foreground">
                  {paper.sections.length} sections
                  {paper.note ? ` · ${paper.note}` : ""}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Where to begin
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/syllabus", label: "Syllabus Map", icon: Map, desc: "Browse every paper, section and unit" },
          { href: "/notes", label: "Notes", icon: BookOpen, desc: "Read study material by unit" },
          { href: "/dashboard", label: "Your Dashboard", icon: LayoutDashboard, desc: "Track coverage and progress" },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardContent className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{q.label}</p>
                    <p className="text-sm text-muted-foreground">{q.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
