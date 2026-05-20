\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '78000000-0000-0000-0000-000000000932',
  '10000000-0000-0000-0000-000000000001',
  '2026-05-18',
  'CEPRAEA',
  'Regressao RPC tipo finalizacao',
  'em_andamento'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'RPC-0032-6M-VIOL',
    'scout_game_id', '78000000-0000-0000-0000-000000000932',
    'tempo_jogo', '01:00',
    'fase_da_bola_code', 'DEF_POS',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_basica_code', 'FINALIZACAO_6M_ADV',
    'categoria_acao_code', 'ACAO_DEFENSIVA',
    'resultado_factual_code', 'VIOLACAO'
  ));

  if v_entry.tipo_finalizacao_code <> '6M' then
    raise exception '0032: FINALIZACAO_6M_ADV deveria auto-derivar 6M, got %', v_entry.tipo_finalizacao_code;
  end if;

  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'RPC-0032-BLOQ-GIRO',
    'scout_game_id', '78000000-0000-0000-0000-000000000932',
    'tempo_jogo', '02:00',
    'fase_da_bola_code', 'DEF_POS',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_basica_code', 'BLOQUEIO',
    'categoria_acao_code', 'ACAO_DEFENSIVA',
    'classificacao_acao_code', 'GIRO',
    'execucao_bloqueio_code', 'EXECUTADO',
    'resultado_factual_code', 'RECUPERACAO_POSSE'
  ));

  if v_entry.tipo_finalizacao_code <> 'GIRO' then
    raise exception '0032: GIRO + EXECUTADO deveria auto-derivar GIRO, got %', v_entry.tipo_finalizacao_code;
  end if;

  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'RPC-0032-INTERC-GOL',
    'scout_game_id', '78000000-0000-0000-0000-000000000932',
    'tempo_jogo', '03:00',
    'fase_da_bola_code', 'DEF_POS',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_basica_code', 'INTERCEPTACAO',
    'categoria_acao_code', 'ACAO_DEFENSIVA',
    'classificacao_acao_code', 'INTERCEPTACAO_MALSUCEDIDA',
    'resultado_factual_code', 'GOL'
  ));

  if v_entry.tipo_finalizacao_code is not null then
    raise exception '0032: INTERCEPTACAO_MALSUCEDIDA + GOL nao deveria persistir tipo_finalizacao_code';
  end if;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'RPC-0032-BLOQ-MANUAL',
      'scout_game_id', '78000000-0000-0000-0000-000000000932',
      'tempo_jogo', '04:00',
      'fase_da_bola_code', 'DEF_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'DEFESA',
      'sistema_defensivo_code', 'DEF_3X0',
      'acao_basica_code', 'BLOQUEIO',
      'categoria_acao_code', 'ACAO_DEFENSIVA',
      'classificacao_acao_code', 'NAO_OBSERVADO',
      'execucao_bloqueio_code', 'NAO_EXECUTADO',
      'resultado_factual_code', 'GOL',
      'tipo_finalizacao_code', 'SIMPLES'
    ));
    raise exception '0032: NAO_OBSERVADO + NAO_EXECUTADO + tipo manual deveria falhar';
  exception
    when others then
      if sqlerrm not like '%tipo_finalizacao_code not allowed in this action/result context%' then
        raise;
      end if;
  end;

  raise notice '0032: alinhamento da RPC de tipo_finalizacao OK';
end;
$$;

rollback;
