-- Mission PSC — auth, roles, and RLS (Stage B0).
-- Multi-user but admin-onboarded: public signup is disabled in the Supabase
-- dashboard; the admin invites users. Content is public-read; only role='admin'
-- can write. Per-user progress/bookmark tables + their RLS arrive in B2.

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user, carrying the role.
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- ---------------------------------------------------------------------------
-- is_admin(): security-definer helper so content policies stay DRY and don't
-- recurse through profiles' own RLS. Defined BEFORE any policy that uses it.
-- ---------------------------------------------------------------------------
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create a profile when a new auth user is created.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- A user can read their own profile; admins can read all. (Role changes happen
-- out-of-band via SQL / admin tooling, not via the client.)
drop policy if exists "profiles_select_self_or_admin" on profiles;
create policy "profiles_select_self_or_admin" on profiles
  for select to authenticated
  using (id = auth.uid() or is_admin());

-- ---------------------------------------------------------------------------
-- Content RLS: public SELECT, admin-only writes. Applied to every content table.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  content_tables text[] := array[
    'papers','sections','units','subjective_questions','decks','flashcards',
    'notes','note_sections','note_videos','note_links','note_files',
    'current_affairs','resources'
  ];
begin
  foreach t in array content_tables loop
    execute format('alter table %I enable row level security;', t);

    execute format('drop policy if exists %I on %I;', t || '_select_public', t);
    execute format($f$
      create policy %I on %I
        for select to anon, authenticated using (true);
    $f$, t || '_select_public', t);

    execute format('drop policy if exists %I on %I;', t || '_write_admin', t);
    execute format($f$
      create policy %I on %I
        for all to authenticated using (is_admin()) with check (is_admin());
    $f$, t || '_write_admin', t);
  end loop;
end;
$$;
