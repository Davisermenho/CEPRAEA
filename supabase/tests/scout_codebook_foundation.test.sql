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

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_code_values'
      and column_name = 'description'
  ) then
    raise exception 'missing scout_code_values.description';
  end if;
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_code_values'
      and column_name = 'when_to_use'
  ) then
    raise exception 'missing scout_code_values.when_to_use';
  end if;
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_code_values'
      and column_name = 'when_not_to_use'
  ) then
    raise exception 'missing scout_code_values.when_not_to_use';
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

  if list_count <> 17 then
    raise exception 'expected 17 active code lists, got %', list_count;
  end if;
  if value_count <> 246 then
    raise exception 'expected 246 active code values, got %', value_count;
  end if;
  if map_count <> 25 then
    raise exception 'expected 25 active field mappings, got %', map_count;
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
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_FASE_EQUIPE') then
    raise exception 'missing LISTA_FASE_EQUIPE';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_TIPO_FINALIZACAO') then
    raise exception 'missing LISTA_TIPO_FINALIZACAO';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_STATUS_VALIDACAO') then
    raise exception 'missing LISTA_STATUS_VALIDACAO';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_MOTIVO_PONTUACAO') then
    raise exception 'missing LISTA_MOTIVO_PONTUACAO';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_ACAO_PRINCIPAL_AT_POS') then
    raise exception 'missing LISTA_ACAO_PRINCIPAL_AT_POS';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_ACAO_PRINCIPAL_DEF_POS') then
    raise exception 'missing LISTA_ACAO_PRINCIPAL_DEF_POS';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_ACAO_PRINCIPAL_TRANS_OF') then
    raise exception 'missing LISTA_ACAO_PRINCIPAL_TRANS_OF';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_ACAO_PRINCIPAL_TRANS_DEF') then
    raise exception 'missing LISTA_ACAO_PRINCIPAL_TRANS_DEF';
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
  if actual <> 18 then raise exception 'LISTA_RESULTADO_FACTUAL should have 18 values, got %', actual; end if;

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

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_FASE_EQUIPE';
  if actual <> 6 then raise exception 'LISTA_FASE_EQUIPE should have 6 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_TIPO_FINALIZACAO';
  if actual <> 8 then raise exception 'LISTA_TIPO_FINALIZACAO should have 8 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_STATUS_VALIDACAO';
  if actual <> 5 then raise exception 'LISTA_STATUS_VALIDACAO should have 5 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_MOTIVO_PONTUACAO';
  if actual <> 10 then raise exception 'LISTA_MOTIVO_PONTUACAO should have 10 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_ACAO_PRINCIPAL_AT_POS';
  if actual <> 14 then raise exception 'LISTA_ACAO_PRINCIPAL_AT_POS should have 14 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_ACAO_PRINCIPAL_DEF_POS';
  if actual <> 17 then raise exception 'LISTA_ACAO_PRINCIPAL_DEF_POS should have 17 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_ACAO_PRINCIPAL_TRANS_OF';
  if actual <> 14 then raise exception 'LISTA_ACAO_PRINCIPAL_TRANS_OF should have 14 values, got %', actual; end if;

  select count(*) into actual
  from public.scout_code_values v
  join public.scout_code_lists l on l.id = v.list_id
  where l.list_key = 'LISTA_ACAO_PRINCIPAL_TRANS_DEF';
  if actual <> 15 then raise exception 'LISTA_ACAO_PRINCIPAL_TRANS_DEF should have 15 values, got %', actual; end if;
end $$;

-- [0028] Resultados de passe devem existir em LISTA_RESULTADO_FACTUAL.
do $$
begin
  if not exists (
    select 1
    from public.scout_code_values v
    join public.scout_code_lists l on l.id = v.list_id
    where l.list_key = 'LISTA_RESULTADO_FACTUAL'
      and v.code = 'ERRO_PASSE'
      and v.active = true
  ) then
    raise exception 'LISTA_RESULTADO_FACTUAL missing ERRO_PASSE';
  end if;

  if not exists (
    select 1
    from public.scout_code_values v
    join public.scout_code_lists l on l.id = v.list_id
    where l.list_key = 'LISTA_RESULTADO_FACTUAL'
      and v.code = 'PASSE_INTERCEPTADO'
      and v.active = true
  ) then
    raise exception 'LISTA_RESULTADO_FACTUAL missing PASSE_INTERCEPTADO';
  end if;
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

  if not exists (
    select 1
    from public.scout_field_codebook_map
    where contract_name = 'scout_live_entries'
      and field_name = 'fase_equipe_analisada_code'
      and list_key = 'LISTA_FASE_EQUIPE'
  ) then
    raise exception 'missing scout_live_entries fase_equipe_analisada_code mapping';
  end if;

  if not exists (
    select 1
    from public.scout_field_codebook_map
    where contract_name = 'scout_live_entries'
      and field_name = 'tipo_finalizacao_code'
      and list_key = 'LISTA_TIPO_FINALIZACAO'
  ) then
    raise exception 'missing scout_live_entries tipo_finalizacao_code mapping';
  end if;

  if not exists (
    select 1
    from public.scout_field_codebook_map
    where contract_name = 'scout_live_entries'
      and field_name = 'status_validacao_code'
      and list_key = 'LISTA_STATUS_VALIDACAO'
  ) then
    raise exception 'missing scout_live_entries status_validacao_code mapping';
  end if;

  if not exists (
    select 1
    from public.scout_field_codebook_map
    where contract_name = 'scout_live_entries'
      and field_name = 'motivo_pontuacao_code'
      and list_key = 'LISTA_MOTIVO_PONTUACAO'
  ) then
    raise exception 'missing scout_live_entries motivo_pontuacao_code mapping';
  end if;

  if not exists (
    select 1
    from public.scout_field_codebook_map
    where contract_name = 'scout_live_entries'
      and field_name = 'acao_principal_suggestion_code'
      and selector_key = 'fase_da_bola_code'
      and selector_value = 'AT_POS'
      and list_key = 'LISTA_ACAO_PRINCIPAL_AT_POS'
  ) then
    raise exception 'missing AT_POS acao_principal_suggestion_code mapping';
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

-- The current chain should expose authenticated read-only access to codebook tables.
do $$
begin
  if not exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'scout_code_lists'
      and p.polname = 'scout_code_lists_select_authenticated'
  ) then
    raise exception 'missing scout_code_lists_select_authenticated';
  end if;

  if not exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'scout_code_values'
      and p.polname = 'scout_code_values_select_authenticated'
  ) then
    raise exception 'missing scout_code_values_select_authenticated';
  end if;

  if not exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'scout_field_codebook_map'
      and p.polname = 'scout_field_codebook_map_select_authenticated'
  ) then
    raise exception 'missing scout_field_codebook_map_select_authenticated';
  end if;
end $$;

rollback;
