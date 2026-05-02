-- RPC grant checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

set local role anon;
do $$
begin
  perform public.confirm_presence_by_token('invalid-token', 'presente', null);

  begin
    perform public.generate_trainings('10000000-0000-0000-0000-000000000001', null, current_date, current_date, array[extract(dow from current_date)::int], '20:00'::time, '21:30'::time, 'America/Sao_Paulo', 'recorrente', 'Teste');
    raise exception 'anon executed generate_trainings unexpectedly';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform public.create_presence_token_batch('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', now() + interval '7 days');
    raise exception 'anon executed create_presence_token_batch unexpectedly';
  exception when insufficient_privilege then
    null;
  end;
end $$;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
do $$
begin
  begin
    perform public.generate_trainings('10000000-0000-0000-0000-000000000001', null, current_date, current_date, array[extract(dow from current_date)::int], '20:00'::time, '21:30'::time, 'America/Sao_Paulo', 'recorrente', 'Teste');
    raise exception 'viewer executed generate_trainings unexpectedly';
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
    perform public.generate_trainings('10000000-0000-0000-0000-000000000001', null, current_date, current_date, array[extract(dow from current_date)::int], '20:00'::time, '21:30'::time, 'America/Sao_Paulo', 'recorrente', 'Teste');
    raise exception 'user_no_team executed generate_trainings unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then
      raise;
    end if;
  end;
end $$;

rollback;
