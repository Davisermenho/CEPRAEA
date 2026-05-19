-- Scout live entries: campo categoria_acao_code (metadado macro)
-- Objetivo: adicionar classificação de alto nível da ação principal
-- {PASSE, ARREMESSO, ACAO_DEFENSIVA, NAO_OBSERVADO}, campo opcional e nullable.
-- Não valida cruzamento com acao_principal neste slice (Opção A).

-- ── 2a. Nova coluna em scout_live_entries (nullable — dados legados ficam NULL)
ALTER TABLE public.scout_live_entries
  ADD COLUMN IF NOT EXISTS categoria_acao_code TEXT
    CHECK (
      categoria_acao_code IS NULL
      OR categoria_acao_code IN ('PASSE', 'ARREMESSO', 'ACAO_DEFENSIVA', 'NAO_OBSERVADO')
    );

-- ── 2b. Lista no codebook
INSERT INTO public.scout_code_lists (
  list_key, label, contract_scope, active, source_version
)
VALUES (
  'LISTA_CATEGORIA_ACAO',
  'Categoria da ação principal',
  'scout_live_entries',
  true,
  'manual-v1.0.1'
)
ON CONFLICT (list_key) DO UPDATE
  SET label           = excluded.label,
      contract_scope  = excluded.contract_scope,
      active          = excluded.active,
      source_version  = excluded.source_version;

WITH cat_seed(code, label, sort_order, is_nao_observado, description) AS (
  VALUES
    ('PASSE',          'Passe',          1, false, 'Sequência encerrada por passe que não gerou arremesso ao gol.'),
    ('ARREMESSO',      'Arremesso',      2, false, 'Sequência encerrada por arremesso ao gol (qualquer resultado).'),
    ('ACAO_DEFENSIVA', 'Ação defensiva', 3, false, 'Sequência encerrada por ação defensiva (recuperação, interceptação, bloqueio).'),
    ('NAO_OBSERVADO',  'Não observado',  4, true,  'Categoria não identificada com segurança na coleta rápida.')
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, s.code, s.label, s.sort_order,
  false, s.is_nao_observado, true, s.description
FROM cat_seed s
JOIN public.scout_code_lists l ON l.list_key = 'LISTA_CATEGORIA_ACAO'
ON CONFLICT (list_id, code) DO UPDATE
  SET label           = excluded.label,
      sort_order      = excluded.sort_order,
      is_nao_observado = excluded.is_nao_observado,
      description     = excluded.description,
      active          = excluded.active;

-- ── 2c. Mapear campo no field_codebook_map
INSERT INTO public.scout_field_codebook_map (
  contract_name, field_name, selector_key, selector_value,
  list_key, allow_nao_aplica, allow_nao_observado, active
)
VALUES (
  'scout_live_entries', 'categoria_acao_code', '*', '*',
  'LISTA_CATEGORIA_ACAO', false, true, true
)
ON CONFLICT (contract_name, field_name, selector_key, selector_value) DO UPDATE
  SET list_key            = excluded.list_key,
      allow_nao_aplica    = excluded.allow_nao_aplica,
      allow_nao_observado = excluded.allow_nao_observado,
      active              = excluded.active;

-- ── 2d. CREATE OR REPLACE create_scout_live_entry com suporte a categoria_acao_code
-- Corpo baseado na versão de migration 0016, com 3 adições mínimas sinalizadas com "-- [0025]".
-- Nenhuma validação existente foi alterada.

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
  v_entry.motivo_pontuacao_code := nullif(btrim(coalesce(input_entry->>'motivo_pontuacao_code', '')), '');
  v_entry.pontos_jogada := nullif(btrim(coalesce(input_entry->>'pontos_jogada', '')), '')::smallint;
  v_entry.causa_provavel_code := nullif(btrim(coalesce(input_entry->>'causa_provavel_code', '')), '');
  v_entry.prioridade_treino_code := nullif(btrim(coalesce(input_entry->>'prioridade_treino_code', '')), '');
  v_entry.video_ref := nullif(btrim(coalesce(input_entry->>'video_ref', '')), '');
  v_entry.status_validacao_code := coalesce(nullif(btrim(coalesce(input_entry->>'status_validacao_code', '')), ''), 'PENDENTE');
  v_entry.obs_geral := nullif(btrim(coalesce(input_entry->>'obs_geral', '')), '');
  v_entry.created_by := v_actor_id;
  v_entry.updated_by := v_actor_id;
  -- [0025] Leitura do novo campo (nullable)
  v_entry.categoria_acao_code := nullif(btrim(coalesce(input_entry->>'categoria_acao_code', '')), '');

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

  if v_entry.motivo_pontuacao_code is not null
     and not public.scout_field_value_allowed('scout_live_entries', 'motivo_pontuacao_code', v_entry.motivo_pontuacao_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: motivo_pontuacao_code';
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

  -- [0025] Validação do novo campo (opcional — NULL é permitido)
  if v_entry.categoria_acao_code is not null
     and not public.scout_field_value_allowed('scout_live_entries', 'categoria_acao_code', v_entry.categoria_acao_code) then
    raise exception 'INVALID_CODEBOOK_VALUE: categoria_acao_code';
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

  if v_entry.resultado_factual_code = 'GOL' and v_entry.motivo_pontuacao_code is null then
    raise exception 'motivo_pontuacao_code required for GOL';
  end if;
  if v_entry.resultado_factual_code <> 'GOL' and v_entry.motivo_pontuacao_code is not null then
    raise exception 'motivo_pontuacao_code only allowed for GOL';
  end if;

  if v_entry.resultado_factual_code = 'GOL' and (v_entry.pontos_jogada is null or v_entry.pontos_jogada not in (1, 2)) then
    raise exception 'pontos_jogada must be 1 or 2 when resultado_factual_code is GOL';
  end if;
  if v_entry.resultado_factual_code <> 'GOL' and coalesce(v_entry.pontos_jogada, 0) <> 0 then
    raise exception 'pontos_jogada must be 0 or null when resultado_factual_code is not GOL';
  end if;

  if v_entry.resultado_factual_code = 'GOL' then
    if v_entry.motivo_pontuacao_code = 'SIMPLES' and v_entry.pontos_jogada <> 1 then
      raise exception 'pontos_jogada does not match motivo_pontuacao_code';
    end if;

    if v_entry.motivo_pontuacao_code in ('GIRO', 'AEREA', '6M', 'GOLEIRA', 'ESPECIALISTA')
       and v_entry.pontos_jogada <> 2 then
      raise exception 'pontos_jogada does not match motivo_pontuacao_code';
    end if;

    if v_entry.tipo_finalizacao_code = 'GIRO' and v_entry.motivo_pontuacao_code <> 'GIRO' then
      raise exception 'motivo_pontuacao_code incompatible with tipo_finalizacao_code';
    end if;
    if v_entry.tipo_finalizacao_code = 'AEREA' and v_entry.motivo_pontuacao_code <> 'AEREA' then
      raise exception 'motivo_pontuacao_code incompatible with tipo_finalizacao_code';
    end if;
    if v_entry.tipo_finalizacao_code = '6M' and v_entry.motivo_pontuacao_code <> '6M' then
      raise exception 'motivo_pontuacao_code incompatible with tipo_finalizacao_code';
    end if;
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
      where l.list_key in ('LISTA_RESULTADO_FACTUAL', 'LISTA_CAUSA_PRINCIPAL', 'LISTA_PRIORIDADE_TREINO', 'LISTA_MOTIVO_PONTUACAO')
        and v.code = v_trimmed_action
        and v.active = true
        and l.active = true
    ) then
      raise exception 'acao_principal_text collides with non-action codebook';
    end if;

    if v_trimmed_action ~ '(^|_)(GOL|DEFENDIDO|BLOQUEADO|PERDA|VIOLACAO|RECUPERACAO|PRIORIDADE|FEEDBACK|PORQUE|TREIN[A-Z0-9]*|CANSOU|CANSADA|ATRASAD[AO]|ERROU|OBS)($|_)' then
      raise exception 'acao_principal_text mixes diagnosis or result';
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

  -- [0025] INSERT atualizado para incluir categoria_acao_code
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
    motivo_pontuacao_code,
    pontos_jogada,
    causa_provavel_code,
    prioridade_treino_code,
    video_ref,
    status_validacao_code,
    obs_geral,
    categoria_acao_code,
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
    v_entry.motivo_pontuacao_code,
    v_entry.pontos_jogada,
    v_entry.causa_provavel_code,
    v_entry.prioridade_treino_code,
    v_entry.video_ref,
    'PENDENTE',
    v_entry.obs_geral,
    v_entry.categoria_acao_code,
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
      'acao_principal_is_custom', v_created.acao_principal_is_custom,
      'motivo_pontuacao_code', v_created.motivo_pontuacao_code,
      'categoria_acao_code', v_created.categoria_acao_code
    )
  );

  return v_created;
end;
$$;

revoke all on function public.create_scout_live_entry(jsonb) from public;
revoke all on function public.create_scout_live_entry(jsonb) from anon;
grant execute on function public.create_scout_live_entry(jsonb) to authenticated;
