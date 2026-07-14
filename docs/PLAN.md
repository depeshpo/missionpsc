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
- ✅ **Slice 1.6 — Current Affairs editor (flat-collection pattern reused).** Full CRUD at
  `/admin/current-affairs` (list + `new` + `[id]/edit`), persisted via a whole-collection
  override (`useCurrentAffairs.ts`, key `current-affairs-overrides`). Richer fields than
  resources: date, scope, summary, multi-paragraph `body`, comma-sep `tags`, optional `source`.
  `CurrentAffairForm` (mount-gated, client-side id lookup) + `CurrentAffairsAdminList`. Both the
  public feed (`CurrentAffairsFeed` now prop-less) **and the detail page** read through the
  override — the detail became a client `CurrentAffairDetail` (resolves by id; EmptyState if
  missing, like `UnitView`) so admin-added items are viewable. Activated in hub + sidebar.
- ✅ **Slice 1.7 — Flashcards editor (first two-level collection).** Full CRUD at
  `/admin/flashcards` (deck list + `new` + `[deck]` editor). Whole-collection override
  (`useFlashcards.ts`, key `flashcards-overrides`, stores `{decks, cards}`; `cardCount`
  recomputed on read so it never goes stale). `DeckForm` edits deck meta **plus its cards
  nested in one form** (add/remove card rows, single `saveDeck` that upserts the deck +
  replaces all its cards) — the `PaperForm` nested-rows approach, so no card sub-routes.
  `FlashcardsAdminList` = deck grid w/ counts + edit/delete + reset. Public deck grid +
  review route through the override via client `DeckGrid`/`DeckReview` (reusing
  `ReviewSession`/`DeckProgress`); a missing deck shows an EmptyState (like `UnitView`).
  Activated in hub + sidebar.
- ✅ **Slice 1.8 — Questions editor + AdminPageShell condense fix.** Full CRUD at `/admin/questions`
  (list grouped by paper + `new` + `[id]/edit`), flat whole-collection override
  (`useSubjectiveQuestions.ts`, key `questions-overrides`). `QuestionForm` has a paper→section→kind
  picker (section dropdown depends on the chosen paper), marks/prompt/passage/wordTarget/modelAnswer/
  comma-sep keywords. All three public `/answers` pages route through the override via client
  readers (`AnswersIndex`/`AnswersPaper`/`AnswerDetail`, reusing `AnswerEditor`/`ModelAnswer`/
  `AttemptedBadge`); `answerablePapersFrom` is override-aware so adding a question makes its paper
  answerable; missing ids show an EmptyState (like `CurrentAffairDetail`). **Fix:** `AdminPageShell`
  now splits into a pinned compact bar (back + breadcrumbs + actions) + a non-sticky big title that
  scrolls away; once scrolled, the title condenses inline next to the breadcrumbs (new client
  `AdminHeader` via IntersectionObserver rooted on `main`). Questions activated in hub + sidebar.
- ✅ **Slice 1.9 — Notes editor (last content-type editor).** Full CRUD at `/admin/notes` (list
  grouped by paper + `new` + `[id]/edit`), flat whole-collection override (`useNotes.ts`, key
  `notes-overrides`; one note per unit, id `note-${unitId}`, upserted by `saveNote`). `NoteForm`
  has a paper→section→unit picker (locked in edit since the unit is the note's identity) + a nested
  **block-body editor** (heading/paragraph/list rows with type/level selects, up/down reorder,
  add/remove) reusing `buildBlocks` (exported from `data/notes.ts`) to regenerate deduped heading
  anchor ids on save + an **attachments editor** (pdf/link rows). All four public `/notes` pages
  route through the override via client readers (`NotesIndex`/`NotesPaperOverview`/`NoteReader` +
  `NotesSidebarLive` feeding the existing `NotesSidebar` from the layout), reusing
  `NoteBody`/`NoteToc`/`NoteAttachments`/`MarkReadButton`; missing notes show an EmptyState. Notes
  activated in hub + sidebar — **all six admin editors are now live.**
- ✅ **Slice 1.10 — Notes redesigned to rich sectioned content + header title-on-scroll.** The note
  model is now a main title + ordered **subtitle sections**, each with a **compulsory rich-text body**
  (hand-rolled `RichTextEditor` contentEditable, stores HTML) plus optional, any-count, **drag-rerankable**
  YouTube embeds, file **attachments** (drag-drop/upload stored in **IndexedDB** via `lib/noteFiles.ts`,
  no backend), and reference links. `NoteEditor` owns the `AdminPageShell` so the **breadcrumb/header title
  tracks the live draft title** and stays pinned on scroll. Reorder via a generic `SortableList` (dnd-kit).
  Public reader rewritten (`NoteContent` renders HTML + YT iframes + `NoteFileList` from IndexedDB + links;
  `NoteToc`/sidebar from section headings). Replaced `NoteBlock`/`NoteAttachment`; removed
  `NoteForm`/`NoteBody`/`NoteAttachments`. `.note-prose` styles in globals.css.
- ✅ **Slice 1.11 — Admin add/edit: float the breadcrumb into the Topbar on scroll.** On the add/edit
  forms (all six types), scrolling now drops the AdminHeader's own pinned bar and shows the breadcrumb
  in the Topbar next to an icon-shrunk search — one chrome row, more space. Bridged via a tiny
  `useAdminChrome` external store (Topbar reads it); `AdminHeader` gains `floatCrumbs` (non-sticky bar
  + publishes crumbs while scrolled); set on the 10 add/edit pages + `NoteEditor` (notes carries the
  live title). List/overview pages unchanged.
- ✅ **Slice 1.12 — Persist create-new-paper (last admin gap closed).** Created papers get a
  collision-proof id (`custom-${stage}-p${code}-${uuid6}`) in `draftToPaper`; `PaperForm`'s create
  branch now persists via `useCreateSyllabusPaper` (writes the new paper into the same
  `syllabus-overrides` map) and redirects to the paper overview. New override helpers
  `addedPapers`/`resolveAllPapers` (override entries with no matching seed id) + a generalized
  `useSyllabusPaperById(id, seed?)` (the old `useSyllabusPaper(seed)` now delegates to it). Lists
  /readers fold in created papers: admin list became a client island (`AdminSyllabusList` via
  `resolveAllPapers`); public `SyllabusMap` swapped `resolvePapers`→`resolveAllPapers`. Routes that
  used server `getPaper`+`notFound()` now pass an **optional** seed to client screens
  (`PaperOverviewScreen`/`PaperEditScreen` own the `AdminPageShell`; public `PaperSyllabus`/`UnitView`
  resolve by id) that resolve the override-only paper after hydration and show an EmptyState for
  truly-missing ids — `UnitView` derives its section from the unit id (no more `sectionId` prop).
  Created papers show **Delete paper** (confirm + redirect) instead of "Reset to default".
  **All admin authoring is now complete; the next phase is the backend.**

## Backend phase (in progress) — Supabase
Provider = **Supabase** (Postgres + Auth + Storage), Supabase JS client + raw SQL migrations (no
ORM), backend in-repo, deploy target Vercel. Multi-user, but users are admin-onboarded (signups off).

- ✅ **B0 — Foundation + auth.** SQL migrations in `supabase/migrations/`: 13 content tables
  mirroring `lib/types.ts` (string-id PKs, `position` columns, `text[]` for subtopics/keywords/tags)
  + `profiles(id → auth.users, role)` + a security-definer `is_admin()` + RLS on every content table
  (public `SELECT`, admin-only writes). Client helpers in `src/lib/supabase/{client,server,admin}.ts`;
  idempotent seed script (`npm run seed`) pushes the `src/data/*.ts` seeds into the DB. Auth gates the
  whole dashboard surface + `/admin` via `src/proxy.ts` (**Next 16 renamed `middleware` → `proxy`**);
  `/login` + `UserMenu` + `AuthNav`; the Admin nav is hidden from non-admins.
- ✅ **B1 — Content read + write, one feature per slice.** Done for **all six**: syllabus, resources,
  current-affairs, flashcards, questions, notes. Every localStorage content-override hook is deleted.
- ✅ **B3 — File storage** (folded into the notes slice, since a blob in the admin's own browser is
  invisible to every other user). Note attachments live in a public `note-files` Storage bucket;
  `src/lib/noteFiles.ts` uploads, builds public URLs, and deletes.
- ✅ **Seed reads retired.** The landing page and `/dashboard` were still building their paper lists
  and unit totals from the TS seed, so admin-created papers never appeared there. They (and the admin
  hub) now read the DB, via new pure helpers in `src/lib/syllabus.ts`.
- ⏳ **B2 — Per-user progress + bookmarks** move server-side (swap `useLocalProgress` / `useBookmarks`,
  and the `notes-read` key). Absorbs `bookmarks/resolve.ts`, the last runtime seed reader. Also the
  natural home for the deferred in-app invite-user UI.
- ⏳ **B4 — Deploy** to Vercel.

**Verified end-to-end as admin** (2026-07-14): creating a note persists sections/videos/links/files
with correct `position`, the attachment lands in Storage and serves publicly, removed children are
really deleted, deleting a note cascades and 404s the reader — and a paper created in admin now shows
up on the public landing page. Every route builds as `ƒ` (dynamic), since the Supabase server client
calls `cookies()`, so there is no static-staleness gap.

**The per-feature B1 pattern** (repeat it exactly): `src/lib/db/<feature>.ts` (`import "server-only"`,
each table `.order("position")`, map snake_case rows → domain types, throw on error) +
`src/app/(dashboard)/admin/<feature>/actions.ts` (`"use server"`, **session** client so RLS enforces
admin, `ActionResult`, `revalidatePath`) + pages become server components that `await` the DB and
pass props + components become presentational and call the actions + **delete the `useX` override
hook**. Nested collections upsert parent → upsert children with `position: i` → prune removed
children (`saveDeck` is the two-level reference, `savePaper` the three-level one). Ordering is an
implicit array index in TS but an explicit `position` column in Postgres.

**Known debt:** `admin/page.tsx` (hub counts), `DashboardProgress.tsx` (totals) and
`bookmarks/resolve.ts` still read the `src/data/*` seeds, so their numbers are stale — a separate
cleanup slice (`resolve.ts` belongs with B2). Note file uploads are eager, so a cancelled edit
orphans a blob in Storage; no sweep yet.

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
            /admin/current-affairs  ·  /admin/current-affairs/new  ·  /admin/current-affairs/[id]/edit
            /admin/flashcards  ·  /admin/flashcards/new  ·  /admin/flashcards/[deck]
            /admin/questions  ·  /admin/questions/new  ·  /admin/questions/[id]/edit
            /admin/notes  ·  /admin/notes/new  ·  /admin/notes/[id]/edit
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
