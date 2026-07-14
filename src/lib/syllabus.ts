import type { Paper, Stage, Unit } from "@/lib/types";

/**
 * Pure syllabus helpers over a `Paper[]` fetched from the DB — the runtime
 * counterparts of the seed accessors in `src/data/syllabus.ts`, which now only
 * feed the seed script. Taking the papers as an argument keeps these usable from
 * both server and client components.
 */

/** Papers in a stage, in syllabus order. */
export function papersByStage(papers: Paper[], stage: Stage): Paper[] {
  return papers.filter((p) => p.stage === stage);
}

/** Every unit across every paper, in syllabus order. */
export function allUnits(papers: Paper[]): Unit[] {
  return papers.flatMap((p) => p.sections.flatMap((s) => s.units));
}

/** Total sections across every paper. */
export function sectionCount(papers: Paper[]): number {
  return papers.reduce((n, p) => n + p.sections.length, 0);
}
