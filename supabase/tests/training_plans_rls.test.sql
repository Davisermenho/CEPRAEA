-- RLS coverage for training_plans / training_plan_blocks / training_plan_exercises.
-- Fixtures usadas (vindas do seed):
--   team CEPRAEA           = 10000000-0000-0000-0000-000000000001
--   team OUTRO             = 10000000-0000-0000-0000-000000000002
--   owner CEPRAEA (auth)   = 00000000-0000-0000-0000-000000000001
--   coach CEPRAEA (auth)   = 00000000-0000-0000-0000-000000000002
--   viewer CEPRAEA (auth)  = 00000000-0000-0000-0000-000000000003
--   owner OUTRO   (auth)   = 00000000-0000-0000-0000-000000000005

\set ON_ERROR_STOP on

begin;

-- Treinos para os dois times.
insert into public.trainings (
  id, team_id, type, status, training_date, start_time, end_time, timezone,
  starts_at, presence_lock_at, generation_key
) values
  (
    '30000000-0000-0000-0000-0000000aa101',
    '10000000-0000-0000-0000-000000000001',
    'extra', 'agendado', '2026-09-10', '20:00', '21:30', 'America/Sao_Paulo',
    '2026-09-10 20:00:00-03', '2026-09-10 14:00:00-03', 'plan:cepraea:training'
  ),
  (
    '30000000-0000-0000-0000-0000000aa102',
    '10000000-0000-0000-0000-000000000002',
    'extra', 'agendado', '2026-09-11', '20:00', '21:30', 'America/Sao_Paulo',
    '2026-09-11 20:00:00-03', '2026-09-11 14:00:00-03', 'plan:other:training'
  );

-- Atleta vinculada (auth) do team CEPRAEA, para validar SELECT do atleta.
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
) values (
  '00000000-0000-0000-0000-0000000aa099',
  'plan-athlete@cepraea.test',
  crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
);

insert into public.profiles (id, name, email)
values ('00000000-0000-0000-0000-0000000aa099', 'Plan Athlete', 'plan-athlete@cepraea.test')
on conflict (id) do update set name = excluded.name, email = excluded.email;

insert into public.athletes (
  id, team_id, user_id, name, email, status
) values (
  '20000000-0000-0000-0000-0000000aa099',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-0000000aa099',
  'Plan Athlete', 'plan-athlete@cepraea.test', 'ativo'
);

-- ── 1. Coach CEPRAEA cria plano + bloco + exercício ──────────────────────────
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

insert into public.training_plans (id, team_id, training_id, objetivo_principal, created_by)
values (
  '11111111-0000-0000-0000-0000000aa001',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-0000000aa101',
  'Trabalhar transição rápida',
  '00000000-0000-0000-0000-000000000002'
);

insert into public.training_plan_blocks (id, training_plan_id, ordem, objetivo_especifico)
values (
  '22222222-0000-0000-0000-0000000aa001',
  '11111111-0000-0000-0000-0000000aa001',
  0, 'Aquecimento'
);

insert into public.training_plan_exercises (id, training_plan_block_id, ordem, descricao)
values (
  '33333333-0000-0000-0000-0000000aa001',
  '22222222-0000-0000-0000-0000000aa001',
  0, 'Corrida 5min'
);

-- ── 2. Owner CEPRAEA lê e atualiza ───────────────────────────────────────────
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
do $$
begin
  if not exists (select 1 from public.training_plans where id = '11111111-0000-0000-0000-0000000aa001') then
    raise exception 'owner should read own team training_plans';
  end if;
  if not exists (select 1 from public.training_plan_blocks where id = '22222222-0000-0000-0000-0000000aa001') then
    raise exception 'owner should read own team training_plan_blocks';
  end if;
  if not exists (select 1 from public.training_plan_exercises where id = '33333333-0000-0000-0000-0000000aa001') then
    raise exception 'owner should read own team training_plan_exercises';
  end if;
end $$;

update public.training_plans
   set published_at = now()
 where id = '11111111-0000-0000-0000-0000000aa001';

-- ── 3. Viewer CEPRAEA lê mas não escreve ─────────────────────────────────────
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
do $$
begin
  if not exists (select 1 from public.training_plans where id = '11111111-0000-0000-0000-0000000aa001') then
    raise exception 'viewer should read training_plans';
  end if;

  begin
    insert into public.training_plans (team_id, training_id)
    values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-0000000aa101');
    raise exception 'viewer must not insert training_plans';
  exception when insufficient_privilege or check_violation or with_check_option_violation then null;
  end;

  begin
    update public.training_plans set objetivo_principal = 'hack' where id = '11111111-0000-0000-0000-0000000aa001';
    if found then
      raise exception 'viewer must not update training_plans';
    end if;
  exception when insufficient_privilege or check_violation or with_check_option_violation then null;
  end;

  begin
    delete from public.training_plans where id = '11111111-0000-0000-0000-0000000aa001';
    if found then
      raise exception 'viewer must not delete training_plans';
    end if;
  exception when insufficient_privilege then null;
  end;
end $$;

-- ── 4. Atleta CEPRAEA lê, mas não escreve ────────────────────────────────────
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000aa099';
do $$
begin
  if public.get_athlete_team_id() <> '10000000-0000-0000-0000-000000000001' then
    raise exception 'athlete team_id resolution failed';
  end if;
  if not exists (select 1 from public.training_plans where id = '11111111-0000-0000-0000-0000000aa001') then
    raise exception 'athlete should read own team training_plans';
  end if;
  if not exists (select 1 from public.training_plan_blocks where id = '22222222-0000-0000-0000-0000000aa001') then
    raise exception 'athlete should read own team training_plan_blocks';
  end if;
  if not exists (select 1 from public.training_plan_exercises where id = '33333333-0000-0000-0000-0000000aa001') then
    raise exception 'athlete should read own team training_plan_exercises';
  end if;

  begin
    insert into public.training_plans (team_id, training_id)
    values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-0000000aa101');
    raise exception 'athlete must not insert training_plans';
  exception when insufficient_privilege or check_violation or with_check_option_violation then null;
  end;

  begin
    update public.training_plan_exercises set descricao = 'hack' where id = '33333333-0000-0000-0000-0000000aa001';
    if found then
      raise exception 'athlete must not update training_plan_exercises';
    end if;
  exception when insufficient_privilege or check_violation or with_check_option_violation then null;
  end;
end $$;

-- ── 5. Owner do OUTRO time não vê o plano CEPRAEA e não consegue inserir nele ──
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
do $$
begin
  if exists (select 1 from public.training_plans where id = '11111111-0000-0000-0000-0000000aa001') then
    raise exception 'cross-team leak: outro owner viu training_plans CEPRAEA';
  end if;
  if exists (select 1 from public.training_plan_blocks where id = '22222222-0000-0000-0000-0000000aa001') then
    raise exception 'cross-team leak: outro owner viu training_plan_blocks CEPRAEA';
  end if;
  if exists (select 1 from public.training_plan_exercises where id = '33333333-0000-0000-0000-0000000aa001') then
    raise exception 'cross-team leak: outro owner viu training_plan_exercises CEPRAEA';
  end if;

  begin
    insert into public.training_plans (team_id, training_id)
    values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-0000000aa101');
    raise exception 'cross-team write: outro owner inseriu training_plans CEPRAEA';
  exception when insufficient_privilege or check_violation or with_check_option_violation then null;
  end;
end $$;

reset role;
rollback;
