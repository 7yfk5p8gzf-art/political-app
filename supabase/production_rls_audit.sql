-- Read-only production migration-blocker audit for supabase/rls_policies.sql.
--
-- Exactly one result set is returned. Every executable statement is a SELECT
-- or WITH query. Expected pre-migration state, safe policy replacement, and
-- RLS-disabled state are intentionally omitted.
--
-- status is only MIGRATION_BLOCKER or NEEDS_REVIEW.

with
fixed_tables(table_name) as (
  values
    ('profiles'),
    ('sources'),
    ('contradictions'),
    ('comparisons'),
    ('audit_logs')
),
optional_tables(table_name) as (
  values
    ('votes'),
    ('contradiction_votes'),
    ('politicians'),
    ('politician_profiles'),
    ('ai_search_cache'),
    ('topic_memory'),
    ('contradiction_memory')
),
required_columns(table_name, column_name) as (
  values
    ('profiles', 'id'),
    ('profiles', 'role'),
    ('profiles', 'is_active'),
    ('sources', 'status'),
    ('sources', 'deleted_at'),
    ('contradictions', 'status'),
    ('contradictions', 'deleted_at'),
    ('comparisons', 'id'),
    ('comparisons', 'status'),
    ('votes', 'comparison_id'),
    ('contradiction_votes', 'contradiction_id'),
    ('contradiction_votes', 'user_id'),
    ('politicians', 'active')
),
id_type_pairs(parent_table, parent_column, child_table, child_column) as (
  values
    ('comparisons', 'id', 'votes', 'comparison_id'),
    ('contradictions', 'id', 'contradiction_votes', 'contradiction_id'),
    ('profiles', 'id', 'contradiction_votes', 'user_id')
),
public_relations as (
  select
    c.oid,
    c.relname as relation_name,
    c.relkind,
    c.relowner,
    case c.relkind
      when 'r' then 'BASE TABLE'
      when 'p' then 'PARTITIONED TABLE'
      when 'v' then 'VIEW'
      when 'm' then 'MATERIALIZED VIEW'
      when 'f' then 'FOREIGN TABLE'
      else c.relkind::text
    end as relation_type
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n
    on n.oid = c.relnamespace
  where n.nspname = 'public'
),
public_tables as (
  select *
  from public_relations
  where relkind in ('r', 'p')
),
public_columns as (
  select
    c.table_name,
    c.column_name,
    c.data_type,
    c.udt_schema,
    c.udt_name,
    c.is_nullable
  from information_schema.columns c
  join public_tables t
    on t.relation_name = c.table_name
  where c.table_schema = 'public'
),
auth_uid_function as (
  select
    pg_get_function_result(p.oid) as return_type
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n
    on n.oid = p.pronamespace
  where n.nspname = 'auth'
    and p.proname = 'uid'
    and pg_get_function_identity_arguments(p.oid) = ''
),
helper_functions as (
  select
    p.oid,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as identity_arguments,
    p.prorettype,
    pg_get_function_result(p.oid) as return_type,
    p.proowner,
    pg_get_userbyid(p.proowner) as owner,
    p.proacl
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n
    on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in ('current_app_role', 'current_app_user_is_active')
),
session_role as (
  select
    current_user as role_name,
    r.rolsuper as is_superuser,
    has_schema_privilege(current_user, 'public', 'CREATE') as public_schema_create
  from pg_catalog.pg_roles r
  where r.rolname = current_user
),
current_policies as (
  select
    p.schemaname,
    p.tablename,
    p.policyname,
    p.roles,
    p.cmd,
    p.qual,
    p.with_check
  from pg_catalog.pg_policies p
  where p.schemaname = 'public'
    and p.tablename in (
      select table_name from fixed_tables
      union all
      select table_name from optional_tables
    )
),
current_policy_roles as (
  select
    cp.*,
    role_name
  from current_policies cp
  cross join lateral unnest(cp.roles) as roles(role_name)
),
required_profile_columns as (
  select count(*) = 3 as complete
  from required_columns rc
  join public_columns pc
    on pc.table_name = rc.table_name
   and pc.column_name = rc.column_name
  where rc.table_name = 'profiles'
),
policy_review_flags as (
  -- A custom role is not represented by the new migration. This may be an
  -- intentional legacy policy, but its functional loss cannot be inferred
  -- safely from catalogs alone.
  select distinct
    'NEEDS_REVIEW'::text as status,
    'CUSTOM_POLICY_ROLE'::text as check_id,
    'policy'::text as category,
    format('public.%s / %s', cpr.tablename, cpr.policyname) as object_name,
    format(
      'Current %s policy grants role %s. The new migration grants only anon/authenticated for browser policies; verify that this custom role does not require access.',
      cpr.cmd,
      cpr.role_name
    ) as details
  from current_policy_roles cpr
  where cpr.role_name not in ('anon', 'authenticated', 'public', 'service_role')

  union all

  -- The application review UI explicitly loads rejected comparisons. The new
  -- comparison workflow policies omit rejected, so an existing authenticated
  -- SELECT policy would lose a workflow capability.
  select distinct
    'NEEDS_REVIEW'::text,
    'COMPARISON_REJECTED_WORKFLOW'::text,
    'policy'::text,
    format('public.%s / %s', cp.tablename, cp.policyname),
    'The current authenticated SELECT policy may expose rejected comparisons, but the new comparison workflow policies allow only draft/review/published. Confirm whether reviewer/editor access to rejected comparisons is required before applying.'
  from current_policies cp
  where cp.tablename = 'comparisons'
    and cp.cmd = 'SELECT'
    and ('public' = any(cp.roles) or 'authenticated' = any(cp.roles))
    and coalesce(cp.qual, '') not ilike '%status%published%'
),
schema_blockers as (
  select
    'MIGRATION_BLOCKER'::text as status,
    'TABLE_RELATION'::text as check_id,
    'relation'::text as category,
    format('public.%s', ft.table_name) as object_name,
    case
      when pr.relation_name is null then
        format('Required fixed relation public.%s is missing; ALTER TABLE/CREATE POLICY statements target it directly.', ft.table_name)
      else
        format('public.%s exists as %s, not BASE TABLE or PARTITIONED TABLE.', ft.table_name, pr.relation_type)
    end as details
  from fixed_tables ft
  left join public_relations pr
    on pr.relation_name = ft.table_name
  where pr.relation_name is null
     or pr.relkind not in ('r', 'p')

  union all

  select
    'MIGRATION_BLOCKER',
    'COLUMN_EXISTS',
    'column',
    format('public.%s.%s', rc.table_name, rc.column_name),
    format('Required column public.%s.%s is missing; an RLS policy or helper function references it.', rc.table_name, rc.column_name)
  from required_columns rc
  left join public_relations pr
    on pr.relation_name = rc.table_name
  left join public_columns pc
    on pc.table_name = rc.table_name
   and pc.column_name = rc.column_name
  where (pr.relkind in ('r', 'p') and pc.column_name is null)
     or (pr.relation_name is not null and pr.relkind not in ('r', 'p'))

  union all

  -- Optional tables are guarded in the migration, so a missing optional table
  -- is not a blocker. If present, however, it must be a real table and its
  -- policy-referenced columns must exist.
  select
    'MIGRATION_BLOCKER',
    'OPTIONAL_RELATION_TYPE',
    'relation',
    format('public.%s', ot.table_name),
    format('Optional relation public.%s exists as %s; the guarded ALTER TABLE/policy block requires a BASE TABLE or PARTITIONED TABLE.', ot.table_name, pr.relation_type)
  from optional_tables ot
  join public_relations pr
    on pr.relation_name = ot.table_name
  where pr.relkind not in ('r', 'p')

  union all

  select
    'MIGRATION_BLOCKER',
    'OPTIONAL_COLUMN_EXISTS',
    'column',
    format('public.%s.%s', rc.table_name, rc.column_name),
    format('Optional relation public.%s exists, but required policy column %s is missing.', rc.table_name, rc.column_name)
  from required_columns rc
  join optional_tables ot
    on ot.table_name = rc.table_name
  join public_tables pt
    on pt.relation_name = rc.table_name
  left join public_columns pc
    on pc.table_name = rc.table_name
   and pc.column_name = rc.column_name
  where pc.column_name is null

  union all

  select
    'MIGRATION_BLOCKER',
    'ID_TYPE_COMPATIBILITY',
    'type',
    format('public.%s.%s = public.%s.%s', p.table_name, p.column_name, c.table_name, c.column_name),
    format('Referenced ID type %s.%s differs from policy-side ID type %s.%s. UUID-linked policies must use compatible native types before applying the RLS source.', p.udt_schema, p.udt_name, c.udt_schema, c.udt_name)
  from id_type_pairs itp
  join public_columns p
    on p.table_name = itp.parent_table
   and p.column_name = itp.parent_column
  join public_columns c
    on c.table_name = itp.child_table
   and c.column_name = itp.child_column
  where format('%s.%s', p.udt_schema, p.udt_name)
     <> format('%s.%s', c.udt_schema, c.udt_name)

  union all

  select
    'MIGRATION_BLOCKER',
    'AUTH_UID_TYPE_COMPATIBILITY',
    'type',
    'auth.uid() = public.profiles.id / public.contradiction_votes.user_id',
    format('auth.uid() returns %s, while one or more policy-side user ID columns use a different type.', au.return_type)
  from auth_uid_function au
  join public_columns p
    on p.table_name = 'profiles'
   and p.column_name = 'id'
  join public_columns cv
    on cv.table_name = 'contradiction_votes'
   and cv.column_name = 'user_id'
  where regexp_replace(au.return_type, '^.*\.', '') <> p.udt_name
     or regexp_replace(au.return_type, '^.*\.', '') <> cv.udt_name

  union all

  select
    'MIGRATION_BLOCKER',
    'AUTH_UID_FUNCTION',
    'function',
    'auth.uid()',
    'auth.uid() is missing; helper and contradiction-vote policies cannot be validated or executed.'
  where not exists (select 1 from auth_uid_function)
),
function_blockers as (
  select
    'MIGRATION_BLOCKER'::text as status,
    'FUNCTION_RETURN_TYPE'::text as check_id,
    'function'::text as category,
    format('public.%s()', x.function_name) as object_name,
    format('Zero-argument helper has return type %s; expected exactly %s.', x.return_type, x.expected_type)
  from (
    select
      hf.function_name,
      hf.return_type,
      case hf.function_name
        when 'current_app_role' then 'text'
        when 'current_app_user_is_active' then 'boolean'
      end as expected_type
    from helper_functions hf
    where hf.identity_arguments = ''
  ) x
  where (x.function_name = 'current_app_role' and x.return_type <> 'text')
     or (x.function_name = 'current_app_user_is_active' and x.return_type <> 'boolean')

  union all

  select
    'MIGRATION_BLOCKER',
    'FUNCTION_OVERLOAD',
    'function',
    format('public.%s()', fn.function_name),
    format('%s overload(s) exist for this function name; CREATE OR REPLACE may not target the intended signature safely.', count(*))
  from helper_functions fn
  group by fn.function_name
  having count(*) > 1

  union all

  -- A missing helper is safe when profiles prerequisites exist and this role
  -- can create it. If CREATE is unavailable, the migration cannot proceed.
  select
    'MIGRATION_BLOCKER',
    'FUNCTION_CREATE_PRIVILEGE',
    'privilege',
    format('public.%s()', rf.function_name),
    format('Helper is missing and current role %s cannot CREATE it in schema public.', sr.role_name)
  from (values ('current_app_role'), ('current_app_user_is_active')) rf(function_name)
  cross join session_role sr
  cross join required_profile_columns rpc
  where rpc.complete
    and not exists (
      select 1
      from helper_functions hf
      where hf.function_name = rf.function_name
        and hf.identity_arguments = ''
    )
    and not (sr.is_superuser or sr.public_schema_create)
),
privilege_blockers as (
  select
    'MIGRATION_BLOCKER'::text as status,
    'TABLE_POLICY_PRIVILEGE'::text as check_id,
    'privilege'::text as category,
    format('public.%s', ft.table_name) as object_name,
    format('Current role %s is not owner/superuser for table public.%s; ALTER TABLE or policy changes may fail.', current_user, ft.table_name)
  from fixed_tables ft
  join public_tables pt
    on pt.relation_name = ft.table_name
  cross join session_role sr
  where not sr.is_superuser
    and not pg_has_role(current_user, pt.relowner, 'USAGE')

  union all

  select distinct
    'MIGRATION_BLOCKER',
    'FUNCTION_REPLACE_PRIVILEGE',
    'privilege',
    format('public.%s()', hf.function_name),
    format('Current role %s is not owner/superuser for helper function %s; CREATE OR REPLACE may fail.', current_user, hf.owner)
  from helper_functions hf
  cross join session_role sr
  where hf.identity_arguments = ''
    and not sr.is_superuser
    and not pg_has_role(current_user, hf.proowner, 'USAGE')

  union all

  select distinct
    'MIGRATION_BLOCKER',
    'FUNCTION_ACL_PRIVILEGE',
    'privilege',
    format('public.%s()', hf.function_name),
    format('Current role %s is not owner/superuser for helper function %s; GRANT/REVOKE EXECUTE may fail.', current_user, hf.owner)
  from helper_functions hf
  cross join session_role sr
  where hf.identity_arguments = ''
    and not sr.is_superuser
    and not pg_has_role(current_user, hf.proowner, 'USAGE')
),
all_findings as (
  select * from schema_blockers
  union all
  select * from function_blockers
  union all
  select * from privilege_blockers
  union all
  select * from policy_review_flags
)
select
  status,
  check_id,
  category,
  object_name,
  details
from all_findings
order by
  case status when 'MIGRATION_BLOCKER' then 1 else 2 end,
  category,
  check_id,
  object_name;
