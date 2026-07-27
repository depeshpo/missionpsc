# Mission PSC

A self-built study portal for the **Nepal Lok Sewa Aayog — Section Officer (Shakha Adhikrit,
Gazetted Class III), Foreign Service (परराष्ट्र सेवा)** exam. It covers the **subjective** side only:
Stage II (Main) papers and the Interview.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Supabase (Postgres + Auth + Storage).

- Architecture, conventions and the exam data model: [`AGENTS.md`](AGENTS.md)
- Build history and roadmap: [`docs/PLAN.md`](docs/PLAN.md)

## Quick start

```bash
./start.sh
```

That installs dependencies if needed, checks your environment, verifies Supabase is reachable, and
starts the dev server on <http://localhost:3000>.

To run the checks without starting the server:

```bash
./start.sh --check
```

## Local development

Local dev runs against a **local Supabase stack (Docker)** — never production. The production site
uses its own cloud project (env vars in Vercel); nothing you do locally touches prod data.

**Prerequisites:** Node.js 22 (see [`.nvmrc`](.nvmrc)) and **Docker Desktop**.

1. **Start the local stack** (Docker must be running):

   ```bash
   npx supabase start
   ```

   This applies the migrations in `supabase/migrations/` (schema, RLS, the `note-files` bucket, the
   admin-role trigger) and prints the local **API URL**, **anon key**, and **service_role key**.

2. **Environment** — copy the template and paste those three values in:

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` is gitignored. For the local stack the keys are fixed local demo keys, not real secrets.
   (Production keys live only in Vercel — and, if you ever need to run a script against prod, in a
   separate gitignored `.env.prod.local`; see the snapshot scripts below.)

3. **Load content + create your admin:**

   ```bash
   npm run snapshot:local     # copy prod content tables into local (reads prod's public anon key)
   npm run snapshot:files      # optional: copy note-file blobs so attachments resolve locally
   ADMIN_PASSWORD='choose-a-dev-password' npm run admin:local   # create local admin@mofa.com
   ```

   `snapshot:local` copies only content; per-user data starts empty in dev. To reset the local DB to a
   clean schema, `npx supabase db reset`, then re-run the snapshot + admin steps.

## Signing in

**The app is login-gated.** Only `/` (landing) and `/login` are public; everything else redirects to
the login page. **Public signup is disabled by design** — accounts are created by the admin.

Locally, `npm run admin:local` (above) creates `admin@mofa.com` and sets its role to `admin`. To add
more local users: Supabase Studio (`http://127.0.0.1:54323`) → Authentication → Users → *Add user*
(a `profiles` row is created with `role = 'user'`); promote with:

```sql
update profiles set role = 'admin' where id = '<the-user-uuid>';
```

## Scripts

| Command | What it does |
| --- | --- |
| `./start.sh` | Checks + dev server (the normal way to run it) |
| `./start.sh --check` | Diagnostics only |
| `npm run dev` | Dev server, no checks |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run seed` | Push `src/data/*.ts` starter content into the DB in `.env.local` (idempotent) |
| `npm run snapshot:local` | Copy prod **content** into the local stack (dev only) |
| `npm run snapshot:files` | Copy prod **note-file blobs** into the local stack (dev only) |
| `npm run admin:local` | Create/promote `admin@mofa.com` in the local stack (`ADMIN_PASSWORD=…`) |

## Gotchas

- **Local dev "nothing works" is usually the stack being down** — Docker not running, or you haven't
  run `npx supabase start`. `./start.sh` detects a local URL and tells you which. (The **cloud**
  project is a different failure mode: free-tier projects **pause** after ~7 days idle — that only
  affects production/the cloud project, and `./start.sh` names it with a **Restore** hint when
  `.env.local` points at a `*.supabase.co` URL. Pausing does not delete data.)
- **Content lives in the database, not in the code.** `src/data/*.ts` is only the one-time seed for
  `npm run seed`; the app reads through `src/lib/db/*`. Author real material through `/admin`.
- Next 16 renamed `middleware` → **`proxy`**; auth gating lives in `src/proxy.ts`.

## License

All rights reserved — see [`LICENSE`](LICENSE). The source is public for viewing and reference, not
licensed for reuse. The study material is the author's own work.
