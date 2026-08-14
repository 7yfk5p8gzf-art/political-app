-- Authentication bootstrap only.
-- Migration order is intentional:
--   1. Run this file to create profiles and the auth trigger.
--   2. Run supabase/rls_policies.sql as the single, final policy source.
-- Do not add profiles policies here; that would reintroduce policy drift.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'editor' check (role in ('superadmin', 'admin', 'reviewer', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists is_active boolean not null default true;

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- első főadmin kézi beállítása példa:
-- update public.profiles set role = 'superadmin' where email = 'foadmin@app.hu';
