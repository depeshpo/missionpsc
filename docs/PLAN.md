# Build Plan & Feature Checklist

> Start each working session by reading this file, then say which feature we're building.
> Full background lives in `AGENTS.md`. v1 = UI + routes + placeholder data only (no auth/DB).

## Scope
**This project is the subjective-study portal only** — Stage II (Main) + the Interview. The
objective **MCQ / Stage I prelim** is a *separate product* and is not built here. Don't add MCQ
routes, types, or data back into this repo.

The app has two surfaces, split by Next.js route groups (the `(...)` folders don't affect URLs):
- **Learn** `src/app/(learn)/` — the public **landing page** (`/`) + **reading/study pages**
  (syllabus, notes, answer writing, flashcards, current affairs, resources). Slim top header
  (`LearnHeader`).
- **Dashboard** `src/app/(dashboard)/` — **account / progress / management** (`/dashboard`,
  `/bookmarks`, `/settings`) + the **admin** surface (`/admin`). App shell with `Sidebar` + `Topbar`.

Grouping rule: *Learn = everything you read/study; Dashboard = your account / progress / management.*

## How to work efficiently (one feature per block)
- Each feature is a self-contained slice: a route folder under the right group
  (`src/app/(learn)/<feature>/` or `src/app/(dashboard)/<feature>/`), its components under
  `src/components/<feature>/`, and one data file `src/data/<feature>.ts`.
- Reuse the shared primitives (`src/components/ui`) and `PageShell`; don't regenerate them.
- **Read content through accessors, not raw arrays.** Components import functions like
  `getPaper`/`getUnit`/`papersByStage` (see `src/data/syllabus.ts`); each new `src/data/<feature>.ts`
  exposes its own `getX`/`listX`. That accessor file is the single boundary we swap to a DB later.
- Real study content is hand-authored in `src/data/*.ts` — that does not need a Claude session.

## Phase 0 — Foundation ✅
- [x] Scaffold Next.js 16 + TS + Tailwind v4; install lucide-react, clsx, tailwind-merge
- [x] Design tokens + dark mode (`globals.css`, `ThemeToggle`)
- [x] UI primitives: `Button`, `Card`, `Badge`, `ProgressBar`, `Tabs`, `EmptyState`, `Skeleton`
- [x] `lib/types.ts`, `lib/cn.ts`, `lib/hooks/useLocalProgress.ts`
- [x] `data/syllabus.ts` seeded with the real subjective exam structure
- [x] Placeholder page for every route (`ComingSoon`)
- [x] `AGENTS.md` (project guide) + this file

## Phase 1 — Subjective focus + surface split ✅
- [x] Removed MCQ: deleted `/practice` and `/mock-tests`; dropped Stage I prelim from syllabus;
      trimmed objective types (`Question`, `QuestionType`, `Level`, `PaperType`, `MockTest`)
- [x] Route groups `(learn)` + `(dashboard)` with per-group layouts; root layout is shell-free
- [x] `LearnHeader` + learn landing page (`/`); `dashboardNav`/`learnNav` split in `nav.ts`
- [x] `/admin` placeholder (ComingSoon) for future authoring + AI content seeder

## Feature build order
1. ✅ **Syllabus Map** — `/syllabus` tree (Stage→Paper→Section→Unit), marks weights, unit checkmarks
   (`useLocalIdSet`), coverage %. Three routes built (`page` / `[paper]` / `[unit]`); progress
   stored under `useLocalIdSet("syllabus-completed-units")`; components in `src/components/syllabus/`.
2. ✅ **Subjective / Answer-Writing** — `data/subjective.ts` (placeholder bank + accessors),
   prompt + collapsible model answer + autosaving your-answer editor; all four main papers
   incl. every Paper IV format (essay/translation/précis/comprehension/correspondence
   templates). Progress under `useLocalProgress("answer:<id>")` + `useLocalIdSet("answers-attempted")`;
   components in `src/components/answers/`.
3. ✅ **Flashcards** — `data/flashcards.ts` (5 seeded decks + accessors), flip card + know/again
   review session with a recap (Restart / Reset deck); known cards persist via
   `useLocalIdSet("flashcards-known")`, decks show a known/total bar. Components in
   `src/components/flashcards/`.
4. ✅ **Notes / Study Material** — `data/notes.ts` (typed `NoteBlock[]` content + accessors),
   docs-style reader: `/notes` index → `/notes/[paper]` overview with a persistent sidebar
   (`[paper]/layout.tsx`) → `/notes/[paper]/[unit]` reader with nested in-page TOC. Read state
   via `useLocalIdSet("notes-read")`; components in `src/components/notes/`.
   ✅ *Follow-up:* **PDF attachments** — `NoteAttachments` renders a note's `attachments`
   (links + lazy expandable iframe preview + Open/Download); local files in `public/attachments/`
   (kept out of `public/notes/*` to avoid the `/notes/[paper]` route collision). Future: uploaded
   from the deferred `/admin` dashboard.
5. ✅ **Current Affairs** — `data/currentAffairs.ts` (seeded feed + accessors; `CurrentAffairItem`
   enriched with `body`/`source`/`tags`), date-grouped feed with scope tabs + tag-chip filter,
   bookmark/save toggle (`useLocalIdSet("bookmarks-current-affairs")`, for #6), and a detail
   reader. Components in `src/components/current-affairs/`.
6. **Resources Library + Dashboard/Bookmarks polish** — `data/resources.ts`; aggregate progress.

## Route map
```
Learn       /  ·  /syllabus  ·  /syllabus/[paper]  ·  /syllabus/[paper]/[unit]
            /notes  ·  /notes/[paper]/[unit]
            /answers  ·  /answers/[paper]  ·  /answers/[paper]/[questionId]
            /flashcards  ·  /flashcards/[deck]
            /current-affairs  ·  /current-affairs/[id]
            /resources
Dashboard   /dashboard  ·  /admin  ·  /bookmarks  ·  /settings
```

## Deferred to later versions
- **Admin authoring + AI content-seeder**: a `/admin` surface to create/edit notes, subjective
  questions, model answers and flashcards, plus an AI-assisted seeder for *genuine, sourced*
  content. Stubbed as ComingSoon in v1.
- **Backend**: a free DB + auth + deploy (Supabase / Neon / Turso, Vercel) — *provider decided
  later*. Code is structured so the data-access accessors are the swap point; `useLocalProgress`
  is the progress swap point.
- Final content-authoring format for prose (Markdown/MDX vs typed TS) — "decide later"; v1 uses
  short typed placeholders.
- **Separate MCQ product** (Stage I objective practice, quizzes, prelim mocks) — its own repo.
