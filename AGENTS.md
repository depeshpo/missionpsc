<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mission PSC — Project Guide

Study portal for the **Nepal Lok Sewa Aayog — Section Officer (Shakha Adhikrit / Gazetted Class III), Foreign Service (परराष्ट्र सेवा)** exam. Self-study tool; the user (Dipesh) authors the content himself from Acts, government publications, books, and online portals.

## Status & scope
- **v1 = UI + routes + placeholder data only.** No backend, no database, no auth — those are deferred to a later version. Do not add them unless asked.
- Build **one feature at a time**; each feature may span several conversations. See `docs/PLAN.md` for the feature build order and checklist.
- Ephemeral "progress" (completed units, scores, bookmarks) lives in `localStorage` via `useLocalProgress`, designed to swap to a DB cleanly later.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript.
- Tailwind CSS v4 (CSS-based config in `src/app/globals.css`, no `tailwind.config.js`). Dark mode = `.dark` class on `<html>`, toggled by `ThemeToggle`.
- `lucide-react` icons; `clsx` + `tailwind-merge` via the `cn()` helper. **No component library** — hand-rolled primitives in `src/components/ui`.
- Import alias: `@/*` → `src/*`.

## Conventions
- **Design tokens**: use semantic Tailwind colors mapped in `globals.css` — `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-accent`, `text-success`, `text-warning`. Don't hardcode raw palette colors (no `bg-slate-200`); use the tokens so dark mode works.
- **Pages**: wrap content in `<PageShell title description breadcrumbs actions>`. Use `<ComingSoon>` for not-yet-built routes.
- **UI primitives** (`src/components/ui`): `Button`, `Card`/`CardHeader`/`CardTitle`/`CardContent`, `Badge`, `ProgressBar`, `Tabs`, `EmptyState`, `Skeleton`. Reuse these; add new primitives here, not inline.
- **Feature components** go in `src/components/<feature>/` (e.g. `practice/`, `answers/`, `flashcards/`).
- **Content/data** lives in `src/data/*.ts` (typed), separate from UI. Adding study content = editing data files; it should not require touching components.
- **Dynamic route params are Promises** in Next 16: `async function Page({ params }: { params: Promise<{ id: string }> })` then `await params`.
- Mark client components with `"use client"` only when they use state/effects/hooks (Sidebar, Tabs, ThemeToggle, useLocalProgress consumers).
- Keep diffs small and scoped to one feature; commit per feature.

## Key files
- `src/data/syllabus.ts` — the spine. Real Stage→Paper→Section→Unit structure with marks + Level I/II tags, plus helpers (`papers`, `papersByStage`, `getPaper`, `getUnit`, `allUnits`, `STAGES`).
- `src/lib/types.ts` — domain types (`Paper`, `Section`, `Unit`, `Question`, `SubjectiveQuestion`, `Flashcard`, `Note`, …).
- `src/lib/hooks/useLocalProgress.ts` — `useLocalProgress` + `useLocalIdSet`.
- `src/components/layout/nav.ts` — sidebar navigation config.

## Exam structure (source of truth for the data model)
- **Stage I — Preliminary** · Objective MCQ · 100 marks · qualifying. Paper I = Part A General Awareness (50, with Level I 60% / Level II 40%), Part B Aptitude (30), Part C English Competence (20).
- **Stage II — Main** · Subjective · 400 marks (Foreign Service) · each paper 100 marks / 3 hrs / 10 questions × 10 marks in Sections A–D:
  - Paper II Governance Systems · Paper III Contemporary Issues · Paper IV English Language (essay, translation, précis, **diplomatic correspondence**) · Paper V **Foreign Policy & International Relations** (MoFA core).
- **Final Stage — Interview** · Oral · 50 marks. Pass mark 40% per paper.

## Commands
- `npm run dev` — dev server.
- `npm run build` — production build.
- `npx tsc --noEmit` — typecheck.
- `npm run lint` — ESLint.
