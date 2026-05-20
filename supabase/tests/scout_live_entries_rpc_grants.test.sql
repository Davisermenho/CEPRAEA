\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values
  (
    '78000000-0000-0000-0000-000000000611',
    '10000000-0000-0000-0000-000000000001',
    '2026-12-20',
    'CEPRAEA',
    'Adversario Live RPC',
    'em_andamento'
  );

do $$
begin
  if has_function_privilege('anon', 'public.create_scout_live_entry(jsonb)', 'EXECUTE') then
    raise exception 'anon should not execute create_scout_live_entry';
  end if;

  if not has_function_privilege('authenticated', 'public.create_scout_live_entry(jsonb)', 'EXECUTE') then
    raise exception 'authenticated should execute create_scout_live_entry';
  end if;
end $$;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';

do $$
begin
  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-VIEWER-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000611',
      'tempo_jogo', '00:21',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_text', 'GIRO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'viewer executed create_scout_live_entry unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then
      raise;
    end if;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';

do $$
begin
  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-NOTEAM-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000611',
      'tempo_jogo', '00:22',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_text', 'GIRO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'no-team user executed create_scout_live_entry unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then
      raise;
    end if;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';

do $$
begin
  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-OTHERTEAM-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000611',
      'tempo_jogo', '00:23',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_text', 'GIRO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'other-team owner executed create_scout_live_entry unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then
      raise;
    end if;
  end;
end $$;

rollback;
