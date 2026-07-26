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

## First-time setup

1. **Node.js 20+** (developed on 24).
2. **Environment** — copy the template and fill in your Supabase project values
   (Supabase dashboard → Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Purpose |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL (public) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (public; RLS enforces access) |
   | `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Used by the seed script. Never commit or expose it. |

   `.env.local` is gitignored. The running app needs only the two `NEXT_PUBLIC_*` values — nothing in
   `src/` reads the service-role key.

3. **Database** — apply the migrations in `supabase/migrations/` to your project, then load the
   starter content:

   ```bash
   npx supabase db push
   npm run seed
   ```

## Signing in

**The app is login-gated.** Only `/` (landing) and `/login` are public; everything else redirects to
the login page. **Public signup is disabled by design** — accounts are created by the admin.

To create a user: Supabase dashboard → Authentication → Users → *Add user*. A `profiles` row is
created automatically with `role = 'user'`. To make someone an admin (required for `/admin`):

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
| `npm run seed` | Push `src/data/*.ts` starter content into Supabase (idempotent) |

## Gotchas

- **A paused Supabase project is the most common "nothing works".** Free-tier projects pause after
  about a week of inactivity, and since every page reads from the database, the whole app fails.
  `./start.sh` detects this and tells you to hit **Restore** in the Supabase dashboard. Pausing does
  not delete data.
- **Content lives in the database, not in the code.** `src/data/*.ts` is only the one-time seed for
  `npm run seed`; the app reads through `src/lib/db/*`. Author real material through `/admin`.
- Next 16 renamed `middleware` → **`proxy`**; auth gating lives in `src/proxy.ts`.

## License

All rights reserved — see [`LICENSE`](LICENSE). The source is public for viewing and reference, not
licensed for reuse. The study material is the author's own work.
