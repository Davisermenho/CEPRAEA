-- Scout live entries create RPC
-- Objetivo: abrir a fronteira de captura rápida da COLETA_AO_VIVO com
-- validação rígida de codebook, jogo/equipe, atleta e regras condicionais.

create or replace function public.create_scout_live_entry(input_entry jsonb)
returns public.scout_live_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry public.scout_live_entries%rowtype;
  v_created public.scout_live_entries%rowtype;
  v_game public.scout_games%rowtype;
  v_actor_id uuid;
  v_action_required boolean;
  v_finish_required boolean;
  v_trimmed_action text;
begin
  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'permission denied';
  end if;

  if input_entry is null or jsonb_typeof(input_entry) <> 'object' then
    raise exception 'invalid scout live entry payload';
  end if;

  select *
  into v_game
  from public.scout_games
  where id = nullif(trim(coalesce(input_entry->>'scout_game_id', '')), '')::uuid;

  if v_game.id is null then
    raise exception 'scout game not found';
  end if;

  if not public.has_team_role(v_game.team_id, array['owner', 'coach']) then
    raise exception 'permission denied';
  end if;

  v_entry.id := gen_random_uuid();
  v_entry.team_id := v_game.team_id;
  v_entry.scout_game_id := v_game.id;
  v_entry.id_jogada := nullif(btrim(coalesce(input_entry->>'id_jogada', '')), '');
  v_entry.tempo_jogo := nullif(btrim(coalesce(input_entry->>'tempo_jogo', '')), '');
  v_entry.fase_da_bola_code := nullif(btrim(coalesce(input_entry->>'fase_da_bola_code', '')), '');
  v_entry.equipe_analisada_id := nullif(btrim(coalesce(input_entry->>'equipe_analisada_id', '')), '')::uuid;
  v_entry.fase_equipe_analisada_code := nullif(btrim(coalesce(input_entry->>'fase_equipe_analisada_code', '')), '');
  v_entry.sistema_ofensivo_code := nullif(btrim(coalesce(input_entry->>'sistema_ofensivo_code', '')), '');
  v_entry.sistema_defensivo_code := nullif(btrim(coalesce(input_entry->>'sistema_defensivo_code', '')), '');
  v_entry.atleta_principal_id := nullif(btrim(coalesce(input_entry->>'atleta_principal_id', '')), '')::uuid;
  v_entry.acao_principal_text := nullif(btrim(coalesce(input_entry->>'acao_principal_text', '')), '');
  v_entry.acao_principal_suggestion_code := nullif(btrim(coalesce(input_entry->>'acao_principal_suggestion_code', '')), '');
  v_entry.tipo_finalizacao_code := nullif(btrim(coalesce(input_entry->>'tipo_finalizacao_code', '')), '');
  v_entry.resultado_factual_code := nullif(btrim(coalesce(input_entry->>'resultado_factual_code', '')), '');
  v_entry.pontos_jogada := nullif(btrim(coalesce(input_entry->>'pontos_jogada', '')), '')::smallint;
  v_entry.causa_provavel_code := nullif(btrim(coalesce(input_entry->>'causa_provavel_code', '')), '');
  v_entry.prioridade_treino_code := nullif(btrim(coalesce(input_entry->>'prioridade_treino_code', '')), '');
  v_entry.video_ref := nullif(btrim(coalesce(input_entry->>'video_ref', '')), '');
  v_entry.status_validacao_code := coalesce(nullif(btrim(coalesce(input_entry->>'status_validacao_code', '')), ''), 'PENDENTE');
  v_entry.obs_geral := nullif(btrim(coalesce(input_entry->>'obs_geral', '')), '');
  v_entry.created_by := v_actor_id;
  v_entry.updated_by := v_actor_id;

  if v_entry.id_jogada is null
     or v_entry.tempo_jogo is null
     or v_entry.fase_da_bola_code is null
     or v_entry.equipe_analisada_id is null
     or v_entry.fase_equipe_analisada_code is null
     or v_entry.resultado_factual_code is null then
    raise exception 'missing required scout live entry fields';
  end if;

  if v_entry.status_validacao_code <> 'PENDENTE' then
    raise exception 'status_validacao_code must be PENDENTE on create';
  end if;

  if v_entry.equipe_analisada_id <> v_game.team_id then
    raise exception 'equipe_analisada_id incompatible with scout game';
  end if;

  if exists (
    select 1
    from public.scout_live_entries sle
    where sle.team_id = v_game.team_id
      and sle.scout_game_id = v_game.id
      and sle.id_jogada = v_entry.id_jogada
  ) then
    raise exception 'duplicate id_jogada for scout game';
  end if;

  if not public.scout_field_value_allowed('scout_live_entries', 'fase_da_bola_code', v_entry.fase_da_bola_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: fase_da_bola_code';
  end if;

  if not public.scout_field_value_allowed('scout_live_entries', 'fase_equipe_analisada_code', v_entry.fase_equipe_analisada_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: fase_equipe_analisada_code';
  end if;

  if not public.scout_field_value_allowed('scout_live_entries', 'resultado_factual_code', v_entry.resultado_factual_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: resultado_factual_code';
  end if;

  if v_entry.sistema_ofensivo_code is not null
     and not public.scout_field_value_allowed('scout_live_entries', 'sistema_ofensivo_code', v_entry.sistema_ofensivo_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: sistema_ofensivo_code';
  end if;

  if v_entry.sistema_defensivo_code is not null
     and not public.scout_field_value_allowed('scout_live_entries', 'sistema_defensivo_code', v_entry.sistema_defensivo_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: sistema_defensivo_code';
  end if;

  if v_entry.tipo_finalizacao_code is not null
     and not public.scout_field_value_allowed('scout_live_entries', 'tipo_finalizacao_code', v_entry.tipo_finalizacao_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: tipo_finalizacao_code';
  end if;

  if v_entry.causa_provavel_code is not null
     and not public.scout_field_value_allowed('scout_live_entries', 'causa_provavel_code', v_entry.causa_provavel_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: causa_provavel_code';
  end if;

  if v_entry.prioridade_treino_code is not null
     and not public.scout_field_value_allowed('scout_live_entries', 'prioridade_treino_code', v_entry.prioridade_treino_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: prioridade_treino_code';
  end if;

  if not public.scout_field_value_allowed('scout_live_entries', 'status_validacao_code', v_entry.status_validacao_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: status_validacao_code';
  end if;

  if v_entry.fase_da_bola_code = 'AT_POS' and v_entry.sistema_ofensivo_code is null then
    raise exception 'sistema_ofensivo_code required for AT_POS';
  end if;

  if v_entry.fase_da_bola_code = 'DEF_POS' and v_entry.sistema_defensivo_code is null then
    raise exception 'sistema_defensivo_code required for DEF_POS';
  end if;

  v_finish_required := v_entry.resultado_factual_code in ('GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE');
  if v_finish_required and v_entry.tipo_finalizacao_code is null then
    raise exception 'tipo_finalizacao_code required for finalization result';
  end if;
  if not v_finish_required and v_entry.tipo_finalizacao_code is not null then
    raise exception 'tipo_finalizacao_code not allowed without finalization result';
  end if;

  if v_entry.resultado_factual_code = 'GOL' and v_entry.pontos_jogada is null then
    raise exception 'pontos_jogada required for GOL';
  end if;
  if v_entry.resultado_factual_code <> 'GOL' and coalesce(v_entry.pontos_jogada, 0) <> 0 then
    raise exception 'pontos_jogada must be 0 or null when resultado_factual_code is not GOL';
  end if;

  if v_entry.atleta_principal_id is not null and not exists (
    select 1
    from public.athletes a
    where a.id = v_entry.atleta_principal_id
      and a.team_id = v_game.team_id
      and a.deleted_at is null
      and a.status = 'ativo'
  ) then
    raise exception 'ATHLETE_OUT_OF_SCOPE: atleta_principal_id';
  end if;

  if v_entry.acao_principal_suggestion_code is not null then
    if not public.scout_field_value_allowed(
      'scout_live_entries',
      'acao_principal_suggestion_code',
      v_entry.acao_principal_suggestion_code,
      'fase_da_bola_code',
      v_entry.fase_da_bola_code
    ) then
      raise exception 'INVALID_CODEBOOK_VALUE: acao_principal_suggestion_code';
    end if;

    v_entry.acao_principal_text := v_entry.acao_principal_suggestion_code;
    v_entry.acao_principal_is_custom := false;
  elsif v_entry.acao_principal_text is not null then
    v_trimmed_action := upper(v_entry.acao_principal_text);

    if char_length(v_trimmed_action) > 40 then
      raise exception 'acao_principal_text too long';
    end if;

    if v_trimmed_action !~ '^[A-Z0-9_]+$' then
      raise exception 'acao_principal_text has invalid format';
    end if;

    if exists (
      select 1
      from public.scout_code_values v
      join public.scout_code_lists l on l.id = v.list_id
      where l.list_key in ('LISTA_RESULTADO_FACTUAL', 'LISTA_CAUSA_PRINCIPAL', 'LISTA_PRIORIDADE_TREINO')
        and v.code = v_trimmed_action
        and v.active = true
        and l.active = true
    ) then
      raise exception 'acao_principal_text collides with non-action codebook';
    end if;

    v_entry.acao_principal_text := v_trimmed_action;
    v_entry.acao_principal_is_custom := true;
  else
    v_entry.acao_principal_is_custom := null;
  end if;

  v_action_required := (
    (v_entry.fase_da_bola_code in ('AT_POS', 'DEF_POS', 'TRANS_OF', 'TRANS_DEF'))
    and v_entry.resultado_factual_code <> 'NAO_OBSERVADO'
  );

  if v_action_required and v_entry.acao_principal_text is null then
    raise exception 'acao_principal_text required for observed sequence';
  end if;

  insert into public.scout_live_entries (
    id,
    team_id,
    scout_game_id,
    id_jogada,
    tempo_jogo,
    fase_da_bola_code,
    equipe_analisada_id,
    fase_equipe_analisada_code,
    sistema_ofensivo_code,
    sistema_defensivo_code,
    atleta_principal_id,
    acao_principal_text,
    acao_principal_suggestion_code,
    acao_principal_is_custom,
    tipo_finalizacao_code,
    resultado_factual_code,
    pontos_jogada,
    causa_provavel_code,
    prioridade_treino_code,
    video_ref,
    status_validacao_code,
    obs_geral,
    created_by,
    updated_by
  ) values (
    v_entry.id,
    v_entry.team_id,
    v_entry.scout_game_id,
    v_entry.id_jogada,
    v_entry.tempo_jogo,
    v_entry.fase_da_bola_code,
    v_entry.equipe_analisada_id,
    v_entry.fase_equipe_analisada_code,
    v_entry.sistema_ofensivo_code,
    v_entry.sistema_defensivo_code,
    v_entry.atleta_principal_id,
    v_entry.acao_principal_text,
    v_entry.acao_principal_suggestion_code,
    v_entry.acao_principal_is_custom,
    v_entry.tipo_finalizacao_code,
    v_entry.resultado_factual_code,
    v_entry.pontos_jogada,
    v_entry.causa_provavel_code,
    v_entry.prioridade_treino_code,
    v_entry.video_ref,
    'PENDENTE',
    v_entry.obs_geral,
    v_entry.created_by,
    v_entry.updated_by
  )
  returning * into v_created;

  perform public.write_audit_log(
    v_created.team_id,
    v_actor_id,
    'coach',
    'scout_live_entries',
    v_created.id,
    'create_scout_live_entry',
    jsonb_build_object(
      'scout_game_id', v_created.scout_game_id,
      'id_jogada', v_created.id_jogada,
      'fase_da_bola_code', v_created.fase_da_bola_code,
      'acao_principal_is_custom', v_created.acao_principal_is_custom
    )
  );

  return v_created;
end;
$$;

revoke all on function public.create_scout_live_entry(jsonb) from public;
revoke all on function public.create_scout_live_entry(jsonb) from anon;
grant execute on function public.create_scout_live_entry(jsonb) to authenticated;
