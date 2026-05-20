-- TEST-08: OUT_ATAQUE exige ESTRUTURA_NUMERICA_REAL = OF_3_DEF_3 (constraint funcionando)
-- TEST-09: OUT_DEFESA exige ESTRUTURA_NUMERICA_REAL = OF_4_DEF_2 (constraint funcionando)
-- Validação via upsert_scout_play_bundle (RPC, migration 0021)
\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '88000000-0000-0000-0000-000000000801',
  '10000000-0000-0000-0000-000000000001',
  '2026-12-01',
  'CEPRAEA',
  'Adversario OUT Rule',
  'em_andamento'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
declare
  v_play_id uuid;
begin

  -- TEST-08a: OUT_ATAQUE com estrutura correta (OF_3_DEF_3) deve persistir
  v_play_id := public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '88000000-0000-0000-0000-000000000801',
    jsonb_build_object(
      'play_code', 'OUT-ATAQUE-OK',
      'session_date', '2026-12-01',
      'session_type', 'JOGO',
      'period', 'SET_1',
      'game_clock', '05:00',
      'source', 'VIDEO',
      'phase_of_ball', 'AT_POS',
      'attacking_team_side', 'ANALYZED',
      'defending_team_side', 'OPPONENT',
      'factual_result', 'PERDA',
      'out_situation', 'OUT_ATAQUE',
      'numerical_structure_real', 'OF_3_DEF_3'
    )
  );

  if not exists (
    select 1 from public.scout_plays
    where id = v_play_id
      and out_situation = 'OUT_ATAQUE'
      and numerical_structure_real = 'OF_3_DEF_3'
  ) then
    raise exception 'TEST-08a FALHOU: OUT_ATAQUE com OF_3_DEF_3 deveria persistir';
  end if;

  raise notice 'TEST-08a OK: OUT_ATAQUE + OF_3_DEF_3 persistiu corretamente';

  -- TEST-09a: OUT_DEFESA com estrutura correta (OF_4_DEF_2) deve persistir
  v_play_id := public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '88000000-0000-0000-0000-000000000801',
    jsonb_build_object(
      'play_code', 'OUT-DEFESA-OK',
      'session_date', '2026-12-01',
      'session_type', 'JOGO',
      'period', 'SET_1',
      'game_clock', '06:00',
      'source', 'VIDEO',
      'phase_of_ball', 'DEF_POS',
      'attacking_team_side', 'OPPONENT',
      'defending_team_side', 'ANALYZED',
      'factual_result', 'RECUPERACAO_POSSE',
      'out_situation', 'OUT_DEFESA',
      'numerical_structure_real', 'OF_4_DEF_2'
    )
  );

  if not exists (
    select 1 from public.scout_plays
    where id = v_play_id
      and out_situation = 'OUT_DEFESA'
      and numerical_structure_real = 'OF_4_DEF_2'
  ) then
    raise exception 'TEST-09a FALHOU: OUT_DEFESA com OF_4_DEF_2 deveria persistir';
  end if;

  raise notice 'TEST-09a OK: OUT_DEFESA + OF_4_DEF_2 persistiu corretamente';

  -- TEST-08b: OUT_ATAQUE com estrutura errada deve falhar
  begin
    perform public.upsert_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '88000000-0000-0000-0000-000000000801',
      jsonb_build_object(
        'play_code', 'OUT-ATAQUE-ERRADO',
        'session_date', '2026-12-01',
        'session_type', 'JOGO',
        'period', 'SET_1',
        'game_clock', '07:00',
        'source', 'VIDEO',
        'phase_of_ball', 'AT_POS',
        'attacking_team_side', 'ANALYZED',
        'defending_team_side', 'OPPONENT',
        'factual_result', 'PERDA',
        'out_situation', 'OUT_ATAQUE',
        'numerical_structure_real', 'OF_4_DEF_2'
      )
    );
    raise exception 'TEST-08b FALHOU: OUT_ATAQUE com OF_4_DEF_2 deveria ser rejeitado';
  exception when others then
    if sqlerrm not like '%CEPR-OUT-01%' then raise; end if;
    raise notice 'TEST-08b OK: OUT_ATAQUE com estrutura errada rejeitado corretamente';
  end;

  -- TEST-08c: OUT_ATAQUE sem estrutura deve falhar
  begin
    perform public.upsert_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '88000000-0000-0000-0000-000000000801',
      jsonb_build_object(
        'play_code', 'OUT-ATAQUE-SEM-ESTRUTURA',
        'session_date', '2026-12-01',
        'session_type', 'JOGO',
        'period', 'SET_1',
        'game_clock', '08:00',
        'source', 'VIDEO',
        'phase_of_ball', 'AT_POS',
        'attacking_team_side', 'ANALYZED',
        'defending_team_side', 'OPPONENT',
        'factual_result', 'PERDA',
        'out_situation', 'OUT_ATAQUE'
      )
    );
    raise exception 'TEST-08c FALHOU: OUT_ATAQUE sem numerical_structure_real deveria ser rejeitado';
  exception when others then
    if sqlerrm not like '%CEPR-OUT-01%' then raise; end if;
    raise notice 'TEST-08c OK: OUT_ATAQUE sem estrutura rejeitado corretamente';
  end;

  -- TEST-09b: OUT_DEFESA com estrutura errada deve falhar
  begin
    perform public.upsert_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '88000000-0000-0000-0000-000000000801',
      jsonb_build_object(
        'play_code', 'OUT-DEFESA-ERRADO',
        'session_date', '2026-12-01',
        'session_type', 'JOGO',
        'period', 'SET_1',
        'game_clock', '09:00',
        'source', 'VIDEO',
        'phase_of_ball', 'DEF_POS',
        'attacking_team_side', 'OPPONENT',
        'defending_team_side', 'ANALYZED',
        'factual_result', 'PERDA',
        'out_situation', 'OUT_DEFESA',
        'numerical_structure_real', 'OF_3_DEF_3'
      )
    );
    raise exception 'TEST-09b FALHOU: OUT_DEFESA com OF_3_DEF_3 deveria ser rejeitado';
  exception when others then
    if sqlerrm not like '%CEPR-OUT-02%' then raise; end if;
    raise notice 'TEST-09b OK: OUT_DEFESA com estrutura errada rejeitado corretamente';
  end;

  -- TEST-09c: OUT_DEFESA sem estrutura deve falhar
  begin
    perform public.upsert_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '88000000-0000-0000-0000-000000000801',
      jsonb_build_object(
        'play_code', 'OUT-DEFESA-SEM-ESTRUTURA',
        'session_date', '2026-12-01',
        'session_type', 'JOGO',
        'period', 'SET_1',
        'game_clock', '10:00',
        'source', 'VIDEO',
        'phase_of_ball', 'DEF_POS',
        'attacking_team_side', 'OPPONENT',
        'defending_team_side', 'ANALYZED',
        'factual_result', 'PERDA',
        'out_situation', 'OUT_DEFESA'
      )
    );
    raise exception 'TEST-09c FALHOU: OUT_DEFESA sem numerical_structure_real deveria ser rejeitado';
  exception when others then
    if sqlerrm not like '%CEPR-OUT-02%' then raise; end if;
    raise notice 'TEST-09c OK: OUT_DEFESA sem estrutura rejeitado corretamente';
  end;

  -- Verificação adicional: campos de shootout persistem corretamente
  v_play_id := public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '88000000-0000-0000-0000-000000000801',
    jsonb_build_object(
      'play_code', 'SHOOTOUT-OK',
      'session_date', '2026-12-01',
      'session_type', 'JOGO',
      'period', 'SET_1',
      'game_clock', '11:00',
      'source', 'VIDEO',
      'phase_of_ball', 'AT_POS',
      'attacking_team_side', 'ANALYZED',
      'defending_team_side', 'OPPONENT',
      'factual_result', 'GOL',
      'special_context', 'SHOOTOUT',
      'shootout_type', 'PENALTI_7M',
      'shootout_result', 'CONVERTIDO',
      'play_score_reason', 'SIMPLES',
      'play_points', '1'
    )
  );

  if not exists (
    select 1 from public.scout_plays
    where id = v_play_id
      and special_context = 'SHOOTOUT'
      and shootout_type = 'PENALTI_7M'
      and shootout_result = 'CONVERTIDO'
  ) then
    raise exception 'Campos shootout_* devem persistir via upsert_scout_play_bundle';
  end if;

  raise notice 'OK: campos shootout_* persistem corretamente';
  raise notice 'TEST-08 e TEST-09: TODOS OS CASOS PASSARAM';

end $$;

rollback;
