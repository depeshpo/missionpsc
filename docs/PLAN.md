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
   ✅ *Enhancement:* **collapsible section sidebar** — `NotesSidebar` is now a tree; each topic
   independently expands (active auto-expands) to its nested `noteHeadings`, linking to
   `#anchor`s. Topic page stays contents-first; `scroll-mt-20` (clears the sticky header) +
   `scroll-smooth` on `<html>`.
5. ✅ **Current Affairs** — `data/currentAffairs.ts` (seeded feed + accessors; `CurrentAffairItem`
   enriched with `body`/`source`/`tags`), date-grouped feed with scope tabs + tag-chip filter,
   bookmark/save toggle (`useLocalIdSet("bookmarks-current-affairs")`, for #6), and a detail
   reader. Components in `src/components/current-affairs/`.
6. ✅ **Resources Library + Dashboard/Bookmarks polish** — `data/resources.ts` (seeded, categorized
   + accessors) with search/category filter on `/resources`; **unified bookmarks** store
   (`useBookmarks`, one `mission-psc:bookmarks` record list with `savedAt`) + generic
   `BookmarkButton` wired across all five types (current-affairs, resources, notes, questions,
   flashcards); `/bookmarks` aggregates them filterable by type + date window; `/dashboard`
   gains live progress widgets (`DashboardProgress`). Components in `src/components/{bookmarks,
   resources,dashboard}/`.

**v1 build order complete.** Deferred next: backend (DB/auth/deploy) + admin authoring & AI
content-seeder (the data accessors and `useLocalProgress`/`useBookmarks` are the swap points).

## Admin authoring (in progress) — `src/app/(dashboard)/admin/`
Building the `/admin` authoring surface, **one content type per slice**, mirroring the content model
(Syllabus is the spine; everything else hangs off it). Each type gets a list view + a typed
create/edit form. **Persistence is deliberately not wired yet** — forms are interactive (local state,
add/remove rows) but Save is inert ("preview only"); wiring it (localStorage merge over accessors,
then DB) is a later slice. `/admin` stays ungated (auth deferred with the backend).
- ✅ **Slice 1 — Foundation + Syllabus editor.** Form UI primitives (`Input`, `Textarea`, `Select`,
  `Field` in `src/components/ui/`); admin **hub** at `/admin` (content-type grid with live counts,
  Syllabus active + others "Coming soon"); **Syllabus** routes `/admin/syllabus` (list),
  `/admin/syllabus/new`, `/admin/syllabus/[paper]` (edit, 404 on bad id); `PaperForm`
  (`src/components/admin/`) mirrors `Paper→Section→Unit` 1:1 with add/remove sections/units/subtopics
  and a read-only derived-id hint.
- ✅ **Slice 1.1 — Admin nav & header UX.** Sidebar `Admin` item is now a collapsible group
  (`NavItem.children` in `nav.ts`; reuses the NotesSidebar derived-`overrides` expand pattern) listing
  all six content types — Syllabus active, the rest "soon"/disabled; auto-expands on `/admin/*`.
  New `AdminPageShell` (`src/components/admin/`) gives admin sub-pages a **sticky** header with a
  **Back** link (parent derived from the breadcrumb trail) — leaves the shared `PageShell` (and the
  learn surface) untouched. `Topbar` is now a client component that narrows the search
  (`max-w-md`→`max-w-xs`) on deep admin routes.
- ✅ **Slice 1.2 — Paper overview + reorder + first real persistence.** `/admin/syllabus/[paper]`
  is now a **manage view** (`PaperOverview`): **collapsible** sections (clean header — no unit-card
  layer) that expand to show their **subtopics grouped by unit** (thin unit label only when a section
  has >1 unit). A **Re-order** toggle button enters reorder mode (**@dnd-kit**): drag a section by
  its whole header, and drag subtopics within a unit; edit/delete hide while reordering. Per-section
  edit (→ `[paper]/edit`) + delete and **Reset to default** otherwise. Content text is edited only on
  the edit page. Edits/reorders/deletes **persist to localStorage** via `useSyllabusPaper`
  (whole-`Paper` override-over-seed on `useLocalProgress`); `PaperForm` Save is real when editing
  (ids preserved, new items get fresh ids). New `[paper]/edit` route holds the form; a `useMounted`
  gate initialises client state from the stored override. Scope guard: public `/syllabus` still seed.
- ✅ **Slice 1.3 — Overview polish.** Dropped the Re-order mode: sections + topics are **always**
  drag-reorderable via dedicated grip handles. The **whole section title** (not just the chevron)
  toggles collapse (header = handle + collapse-button + edit/delete as siblings). Subtopics are
  redesigned as proper **numbered "topic" cards** (ordinal badge + handle + hover state); multi-unit
  sections show styled unit-label headings. Persistence + edit-page split unchanged.
- ✅ **Slice 1.4 — Learn read path through override.** Public `/syllabus`, `/syllabus/[paper]` and
  `/syllabus/[paper]/[unit]` now resolve papers through the same override map, so admin edits show on
  the study side. Server pages keep `notFound()` and pass the seed to client islands
  (`SyllabusMap`/`PaperSyllabus`/`UnitView`) that read `useSyllabusOverrides` + `resolvePaper`
  (SSR-safe — server snapshot is the seed). A unit removed in an override shows an EmptyState.
- ✅ **Slice 1.5 — Resources editor (first flat-collection editor).** Full CRUD at
  `/admin/resources` (list + `new` + `[id]/edit`), persisted via a **whole-collection** override
  (`useResources.ts`, key `resources-overrides`, stores `Resource[] | null`; absent = seed) — the
  reusable pattern for flat collections, distinct from syllabus's per-item map. `ResourceForm`
  (mount-gated draft, category `<datalist>`, client-side id lookup so newly-added items are
  editable) + `ResourcesAdminList` (grouped rows, edit/delete, Reset to default). Public
  `/resources` reads through `useResources()`. Resources activated in the admin hub + sidebar.
- ☐ Next: Current Affairs (reuses the flat-collection pattern), Notes, Questions, Flashcards
  editors; persist the **create-new-paper** flow.

## Route map
```
Learn       /  ·  /syllabus  ·  /syllabus/[paper]  ·  /syllabus/[paper]/[unit]
            /notes  ·  /notes/[paper]  ·  /notes/[paper]/[unit]
            /answers  ·  /answers/[paper]  ·  /answers/[paper]/[questionId]
            /flashcards  ·  /flashcards/[deck]
            /current-affairs  ·  /current-affairs/[id]
            /resources
Dashboard   /dashboard  ·  /bookmarks  ·  /settings
Admin       /admin  ·  /admin/syllabus  ·  /admin/syllabus/new  ·  /admin/syllabus/[paper]
            /admin/resources  ·  /admin/resources/new  ·  /admin/resources/[id]/edit
```

## Deferred to later versions
- **Admin authoring + AI content-seeder**: a `/admin` surface to create/edit notes, subjective
  questions, model answers and flashcards, plus an AI-assisted seeder for *genuine, sourced*
  content. Stubbed as ComingSoon in v1.
- **Backend**: a free DB + auth + deploy (Supabase / Neon / Turso, Vercel) — *provider decided
  later*. Code is structured so the data-access accessors are the swap point; `useLocalProgress`
  and `useBookmarks` are the progress/bookmark swap points.
- Final content-authoring format for prose (Markdown/MDX vs typed TS) — "decide later"; v1 uses
  short typed placeholders.
- **Separate MCQ product** (Stage I objective practice, quizzes, prelim mocks) — its own repo.
