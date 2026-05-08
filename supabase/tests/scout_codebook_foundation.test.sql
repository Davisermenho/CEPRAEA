-- Scout codebook foundation checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

do $$
begin
  if to_regclass('public.scout_code_lists') is null then
    raise exception 'missing relation public.scout_code_lists';
  end if;
  if to_regclass('public.scout_code_values') is null then
    raise exception 'missing relation public.scout_code_values';
  end if;
  if to_regclass('public.scout_field_codebook_map') is null then
    raise exception 'missing relation public.scout_field_codebook_map';
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'scout_code_lists'
      and c.relrowsecurity = true and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.scout_code_lists';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'scout_code_values'
      and c.relrowsecurity = true and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.scout_code_values';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'scout_field_codebook_map'
      and c.relrowsecurity = true and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.scout_field_codebook_map';
  end if;
end $$;

do $$
declare
  list_count int;
  value_count int;
  map_count int;
begin
  select count(*) into list_count from public.scout_code_lists where active = true;
  select count(*) into value_count from public.scout_code_values where active = true;
  select count(*) into map_count from public.scout_field_codebook_map where active = true;

  if list_count <> 9 then
    raise exception 'expected 9 active code lists, got %', list_count;
  end if;
  if value_count <> 147 then
    raise exception 'expected 147 active code values, got %', value_count;
  end if;
  if map_count <> 11 then
    raise exception 'expected 11 active field mappings, got %', map_count;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_FASES') then
    raise exception 'missing LISTA_FASES';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_SISTEMA_OFENSIVO') then
    raise exception 'missing LISTA_SISTEMA_OFENSIVO';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_CONFIGURACAO_OFENSIVA') then
    raise exception 'missing LISTA_CONFIGURACAO_OFENSIVA';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_SISTEMA_DEFENSIVO') then
    raise exception 'missing LISTA_SISTEMA_DEFENSIVO';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_ACAO_OFENSIVA') then
    raise exception 'missing LISTA_ACAO_OFENSIVA';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_ACAO_DEFENSIVA') then
    raise exception 'missing LISTA_ACAO_DEFENSIVA';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_RESULTADO_FACTUAL') then
    raise exception 'missing LISTA_RESULTADO_FACTUAL';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_CAUSA_PRINCIPAL') then
    raise exception 'missing LISTA_CAUSA_PRINCIPAL';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_PRIORIDADE_TREINO') then
    raise exception 'missing LISTA_PRIORIDADE_TREINO';
  end if;
end $$;

-- Assert exact counts for seeded lists of slice 1.
do $$
declare
  actual int;
begin
  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_FASES';
  if actual <> 4 then raise exception 'LISTA_FASES should have 4 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_SISTEMA_OFENSIVO';
  if actual <> 4 then raise exception 'LISTA_SISTEMA_OFENSIVO should have 4 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_CONFIGURACAO_OFENSIVA';
  if actual <> 10 then raise exception 'LISTA_CONFIGURACAO_OFENSIVA should have 10 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_SISTEMA_DEFENSIVO';
  if actual <> 7 then raise exception 'LISTA_SISTEMA_DEFENSIVO should have 7 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_ACAO_OFENSIVA';
  if actual <> 20 then raise exception 'LISTA_ACAO_OFENSIVA should have 20 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_ACAO_DEFENSIVA';
  if actual <> 19 then raise exception 'LISTA_ACAO_DEFENSIVA should have 19 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_RESULTADO_FACTUAL';
  if actual <> 8 then raise exception 'LISTA_RESULTADO_FACTUAL should have 8 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_CAUSA_PRINCIPAL';
  if actual <> 18 then raise exception 'LISTA_CAUSA_PRINCIPAL should have 18 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_PRIORIDADE_TREINO';
  if actual <> 57 then raise exception 'LISTA_PRIORIDADE_TREINO should have 57 values, got %', actual; end if;
end $$;

-- Semantic flags around NAO_APLICA / NAO_OBSERVADO must survive the seed.
do $$
begin
  if not exists (
    select 1
    from public.scout_code_values v
    join public.scout_code_lists l on l.id = v.list_id
    where l.list_key = 'LISTA_SISTEMA_OFENSIVO'
      and v.code = 'NAO_APLICA'
      and v.is_nao_aplica = true
      and v.is_nao_observado = false
  ) then
    raise exception 'LISTA_SISTEMA_OFENSIVO::NAO_APLICA flags are wrong';
  end if;

  if not exists (
    select 1
    from public.scout_code_values v
    join public.scout_code_lists l on l.id = v.list_id
    where l.list_key = 'LISTA_SISTEMA_OFENSIVO'
      and v.code = 'NAO_OBSERVADO'
      and v.is_nao_aplica = false
      and v.is_nao_observado = true
  ) then
    raise exception 'LISTA_SISTEMA_OFENSIVO::NAO_OBSERVADO flags are wrong';
  end if;

  if not exists (
    select 1
    from public.scout_code_values v
    join public.scout_code_lists l on l.id = v.list_id
    where l.list_key = 'LISTA_ACAO_OFENSIVA'
      and v.code = 'NAO_OBSERVADO'
      and v.is_nao_aplica = false
      and v.is_nao_observado = true
  ) then
    raise exception 'LISTA_ACAO_OFENSIVA::NAO_OBSERVADO flags are wrong';
  end if;
end $$;

-- Conditional field mapping is the core refinement for slice 1.
do $$
begin
  if not exists (
    select 1
    from public.scout_field_codebook_map
    where contract_name = 'scout_play_participations'
      and field_name = 'action_code'
      and selector_key = 'participant_scope'
      and selector_value = 'ATQ'
      and list_key = 'LISTA_ACAO_OFENSIVA'
  ) then
    raise exception 'missing offensive action_code mapping';
  end if;

  if not exists (
    select 1
    from public.scout_field_codebook_map
    where contract_name = 'scout_play_participations'
      and field_name = 'action_code'
      and selector_key = 'participant_scope'
      and selector_value = 'DEF'
      and list_key = 'LISTA_ACAO_DEFENSIVA'
  ) then
    raise exception 'missing defensive action_code mapping';
  end if;
end $$;

-- Duplicate selector mapping must fail.
do $$
begin
  begin
    insert into public.scout_field_codebook_map (
      contract_name,
      field_name,
      selector_key,
      selector_value,
      list_key
    ) values (
      'scout_play_participations',
      'action_code',
      'participant_scope',
      'ATQ',
      'LISTA_ACAO_OFENSIVA'
    );
    raise exception 'duplicate field mapping unexpectedly succeeded';
  exception when unique_violation then
    null;
  end;
end $$;

-- Invalid list reference must fail structurally.
do $$
begin
  begin
    insert into public.scout_field_codebook_map (
      contract_name,
      field_name,
      selector_key,
      selector_value,
      list_key
    ) values (
      'scout_plays',
      'phase_of_ball_shadow',
      '*',
      '*',
      'LISTA_INEXISTENTE'
    );
    raise exception 'invalid list_key mapping unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;
end $$;

-- 0009 should still be fail-closed before RLS/policies of the next migration.
do $$
begin
  if exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('scout_code_lists', 'scout_code_values', 'scout_field_codebook_map')
  ) then
    raise exception '0009 should not create codebook policies yet';
  end if;
end $$;

rollback;
