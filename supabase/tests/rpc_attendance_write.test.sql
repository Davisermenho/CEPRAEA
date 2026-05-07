-- rpc_attendance_write.test.sql
-- Verifica as RPCs de escrita de presença: get_current_athlete_id,
-- upsert_own_attendance e upsert_coach_attendance.
-- Executa dentro de uma transação e faz rollback — não persiste dados.
\set ON_ERROR_STOP on

begin;

-- ── Fixtures ──────────────────────────────────────────────────────────────────

-- Atleta vinculada (user_id presente)
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
) values (
  '00000000-0000-0000-0000-000000000071',
  'aw_atleta@cepraea.test',
  crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
);

insert into public.profiles (id, name, email)
values (
  '00000000-0000-0000-0000-000000000071',
  'AW Atleta',
  'aw_atleta@cepraea.test'
);

insert into public.athletes (
  id, team_id, user_id, name, email, status
) values (
  '20000000-0000-0000-0000-000000000071',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000071',
  'AW Atleta',
  'aw_atleta@cepraea.test',
  'ativo'
);

insert into public.trainings (
  id, team_id, type, status, training_date, start_time, end_time, timezone,
  starts_at, presence_lock_at, generation_key
) values (
  '30000000-0000-0000-0000-000000000701',
  '10000000-0000-0000-0000-000000000001',
  'extra', 'agendado', '2026-10-01', '20:00', '21:30', 'America/Sao_Paulo',
  '2026-10-01 20:00:00-03', '2026-10-01 14:00:00-03', 'aw:write:test:training'
);

-- ── Teste 1: get_current_athlete_id como atleta autenticada ───────────────────

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000071';

do $$
declare
  v_athlete_id uuid;
begin
  v_athlete_id := public.get_current_athlete_id();

  if v_athlete_id is null then
    raise exception 'get_current_athlete_id deve retornar o id da atleta autenticada';
  end if;

  if v_athlete_id <> '20000000-0000-0000-0000-000000000071' then
    raise exception 'get_current_athlete_id retornou ID errado: %', v_athlete_id;
  end if;
end $$;

-- ── Teste 2: upsert_own_attendance — atleta registra própria presença ─────────

do $$
declare
  v_record_id uuid;
begin
  v_record_id := public.upsert_own_attendance(
    '30000000-0000-0000-0000-000000000701'::uuid,
    'presente',
    null
  );

  if v_record_id is null then
    raise exception 'upsert_own_attendance deve retornar o id do registro';
  end if;

  if not exists (
    select 1 from public.attendance_records
    where id = v_record_id
      and athlete_id = '20000000-0000-0000-0000-000000000071'
      and training_id = '30000000-0000-0000-0000-000000000701'
      and status = 'presente'
      and confirmed_by_athlete = true
  ) then
    raise exception 'upsert_own_attendance: registro não persistido corretamente';
  end if;
end $$;

-- ── Teste 3: upsert_own_attendance — idempotência (upsert real) ──────────────

do $$
declare
  v_record_id uuid;
begin
  v_record_id := public.upsert_own_attendance(
    '30000000-0000-0000-0000-000000000701'::uuid,
    'justificado',
    'viagem escolar'
  );

  if not exists (
    select 1 from public.attendance_records
    where training_id = '30000000-0000-0000-0000-000000000701'
      and athlete_id = '20000000-0000-0000-0000-000000000071'
      and status = 'justificado'
      and justification = 'viagem escolar'
  ) then
    raise exception 'upsert_own_attendance: idempotência falhou — status não atualizado';
  end if;

  if (select count(*) from public.attendance_records
      where training_id = '30000000-0000-0000-0000-000000000701'
        and athlete_id = '20000000-0000-0000-0000-000000000071') > 1 then
    raise exception 'upsert_own_attendance: criou duplicata em vez de atualizar';
  end if;
end $$;

-- ── Teste 4: upsert_own_attendance — atleta não pode gravar por outra atleta ──

do $$
begin
  begin
    -- Tentativa de escrever para outro athlete_id via SQL direto — sem RPC
    insert into public.attendance_records (
      team_id, training_id, athlete_id, status
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000701',
      '20000000-0000-0000-0000-000000000012', -- outro atleta
      'presente'
    );
    raise exception 'atleta não deveria poder inserir diretamente para outra atleta';
  exception when insufficient_privilege or check_violation or with_check_option_violation then
    null; -- esperado
  end;
end $$;

-- ── Teste 5: upsert_coach_attendance — coach grava presença por atleta ────────

reset role;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001'; -- coach CEPRAEA

do $$
declare
  v_record_id uuid;
begin
  v_record_id := public.upsert_coach_attendance(
    '10000000-0000-0000-0000-000000000001'::uuid,  -- team_id
    '30000000-0000-0000-0000-000000000701'::uuid,  -- training_id
    '20000000-0000-0000-0000-000000000071'::uuid,  -- athlete_id
    'presente',
    null,
    false
  );

  if v_record_id is null then
    raise exception 'upsert_coach_attendance deve retornar o id do registro';
  end if;

  if not exists (
    select 1 from public.attendance_records
    where id = v_record_id
      and status = 'presente'
  ) then
    raise exception 'upsert_coach_attendance: registro não persistido';
  end if;
end $$;

-- ── Teste 6: upsert_coach_attendance — coach de outro time é rejeitado ────────

do $$
begin
  begin
    perform public.upsert_coach_attendance(
      '10000000-0000-0000-0000-000000000002'::uuid, -- outro time
      '30000000-0000-0000-0000-000000000701'::uuid,
      '20000000-0000-0000-0000-000000000071'::uuid,
      'presente',
      null,
      false
    );
    raise exception 'coach de outro time não deveria conseguir gravar presença';
  exception when raise_exception then
    if sqlerrm not like '%não autorizado%' and sqlerrm not like '%not authorized%' and sqlerrm not like '%team%' then
      raise; -- propaga exceção inesperada
    end if;
    null; -- esperado: acesso negado
  end;
end $$;

-- ── Teste 7: audit_logs — presença do coach gera entrada de auditoria ─────────

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

do $$
begin
  if not exists (
    select 1 from public.audit_logs
    where team_id = '10000000-0000-0000-0000-000000000001'
      and entity_type = 'attendance_record'
      and action in ('upsert', 'insert', 'update')
  ) then
    raise exception 'upsert_coach_attendance: audit_log não registrado';
  end if;
end $$;

-- ── Teste 8: convergência — atleta e coach escrevem na mesma linha ────────────
-- Atleta grava 'presente'; coach regrava 'ausente'; deve existir exactamente 1 linha.

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000071'; -- atleta

do $$
declare
  v_count int;
begin
  perform public.upsert_own_attendance(
    '30000000-0000-0000-0000-000000000701'::uuid,
    'presente',
    null
  );

  set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001'; -- coach
  perform public.upsert_coach_attendance(
    '10000000-0000-0000-0000-000000000001'::uuid,
    '30000000-0000-0000-0000-000000000701'::uuid,
    '20000000-0000-0000-0000-000000000071'::uuid,
    'ausente',
    null,
    false
  );

  select count(*) into v_count
  from public.attendance_records
  where training_id = '30000000-0000-0000-0000-000000000701'
    and athlete_id = '20000000-0000-0000-0000-000000000071';

  if v_count <> 1 then
    raise exception 'convergência falhou: esperado 1 linha, encontrado %', v_count;
  end if;

  if not exists (
    select 1 from public.attendance_records
    where training_id = '30000000-0000-0000-0000-000000000701'
      and athlete_id = '20000000-0000-0000-0000-000000000071'
      and status = 'ausente'
  ) then
    raise exception 'convergência falhou: status deve ser ausente após escrita do coach';
  end if;
end $$;

rollback;
