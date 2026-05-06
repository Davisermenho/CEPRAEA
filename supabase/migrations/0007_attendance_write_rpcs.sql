-- ─── 0007: Attendance Write RPCs ─────────────────────────────────────────────
-- Cria as RPCs de escrita de presença usadas pelo frontend Supabase-first.
-- Todas usam security definer, validam auth.uid() internamente e registram
-- audit_logs em toda escrita.

-- ── Ampliar check constraint de actor_type em audit_logs ─────────────────────
-- Adiciona 'athlete' como tipo de ator válido para RPCs de escrita direta.

ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_actor_type_check;

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_actor_type_check
    CHECK (actor_type IN ('coach', 'athlete_token', 'system', 'athlete'));

-- ── 1. get_current_athlete_id ─────────────────────────────────────────────────
-- Retorna o athlete.id vinculado ao auth.uid() atual.
-- Usada internamente pelas RPCs e exposta para o frontend.

create or replace function public.get_current_athlete_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.athletes
  where user_id = auth.uid()
    and deleted_at is null
  limit 1;
$$;

grant execute on function public.get_current_athlete_id() to authenticated;

-- ── 2. upsert_own_attendance ──────────────────────────────────────────────────
-- Atleta autenticada registra a própria presença.
-- Valida internamente:
--   - auth.uid() está vinculado a um atleta (get_current_athlete_id)
--   - o treino pertence à mesma equipe que o atleta
-- Garante idempotência via ON CONFLICT.

create or replace function public.upsert_own_attendance(
  input_training_id  uuid,
  input_status       text,
  input_justification text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_athlete_id uuid;
  v_team_id    uuid;
  v_record_id  uuid;
begin
  -- Resolve atleta pelo auth.uid()
  v_athlete_id := public.get_current_athlete_id();
  if v_athlete_id is null then
    raise exception 'não autorizado: nenhum atleta vinculado a este usuário';
  end if;

  -- Resolve e valida team_id pelo atleta
  select team_id into v_team_id
  from public.athletes
  where id = v_athlete_id
    and deleted_at is null;

  if v_team_id is null then
    raise exception 'não autorizado: atleta sem equipe ativa';
  end if;

  -- Confirma que o treino pertence à mesma equipe
  if not exists (
    select 1 from public.trainings
    where id = input_training_id
      and team_id = v_team_id
  ) then
    raise exception 'não autorizado: treino não pertence à equipe do atleta';
  end if;

  -- Upsert
  insert into public.attendance_records (
    team_id, training_id, athlete_id, status, justification, confirmed_by_athlete, registered_at
  ) values (
    v_team_id,
    input_training_id,
    v_athlete_id,
    input_status,
    input_justification,
    true,
    now()
  )
  on conflict (training_id, athlete_id)
  do update set
    status               = excluded.status,
    justification        = excluded.justification,
    confirmed_by_athlete = true,
    registered_at        = now(),
    updated_at           = now()
  returning id into v_record_id;

  -- Audit
  perform public.write_audit_log(
    v_team_id,
    auth.uid(),
    'athlete',
    'attendance_record',
    v_record_id,
    'upsert',
    jsonb_build_object(
      'training_id', input_training_id,
      'status', input_status
    )
  );

  return v_record_id;
end;
$$;

grant execute on function public.upsert_own_attendance(uuid, text, text) to authenticated;

-- ── 3. upsert_coach_attendance ────────────────────────────────────────────────
-- Treinador registra presença de qualquer atleta de uma equipe.
-- Valida internamente:
--   - auth.uid() tem role 'owner' ou 'coach' na team_id informada
--   - o atleta pertence à mesma equipe
--   - o treino pertence à mesma equipe

create or replace function public.upsert_coach_attendance(
  input_team_id            uuid,
  input_training_id        uuid,
  input_athlete_id         uuid,
  input_status             text,
  input_justification      text    default null,
  input_confirmed_by_athlete boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record_id uuid;
begin
  -- Valida que o chamador é coach/owner da equipe informada
  if not public.has_team_role(input_team_id, array['owner', 'coach']) then
    raise exception 'não autorizado: usuário não é coach ou owner da equipe';
  end if;

  -- Valida que o atleta pertence à equipe
  if not exists (
    select 1 from public.athletes
    where id = input_athlete_id
      and team_id = input_team_id
      and deleted_at is null
  ) then
    raise exception 'não autorizado: atleta não pertence à equipe informada';
  end if;

  -- Valida que o treino pertence à equipe
  if not exists (
    select 1 from public.trainings
    where id = input_training_id
      and team_id = input_team_id
  ) then
    raise exception 'não autorizado: treino não pertence à equipe informada';
  end if;

  -- Upsert
  insert into public.attendance_records (
    team_id, training_id, athlete_id, status, justification, confirmed_by_athlete, registered_at
  ) values (
    input_team_id,
    input_training_id,
    input_athlete_id,
    input_status,
    input_justification,
    input_confirmed_by_athlete,
    now()
  )
  on conflict (training_id, athlete_id)
  do update set
    status               = excluded.status,
    justification        = excluded.justification,
    confirmed_by_athlete = case
      when excluded.confirmed_by_athlete then true
      else attendance_records.confirmed_by_athlete
    end,
    registered_at = now(),
    updated_at    = now()
  returning id into v_record_id;

  -- Audit
  perform public.write_audit_log(
    input_team_id,
    auth.uid(),
    'coach',
    'attendance_record',
    v_record_id,
    'upsert',
    jsonb_build_object(
      'training_id', input_training_id,
      'athlete_id', input_athlete_id,
      'status', input_status
    )
  );

  return v_record_id;
end;
$$;

grant execute on function public.upsert_coach_attendance(uuid, uuid, uuid, text, text, boolean) to authenticated;
