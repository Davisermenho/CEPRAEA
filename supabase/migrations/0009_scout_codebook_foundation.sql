-- Scout codebook foundation
-- Objetivo: criar o codebook central mínimo do scout para o slice 1, sem
-- depender de ENUMs massivos do Postgres e sem abrir runtime ainda.

create table if not exists public.scout_code_lists (
  id uuid primary key default gen_random_uuid(),
  list_key text not null unique,
  label text not null,
  contract_scope text,
  active boolean not null default true,
  source_version text not null default 'etapa-a-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scout_code_values (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.scout_code_lists(id) on delete cascade,
  code text not null,
  label text not null,
  sort_order int not null check (sort_order >= 1),
  is_nao_aplica boolean not null default false,
  is_nao_observado boolean not null default false,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(list_id, code)
);

create table if not exists public.scout_field_codebook_map (
  id uuid primary key default gen_random_uuid(),
  contract_name text not null,
  field_name text not null,
  selector_key text not null default '*',
  selector_value text not null default '*',
  list_key text not null references public.scout_code_lists(list_key) on delete cascade,
  allow_nao_aplica boolean not null default false,
  allow_nao_observado boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(contract_name, field_name, selector_key, selector_value)
);

create index if not exists scout_code_lists_active_idx
  on public.scout_code_lists(active, list_key);

create index if not exists scout_code_values_list_sort_idx
  on public.scout_code_values(list_id, sort_order);

create index if not exists scout_code_values_code_idx
  on public.scout_code_values(code);

create index if not exists scout_field_codebook_map_lookup_idx
  on public.scout_field_codebook_map(contract_name, field_name, selector_key, selector_value)
  where active = true;

create trigger scout_code_lists_set_updated_at before update on public.scout_code_lists
  for each row execute function public.set_updated_at();

create trigger scout_code_values_set_updated_at before update on public.scout_code_values
  for each row execute function public.set_updated_at();

create trigger scout_field_codebook_map_set_updated_at before update on public.scout_field_codebook_map
  for each row execute function public.set_updated_at();

alter table public.scout_code_lists enable row level security;
alter table public.scout_code_values enable row level security;
alter table public.scout_field_codebook_map enable row level security;

with list_seed(list_key, label, contract_scope, source_version) as (
  values
    ('LISTA_FASES', 'Fases da jogada', 'shared', 'etapa-a-v1'),
    ('LISTA_SISTEMA_OFENSIVO', 'Sistemas ofensivos', 'scout_plays', 'etapa-a-v1'),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'Configuracoes ofensivas', 'scout_plays', 'etapa-a-v1'),
    ('LISTA_SISTEMA_DEFENSIVO', 'Sistemas defensivos', 'scout_plays', 'etapa-a-v1'),
    ('LISTA_ACAO_OFENSIVA', 'Acoes ofensivas', 'scout_play_participations', 'etapa-a-v1'),
    ('LISTA_ACAO_DEFENSIVA', 'Acoes defensivas', 'scout_play_participations', 'etapa-a-v1'),
    ('LISTA_RESULTADO_FACTUAL', 'Resultados factuais', 'scout_plays', 'etapa-a-v1'),
    ('LISTA_CAUSA_PRINCIPAL', 'Causas principais', 'shared', 'etapa-a-v1'),
    ('LISTA_PRIORIDADE_TREINO', 'Prioridades de treino', 'shared', 'etapa-a-v1')
)
insert into public.scout_code_lists (
  list_key,
  label,
  contract_scope,
  active,
  source_version
)
select
  list_key,
  label,
  contract_scope,
  true,
  source_version
from list_seed
on conflict (list_key) do update
set label = excluded.label,
    contract_scope = excluded.contract_scope,
    active = excluded.active,
    source_version = excluded.source_version;

with value_seed(list_key, code, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_FASES', 'AT_POS', 1, false, false),
    ('LISTA_FASES', 'DEF_POS', 2, false, false),
    ('LISTA_FASES', 'TRANS_OF', 3, false, false),
    ('LISTA_FASES', 'TRANS_DEF', 4, false, false),

    ('LISTA_SISTEMA_OFENSIVO', 'AT_3X1', 1, false, false),
    ('LISTA_SISTEMA_OFENSIVO', 'AT_4X0', 2, false, false),
    ('LISTA_SISTEMA_OFENSIVO', 'NAO_APLICA', 3, true, false),
    ('LISTA_SISTEMA_OFENSIVO', 'NAO_OBSERVADO', 4, false, true),

    ('LISTA_CONFIGURACAO_OFENSIVA', 'AT_3X1_ESP_CE', 1, false, false),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'AT_3X1_ESP_LE', 2, false, false),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'AT_3X1_ESP_LD', 3, false, false),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'AT_3X1_PLAYMAKER_CE', 4, false, false),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'AT_4X0_ESP_LE', 5, false, false),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'AT_4X0_ESP_CE_LE', 6, false, false),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'AT_4X0_ESP_CE_LD', 7, false, false),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'AT_4X0_ESP_LD', 8, false, false),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'NAO_APLICA', 9, true, false),
    ('LISTA_CONFIGURACAO_OFENSIVA', 'NAO_OBSERVADO', 10, false, true),

    ('LISTA_SISTEMA_DEFENSIVO', 'DEF_3X0', 1, false, false),
    ('LISTA_SISTEMA_DEFENSIVO', 'DEF_2X1', 2, false, false),
    ('LISTA_SISTEMA_DEFENSIVO', 'DEF_1X2', 3, false, false),
    ('LISTA_SISTEMA_DEFENSIVO', 'DEF_MISTO', 4, false, false),
    ('LISTA_SISTEMA_DEFENSIVO', 'DEF_INDIVIDUAL', 5, false, false),
    ('LISTA_SISTEMA_DEFENSIVO', 'DEF_2X0_OUT', 6, false, false),
    ('LISTA_SISTEMA_DEFENSIVO', 'NAO_OBSERVADO', 7, false, true),

    ('LISTA_ACAO_OFENSIVA', 'PASSE_GIRO', 1, false, false),
    ('LISTA_ACAO_OFENSIVA', 'PASSE_AEREA', 2, false, false),
    ('LISTA_ACAO_OFENSIVA', 'ASSIST', 3, false, false),
    ('LISTA_ACAO_OFENSIVA', 'GIRO', 4, false, false),
    ('LISTA_ACAO_OFENSIVA', 'AEREA', 5, false, false),
    ('LISTA_ACAO_OFENSIVA', 'ARREM_SIMP', 6, false, false),
    ('LISTA_ACAO_OFENSIVA', 'FIXOU', 7, false, false),
    ('LISTA_ACAO_OFENSIVA', 'QUEBRA', 8, false, false),
    ('LISTA_ACAO_OFENSIVA', 'BLOQ_OF', 9, false, false),
    ('LISTA_ACAO_OFENSIVA', 'OCUPOU', 10, false, false),
    ('LISTA_ACAO_OFENSIVA', 'BOLA_RETORNO', 11, false, false),
    ('LISTA_ACAO_OFENSIVA', 'FINTA_GIRO_RETORNO', 12, false, false),
    ('LISTA_ACAO_OFENSIVA', 'FINTA_ARREM_RETORNO', 13, false, false),
    ('LISTA_ACAO_OFENSIVA', 'RECEBE_RETORNO_ARREM', 14, false, false),
    ('LISTA_ACAO_OFENSIVA', 'RECEBE_RETORNO_PASSA_INDEVIDO', 15, false, false),
    ('LISTA_ACAO_OFENSIVA', 'RECEBE_RETORNO_PERDE', 16, false, false),
    ('LISTA_ACAO_OFENSIVA', 'ERRO_PASSE', 17, false, false),
    ('LISTA_ACAO_OFENSIVA', 'ERRO_REC', 18, false, false),
    ('LISTA_ACAO_OFENSIVA', 'NEUTRA', 19, false, false),
    ('LISTA_ACAO_OFENSIVA', 'NAO_OBSERVADO', 20, false, true),

    ('LISTA_ACAO_DEFENSIVA', 'BLOQ_GIRO', 1, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'BLOQ_SIMPLES', 2, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'COB_AEREA', 3, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'COB_PIVO', 4, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'MARC_ESP', 5, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'MARC_LAT', 6, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'TROCA', 7, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'AJUDA', 8, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'INTERC', 9, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'ROUBO', 10, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'PRESS', 11, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'RETORNO', 12, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'DISSUADIR', 13, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'INDIVIDUALIZAR', 14, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'FECHAR_SETOR', 15, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'PROVOCAR_FALTA_ATAQUE', 16, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'DESLIZAR_RECOMPOR', 17, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'NEUTRA', 18, false, false),
    ('LISTA_ACAO_DEFENSIVA', 'NAO_OBSERVADO', 19, false, true),

    ('LISTA_RESULTADO_FACTUAL', 'GOL', 1, false, false),
    ('LISTA_RESULTADO_FACTUAL', 'DEFENDIDO', 2, false, false),
    ('LISTA_RESULTADO_FACTUAL', 'BLOQUEADO', 3, false, false),
    ('LISTA_RESULTADO_FACTUAL', 'FORA', 4, false, false),
    ('LISTA_RESULTADO_FACTUAL', 'TRAVE', 5, false, false),
    ('LISTA_RESULTADO_FACTUAL', 'VIOLACAO', 6, false, false),
    ('LISTA_RESULTADO_FACTUAL', 'PERDA', 7, false, false),
    ('LISTA_RESULTADO_FACTUAL', 'NAO_OBSERVADO', 8, false, true),

    ('LISTA_CAUSA_PRINCIPAL', 'TEC_OF', 1, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'DEC_OF', 2, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'EXEC_OF', 3, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'TEC_DEF', 4, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'DEC_DEF', 5, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'COB', 6, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'BLOQ', 7, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'COM', 8, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'POS', 9, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'TROCA', 10, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'GOL', 11, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'MERITO', 12, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'MERITO_ADV', 13, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'FIS', 14, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'REGRA', 15, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'OUT_ESTRUTURAL', 16, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'OK', 17, false, false),
    ('LISTA_CAUSA_PRINCIPAL', 'NAO_OBSERVADO', 18, false, true),

    ('LISTA_PRIORIDADE_TREINO', 'MANTER', 1, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'DEF_GIRO', 2, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'DEF_AEREA', 3, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'DEF_ESP', 4, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'COBERTURA', 5, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'COM_DEF', 6, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'BLOQUEIO', 7, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'GOLEIRA', 8, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'GOL_REACAO_GIRO', 9, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'GOL_FECHAMENTO_ANGULO', 10, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'GOL_OUTLET_PASS', 11, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'GOL_DEF_BAIXO', 12, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'TRANS_DEF', 13, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'TRANS_OF', 14, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'FORM_TRANS_OF', 15, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'TRANS_OF_ESP_LATERAL', 16, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'TRANS_OF_ESP_CENTRO', 17, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'TRANS_DEF_PRIMEIRA_ENTRADA', 18, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'ESTABILIZACAO_AT_POS', 19, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'ESTABILIZACAO_DEF_POS', 20, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'REORGANIZACAO_DEF', 21, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'SAIDA', 22, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'FIN2', 23, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'FIN_SIMP', 24, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'PASSE', 25, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'DECISAO', 26, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'SIST_OF', 27, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'SIST_DEF', 28, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'OUT_ATAQUE_3X3', 29, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'OUT_DEFESA_4X2', 30, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'OUT_GESTAO_RISCO', 31, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'OUT_NEGAR_2PTS', 32, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'OUT_MANUTENCAO_POSSE', 33, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'OUT_GOLEIRA', 34, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'OUT_MANTER', 35, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'BOLA_RETORNO', 36, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'RETORNO_GIRO', 37, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'RETORNO_DECISAO', 38, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'RETORNO_RECEPTORA', 39, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'ARREM_OBRIGATORIO', 40, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'PASSIVO_4_PASSES', 41, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'SEGURANCA_ARREM', 42, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'FIN_CONTROLE', 43, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'OUT_DISCIPLINA', 44, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'OUT_TROCA', 45, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'RESET_MENTAL', 46, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'POS_ERRO', 47, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'PRESSAO_DECISAO', 48, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'FECHAMENTO_SET_MENTAL', 49, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'GOLDEN_GOAL_MENTAL', 50, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'SHOOTOUT_MENTAL', 51, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'PLACAR_ADVERSO', 52, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'COMUNICACAO_CRITICA', 53, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'LIDERANCA_FUNCIONAL', 54, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'ERRO_CONSECUTIVO', 55, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'COMPENSACAO_POS_ERRO', 56, false, false),
    ('LISTA_PRIORIDADE_TREINO', 'CONFIANCA_DECISIVA', 57, false, false)
)
insert into public.scout_code_values (
  list_id,
  code,
  label,
  sort_order,
  is_nao_aplica,
  is_nao_observado,
  active
)
select
  l.id,
  v.code,
  v.code,
  v.sort_order,
  v.is_nao_aplica,
  v.is_nao_observado,
  true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    is_nao_aplica = excluded.is_nao_aplica,
    is_nao_observado = excluded.is_nao_observado,
    active = excluded.active;

with map_seed(contract_name, field_name, selector_key, selector_value, list_key, allow_nao_aplica, allow_nao_observado) as (
  values
    ('scout_plays', 'phase_of_ball', '*', '*', 'LISTA_FASES', false, false),
    ('scout_plays', 'offensive_system', '*', '*', 'LISTA_SISTEMA_OFENSIVO', true, true),
    ('scout_plays', 'offensive_configuration', '*', '*', 'LISTA_CONFIGURACAO_OFENSIVA', true, true),
    ('scout_plays', 'defensive_system', '*', '*', 'LISTA_SISTEMA_DEFENSIVO', false, true),
    ('scout_plays', 'factual_result', '*', '*', 'LISTA_RESULTADO_FACTUAL', false, true),
    ('scout_plays', 'main_cause', '*', '*', 'LISTA_CAUSA_PRINCIPAL', false, true),
    ('scout_play_participations', 'phase_of_athlete', '*', '*', 'LISTA_FASES', false, false),
    ('scout_play_participations', 'action_code', 'participant_scope', 'ATQ', 'LISTA_ACAO_OFENSIVA', false, true),
    ('scout_play_participations', 'action_code', 'participant_scope', 'DEF', 'LISTA_ACAO_DEFENSIVA', false, true),
    ('scout_play_participations', 'main_cause', '*', '*', 'LISTA_CAUSA_PRINCIPAL', false, true),
    ('scout_play_participations', 'training_priority', '*', '*', 'LISTA_PRIORIDADE_TREINO', false, false)
)
insert into public.scout_field_codebook_map (
  contract_name,
  field_name,
  selector_key,
  selector_value,
  list_key,
  allow_nao_aplica,
  allow_nao_observado,
  active
)
select
  contract_name,
  field_name,
  selector_key,
  selector_value,
  list_key,
  allow_nao_aplica,
  allow_nao_observado,
  true
from map_seed
on conflict (contract_name, field_name, selector_key, selector_value) do update
set list_key = excluded.list_key,
    allow_nao_aplica = excluded.allow_nao_aplica,
    allow_nao_observado = excluded.allow_nao_observado,
    active = excluded.active;
