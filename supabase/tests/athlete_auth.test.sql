-- athlete_auth.test.sql — Verifica migração 0006 e RLS de atleta.
-- Cobre: schema, índices, RPC get_athlete_team_id(), todas as 7 policies de atleta,
-- linking de primeiro login, isolamento cross-team e rejeição de write indevido.
-- Execute após as migrations. Faz rollback ao final — sem efeito colateral.
\set ON_ERROR_STOP on

begin;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 1 — Schema guard (migração 0006)
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'athletes' and column_name = 'email'
  ) then raise exception '0006: athletes.email column missing'; end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'athletes' and column_name = 'user_id'
  ) then raise exception '0006: athletes.user_id column missing'; end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'athletes' and indexname = 'athletes_user_id_key'
  ) then raise exception '0006: unique index athletes_user_id_key missing'; end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'athletes' and indexname = 'athletes_team_email_key'
  ) then raise exception '0006: unique index athletes_team_email_key missing'; end if;

  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'get_athlete_team_id'
  ) then raise exception '0006: RPC get_athlete_team_id() missing'; end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 2 — Fixtures
-- ═══════════════════════════════════════════════════════════════════════════

insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
) values
  ('00000000-0000-0000-0000-000000000011', 'atleta1@cepraea.test',
   crypt('password', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000012', 'atleta2@cepraea.test',
   crypt('password', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000013', 'atleta-outra@other.test',
   crypt('password', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- Atletas: 1 vinculado, 1 pré-cadastrado (user_id null), 1 de outra equipe
insert into public.athletes (id, team_id, name, email, user_id, status)
values
  ('20000000-0000-0000-0000-000000000011',
   '10000000-0000-0000-0000-000000000001',
   'Atleta Linked 1', 'atleta1@cepraea.test',
   '00000000-0000-0000-0000-000000000011', 'ativo'),
  ('20000000-0000-0000-0000-000000000012',
   '10000000-0000-0000-0000-000000000001',
   'Atleta Unlinked', 'atleta2@cepraea.test',
   null, 'ativo'),
  ('20000000-0000-0000-0000-000000000013',
   '10000000-0000-0000-0000-000000000002',
   'Atleta Outra Equipe Auth', 'atleta-outra@other.test',
   '00000000-0000-0000-0000-000000000013', 'ativo')
on conflict (id) do nothing;

insert into public.trainings (
  id, team_id, type, status, training_date, start_time, end_time, timezone,
  starts_at, presence_lock_at, generation_key
) values (
  '30000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000001',
  'extra', 'agendado', '2026-09-01', '20:00', '21:30', 'America/Sao_Paulo',
  '2026-09-01 20:00:00-03', '2026-09-01 14:00:00-03', 'auth:cepraea:training'
) on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 3 — RPC get_athlete_team_id()
-- ═══════════════════════════════════════════════════════════════════════════

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000011';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000011","email":"atleta1@cepraea.test"}';

do $$
begin
  if public.get_athlete_team_id() is distinct from '10000000-0000-0000-0000-000000000001'::uuid then
    raise exception 'get_athlete_team_id: retornou team_id errado para atleta vinculado';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 4 — athlete_select_own_record
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if not exists (
    select 1 from public.athletes where id = '20000000-0000-0000-0000-000000000011'
  ) then
    raise exception 'athlete_select_own_record: atleta vinculado deve ler o próprio registro';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 5 — athlete_select_by_email_for_linking (primeiro login)
-- ═══════════════════════════════════════════════════════════════════════════

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000012';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000012","email":"atleta2@cepraea.test"}';

do $$
begin
  if not exists (
    select 1 from public.athletes
    where id = '20000000-0000-0000-0000-000000000012' and user_id is null
  ) then
    raise exception 'athlete_select_by_email_for_linking: deve ver registro não vinculado pelo email';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 6 — athlete_link_user_id (reivindicação de registro)
-- ═══════════════════════════════════════════════════════════════════════════

update public.athletes
  set user_id = '00000000-0000-0000-0000-000000000012'
  where id = '20000000-0000-0000-0000-000000000012';

do $$
begin
  if not exists (
    select 1 from public.athletes
    where id    = '20000000-0000-0000-0000-000000000012'
      and user_id = '00000000-0000-0000-0000-000000000012'
  ) then
    raise exception 'athlete_link_user_id: atleta deve reivindicar próprio registro no primeiro login';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 7 — athlete_select_team_athletes (pós-link)
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if (
    select count(*) from public.athletes
    where team_id = '10000000-0000-0000-0000-000000000001'
  ) < 2 then
    raise exception 'athlete_select_team_athletes: atleta deve ver os colegas da equipe';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 8 — athlete_select_team_trainings
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if not exists (
    select 1 from public.trainings where id = '30000000-0000-0000-0000-000000000011'
  ) then
    raise exception 'athlete_select_team_trainings: atleta deve ver treinos da equipe';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 9 — athlete_insert_own_attendance + athlete_select_team_attendance
-- ═══════════════════════════════════════════════════════════════════════════

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000011';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000011","email":"atleta1@cepraea.test"}';

insert into public.attendance_records (id, team_id, training_id, athlete_id, status)
values (
  '40000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000011',
  '20000000-0000-0000-0000-000000000011',
  'presente'
);

do $$
begin
  if not exists (
    select 1 from public.attendance_records where id = '40000000-0000-0000-0000-000000000011'
  ) then
    raise exception 'athlete_insert_own_attendance: atleta deve inserir própria presença';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 10 — athlete_update_own_attendance
-- ═══════════════════════════════════════════════════════════════════════════

update public.attendance_records
  set status = 'ausente'
  where id = '40000000-0000-0000-0000-000000000011';

do $$
begin
  if not exists (
    select 1 from public.attendance_records
    where id = '40000000-0000-0000-0000-000000000011' and status = 'ausente'
  ) then
    raise exception 'athlete_update_own_attendance: atleta deve poder atualizar própria presença';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 11 — Rejeição: inserir presença por outro atleta
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  begin
    insert into public.attendance_records (id, team_id, training_id, athlete_id, status)
    values (
      '40000000-0000-0000-0000-000000000099',
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000011',
      '20000000-0000-0000-0000-000000000012',
      'presente'
    );
    raise exception 'atleta não deve inserir presença por outro atleta';
  exception when insufficient_privilege or check_violation or with_check_option_violation then
    null;
  end;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 12 — Isolamento cross-team
-- ═══════════════════════════════════════════════════════════════════════════

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000013';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000013","email":"atleta-outra@other.test"}';

do $$
begin
  if exists (
    select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'cross-team: atleta de outra equipe não deve ver atletas da CEPRAEA';
  end if;
  if exists (
    select 1 from public.trainings where team_id = '10000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'cross-team: atleta de outra equipe não deve ver treinos da CEPRAEA';
  end if;
  if exists (
    select 1 from public.attendance_records where team_id = '10000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'cross-team: atleta de outra equipe não deve ver presenças da CEPRAEA';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BLOCO 13 — Constraint: email duplicado na mesma equipe (case-insensitive)
-- ═══════════════════════════════════════════════════════════════════════════

set local role postgres;

do $$
begin
  begin
    insert into public.athletes (id, team_id, name, email, status)
    values (
      '20000000-0000-0000-0000-000000000099',
      '10000000-0000-0000-0000-000000000001',
      'Duplicado', 'ATLETA1@cepraea.test',
      'ativo'
    );
    raise exception '0006: deveria rejeitar email duplicado na mesma equipe (case-insensitive)';
  exception when unique_violation then
    null;
  end;
end $$;

rollback;
