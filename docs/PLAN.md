# Build Plan & Feature Checklist

> Start each working session by reading this file, then say which feature we're building.
> Full background lives in `AGENTS.md`. v1 = UI + routes + placeholder data only (no auth/DB).

## How to work efficiently (one feature per block)
- Each feature is a self-contained slice: one route folder under `src/app/<feature>/`, its components under `src/components/<feature>/`, and one data file `src/data/<feature>.ts`. A session should only need to touch that slice + shared `ui/`/`layout/`.
- Reuse the shared primitives (`src/components/ui`) and `PageShell`; don't regenerate them.
- Real study content is hand-authored in `src/data/*.ts` — that does not need a Claude session.

## Phase 0 — Foundation ✅
- [x] Scaffold Next.js 16 + TS + Tailwind v4; install lucide-react, clsx, tailwind-merge
- [x] Design tokens + dark mode (`globals.css`, `ThemeToggle`)
- [x] App shell: `Sidebar`, `Topbar`, `PageShell`, `Breadcrumbs`, nav config
- [x] UI primitives: `Button`, `Card`, `Badge`, `ProgressBar`, `Tabs`, `EmptyState`, `Skeleton`
- [x] `lib/types.ts`, `lib/cn.ts`, `lib/hooks/useLocalProgress.ts`
- [x] `data/syllabus.ts` seeded with the real exam structure
- [x] Placeholder page for every route (`ComingSoon`)
- [x] Dashboard landing wired to syllabus data
- [x] `AGENTS.md` (project guide) + this file

## Feature build order
1. **Syllabus Map** ← next — `/syllabus` tree (Stage→Paper→Section→Unit), marks weights, Level I/II tags, unit checkmarks (`useLocalIdSet`), coverage %.
2. **MCQ Practice (Stage I)** — `data/questions.ts`, `components/practice/` (`QuestionCard`, `QuizPlayer`, `OptionList`, `ScoreSummary`), quiz + result routes.
3. **Subjective / Answer-Writing (Stage II)** — `data/subjective.ts`, prompt + model answer + your-notes editor; diplomatic-correspondence templates (Paper IV).
4. **Flashcards** — `data/flashcards.ts`, flip card + know/again, decks for diplomatic terms / treaties / Vienna articles.
5. **Notes / Study Material** — `data/notes.ts`, reader by syllabus unit + TOC.
6. **Current Affairs** — `data/currentAffairs.ts`, dated feed + detail.
7. **Mock Tests** — `data/mockTests.ts`, prelim (objective, timed) + main paper (3-hr timer).
8. **Resources Library + Dashboard/Bookmarks polish** — `data/resources.ts`; aggregate progress.

## Route map (all stubbed)
```
/dashboard
/syllabus  ·  /syllabus/[paper]  ·  /syllabus/[paper]/[unit]
/practice  ·  /practice/[part]  ·  /practice/quiz/[quizId]  ·  /practice/quiz/[quizId]/result
/answers   ·  /answers/[paper]  ·  /answers/[paper]/[questionId]
/flashcards  ·  /flashcards/[deck]
/notes  ·  /notes/[paper]/[unit]
/current-affairs  ·  /current-affairs/[id]
/mock-tests  ·  /mock-tests/[testId]  ·  /mock-tests/[testId]/result
/resources  ·  /bookmarks  ·  /settings
```

## Deferred to later versions
- Authentication (free-tier provider) and a real database.
- Final content-authoring format for prose (Markdown/MDX vs typed TS) — "decide later"; v1 uses short typed placeholders.
