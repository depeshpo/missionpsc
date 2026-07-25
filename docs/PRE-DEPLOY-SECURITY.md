# Pre-deploy & security checklist

Before making the GitHub repo **public** and deploying to the **real world**. Grouped by
priority. Each item notes whether it's a **[dashboard]** / **[account]** action you do, or a
**[code]** change (which Claude can make).

The whole security model rests on **Supabase Row-Level Security (RLS)**: the anon key and project
URL are public by design and safe to expose — RLS is the actual boundary. So the critical items are
about making sure RLS is airtight and nothing bypasses it.

---

## 🔴 Critical — do before the repo is public / before real users

- [ ] **[dashboard] Confirm signup is actually disabled on the *remote* project.** `supabase/config.toml`
      has `enable_signup = true` (that's the local dev default). The app is designed as
      *admin-onboarded, signups off*. In the Supabase dashboard → Authentication → Providers → Email,
      confirm **"Enable Signups" is OFF** (or Auth → Settings). If it's on, anyone can self-register a
      `role='user'` account and reach the gated learn/dashboard surface. Decide deliberately.
- [ ] **[dashboard] Verify RLS is ENABLED on every table in the remote DB**, not just in the migration
      files. Run in the SQL editor:
      `select tablename, rowsecurity from pg_tables where schemaname='public';` — every content and
      `user_*` table must show `rowsecurity = true`. A single table with RLS off = world read/write.
- [ ] **[dashboard] Confirm the `profiles` table has no UPDATE/INSERT policy** (it shouldn't — verified
      in the migration: only `profiles_select_self_or_admin`). This is what stops a user from setting
      their own `role='admin'`. Roles must only be changed via SQL/service-role.
- [ ] **[account] Final secret scan before flipping to public.** Verified today: no secrets in tracked
      files or git history, `.env*` is gitignored, the service-role key is never `NEXT_PUBLIC`. As due
      diligence run a scanner over history anyway: `npx gitleaks detect` or `npx trufflehog git file://.`.
- [ ] **[account] Never put `SUPABASE_SERVICE_ROLE_KEY` in Vercel.** The running app doesn't use it
      (only `scripts/seed.ts` does, locally). Vercel needs **only** the two `NEXT_PUBLIC_*` vars. If you
      ever seed prod, run the script from your machine, don't store the key in the host.

## 🟠 Important — before real-world use

- [ ] **[dashboard] Raise the minimum password length.** Config shows `minimum_password_length = 6`.
      Set 8–12 in Auth settings. Consider enabling leaked-password protection (Supabase "Password
      strength / HaveIBeenPwned" option).
- [ ] **[code] Sanitize note HTML.** `src/components/notes/NoteContent.tsx` renders authored HTML with
      `dangerouslySetInnerHTML`. It's admin-authored today (low risk with one trusted admin), but it's
      **stored XSS** the moment a second admin is added or authoring opens up. Sanitize on render (e.g.
      DOMPurify) or on save.
- [ ] **[code] Add HTTP security headers** in `next.config.ts` (currently none): at least
      `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
      `X-Frame-Options: DENY` (or `frame-ancestors 'none'`), and a **Content-Security-Policy**. Note the
      theme-init inline `<script>` in `src/app/layout.tsx` needs a CSP hash/nonce, so CSP takes a little
      care. HSTS is provided by Vercel automatically over HTTPS.
- [ ] **[account] Run `npm audit`.** 5 high-severity advisories were reported. Review and
      `npm audit fix`; avoid `--force` unless you check the major bumps. Turn on **Dependabot** on the
      public repo.
- [ ] **[dashboard] Set the production Site URL + redirect allowlist** (Auth → URL Configuration) to the
      Vercel domain, so auth flows and any future email links resolve to prod, not localhost.
- [ ] **[dashboard] Review auth rate limits** (Auth → Rate Limits). Consider a CAPTCHA
      (hCaptcha/Turnstile — Supabase supports it) on login if brute-force/abuse is a concern once public.

## 🟢 Good practice / hardening

- [ ] **[code] Track `.env.example`.** The `.env*` gitignore rule currently swallows it, so a fresh
      public clone has no env template. Add `!.env.example` to `.gitignore` (keeps real `.env.local`
      ignored). Confirm `.env.example` holds only placeholders — it does.
- [ ] **[code] Remove dead code** `src/lib/supabase/admin.ts` (`createAdminClient`, service-role) —
      nothing imports it. Deleting it removes the only in-`src` reference to the service-role key and
      shrinks the attack surface. (`scripts/seed.ts` builds its own client, so seeding still works.)
- [ ] **[account] Add a `LICENSE`** before making the repo public (decide how others may use it), and a
      note that the study content is your own work.
- [ ] **[dashboard] Enable Point-in-Time Recovery / confirm backups** for the Supabase project if the
      data matters (free tier retains daily backups; the project also **auto-pauses after ~7 days
      idle** — see `./start.sh` and the README).
- [ ] **[dashboard] Storage bucket `note-files` is PUBLIC** (world-readable via URL, unguessable UUID
      paths). Fine for study material — just don't upload anything private, since a leaked URL is
      readable by anyone. Switch to signed URLs if that ever changes.
- [ ] **[code] Consider a real error monitor** (Sentry, or Vercel's built-in) so production errors are
      visible; `error.tsx` shows a friendly page + `digest` but doesn't report anywhere.

---

## ✅ Already handled (context)

- RLS: content = public read / **admin-only writes via `is_admin()`**; `user_progress` /
  `answer_drafts` / `user_bookmarks` = **self-scoped** (`user_id = auth.uid()`); `profiles` = select
  self-or-admin, **no client write path to `role`**.
- App is **fully gated** (`src/proxy.ts` allow-lists only `/` and `/login`); `/admin` additionally
  requires the admin role. The proxy uses `getUser()` (validates the token), not just `getSession()`.
- Anon key + project URL are **meant** to be public; the secret (`service_role`) is server-only and
  used only by the seed script.
- No secrets in tracked files or git history; `.env.local` is gitignored.
- Friendly error pages don't leak stack traces (`not-found.tsx`, `error.tsx`).
