begin;

do $$
declare
  parent_type text;
  child_type text;
  invalid_count bigint;
  orphan_count bigint;
begin
  select c.udt_name
    into parent_type
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'contradictions'
    and c.column_name = 'id';

  select c.udt_name
    into child_type
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'contradiction_votes'
    and c.column_name = 'contradiction_id';

  if parent_type is distinct from 'uuid' then
    raise exception 'Migration blocked: public.contradictions.id must be uuid, found %', coalesce(parent_type, '<missing>');
  end if;

  if child_type is null or child_type not in ('text', 'varchar', 'bpchar') then
    raise exception 'Migration blocked: public.contradiction_votes.contradiction_id must be text-like before conversion, found %', coalesce(child_type, '<missing>');
  end if;

  select count(*)
    into invalid_count
  from public.contradiction_votes cv
  where cv.contradiction_id is null
     or btrim(cv.contradiction_id) !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  if invalid_count > 0 then
    raise exception 'Migration blocked: % invalid or null contradiction_id values remain', invalid_count;
  end if;

  select count(*)
    into orphan_count
  from public.contradiction_votes cv
  where not exists (
    select 1
    from public.contradictions c
    where c.id = btrim(cv.contradiction_id)::uuid
  );

  if orphan_count > 0 then
    raise exception 'Migration blocked: % orphan contradiction vote rows remain', orphan_count;
  end if;
end
$$;

alter table public.contradiction_votes
  alter column contradiction_id type uuid
  using btrim(contradiction_id)::uuid;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.contradiction_votes'::regclass
      and conname = 'contradiction_votes_contradiction_id_fkey'
      and not (
        contype = 'f'
        and confrelid = 'public.contradictions'::regclass
      )
  ) then
    raise exception 'Migration blocked: constraint name contradiction_votes_contradiction_id_fkey is already used for another constraint';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint fk
    where fk.contype = 'f'
      and fk.conrelid = 'public.contradiction_votes'::regclass
      and fk.confrelid = 'public.contradictions'::regclass
      and fk.conkey = array[
        (select a.attnum
         from pg_catalog.pg_attribute a
         where a.attrelid = 'public.contradiction_votes'::regclass
           and a.attname = 'contradiction_id'
           and not a.attisdropped)
      ]::smallint[]
      and fk.confkey = array[
        (select a.attnum
         from pg_catalog.pg_attribute a
         where a.attrelid = 'public.contradictions'::regclass
           and a.attname = 'id'
           and not a.attisdropped)
      ]::smallint[]
  ) then
    alter table public.contradiction_votes
      add constraint contradiction_votes_contradiction_id_fkey
      foreign key (contradiction_id)
      references public.contradictions (id)
      on delete restrict;
  end if;
end
$$;

commit;
