-- Read-only orphan contradiction-vote lookup.
-- Returns rows whose contradiction_id is a valid UUID but has no matching
-- public.contradictions.id. This query has no side effects.

select
  cv.*,
  parsed.contradiction_uuid
from public.contradiction_votes cv
cross join lateral (
  select case
    when cv.contradiction_id is not null
     and btrim(cv.contradiction_id) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then btrim(cv.contradiction_id)::uuid
    else null::uuid
  end as contradiction_uuid
) parsed
where parsed.contradiction_uuid is not null
  and not exists (
    select 1
    from public.contradictions c
    where c.id = parsed.contradiction_uuid
  )
order by cv.contradiction_id;
