-- CEPRAEA critical RPCs.
-- Regras: validação interna, nomes qualificados, token puro não persistido, operação atômica.

create or replace function public.compute_starts_at(input_date date, input_time time, input_timezone text)
returns timestamptz
language sql
stable
set search_path = public
as $$
  select ((input_date::text || ' ' || input_time::text)::timestamp at time zone input_timezone);
$$;

create or replace function public.compute_generation_key(
  input_team_id uuid,
  input_series_id uuid,
  input_training_date date,
  input_start_time time,
  input_end_time time,
  input_type text
)
returns text
language sql
stable
set search_path = public
as $$
  select concat_ws(':',
    input_team_id::text,
    coalesce(input_series_id::text, 'no-series'),
    input_training_date::text,
    input_start_time::text,
    input_end_time::text,
    input_type
  );
$$;

create or replace function public.write_audit_log(
  input_team_id uuid,
  input_actor_user_id uuid,
  input_actor_type text,
  input_entity_type text,
  input_entity_id uuid,
  input_action text,
  input_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_id uuid;
begin
  insert into public.audit_logs (
    team_id,
    actor_user_id,
    actor_type,
    entity_type,
    entity_id,
    action,
    metadata
  ) values (
    input_team_id,
    input_actor_user_id,
    input_actor_type,
    input_entity_type,
    input_entity_id,
    input_action,
    coalesce(input_metadata, '{}'::jsonb)
  ) returning id into audit_id;

  return audit_id;
end;
$$;

create or replace function public.generate_trainings(
  input_team_id uuid,
  input_series_id uuid,
  input_start_date date,
  input_end_date date,
  input_days_of_week int[],
  input_start_time time,
  input_end_time time,
  input_timezone text default 'America/Sao_Paulo',
  input_type text default 'recorrente',
  input_location text default null
)
returns table(created_count int, skipped_count int, failed_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_day date;
  generated_key text;
  starts_at_value timestamptz;
  lock_at_value timestamptz;
  attempted int := 0;
  created int := 0;
  inserted_id uuid;
begin
  if auth.uid() is null then
    raise exception 'permission denied';
  end if;

  if not public.has_team_role(input_team_id, array['owner','coach']) then
    raise exception 'permission denied';
  end if;

  if input_start_date is null or input_end_date is null or input_start_date > input_end_date then
    raise exception 'invalid date range';
  end if;

  if input_days_of_week is null or array_length(input_days_of_week, 1) is null then
    raise exception 'days_of_week required';
  end if;

  if exists (select 1 from unnest(input_days_of_week) as d where d < 0 or d > 6) then
    raise exception 'invalid day of week';
  end if;

  if input_type not in ('recorrente', 'extra') then
    raise exception 'invalid training type';
  end if;

  for current_day in
    select gs::date
    from generate_series(input_start_date, input_end_date, interval '1 day') gs
    where extract(dow from gs)::int = any(input_days_of_week)
  loop
    attempted := attempted + 1;
    generated_key := public.compute_generation_key(input_team_id, input_series_id, current_day, input_start_time, input_end_time, input_type);
    starts_at_value := public.compute_starts_at(current_day, input_start_time, input_timezone);
    lock_at_value := starts_at_value - interval '6 hours';

    inserted_id := null;
    insert into public.trainings (
      team_id,
      series_id,
      type,
      status,
      training_date,
      start_time,
      end_time,
      timezone,
      starts_at,
      presence_lock_at,
      location,
      created_manually,
      generation_key
    ) values (
      input_team_id,
      input_series_id,
      input_type,
      'agendado',
      current_day,
      input_start_time,
      input_end_time,
      input_timezone,
      starts_at_value,
      lock_at_value,
      input_location,
      input_series_id is null,
      generated_key
    ) on conflict (team_id, generation_key) do nothing
    returning id into inserted_id;

    if inserted_id is not null then
      created := created + 1;
    end if;
  end loop;

  perform public.write_audit_log(
    input_team_id,
    auth.uid(),
    'coach',
    'trainings',
    null,
    'generate_trainings',
    jsonb_build_object('attempted', attempted, 'created', created, 'skipped', attempted - created)
  );

  created_count := created;
  skipped_count := attempted - created;
  failed_count := 0;
  return next;
end;
$$;

create or replace function public.create_presence_token_batch(
  input_team_id uuid,
  input_training_id uuid,
  input_expires_at timestamptz
)
returns table(batch_id uuid, athlete_id uuid, token text, link_path text)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_batch_id uuid;
  athlete_record record;
  plain_token text;
  hashed_token text;
  token_id uuid;
begin
  if auth.uid() is null then
    raise exception 'permission denied';
  end if;

  if not public.has_team_role(input_team_id, array['owner','coach']) then
    raise exception 'permission denied';
  end if;

  if not exists (
    select 1 from public.trainings t
    where t.id = input_training_id
      and t.team_id = input_team_id
      and t.deleted_at is null
  ) then
    raise exception 'training not found';
  end if;

  if exists (
    select 1 from public.presence_token_batches b
    where b.team_id = input_team_id
      and b.training_id = input_training_id
      and b.status in ('created', 'exported')
      and b.revoked_at is null
  ) then
    raise exception 'active token batch already exists';
  end if;

  insert into public.presence_token_batches(team_id, training_id, created_by, status)
  values (input_team_id, input_training_id, auth.uid(), 'created')
  returning id into new_batch_id;

  for athlete_record in
    select a.id
    from public.athletes a
    where a.team_id = input_team_id
      and a.status = 'ativo'
      and a.deleted_at is null
    order by a.name
  loop
    plain_token := encode(gen_random_bytes(32), 'hex');
    hashed_token := encode(digest(plain_token, 'sha256'), 'hex');

    insert into public.presence_tokens(
      team_id,
      batch_id,
      training_id,
      athlete_id,
      token_hash,
      expires_at,
      created_by
    ) values (
      input_team_id,
      new_batch_id,
      input_training_id,
      athlete_record.id,
      hashed_token,
      input_expires_at,
      auth.uid()
    ) returning id into token_id;

    batch_id := new_batch_id;
    athlete_id := athlete_record.id;
    token := plain_token;
    link_path := '/confirmar-presenca?token=' || plain_token;
    return next;
  end loop;

  perform public.write_audit_log(
    input_team_id,
    auth.uid(),
    'coach',
    'presence_token_batches',
    new_batch_id,
    'create_presence_token_batch',
    jsonb_build_object('training_id', input_training_id)
  );
end;
$$;

create or replace function public.mark_presence_token_batch_exported(input_batch_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  batch_record public.presence_token_batches%rowtype;
begin
  if auth.uid() is null then
    raise exception 'permission denied';
  end if;

  select * into batch_record
  from public.presence_token_batches
  where id = input_batch_id;

  if batch_record.id is null or not public.has_team_role(batch_record.team_id, array['owner','coach']) then
    raise exception 'permission denied';
  end if;

  update public.presence_token_batches
  set status = 'exported', exported_at = now()
  where id = input_batch_id and status = 'created';

  perform public.write_audit_log(
    batch_record.team_id,
    auth.uid(),
    'coach',
    'presence_token_batches',
    input_batch_id,
    'mark_presence_token_batch_exported',
    '{}'::jsonb
  );
end;
$$;

create or replace function public.revoke_presence_token_batch(input_batch_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  batch_record public.presence_token_batches%rowtype;
begin
  if auth.uid() is null then
    raise exception 'permission denied';
  end if;

  select * into batch_record
  from public.presence_token_batches
  where id = input_batch_id;

  if batch_record.id is null or not public.has_team_role(batch_record.team_id, array['owner','coach']) then
    raise exception 'permission denied';
  end if;

  update public.presence_token_batches
  set status = 'revoked', revoked_at = now()
  where id = input_batch_id and revoked_at is null;

  update public.presence_tokens
  set revoked_at = coalesce(revoked_at, now())
  where batch_id = input_batch_id;

  perform public.write_audit_log(
    batch_record.team_id,
    auth.uid(),
    'coach',
    'presence_token_batches',
    input_batch_id,
    'revoke_presence_token_batch',
    '{}'::jsonb
  );
end;
$$;

create or replace function public.confirm_presence_by_token(
  input_token text,
  input_status text,
  input_justification text default null
)
returns table(ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  token_hash_value text;
  token_record record;
  now_value timestamptz := now();
begin
  if input_status not in ('presente', 'ausente', 'justificado') then
    ok := false;
    message := 'Link inválido, expirado ou indisponível.';
    return next;
    return;
  end if;

  token_hash_value := encode(digest(coalesce(input_token, ''), 'sha256'), 'hex');

  select
    pt.*,
    b.status as batch_status,
    b.revoked_at as batch_revoked_at,
    t.starts_at,
    t.presence_lock_at,
    t.deleted_at as training_deleted_at,
    a.deleted_at as athlete_deleted_at,
    a.status as athlete_status
  into token_record
  from public.presence_tokens pt
  join public.presence_token_batches b on b.id = pt.batch_id
  join public.trainings t on t.id = pt.training_id and t.team_id = pt.team_id
  join public.athletes a on a.id = pt.athlete_id and a.team_id = pt.team_id
  where pt.token_hash = token_hash_value
  limit 1;

  if token_record.id is null
    or token_record.revoked_at is not null
    or token_record.batch_revoked_at is not null
    or token_record.batch_status not in ('created', 'exported')
    or token_record.expires_at <= now_value
    or token_record.training_deleted_at is not null
    or token_record.athlete_deleted_at is not null
    or token_record.athlete_status <> 'ativo'
    or token_record.presence_lock_at <= now_value
  then
    ok := false;
    message := 'Link inválido, expirado ou indisponível.';
    return next;
    return;
  end if;

  insert into public.attendance_records(
    team_id,
    training_id,
    athlete_id,
    status,
    justification,
    confirmed_by_athlete,
    registered_at
  ) values (
    token_record.team_id,
    token_record.training_id,
    token_record.athlete_id,
    input_status,
    input_justification,
    true,
    now_value
  ) on conflict (training_id, athlete_id) do update
  set status = excluded.status,
      justification = excluded.justification,
      confirmed_by_athlete = true,
      registered_at = excluded.registered_at,
      updated_at = now();

  update public.presence_tokens
  set first_used_at = coalesce(first_used_at, now_value),
      last_used_at = now_value,
      use_count = use_count + 1
  where id = token_record.id;

  perform public.write_audit_log(
    token_record.team_id,
    null,
    'athlete_token',
    'attendance_records',
    null,
    'confirm_presence_by_token',
    jsonb_build_object('field', 'attendance.status', 'to', input_status, 'source', 'presence_token')
  );

  ok := true;
  message := 'Presença registrada.';
  return next;
exception when others then
  ok := false;
  message := 'Link inválido, expirado ou indisponível.';
  return next;
end;
$$;

revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;

grant execute on function public.is_team_member(uuid) to authenticated;
grant execute on function public.has_team_role(uuid, text[]) to authenticated;
grant execute on function public.generate_trainings(uuid, uuid, date, date, int[], time, time, text, text, text) to authenticated;
grant execute on function public.create_presence_token_batch(uuid, uuid, timestamptz) to authenticated;
grant execute on function public.mark_presence_token_batch_exported(uuid) to authenticated;
grant execute on function public.revoke_presence_token_batch(uuid) to authenticated;
grant execute on function public.confirm_presence_by_token(text, text, text) to anon;
