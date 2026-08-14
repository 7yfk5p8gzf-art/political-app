begin;

delete from public.contradiction_votes cv
where cv.contradiction_id is not null
  and btrim(cv.contradiction_id::text) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and not exists (
    select 1
    from public.contradictions c
    where c.id = btrim(cv.contradiction_id::text)::uuid
  )
returning cv.*;

commit;
