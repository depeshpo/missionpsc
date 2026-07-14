-- Mission PSC — Storage bucket for note file attachments (Stage B3, folded into
-- the notes B1 slice). Blobs used to live in the admin's own browser (IndexedDB
-- via src/lib/noteFiles.ts), which is invisible to every other user now that the
-- app is multi-user. `note_files.ref` becomes the object path in this bucket.
--
-- The bucket is PUBLIC, matching the content tables (all public-read): readers
-- can use a plain public URL with no signing round-trip. Writes are admin-only,
-- reusing the security-definer is_admin() from 20260624000002_auth.sql.

insert into storage.buckets (id, name, public, file_size_limit)
values ('note-files', 'note-files', true, 26214400)  -- 25 MiB
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "note_files_objects_select_public" on storage.objects;
create policy "note_files_objects_select_public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'note-files');

drop policy if exists "note_files_objects_write_admin" on storage.objects;
create policy "note_files_objects_write_admin" on storage.objects
  for all to authenticated
  using (bucket_id = 'note-files' and is_admin())
  with check (bucket_id = 'note-files' and is_admin());
