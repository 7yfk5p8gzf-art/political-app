-- Final application RLS source.
-- Migration order:
--   1. Run supabase/auth_setup.sql (tables + auth trigger only).
--   2. Run this file after all application tables exist.
--
-- Browser clients receive narrowly scoped read policies and contradiction-vote
-- inserts.
-- Content and administrative writes continue through server routes using the
-- service_role key.

-- These helpers read profiles without recursively evaluating profiles RLS.
-- Keep the body fully schema-qualified and the search_path fixed.
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
$$;

create or replace function public.current_app_user_is_active()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
$$;

revoke execute on function public.current_app_role() from public;
revoke execute on function public.current_app_user_is_active() from public;
revoke execute on function public.current_app_role() from anon;
revoke execute on function public.current_app_user_is_active() from anon;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.current_app_user_is_active() to authenticated;

-- Remove only browser-role write policies outside the intended contradiction
-- vote INSERT policy. Service-role-only policies are retained; service_role
-- bypasses RLS and is not a browser role.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select p.tablename, p.policyname
    from pg_catalog.pg_policies p
    where p.schemaname = 'public'
      and p.tablename in (
        'profiles', 'sources', 'contradictions', 'comparisons',
        'audit_logs', 'contradiction_votes', 'votes'
      )
      and p.cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and p.roles && array['anon', 'authenticated', 'public']::name[]
      and not (
        p.tablename = 'contradiction_votes'
        and p.policyname = 'Active users can create own contradiction votes'
        and p.cmd = 'INSERT'
      )
  loop
    execute format('drop policy %I on public.%I', policy_row.policyname, policy_row.tablename);
  end loop;
end
$$;

-- Profiles: users can read themselves; only superadmins can read the directory.
-- There is deliberately no browser update policy. User mutations belong to the
-- authenticated server routes and use service_role.
alter table public.profiles enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Superadmin can read all profiles" on public.profiles;
drop policy if exists "Superadmin can update profiles" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select to authenticated
using (auth.uid() = id);
create policy "Superadmin can read all profiles"
on public.profiles for select to authenticated
using (public.current_app_role() = 'superadmin');

-- Public content. Admins can inspect deleted records; editorial users can
-- inspect workflow content according to their role, but never deleted rows.
alter table public.sources enable row level security;
drop policy if exists "Public can read published sources" on public.sources;
drop policy if exists "Active users can read sources" on public.sources;
drop policy if exists "Editors can read source workflow" on public.sources;
drop policy if exists "Reviewers can read source workflow" on public.sources;
drop policy if exists "Admins can read all sources" on public.sources;
create policy "Public can read published sources"
on public.sources for select to anon, authenticated
using (status = 'published' and deleted_at is null);
create policy "Editors can read source workflow"
on public.sources for select to authenticated
using (
  public.current_app_role() = 'editor'
  and status in ('draft', 'review', 'published')
  and deleted_at is null
);
create policy "Reviewers can read source workflow"
on public.sources for select to authenticated
using (
  public.current_app_role() = 'reviewer'
  and status in ('draft', 'review', 'approved', 'published')
  and deleted_at is null
);
create policy "Admins can read all sources"
on public.sources for select to authenticated
using (public.current_app_role() in ('admin', 'superadmin'));

alter table public.contradictions enable row level security;
drop policy if exists "Public can read published contradictions" on public.contradictions;
drop policy if exists "Active users can read contradictions" on public.contradictions;
drop policy if exists "Editors can read contradiction workflow" on public.contradictions;
drop policy if exists "Reviewers can read contradiction workflow" on public.contradictions;
drop policy if exists "Admins can read all contradictions" on public.contradictions;
create policy "Public can read published contradictions"
on public.contradictions for select to anon, authenticated
using (status = 'published' and deleted_at is null);
create policy "Editors can read contradiction workflow"
on public.contradictions for select to authenticated
using (
  public.current_app_role() = 'editor'
  and status in ('draft', 'review', 'published')
  and deleted_at is null
);
create policy "Reviewers can read contradiction workflow"
on public.contradictions for select to authenticated
using (
  public.current_app_role() = 'reviewer'
  and status in ('draft', 'review', 'approved', 'published')
  and deleted_at is null
);
create policy "Admins can read all contradictions"
on public.contradictions for select to authenticated
using (public.current_app_role() in ('admin', 'superadmin'));

alter table public.comparisons enable row level security;
drop policy if exists "Public can read published comparisons" on public.comparisons;
drop policy if exists "Active users can read comparisons" on public.comparisons;
drop policy if exists "Editors can read comparison workflow" on public.comparisons;
drop policy if exists "Reviewers can read comparison workflow" on public.comparisons;
drop policy if exists "Admins can read all comparisons" on public.comparisons;
create policy "Public can read published comparisons"
on public.comparisons for select to anon, authenticated
using (status = 'published');
create policy "Editors can read comparison workflow"
on public.comparisons for select to authenticated
using (
  public.current_app_role() = 'editor'
  and status in ('draft', 'review', 'published')
);
create policy "Reviewers can read comparison workflow"
on public.comparisons for select to authenticated
using (
  public.current_app_role() = 'reviewer'
  and status in ('draft', 'review', 'published')
);
create policy "Admins can read all comparisons"
on public.comparisons for select to authenticated
using (public.current_app_role() in ('admin', 'superadmin'));

alter table public.audit_logs enable row level security;
drop policy if exists "Admins can read audit logs" on public.audit_logs;
create policy "Admins can read audit logs"
on public.audit_logs for select to authenticated
using (public.current_app_role() in ('superadmin', 'admin'));

-- Public comparison votes are readable only for published comparisons. The
-- current application reads votes but does not insert them from the browser;
-- comparison vote writes therefore remain service_role-only.
do $$
declare
  policy_name text;
begin
  if to_regclass('public.votes') is not null then
    execute 'alter table public.votes enable row level security';
    execute 'drop policy if exists "Public can read published comparison votes" on public.votes';
    execute 'drop policy if exists "Active users can create own comparison votes" on public.votes';
    execute $policy$
      create policy "Public can read published comparison votes"
      on public.votes for select to anon, authenticated
      using (
        exists (
          select 1 from public.comparisons c
          where c.id::text = comparison_id::text
            and c.status = 'published'
          )
        )
    $policy$;
  end if;

  if to_regclass('public.contradiction_votes') is not null then
    execute 'alter table public.contradiction_votes enable row level security';
    for policy_name in
      select p.policyname
      from pg_catalog.pg_policies p
      where p.schemaname = 'public'
        and p.tablename = 'contradiction_votes'
    loop
      execute format('drop policy %I on public.contradiction_votes', policy_name);
    end loop;
    execute $policy$
      create policy "Public can read published contradiction votes"
      on public.contradiction_votes for select to anon, authenticated
      using (
        exists (
          select 1 from public.contradictions c
          where c.id = contradiction_id
            and c.status = 'published'
            and c.deleted_at is null
        )
      )
    $policy$;
    execute $policy$
      create policy "Active users can create own contradiction votes"
      on public.contradiction_votes for insert to authenticated
      with check (
        auth.uid() = user_id
        and public.current_app_user_is_active()
        and exists (
          select 1 from public.contradictions c
          where c.id = contradiction_id
            and c.status = 'published'
            and c.deleted_at is null
        )
      )
    $policy$;
  end if;
end
$$;

-- Registry data is public only when explicitly active. Profile/memory/cache
-- tables are server-side AI state and intentionally have no browser policies.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['politicians', 'politician_profiles', 'ai_search_cache', 'topic_memory', 'contradiction_memory'] loop
    if to_regclass(format('public.%s', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('drop policy if exists "Browser read policy" on public.%I', table_name);
    end if;
  end loop;

  if to_regclass('public.politicians') is not null then
    execute $policy$
      create policy "Public can read active politicians"
      on public.politicians for select to anon, authenticated
      using (active = true)
    $policy$;
  end if;
end
$$;

-- No INSERT, UPDATE, or DELETE policies are granted to browser roles on
-- content, profiles, audit, registry, cache, or memory tables. service_role
-- bypasses RLS and is used only by server-side routes.
