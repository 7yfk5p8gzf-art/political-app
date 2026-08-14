begin;

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
revoke execute on function public.current_app_role() from anon;
revoke execute on function public.current_app_user_is_active() from public;
revoke execute on function public.current_app_user_is_active() from anon;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.current_app_user_is_active() to authenticated;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select p.tablename, p.policyname
    from pg_catalog.pg_policies p
    where p.schemaname = 'public'
      and p.tablename in (
        'profiles',
        'sources',
        'contradictions',
        'comparisons',
        'audit_logs',
        'contradiction_votes',
        'votes'
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

do $$
declare
  policy_row record;
begin
  for policy_row in
    select p.policyname
    from pg_catalog.pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'contradiction_votes'
  loop
    execute format('drop policy %I on public.contradiction_votes', policy_row.policyname);
  end loop;
end
$$;

create policy "Public can read published contradiction votes"
on public.contradiction_votes for select to anon, authenticated
using (
  exists (
    select 1
    from public.contradictions c
    where c.id = contradiction_id
      and c.status = 'published'
      and c.deleted_at is null
  )
);

create policy "Active users can create own contradiction votes"
on public.contradiction_votes for insert to authenticated
with check (
  auth.uid() = user_id
  and public.current_app_user_is_active()
  and exists (
    select 1
    from public.contradictions c
    where c.id = contradiction_id
      and c.status = 'published'
      and c.deleted_at is null
  )
);

commit;
