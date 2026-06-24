-- Mission PSC — content schema (Stage B0).
-- Mirrors src/lib/types.ts. String ids from the TS seeds are preserved as PKs so
-- existing route links and bookmark ref_ids keep working. `position` columns keep
-- author-defined ordering (the TS seeds rely on array order). RLS is added in
-- 0002_auth.sql once profiles/roles exist.

-- ---------------------------------------------------------------------------
-- Syllabus spine: papers -> sections -> units
-- ---------------------------------------------------------------------------
create table if not exists papers (
  id            text primary key,
  stage         text not null check (stage in ('main', 'interview')),
  code          text not null check (code in ('I', 'II', 'III', 'IV', 'V')),
  title         text not null,
  total_marks   integer not null,
  duration_mins integer,
  note          text,
  position      integer not null default 0
);

create table if not exists sections (
  id        text primary key,
  paper_id  text not null references papers (id) on delete cascade,
  label     text not null,
  marks     integer not null,
  pattern   text,
  position  integer not null default 0
);
create index if not exists sections_paper_id_idx on sections (paper_id);

create table if not exists units (
  id          text primary key,
  section_id  text not null references sections (id) on delete cascade,
  number      text not null,
  title       text not null,
  subtopics   text[] not null default '{}',
  position    integer not null default 0
);
create index if not exists units_section_id_idx on units (section_id);

-- ---------------------------------------------------------------------------
-- Subjective questions (answer-writing)
-- ---------------------------------------------------------------------------
create table if not exists subjective_questions (
  id           text primary key,
  paper_id     text not null references papers (id) on delete cascade,
  section_id   text not null references sections (id) on delete cascade,
  kind         text not null check (kind in ('qa','essay','translation','precis','comprehension','correspondence')),
  marks        integer not null,
  prompt       text not null,
  passage      text,
  word_target  integer,
  model_answer text,
  keywords     text[] not null default '{}',
  position     integer not null default 0
);
create index if not exists subjective_questions_paper_id_idx on subjective_questions (paper_id);
create index if not exists subjective_questions_section_id_idx on subjective_questions (section_id);

-- ---------------------------------------------------------------------------
-- Flashcards: decks -> cards (Deck.cardCount is derived on read, not stored)
-- ---------------------------------------------------------------------------
create table if not exists decks (
  id          text primary key,
  title       text not null,
  description text,
  position    integer not null default 0
);

create table if not exists flashcards (
  id        text primary key,
  deck_id   text not null references decks (id) on delete cascade,
  front     text not null,
  back      text not null,
  tags      text[] not null default '{}',
  position  integer not null default 0
);
create index if not exists flashcards_deck_id_idx on flashcards (deck_id);

-- ---------------------------------------------------------------------------
-- Notes: note -> sections -> (videos | files | links). Rich HTML body per section.
-- ---------------------------------------------------------------------------
create table if not exists notes (
  id       text primary key,
  unit_id  text not null,
  title    text not null,
  position integer not null default 0
);
create index if not exists notes_unit_id_idx on notes (unit_id);

create table if not exists note_sections (
  id        text primary key,
  note_id   text not null references notes (id) on delete cascade,
  heading   text not null,
  html      text not null default '',
  position  integer not null default 0
);
create index if not exists note_sections_note_id_idx on note_sections (note_id);

create table if not exists note_videos (
  id          text primary key,
  section_id  text not null references note_sections (id) on delete cascade,
  url         text not null,
  position    integer not null default 0
);
create index if not exists note_videos_section_id_idx on note_videos (section_id);

create table if not exists note_links (
  id          text primary key,
  section_id  text not null references note_sections (id) on delete cascade,
  title       text not null,
  url         text not null,
  position    integer not null default 0
);
create index if not exists note_links_section_id_idx on note_links (section_id);

-- `ref` is the storage path (Supabase Storage, wired in B3); until then the seed
-- carries whatever the TS data had.
create table if not exists note_files (
  id          text primary key,
  section_id  text not null references note_sections (id) on delete cascade,
  name        text not null,
  mime        text not null,
  size        bigint not null default 0,
  ref         text not null,
  position    integer not null default 0
);
create index if not exists note_files_section_id_idx on note_files (section_id);

-- ---------------------------------------------------------------------------
-- Current affairs feed
-- ---------------------------------------------------------------------------
create table if not exists current_affairs (
  id           text primary key,
  date         date not null,
  scope        text not null check (scope in ('national', 'international')),
  title        text not null,
  summary      text not null,
  body         text[],
  source_title text,
  source_href  text,
  tags         text[] not null default '{}'
);
create index if not exists current_affairs_date_idx on current_affairs (date desc);

-- ---------------------------------------------------------------------------
-- Resources library
-- ---------------------------------------------------------------------------
create table if not exists resources (
  id          text primary key,
  title       text not null,
  category    text not null,
  url         text not null,
  description text,
  position    integer not null default 0
);
