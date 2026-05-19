\set ON_ERROR_STOP on

-- CEPR-0101: AT_POS + ARREMESSO usa tipo_finalizacao_code como campo semântico.

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '78000000-0000-0000-0000-000000001001',
  '10000000-0000-0000-0000-000000000001',
  '2026-05-19',
  'CEPRAEA',
  'Regressao CEPR-0101',
  'em_andamento'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  -- Positivo: AT_POS + ARREMESSO salva tipo_finalizacao_code sem classificacao_acao_code.
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'CEPR-0101-AT-GIRO',
    'scout_game_id', '78000000-0000-0000-0000-000000001001',
    'tempo_jogo', '01:01',
    'fase_da_bola_code', 'AT_POS',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code', 'AT_4X0',
    'categoria_acao_code', 'ARREMESSO',
    'acao_basica_code', 'ARREMESSO',
    'tipo_finalizacao_code', 'GIRO',
    'resultado_factual_code', 'GOL',
    'motivo_pontuacao_code', 'GIRO',
    'pontos_jogada', 2
  ));

  if v_entry.tipo_finalizacao_code <> 'GIRO' then
    raise exception 'CEPR-0101: tipo_finalizacao_code deveria persistir GIRO, got %', v_entry.tipo_finalizacao_code;
  end if;

  if v_entry.classificacao_acao_code is not null then
    raise exception 'CEPR-0101: classificacao_acao_code deveria permanecer NULL, got %', v_entry.classificacao_acao_code;
  end if;

  if v_entry.motivo_pontuacao_code <> 'GIRO' or v_entry.pontos_jogada <> 2 then
    raise exception 'CEPR-0101: motivo/pontos de GIRO persistiram incorretamente';
  end if;

  -- Positivo: PASSIVO é interrupção da posse e não carrega finalização.
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'CEPR-0101-AT-PASSIVO',
    'scout_game_id', '78000000-0000-0000-0000-000000001001',
    'tempo_jogo', '01:20',
    'fase_da_bola_code', 'AT_POS',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code', 'AT_4X0',
    'categoria_acao_code', 'ARREMESSO',
    'acao_basica_code', 'ARREMESSO',
    'resultado_factual_code', 'PASSIVO'
  ));

  if v_entry.resultado_factual_code <> 'PASSIVO'
     or v_entry.tipo_finalizacao_code is not null
     or v_entry.motivo_pontuacao_code is not null
     or v_entry.pontos_jogada <> 0 then
    raise exception 'CEPR-0101: PASSIVO deveria salvar sem tipo/motivo/pontos';
  end if;

  -- Negativo: 6M não é tipo manual de arremesso corrido.
  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'CEPR-0101-AT-6M-INVALIDO',
      'scout_game_id', '78000000-0000-0000-0000-000000001001',
      'tempo_jogo', '01:40',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_4X0',
      'categoria_acao_code', 'ARREMESSO',
      'acao_basica_code', 'ARREMESSO',
      'tipo_finalizacao_code', '6M',
      'resultado_factual_code', 'GOL',
      'motivo_pontuacao_code', '6M',
      'pontos_jogada', 2
    ));
    raise exception 'CEPR-0101: 6M manual em ARREMESSO deveria falhar';
  exception
    when others then
      if sqlerrm not like '%tipo_finalizacao_code not allowed for offensive arremesso%' then
        raise;
      end if;
  end;

  -- Negativo: PASSIVO não aceita tipo_finalizacao_code residual.
  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'CEPR-0101-PASSIVO-TIPO-INVALIDO',
      'scout_game_id', '78000000-0000-0000-0000-000000001001',
      'tempo_jogo', '02:00',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_4X0',
      'categoria_acao_code', 'ARREMESSO',
      'acao_basica_code', 'ARREMESSO',
      'tipo_finalizacao_code', 'SIMPLES',
      'resultado_factual_code', 'PASSIVO'
    ));
    raise exception 'CEPR-0101: PASSIVO com tipo_finalizacao_code deveria falhar';
  exception
    when others then
      if sqlerrm not like '%tipo_finalizacao_code not allowed in this action/result context%' then
        raise;
      end if;
  end;

  raise notice 'CEPR-0101: normalizacao de tipo_finalizacao_code em AT_POS + ARREMESSO OK';
end;
$$;

rollback;
