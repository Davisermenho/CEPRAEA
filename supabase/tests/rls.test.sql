-- RLS authorization checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

-- Owner CEPRAEA reads own team.
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
do $$
begin
  if (select count(*) from public.athletes where team_id = '10000000-0000-0000-0000-000000000001') < 2 then
    raise exception 'owner should read CEPRAEA athletes';
  end if;
  if exists (select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000002') then
    raise exception 'owner CEPRAEA must not read other team athletes';
  end if;
end $$;

-- Coach reads own team and not other team.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
do $$
begin
  if (select count(*) from public.athletes where team_id = '10000000-0000-0000-0000-000000000001') < 2 then
    raise exception 'coach should read CEPRAEA athletes';
  end if;
  if exists (select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000002') then
    raise exception 'coach CEPRAEA must not read other team athletes';
  end if;
end $$;

-- Viewer reads, but cannot write.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
do $$
begin
  if (select count(*) from public.athletes where team_id = '10000000-0000-0000-0000-000000000001') < 2 then
    raise exception 'viewer should read CEPRAEA athletes';
  end if;

  begin
    insert into public.athletes(team_id, name) values ('10000000-0000-0000-0000-000000000001', 'Viewer Should Fail');
    raise exception 'viewer inserted athlete unexpectedly';
  exception when insufficient_privilege or check_violation or with_check_option_violation then
    null;
  end;
end $$;

-- User without team cannot read private team data.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
do $$
begin
  if exists (select 1 from public.athletes) then
    raise exception 'user without team must not read athletes';
  end if;
end $$;

-- Owner from another team cannot read CEPRAEA.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
do $$
begin
  if exists (select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000001') then
    raise exception 'other team owner must not read CEPRAEA athletes';
  end if;
  if not exists (select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000002') then
    raise exception 'other team owner should read own team athletes';
  end if;
end $$;

-- Anonymous cannot read private tables.
set local role anon;
set local request.jwt.claim.sub = '';
do $$
begin
  if exists (select 1 from public.athletes) then
    raise exception 'anon must not read athletes';
  end if;
end $$;

rollback;
