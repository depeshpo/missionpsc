-- Standard Supabase role grants for the public schema.
--
-- Supabase CLOUD applies these automatically when it provisions a project, so the
-- earlier migrations worked on prod WITHOUT any explicit grants. A fresh database
-- that Supabase did not provision — the local Docker stack, a brand-new cloud
-- project, or a CI Postgres — does not get them, leaving anon/authenticated/
-- service_role with no DML (every PostgREST query 401s / "permission denied").
--
-- Adding them here makes the schema self-contained and portable. Row-Level Security
-- remains the actual access gate (content = public read / admin-only writes; the
-- user_* tables = self-scoped); these are just the table-level grants RLS sits on.

grant usage on schema public to anon, authenticated, service_role;

-- Existing objects.
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

-- Future objects created by later migrations inherit the same grants.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on routines to anon, authenticated, service_role;
