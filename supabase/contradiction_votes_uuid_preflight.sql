-- Read-only preflight for converting
-- public.contradiction_votes.contradiction_id from text to uuid.
--
-- This file performs no CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, GRANT,
-- or REVOKE. It is safe to run repeatedly because it has no side effects.
--
-- A UUID conversion is data-compatible only when:
--   1. public.contradictions.id is uuid;
--   2. public.contradiction_votes.contradiction_id is text-like;
--   3. every non-null vote ID is a valid PostgreSQL UUID; and
--   4. every converted UUID has a matching public.contradictions.id row.

with
column_metadata as (
  select
    table_name,
    column_name,
    data_type,
    udt_schema,
    udt_name
  from information_schema.columns
  where table_schema = 'public'
    and (
      (table_name = 'contradictions' and column_name = 'id')
      or (table_name = 'contradiction_votes' and column_name = 'contradiction_id')
    )
),
vote_values as (
  select
    cv.contradiction_id,
    case
      when cv.contradiction_id is not null
       and btrim(cv.contradiction_id) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then btrim(cv.contradiction_id)::uuid
      else null::uuid
    end as contradiction_uuid,
    case
      when cv.contradiction_id is not null
       and btrim(cv.contradiction_id) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then false
      else true
    end as invalid_uuid
  from public.contradiction_votes cv
),
integrity as (
  select
    count(*) as total_vote_rows,
    count(*) filter (where invalid_uuid) as invalid_uuid_rows,
    count(*) filter (where not invalid_uuid and c.id is null) as orphan_rows,
    count(*) filter (where not invalid_uuid and c.id is not null) as valid_parent_rows,
    count(*) filter (where contradiction_id is null) as null_id_rows
  from vote_values v
  left join public.contradictions c
    on c.id = v.contradiction_uuid
),
metadata_status as (
  select
    max(case when table_name = 'contradictions' and column_name = 'id' then udt_name end) as parent_udt,
    max(case when table_name = 'contradiction_votes' and column_name = 'contradiction_id' then udt_name end) as child_udt,
    max(case when table_name = 'contradictions' and column_name = 'id' then data_type end) as parent_data_type,
    max(case when table_name = 'contradiction_votes' and column_name = 'contradiction_id' then data_type end) as child_data_type
  from column_metadata
),
findings as (
  select
    'MIGRATION_BLOCKER'::text as status,
    'PARENT_ID_TYPE'::text as check_id,
    'public.contradictions.id'::text as object_name,
    case
      when parent_udt is null then 'Parent ID column is missing.'
      when parent_udt <> 'uuid' then format('Parent ID type is %s, expected uuid.', parent_udt)
      else 'Parent ID type is uuid.'
    end as details
  from metadata_status
  where parent_udt is null or parent_udt <> 'uuid'

  union all

  select
    'NEEDS_REVIEW',
    'CHILD_ID_TYPE',
    'public.contradiction_votes.contradiction_id',
    case
      when child_udt is null then 'Vote contradiction_id column is missing.'
      when child_udt not in ('text', 'varchar', 'bpchar') then format('Vote contradiction_id type is %s, not a text-like type.', child_udt)
      else format('Vote contradiction_id is text-like (%s) and can be checked for UUID conversion.', child_udt)
    end
  from metadata_status
  where child_udt is null or child_udt not in ('text', 'varchar', 'bpchar')

  union all

  select
    'MIGRATION_BLOCKER',
    'INVALID_UUID_VALUES',
    'public.contradiction_votes.contradiction_id',
    format('%s vote rows are null or not valid canonical UUID strings.', i.invalid_uuid_rows)
  from integrity i
  where i.invalid_uuid_rows > 0

  union all

  select
    'MIGRATION_BLOCKER',
    'ORPHAN_CONTRADICTION_IDS',
    'public.contradiction_votes.contradiction_id',
    format('%s converted UUID values do not reference an existing public.contradictions.id.', i.orphan_rows)
  from integrity i
  where i.orphan_rows > 0

  union all

  select
    'NEEDS_REVIEW',
    'DATA_SUMMARY',
    'public.contradiction_votes',
    format('total=%s, valid_parent=%s, null=%s, invalid_uuid=%s, orphan=%s.', i.total_vote_rows, i.valid_parent_rows, i.null_id_rows, i.invalid_uuid_rows, i.orphan_rows)
  from integrity i
  where i.total_vote_rows = 0
),
summary as (
  select
    i.total_vote_rows,
    i.invalid_uuid_rows,
    i.orphan_rows,
    i.valid_parent_rows,
    i.null_id_rows,
    m.parent_udt,
    m.child_udt
  from integrity i
  cross join metadata_status m
)
select
  status,
  check_id,
  object_name,
  details
from findings

union all

select
  case
    when s.parent_udt = 'uuid'
     and s.child_udt in ('text', 'varchar', 'bpchar')
     and s.invalid_uuid_rows = 0
     and s.orphan_rows = 0
     and s.total_vote_rows > 0
    then 'PASS'
    else 'NEEDS_REVIEW'
  end as status,
  'UUID_CONVERSION_READINESS' as check_id,
  'public.contradiction_votes.contradiction_id' as object_name,
  format('parent_udt=%s, child_udt=%s, total=%s, valid_parent=%s, null=%s, invalid_uuid=%s, orphan=%s.', s.parent_udt, s.child_udt, s.total_vote_rows, s.valid_parent_rows, s.null_id_rows, s.invalid_uuid_rows, s.orphan_rows) as details
from summary s;
