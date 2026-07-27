-- Mission PSC — rich text + attachments for practice-answer drafts (#5).
--
-- answer_drafts.body used to be plain "your answer" text; it now holds HTML from
-- the rich-text editor (no schema change — still `text`, backward compatible: an
-- old plain-text draft renders as plain text). We add an `attachments` jsonb of
-- [{id,name,mime,size,ref}], where `ref` is the object path in a NEW bucket.
--
-- Unlike note-files (public, admin-authored content), answer drafts are the
-- STUDENT'S OWN private work — so the bucket is PRIVATE and read via signed URLs,
-- and object RLS scopes every read/write to the owner's own <uid>/ prefix.

alter table answer_drafts
  add column if not exists attachments jsonb not null default '[]'::jsonb;

-- Private bucket (public = false). Objects are keyed `<uid>/<question_id>/<file>`.
insert into storage.buckets (id, name, public, file_size_limit)
values ('answer-files', 'answer-files', false, 26214400)  -- 25 MiB
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

-- RLS: a user can only touch objects under their own top-level <uid>/ folder.
-- (storage.foldername(name))[1] is the first path segment.
drop policy if exists "answer_files_objects_own" on storage.objects;
create policy "answer_files_objects_own" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'answer-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'answer-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
