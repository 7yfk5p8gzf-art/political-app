with required_tables(table_name) as (
  values
    ('profiles'),
    ('sources'),
    ('contradictions'),
    ('comparisons'),
    ('audit_logs'),
    ('contradiction_votes')
), expected_policies(table_name, policyname, cmd) as (
  values
    ('profiles', 'Users can read own profile', 'SELECT'),
    ('profiles', 'Superadmin can read all profiles', 'SELECT'),
    ('sources', 'Public can read published sources', 'SELECT'),
    ('sources', 'Editors can read source workflow', 'SELECT'),
    ('sources', 'Reviewers can read source workflow', 'SELECT'),
    ('sources', 'Admins can read all sources', 'SELECT'),
    ('contradictions', 'Public can read published contradictions', 'SELECT'),
    ('contradictions', 'Editors can read contradiction workflow', 'SELECT'),
    ('contradictions', 'Reviewers can read contradiction workflow', 'SELECT'),
    ('contradictions', 'Admins can read all contradictions', 'SELECT'),
    ('comparisons', 'Public can read published comparisons', 'SELECT'),
    ('comparisons', 'Editors can read comparison workflow', 'SELECT'),
    ('comparisons', 'Reviewers can read comparison workflow', 'SELECT'),
    ('comparisons', 'Admins can read all comparisons', 'SELECT'),
    ('audit_logs', 'Admins can read audit logs', 'SELECT'),
    ('contradiction_votes', 'Public can read published contradiction votes', 'SELECT'),
    ('contradiction_votes', 'Active users can create own contradiction votes', 'INSERT')
), legacy_policies(policyname) as (
  values
    ('Active users can read sources'),
    ('Active users can read contradictions'),
    ('Active users can read comparisons'),
    ('Superadmin can update profiles'),
    ('Browser read policy')
), orphan_stats as (
  select
    count(*)::bigint as orphan_vote_count,
    count(distinct cv.contradiction_id)::bigint as orphan_id_count
  from public.contradiction_votes cv
  where not exists (
    select 1
    from public.contradictions c
    where c.id = cv.contradiction_id
  )
), type_checks as (
  select
    max(case when table_name = 'contradictions' and column_name = 'id' then udt_name end) as parent_type,
    max(case when table_name = 'contradiction_votes' and column_name = 'contradiction_id' then udt_name end) as child_type
  from information_schema.columns
  where table_schema = 'public'
    and (
      (table_name = 'contradictions' and column_name = 'id')
      or (table_name = 'contradiction_votes' and column_name = 'contradiction_id')
    )
), fk_checks as (
  select exists (
    select 1
    from pg_catalog.pg_constraint fk
    where fk.contype = 'f'
      and fk.conrelid = 'public.contradiction_votes'::regclass
      and fk.confrelid = 'public.contradictions'::regclass
      and fk.conkey = array[
        (select a.attnum from pg_catalog.pg_attribute a
         where a.attrelid = 'public.contradiction_votes'::regclass
           and a.attname = 'contradiction_id' and not a.attisdropped)
      ]::smallint[]
      and fk.confkey = array[
        (select a.attnum from pg_catalog.pg_attribute a
         where a.attrelid = 'public.contradictions'::regclass
           and a.attname = 'id' and not a.attisdropped)
      ]::smallint[]
      and fk.confdeltype = 'r'
  ) as fk_ok
), rls_stats as (
  select
    count(*) filter (where c.oid is not null)::bigint as present_table_count,
    count(*) filter (where c.oid is not null and c.relrowsecurity)::bigint as enabled_table_count,
    count(*)::bigint as required_table_count
  from required_tables rt
  left join pg_catalog.pg_class c
    on c.relname = rt.table_name
   and c.relnamespace = 'public'::regnamespace
), helper_functions as (
  select
    p.oid,
    p.proname,
    pg_get_function_result(p.oid) as return_type,
    pg_get_functiondef(p.oid) as definition,
    p.prosecdef,
    p.proconfig,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in ('current_app_role', 'current_app_user_is_active')
    and pg_get_function_identity_arguments(p.oid) = ''
), checks as (
  select
    case when os.orphan_vote_count = 0 then 'PASS' else 'FAIL' end as status,
    'ORPHAN_VOTES'::text as check_id,
    'public.contradiction_votes'::text as object_name,
    format('orphan_vote_count=%s, orphan_id_count=%s', os.orphan_vote_count, os.orphan_id_count) as details
  from orphan_stats os

  union all

  select
    case when tc.parent_type = 'uuid' and tc.child_type = 'uuid' then 'PASS' else 'FAIL' end,
    'ID_TYPES',
    'public.contradictions.id / public.contradiction_votes.contradiction_id',
    format('parent_udt=%s, child_udt=%s', coalesce(tc.parent_type, '<missing>'), coalesce(tc.child_type, '<missing>'))
  from type_checks tc

  union all

  select
    case when fc.fk_ok then 'PASS' else 'FAIL' end,
    'FOREIGN_KEY',
    'public.contradiction_votes.contradiction_id -> public.contradictions.id',
    case when fc.fk_ok then 'Validated foreign key exists with ON DELETE RESTRICT.' else 'Validated foreign key is missing or has an incompatible delete action.' end
  from fk_checks fc

  union all

  select
    case when rs.present_table_count = rs.required_table_count and rs.enabled_table_count = rs.required_table_count then 'PASS' else 'FAIL' end,
    'RLS_ACTIVE',
    'required public tables',
    format('present=%s/%s, rls_enabled=%s/%s', rs.present_table_count, rs.required_table_count, rs.enabled_table_count, rs.required_table_count)
  from rls_stats rs

  union all

  select
    case when count(*) = 0 then 'PASS' else 'FAIL' end,
    'EXPECTED_POLICIES',
    'public policies',
    case when count(*) = 0 then 'All required policy names and commands exist.' else string_agg(ep.table_name || '.' || ep.policyname, ', ' order by ep.table_name, ep.policyname) || ' missing.' end
  from expected_policies ep
  left join pg_catalog.pg_policies p
    on p.schemaname = 'public'
   and p.tablename = ep.table_name
   and p.policyname = ep.policyname
   and p.cmd = ep.cmd
  where p.policyname is null

  union all

  select
    case when count(*) = 0 then 'PASS' else 'FAIL' end,
    'LEGACY_POLICIES_ABSENT',
    'public policies',
    case when count(*) = 0 then 'Known legacy policy names are absent.' else string_agg(p.tablename || '.' || p.policyname, ', ' order by p.tablename, p.policyname) || ' still exists.' end
  from pg_catalog.pg_policies p
  join legacy_policies lp on lp.policyname = p.policyname
  where p.schemaname = 'public'

  union all

  select
    case when count(*) = 0 then 'PASS' else 'FAIL' end,
    'UNEXPECTED_BROWSER_WRITE_POLICIES',
    'public policies',
    case when count(*) = 0 then 'No unexpected INSERT/UPDATE/DELETE/ALL policy is granted to browser roles.' else string_agg(p.tablename || '.' || p.policyname || ':' || p.cmd, ', ' order by p.tablename, p.policyname) end
  from pg_catalog.pg_policies p
  where p.schemaname = 'public'
    and p.tablename in (select table_name from required_tables)
    and p.cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
    and p.roles && array['anon', 'authenticated', 'public']::name[]
    and not (
      p.tablename = 'contradiction_votes'
      and p.policyname = 'Active users can create own contradiction votes'
      and p.cmd = 'INSERT'
    )

  union all

  select
    case when count(*) = 2
      and bool_and(prosecdef)
      and bool_and(return_type = case proname when 'current_app_role' then 'text' when 'current_app_user_is_active' then 'boolean' end)
      and bool_and(definition !~* '(p[.]id|auth[.]uid[(][)])[[:space:]]*[)]?[[:space:]]*::[[:space:]]*text')
      and bool_and(coalesce(array_to_string(proconfig, ','), '') like '%search_path=pg_catalog, public%')
      then 'PASS' else 'FAIL' end,
    'HELPER_FUNCTIONS',
    'public.current_app_role(), public.current_app_user_is_active()',
    format('function_count=%s; security_definer=%s; return_types=%s; no_text_casts=%s; fixed_search_path=%s',
      count(*), bool_and(prosecdef), bool_and(return_type = case proname when 'current_app_role' then 'text' when 'current_app_user_is_active' then 'boolean' end), bool_and(definition !~* '(p[.]id|auth[.]uid[(][)])[[:space:]]*[)]?[[:space:]]*::[[:space:]]*text'),
      bool_and(coalesce(array_to_string(proconfig, ','), '') like '%search_path=pg_catalog, public%'))
  from helper_functions

  union all

  select
    case
      when count(*) = 2
       and count(*) filter (where p.policyname = 'Public can read published contradiction votes' and p.cmd = 'SELECT') = 1
       and count(*) filter (where p.policyname = 'Active users can create own contradiction votes' and p.cmd = 'INSERT') = 1
       and bool_and(coalesce(p.qual, '') !~* '(c[.]id|contradiction_id|auth[.]uid[(][)]|user_id)[[:space:]]*[)]?[[:space:]]*::[[:space:]]*text')
       and bool_and(coalesce(p.with_check, '') !~* '(c[.]id|contradiction_id|auth[.]uid[(][)]|user_id)[[:space:]]*[)]?[[:space:]]*::[[:space:]]*text')
      then 'PASS' else 'FAIL'
    end,
    'UUID_POLICY_EXPRESSIONS',
    'public.contradiction_votes policies',
    format(
      'policy_count=%s; expected_select=%s; expected_insert=%s; select_without_id_text_cast=%s; insert_without_id_text_cast=%s',
      count(*),
      count(*) filter (where p.policyname = 'Public can read published contradiction votes' and p.cmd = 'SELECT'),
      count(*) filter (where p.policyname = 'Active users can create own contradiction votes' and p.cmd = 'INSERT'),
      bool_and(coalesce(p.qual, '') !~* '(c[.]id|contradiction_id|auth[.]uid[(][)]|user_id)[[:space:]]*[)]?[[:space:]]*::[[:space:]]*text'),
      bool_and(coalesce(p.with_check, '') !~* '(c[.]id|contradiction_id|auth[.]uid[(][)]|user_id)[[:space:]]*[)]?[[:space:]]*::[[:space:]]*text')
    )
  from pg_catalog.pg_policies p
  where p.schemaname = 'public'
    and p.tablename = 'contradiction_votes'

  union all

  select
    case when count(*) = 2 and bool_and(not anon_execute and authenticated_execute) then 'PASS' else 'FAIL' end,
    'HELPER_EXECUTE_PRIVILEGES',
    'public helper functions',
    format('function_count=%s; effective_anon_execute=%s; authenticated_execute=%s', count(*), bool_or(anon_execute), bool_and(authenticated_execute))
  from helper_functions
)
select status, check_id, object_name, details
from checks
order by case status when 'FAIL' then 1 else 2 end, check_id;
