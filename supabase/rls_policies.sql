-- Application RLS baseline.
-- Apply after the application tables exist. Server-side admin routes use the
-- service_role key; browser clients must not receive write policies.

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
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
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
$$;

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

alter table public.sources enable row level security;
drop policy if exists "Public can read published sources" on public.sources;
drop policy if exists "Active users can read sources" on public.sources;
create policy "Public can read published sources"
on public.sources for select to anon
using (status = 'published' and deleted_at is null);
create policy "Active users can read sources"
on public.sources for select to authenticated
using (public.current_app_user_is_active());

alter table public.contradictions enable row level security;
drop policy if exists "Public can read published contradictions" on public.contradictions;
drop policy if exists "Active users can read contradictions" on public.contradictions;
create policy "Public can read published contradictions"
on public.contradictions for select to anon
using (status = 'published' and deleted_at is null);
create policy "Active users can read contradictions"
on public.contradictions for select to authenticated
using (public.current_app_user_is_active());

alter table public.comparisons enable row level security;
drop policy if exists "Public can read published comparisons" on public.comparisons;
drop policy if exists "Active users can read comparisons" on public.comparisons;
create policy "Public can read published comparisons"
on public.comparisons for select to anon
using (status = 'published');
create policy "Active users can read comparisons"
on public.comparisons for select to authenticated
using (public.current_app_user_is_active());

alter table public.audit_logs enable row level security;
drop policy if exists "Admins can read audit logs" on public.audit_logs;
create policy "Admins can read audit logs"
on public.audit_logs for select to authenticated
using (public.current_app_role() in ('superadmin', 'admin'));

-- There are intentionally no INSERT, UPDATE, or DELETE policies for business
-- tables or audit_logs. All mutations go through authenticated server routes.
