-- Manual verification queries for supabase/rls_policies.sql.
-- Run in the Supabase SQL editor after applying the policy migration.

select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'sources', 'contradictions', 'comparisons', 'audit_logs')
order by c.relname;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'sources', 'contradictions', 'comparisons', 'audit_logs')
order by tablename, policyname;

-- Expected invariant: no INSERT/UPDATE/DELETE policy exists for sources,
-- contradictions, comparisons, or audit_logs.
select tablename, cmd, count(*) as policy_count
from pg_policies
where schemaname = 'public'
  and tablename in ('sources', 'contradictions', 'comparisons', 'audit_logs')
  and cmd in ('INSERT', 'UPDATE', 'DELETE')
group by tablename, cmd
order by tablename, cmd;
