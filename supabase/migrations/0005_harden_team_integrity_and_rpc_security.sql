-- Endurecimento fundacional: isolamento estrutural por team_id e RPCs defensivas.
-- Mantém escopo restrito à fundação Supabase.

-- Roles não confiáveis não podem criar objetos em public.
-- Isso reduz risco de shadowing em funções security definer.
revoke create on schema public from public;
revoke create on schema public from anon;
revoke create on schema public from authenticated;

-- Chaves únicas compostas para permitir FKs que validam id + team_id.
alter table public.trainings
  add constraint trainings_id_team_id_key unique (id, team_id);

alter table public.athletes
  add constraint athletes_id_team_id_key unique (id, team_id);

alter table public.presence_token_batches
  add constraint presence_token_batches_id_team_id_key unique (id, team_id);

alter table public.scout_games
  add constraint scout_games_id_team_id_key unique (id, team_id);

-- Integridade cruzada: IDs relacionados precisam pertencer ao mesmo team_id da linha.
alter table public.attendance_records
  add constraint attendance_records_training_team_fk
  foreign key (training_id, team_id)
  references public.trainings(id, team_id)
  on delete cascade;

alter table public.attendance_records
  add constraint attendance_records_athlete_team_fk
  foreign key (athlete_id, team_id)
  references public.athletes(id, team_id)
  on delete cascade;

alter table public.presence_token_batches
  add constraint presence_token_batches_training_team_fk
  foreign key (training_id, team_id)
  references public.trainings(id, team_id)
  on delete cascade;

alter table public.presence_tokens
  add constraint presence_tokens_batch_team_fk
  foreign key (batch_id, team_id)
  references public.presence_token_batches(id, team_id)
  on delete cascade;

alter table public.presence_tokens
  add constraint presence_tokens_training_team_fk
  foreign key (training_id, team_id)
  references public.trainings(id, team_id)
  on delete cascade;

alter table public.presence_tokens
  add constraint presence_tokens_athlete_team_fk
  foreign key (athlete_id, team_id)
  references public.athletes(id, team_id)
  on delete cascade;

alter table public.scout_events
  add constraint scout_events_game_team_fk
  foreign key (scout_game_id, team_id)
  references public.scout_games(id, team_id)
  on delete cascade;

-- Recria RPCs críticas com chamadas pgcrypto explicitamente qualificadas.
create or replace function public.create_presence_token_batch(
  input_team_id uuid,
  input_training_id uuid,
  input_expires_at timestamptz
)
returns table(batch_id uuid, athlete_id uuid, token text, link_path text)
language plpgsql
security definer
set search_path = public, extensions
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
    plain_token := encode(extensions.gen_random_bytes(32), 'hex');
    hashed_token := encode(extensions.digest(plain_token, 'sha256'), 'hex');

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

create or replace function public.confirm_presence_by_token(
  input_token text,
  input_status text,
  input_justification text default null
)
returns table(ok boolean, message text)
language plpgsql
security definer
set search_path = public, extensions
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

  token_hash_value := encode(extensions.digest(coalesce(input_token, ''), 'sha256'), 'hex');

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
  join public.presence_token_batches b on b.id = pt.batch_id and b.team_id = pt.team_id
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
