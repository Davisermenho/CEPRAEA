\set ON_ERROR_STOP on

begin;

insert into auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
) values (
  '00000000-0000-0000-0000-000000000011',
  'athlete1@cepraea.test',
  crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
);

insert into public.profiles (id, name, email)
values ('00000000-0000-0000-0000-000000000011', 'Athlete Auth Test', 'athlete1@cepraea.test');

insert into public.athletes (
  id, team_id, user_id, name, email, status
) values
  (
    '20000000-0000-0000-0000-000000000011',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000011',
    'Athlete Auth Test',
    'athlete1@cepraea.test',
    'ativo'
  ),
  (
    '20000000-0000-0000-0000-000000000012',
    '10000000-0000-0000-0000-000000000001',
    null,
    'Teammate Visible',
    'teammate@cepraea.test',
    'ativo'
  );

insert into public.trainings (
  id, team_id, type, status, training_date, start_time, end_time, timezone,
  starts_at, presence_lock_at, generation_key
) values (
  '30000000-0000-0000-0000-000000000111',
  '10000000-0000-0000-0000-000000000001',
  'extra', 'agendado', '2026-09-01', '20:00', '21:30', 'America/Sao_Paulo',
  '2026-09-01 20:00:00-03', '2026-09-01 14:00:00-03', 'athlete-auth:test:training'
);

insert into public.attendance_records (
  id, team_id, training_id, athlete_id, status
) values (
  '40000000-0000-0000-0000-000000000111',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000111',
  '20000000-0000-0000-0000-000000000012',
  'pendente'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000011';

do $$
begin
  if public.get_athlete_team_id() <> '10000000-0000-0000-0000-000000000001' then
    raise exception 'get_athlete_team_id should resolve the athlete team';
  end if;

  if not exists (
    select 1 from public.athletes where id = '20000000-0000-0000-0000-000000000011'
  ) then
    raise exception 'athlete should read own record';
  end if;

  if not exists (
    select 1 from public.athletes where id = '20000000-0000-0000-0000-000000000012'
  ) then
    raise exception 'athlete should read active teammates';
  end if;

  if exists (
    select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000002'
  ) then
    raise exception 'athlete must not read other team athletes';
  end if;

  if not exists (
    select 1 from public.trainings where id = '30000000-0000-0000-0000-000000000111'
  ) then
    raise exception 'athlete should read own team trainings';
  end if;

  if not exists (
    select 1 from public.attendance_records where id = '40000000-0000-0000-0000-000000000111'
  ) then
    raise exception 'athlete should read own team attendance';
  end if;

  insert into public.attendance_records (
    id, team_id, training_id, athlete_id, status
  ) values (
    '40000000-0000-0000-0000-000000000112',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000111',
    '20000000-0000-0000-0000-000000000011',
    'presente'
  );

  begin
    insert into public.attendance_records (
      id, team_id, training_id, athlete_id, status
    ) values (
      '40000000-0000-0000-0000-000000000113',
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000111',
      '20000000-0000-0000-0000-000000000012',
      'presente'
    );
    raise exception 'athlete inserted attendance for another athlete unexpectedly';
  exception when insufficient_privilege or check_violation or with_check_option_violation then
    null;
  end;
end $$;


-- ── 6. link_athlete_user_id() RPC ────────────────────────────────────────────
-- Creates a second auth user whose email matches the pre-inserted unlinked
-- athlete (teammate@cepraea.test / id 20000000-…-12), calls the RPC, and
-- verifies: (a) correct athlete_id returned, (b) user_id set, (c) team_id
-- unchanged, (d) second call returns NULL (idempotent guard).

reset role;

insert into auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
) values (
  '00000000-0000-0000-0000-000000000022',
  'teammate@cepraea.test',
  crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
);

insert into public.profiles (id, name, email)
values ('00000000-0000-0000-0000-000000000022', 'Teammate Linking Test', 'teammate@cepraea.test');

set local role authenticated;
set local request.jwt.claim.sub   = '00000000-0000-0000-0000-000000000022';
set local request.jwt.claims      = '{"sub":"00000000-0000-0000-0000-000000000022","email":"teammate@cepraea.test","aud":"authenticated","role":"authenticated"}';

do $$
declare
  v_linked_id  uuid;
  v_second_id  uuid;
  v_team_after uuid;
begin
  -- First call: should link the matching unlinked record and return its id.
  v_linked_id := public.link_athlete_user_id();
  if v_linked_id is null then
    raise exception 'link_athlete_user_id should return athlete id on first call';
  end if;
  if v_linked_id <> '20000000-0000-0000-0000-000000000012' then
    raise exception 'link_athlete_user_id returned unexpected athlete id: %', v_linked_id;
  end if;

  -- user_id must be set to the caller's auth.uid()
  if not exists (
    select 1 from public.athletes
    where id      = v_linked_id
      and user_id = '00000000-0000-0000-0000-000000000022'
  ) then
    raise exception 'link_athlete_user_id should have written user_id';
  end if;

  -- team_id must be unchanged (security invariant)
  select team_id into v_team_after from public.athletes where id = v_linked_id;
  if v_team_after <> '10000000-0000-0000-0000-000000000001' then
    raise exception 'link_athlete_user_id must not alter team_id (got %)', v_team_after;
  end if;

  -- Second call: no unlinked record remains → must return NULL
  v_second_id := public.link_athlete_user_id();
  if v_second_id is not null then
    raise exception 'link_athlete_user_id should return null when no unlinked record exists';
  end if;
end $$;

rollback;
