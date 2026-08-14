with orphan_votes as (
  select
    btrim(cv.contradiction_id::text)::uuid as contradiction_id
  from public.contradiction_votes cv
  where cv.contradiction_id is not null
    and btrim(cv.contradiction_id::text) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and not exists (
      select 1
      from public.contradictions c
      where c.id = btrim(cv.contradiction_id::text)::uuid
    )
), summary as (
  select
    count(*)::bigint as orphan_vote_count,
    count(distinct contradiction_id)::bigint as orphan_contradiction_id_count,
    coalesce(
      array_agg(distinct contradiction_id order by contradiction_id),
      array[]::uuid[]
    ) as remaining_orphan_ids
  from orphan_votes
)
select
  orphan_vote_count,
  orphan_contradiction_id_count,
  remaining_orphan_ids,
  case
    when orphan_vote_count = 0 then 'PASS: no valid-UUID orphan votes remain'
    else 'FAIL: orphan votes remain'
  end as verification_status
from summary;
