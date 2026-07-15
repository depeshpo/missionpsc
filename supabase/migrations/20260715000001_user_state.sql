-- Mission PSC — per-user state (Stage B2). Progress, answer drafts and bookmarks
-- move off localStorage into per-user tables. Each row belongs to one auth user;
-- RLS scopes every read/write to `auth.uid()`, mirroring the self-scoped policy
-- pattern from 20260624000002_auth.sql (minus the admin clause). `user_id`
-- defaults to auth.uid() so the client never has to send it.

-- ---------------------------------------------------------------------------
-- user_progress: the four id-sets (completed units, known cards, read notes,
-- attempted questions) in one table, distinguished by `kind`.
-- ---------------------------------------------------------------------------
create table if not exists user_progress (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('unit_complete', 'card_known', 'note_read', 'answer_attempted')),
  item_id    text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

-- ---------------------------------------------------------------------------
-- answer_drafts: the "your answer" free text, one row per question.
-- ---------------------------------------------------------------------------
create table if not exists answer_drafts (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id text not null,
  body        text not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- ---------------------------------------------------------------------------
-- user_bookmarks: saved items across the five content types. saved_at drives
-- the /bookmarks date filter.
-- ---------------------------------------------------------------------------
create table if not exists user_bookmarks (
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type     text not null check (type in ('current-affair', 'resource', 'note', 'question', 'flashcard')),
  item_id  text not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, type, item_id)
);

-- ---------------------------------------------------------------------------
-- RLS: a user can only see and change their own rows.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  user_tables text[] := array['user_progress', 'answer_drafts', 'user_bookmarks'];
begin
  foreach t in array user_tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists %I on %I;', t || '_own', t);
    execute format($f$
      create policy %I on %I
        for all to authenticated
        using (user_id = auth.uid())
        with check (user_id = auth.uid());
    $f$, t || '_own', t);
  end loop;
end;
$$;
