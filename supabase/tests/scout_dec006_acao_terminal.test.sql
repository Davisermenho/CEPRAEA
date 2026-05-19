-- TEST-21 a TEST-24: Validação DEC-006 — ACAO_PRINCIPAL como ação terminal/decisiva
-- A COLETA_AO_VIVO deve registrar a ação que encerrou a sequência, não a ação preparatória.
-- PASSE_GIRO e PASSE_AEREA não devem ser ação principal quando houver finalização posterior.

\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '78000000-0000-0000-0000-000000000690',
  '10000000-0000-0000-0000-000000000001',
  '2026-12-11',
  'CEPRAEA',
  'Adversario DEC006',
  'em_andamento'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin

  -- -------------------------------------------------------------------------
  -- TEST-21: GIRO deve persistir como ação principal (ação terminal)
  -- Regra DEC-006: passe para giro + giro finalizado → ACAO_PRINCIPAL = GIRO
  -- -------------------------------------------------------------------------
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                  'DEC006-TEST21',
    'scout_game_id',              '78000000-0000-0000-0000-000000000690',
    'tempo_jogo',                 '00:05',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_3X1',
    'atleta_principal_id',        '20000000-0000-0000-0000-000000000001',
    'acao_principal_suggestion_code', 'GIRO',
    'tipo_finalizacao_code',      'GIRO',
    'resultado_factual_code',     'GOL',
    'motivo_pontuacao_code',      'GIRO',
    'pontos_jogada',              2
  ));

  if v_entry.acao_principal_text <> 'GIRO' then
    raise exception 'TEST-21 FALHOU: acao_principal_text deveria ser GIRO (ação terminal), obtido: %', v_entry.acao_principal_text;
  end if;
  if v_entry.resultado_factual_code <> 'GOL' then
    raise exception 'TEST-21 FALHOU: resultado_factual_code deveria ser GOL, obtido: %', v_entry.resultado_factual_code;
  end if;
  raise notice 'TEST-21 OK: GIRO persiste como ação terminal com GOL';

  -- -------------------------------------------------------------------------
  -- TEST-22: AEREA deve persistir como ação principal (ação terminal)
  -- Regra DEC-006: passe para aérea + aérea finalizada → ACAO_PRINCIPAL = AEREA
  -- -------------------------------------------------------------------------
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                  'DEC006-TEST22',
    'scout_game_id',              '78000000-0000-0000-0000-000000000690',
    'tempo_jogo',                 '00:10',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_4X0',
    'atleta_principal_id',        '20000000-0000-0000-0000-000000000001',
    'acao_principal_suggestion_code', 'AEREA',
    'tipo_finalizacao_code',      'AEREA',
    'resultado_factual_code',     'DEFENDIDO'
  ));

  if v_entry.acao_principal_text <> 'AEREA' then
    raise exception 'TEST-22 FALHOU: acao_principal_text deveria ser AEREA, obtido: %', v_entry.acao_principal_text;
  end if;
  if v_entry.resultado_factual_code <> 'DEFENDIDO' then
    raise exception 'TEST-22 FALHOU: resultado_factual_code deveria ser DEFENDIDO, obtido: %', v_entry.resultado_factual_code;
  end if;
  raise notice 'TEST-22 OK: AEREA persiste como ação terminal com DEFENDIDO';

  -- -------------------------------------------------------------------------
  -- TEST-23: ERRO_PASSE pode ser ação principal quando gera perda de posse
  -- Regra DEC-006: passe preparatório que gera perda → ACAO_PRINCIPAL = ERRO_PASSE
  -- -------------------------------------------------------------------------
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                  'DEC006-TEST23',
    'scout_game_id',              '78000000-0000-0000-0000-000000000690',
    'tempo_jogo',                 '00:15',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_3X1',
    'atleta_principal_id',        '20000000-0000-0000-0000-000000000001',
    'acao_principal_suggestion_code', 'ERRO_PASSE',
    'resultado_factual_code',     'PERDA'
  ));

  if v_entry.acao_principal_text <> 'ERRO_PASSE' then
    raise exception 'TEST-23 FALHOU: acao_principal_text deveria ser ERRO_PASSE, obtido: %', v_entry.acao_principal_text;
  end if;
  if v_entry.resultado_factual_code <> 'PERDA' then
    raise exception 'TEST-23 FALHOU: resultado_factual_code deveria ser PERDA, obtido: %', v_entry.resultado_factual_code;
  end if;
  if v_entry.tipo_finalizacao_code is not null then
    raise exception 'TEST-23 FALHOU: tipo_finalizacao_code deve ser NULL em ERRO_PASSE sem finalização, obtido: %', v_entry.tipo_finalizacao_code;
  end if;
  raise notice 'TEST-23 OK: ERRO_PASSE como ação principal com PERDA e sem tipo_finalizacao';

  -- -------------------------------------------------------------------------
  -- TEST-24: INTERC pode ser ação principal (foco defensivo recupera posse)
  -- Regra DEC-006: interceptação defensiva → ACAO_PRINCIPAL = INTERC
  -- -------------------------------------------------------------------------
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                  'DEC006-TEST24',
    'scout_game_id',              '78000000-0000-0000-0000-000000000690',
    'tempo_jogo',                 '00:20',
    'fase_da_bola_code',          'DEF_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code',     'DEF_3X0',
    'atleta_principal_id',        '20000000-0000-0000-0000-000000000001',
    'acao_principal_suggestion_code', 'INTERC',
    'resultado_factual_code',     'RECUPERACAO_POSSE'
  ));

  if v_entry.acao_principal_text <> 'INTERC' then
    raise exception 'TEST-24 FALHOU: acao_principal_text deveria ser INTERC, obtido: %', v_entry.acao_principal_text;
  end if;
  if v_entry.resultado_factual_code <> 'RECUPERACAO_POSSE' then
    raise exception 'TEST-24 FALHOU: resultado_factual_code deveria ser RECUPERACAO_POSSE, obtido: %', v_entry.resultado_factual_code;
  end if;
  raise notice 'TEST-24 OK: INTERC como ação principal defensiva com RECUPERACAO_POSSE';

  raise notice 'DEC-006 — TEST-21 a TEST-24: TODOS PASSARAM';
end $$;

rollback;
