-- Migration: 0018_scout_codebook_all_lists.sql
-- DB-17: Seed das listas funcionais do scout codebook (111 novas listas)
-- Generated automatically from scout-listas.md

-- ============================================================
-- PART 1: Criar/atualizar cabeçalhos das listas
-- ============================================================
with list_seed(list_key, label, contract_scope, source_version) as (
  values
    ('LISTA_TIPO_SESSAO', 'Tipo de sessão', 'scout', 'manual-v1.0.1'),
    ('LISTA_PERIODO', 'Período da partida', 'scout', 'manual-v1.0.1'),
    ('LISTA_FONTE_COLETA', 'Fonte de coleta', 'scout', 'manual-v1.0.1'),
    ('LISTA_BOOLEANO', 'Booleano (Sim/Não)', 'scout', 'manual-v1.0.1'),
    ('LISTA_BOOLEANO_OBS', 'Booleano com Não Observado', 'scout', 'manual-v1.0.1'),
    ('LISTA_NAO_OBSERVADO', 'Não Observado', 'scout', 'manual-v1.0.1'),
    ('LISTA_NAO_APLICA', 'Não Aplica', 'scout', 'manual-v1.0.1'),
    ('LISTA_CONFIG_3X1', 'Configuração 3x1', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_CONFIG_4X0', 'Configuração 4x0', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_POSICAO_OFENSIVA', 'Posição ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_POS_OF_3X1', 'Posição ofensiva 3x1', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_POS_OF_4X0', 'Posição ofensiva 4x0', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_FUNCAO_ESPECIAL_OFENSIVA', 'Função especial ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_PARTICIPA_DEFINICAO', 'Participação na definição', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_OCUPACAO_PIVO_TEMP_RESULTADO', 'Resultado de ocupação pivô temp.', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_POSICAO_DEFENSIVA', 'Posição defensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_POS_DEF', 'Posição defensiva (sem NAO_OBS)', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_POS_DEF_3X0', 'Posição defensiva 3x0', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'Comportamento defensivo', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_CONEXAO_DEFENSIVA', 'Conexão defensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_AJUSTE_DEFENSIVO', 'Ajuste defensivo', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_AMEACA_OFENSIVA', 'Ameaça ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_RESULTADO_AJUSTE_DEFENSIVO', 'Resultado do ajuste defensivo', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_DESTINO_ARREMESSO', 'Destino do arremesso', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_REGIAO_ARREMESSO', 'Região do arremesso', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_RESULTADO_ANALISE', 'Resultado da análise', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_RESULTADO_INDIVIDUAL', 'Resultado individual', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_PONTOS', 'Pontos marcados', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_DECISAO_EXECUCAO', 'Decisão/Execução', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_TECNICA_DEFESA', 'Técnica defensiva (goleira)', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_POSTURA_GOLEIRA', 'Postura da goleira', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_REACAO_GOLEIRA', 'Reação da goleira', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_DECISAO_GOLEIRA', 'Decisão da goleira', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_RESPOSTA_GOLEIRA', 'Resposta da goleira', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_QUALIDADE_REPOSICAO_GOL', 'Qualidade da reposição da goleira', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_TIPO_PASSE_GOL', 'Tipo de passe da goleira', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_VISAO_JOGO_GOL', 'Visão de jogo da goleira', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_FORM_TRANS_OF', 'Formação de transição ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'Objetivo da formação trans. ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_POS_TRANS_OF', 'Posição na transição ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_FUNCAO_TRANS_OF', 'Função na transição ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_STATUS_ESTABILIZACAO_AT_POS', 'Status de estabilização ataque pos.', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_MOTIVO_FIM_TRANS_OF', 'Motivo do fim da transição ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_FORM_TRANS_DEF', 'Formação de transição defensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_OBJETIVO_FORM_TRANS_DEF', 'Objetivo da formação trans. defensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_SISTEMA_DEF_TRANS_TEMP', 'Sistema defensivo trans. temporária', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_ZONA_TRANS_DEF', 'Zona de transição defensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_ACAO_TRANS_DEF', 'Ação na transição defensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_REORGANIZACAO_DEF', 'Reorganização defensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_STATUS_ESTABILIZACAO_DEF_POS', 'Status estabilização defesa pos.', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_MOTIVO_FIM_TRANS_DEF', 'Motivo do fim da transição defensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_VELOCIDADE_TRANS_OF', 'Velocidade da transição ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_VANTAGEM_TRANS_OF', 'Vantagem na transição ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_RESULTADO_TRANS_OF', 'Resultado da transição ofensiva', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_OUT_SITUACAO', 'Situação de OUT', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_ESTRUTURA_NUMERICA_REAL', 'Estrutura numérica real', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT', 'Sistema ofensivo ajustado OUT', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_AJUSTE_DEFENSIVO_OUT', 'Ajuste defensivo em OUT', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_AMEACA_PRIORITARIA_OUT', 'Ameaça prioritária em OUT', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_RESULTADO_OUT', 'Resultado de OUT', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_CAUSA_OUT', 'Causa do OUT', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_OUT_GATILHO', 'Gatilho de OUT/punição', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_PUNICAO_RESULTADO', 'Resultado da punição', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_MOMENTO_PUNICAO', 'Momento da punição', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_DEFESA_MISTA', 'Marcação mista', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_DEF_MISTO_RESULTADO', 'Resultado da marcação mista', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_DEFESA_INDIVIDUAL', 'Defesa individual (trocas)', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_DEF_INDIV_RESULTADO', 'Resultado da defesa individual', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_TIPO_BOLA_RETORNO', 'Tipo de bola/retorno', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_FINALIZACAO_FINTADA', 'Finalização fintada', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_BLOQUEIO_ATRAIDO', 'Bloqueio atraído', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_RELACAO_NUMERICA_APOS_RETORNO', 'Relação numérica após retorno', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'Resultado arremesso obrigatório', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_CONTADOR_PASSIVO', 'Contador passivo', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_RESULTADO_REGRA_PASSIVO', 'Resultado da regra de passivo', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_SHOOTOUT', 'Tipo de shootout', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_SHOOTOUT_RESULTADO', 'Resultado do shootout', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_SHOOTOUT_DECISAO', 'Decisão no shootout', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_SHOOTOUT_EXECUCAO', 'Execução no shootout', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_CONTEXTO_ESPECIAL', 'Contexto especial', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_TIPO_BOLA_PARADA', 'Tipo de bola parada', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_6M', 'Resultado de tiro de 6m', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_TIRO_LIVRE', 'Resultado de tiro livre', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_REPOSICAO_LATERAL', 'Resultado de reposição lateral', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_REPOSICAO_GOLEIRA', 'Resultado de reposição da goleira', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_REPOSICAO_APOS_GOL', 'Resultado de reposição após gol', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_GOLDEN_GOAL', 'Situação de golden goal', 'scout_plays', 'manual-v1.0.1'),
    ('LISTA_CODIGO_MENTAL', 'Código mental', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_MARCA_MENTAL', 'Marca mental', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_CONTEXTO_PRESSAO', 'Contexto de pressão', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'Gatilho do evento mental', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_RESPOSTA_APOS_ERRO', 'Resposta após erro', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_IMPACTO_ERRO_ANTERIOR', 'Impacto do erro anterior', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'Comportamento sob pressão', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_QUALIDADE_RESET_MENTAL', 'Qualidade do reset mental', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'Comunicação em momento crítico', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_LINGUAGEM_CORPORAL', 'Linguagem corporal', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_PERFIL_PRESSAO_JOGO', 'Perfil sob pressão em jogo', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_SEQUENCIA_ERROS_ATLETA', 'Sequência de erros da atleta', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_ACAO_POS_ERRO', 'Ação após erro', 'scout_mental_events', 'manual-v1.0.1'),
    ('LISTA_TIPO_FEEDBACK', 'Tipo de feedback', 'scout_feedback', 'manual-v1.0.1'),
    ('LISTA_DESTINATARIO_FEEDBACK', 'Destinatário do feedback', 'scout_feedback', 'manual-v1.0.1'),
    ('LISTA_PRIORIDADE_FEEDBACK', 'Prioridade do feedback', 'scout_feedback', 'manual-v1.0.1'),
    ('LISTA_STATUS_FEEDBACK', 'Status do feedback', 'scout_feedback', 'manual-v1.0.1'),
    ('LISTA_BLOCO_RELATORIO', 'Bloco de relatório', 'scout_report', 'manual-v1.0.1'),
    ('LISTA_STATUS_DASHBOARD', 'Status de dashboard', 'scout_dashboard', 'manual-v1.0.1'),
    ('LISTA_STATUS_ATLETA', 'Status da atleta', 'athlete_scout_profiles', 'manual-v1.0.1'),
    ('LISTA_MAO_DOMINANTE', 'Mão dominante', 'athlete_scout_profiles', 'manual-v1.0.1'),
    ('LISTA_FUNCAO_PRINCIPAL', 'Função principal', 'athlete_scout_profiles', 'manual-v1.0.1'),
    ('LISTA_TIPO_EQUIPE', 'Tipo de equipe', 'scouts_catalog_teams', 'manual-v1.0.1'),
    ('LISTA_CATEGORIA', 'Categoria', 'scouts_catalog_teams', 'manual-v1.0.1')
)
insert into public.scout_code_lists (id, list_key, label, contract_scope, active, source_version)
select gen_random_uuid(), s.list_key, s.label, s.contract_scope, true, s.source_version
from list_seed s
on conflict (list_key) do update
  set label = excluded.label,
      contract_scope = excluded.contract_scope,
      source_version = excluded.source_version,
      active = excluded.active;

-- ============================================================
-- PART 2: Popular valores de cada lista
-- ============================================================

-- LISTA_TIPO_SESSAO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_TIPO_SESSAO', 'JOGO', 'Jogo', 1, false, false),
    ('LISTA_TIPO_SESSAO', 'TREINO', 'Treino', 2, false, false),
    ('LISTA_TIPO_SESSAO', 'AMISTOSO', 'Amistoso', 3, false, false),
    ('LISTA_TIPO_SESSAO', 'SIMULADO', 'Simulado', 4, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_PERIODO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_PERIODO', 'SET_1', 'Set 1', 1, false, false),
    ('LISTA_PERIODO', 'SET_2', 'Set 2', 2, false, false),
    ('LISTA_PERIODO', 'GOLDEN_GOAL', 'Golden Goal', 3, false, false),
    ('LISTA_PERIODO', 'SHOOTOUT', 'Shootout', 4, false, false),
    ('LISTA_PERIODO', 'TREINO', 'Treino', 5, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_FONTE_COLETA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_FONTE_COLETA', 'AO_VIVO', 'Ao vivo', 1, false, false),
    ('LISTA_FONTE_COLETA', 'VIDEO', 'Vídeo', 2, false, false),
    ('LISTA_FONTE_COLETA', 'MISTA', 'Mista', 3, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_BOOLEANO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_BOOLEANO', 'SIM', 'Sim', 1, false, false),
    ('LISTA_BOOLEANO', 'NAO', 'Não', 2, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_BOOLEANO_OBS
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_BOOLEANO_OBS', 'SIM', 'Sim', 1, false, false),
    ('LISTA_BOOLEANO_OBS', 'NAO', 'Não', 2, false, false),
    ('LISTA_BOOLEANO_OBS', 'NAO_OBSERVADO', 'Não Observado', 3, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_NAO_OBSERVADO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_NAO_OBSERVADO', 'NAO_OBSERVADO', 'Não Observado', 1, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_NAO_APLICA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_NAO_APLICA', 'NAO_APLICA', 'Não Aplica', 1, true, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_CONFIG_3X1
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_CONFIG_3X1', 'AT_3X1_ESP_CE', 'Esp. central 3x1', 1, false, false),
    ('LISTA_CONFIG_3X1', 'AT_3X1_ESP_LE', 'Esp. esq. 3x1', 2, false, false),
    ('LISTA_CONFIG_3X1', 'AT_3X1_ESP_LD', 'Esp. dir. 3x1', 3, false, false),
    ('LISTA_CONFIG_3X1', 'AT_3X1_PLAYMAKER_CE', 'Playmaker central', 4, false, false),
    ('LISTA_CONFIG_3X1', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_CONFIG_4X0
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_CONFIG_4X0', 'AT_4X0_ESP_LE', 'Esp. esq. 4x0', 1, false, false),
    ('LISTA_CONFIG_4X0', 'AT_4X0_ESP_CE_LE', 'Esp. centro-esq.', 2, false, false),
    ('LISTA_CONFIG_4X0', 'AT_4X0_ESP_CE_LD', 'Esp. centro-dir.', 3, false, false),
    ('LISTA_CONFIG_4X0', 'AT_4X0_ESP_LD', 'Esp. dir. 4x0', 4, false, false),
    ('LISTA_CONFIG_4X0', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_POSICAO_OFENSIVA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_POSICAO_OFENSIVA', 'LE', 'Lateral esquerdo', 1, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'CE', 'Central', 2, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'LD', 'Lateral direito', 3, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'PV', 'Pivô', 4, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'CE_LE', 'Central-esquerdo', 5, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'CE_LD', 'Central-direito', 6, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'ESP', 'Especialista', 7, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'GOL_LINHA', 'Goleira de linha', 8, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'TR_LE', 'Trans. esquerda', 9, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'TR_CE_LE', 'Trans. centro-esq.', 10, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'TR_CE', 'Trans. central', 11, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'TR_CE_LD', 'Trans. centro-dir.', 12, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'TR_LD', 'Trans. direita', 13, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'TR_INT', 'Trans. interna', 14, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'TR_PROF', 'Trans. prof.', 15, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'TR_SEG', 'Trans. segurança', 16, false, false),
    ('LISTA_POSICAO_OFENSIVA', 'NAO_OBSERVADO', 'Não Observado', 17, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_POS_OF_3X1
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_POS_OF_3X1', 'LE', 'Lateral esquerdo', 1, false, false),
    ('LISTA_POS_OF_3X1', 'PV', 'Pivô', 2, false, false),
    ('LISTA_POS_OF_3X1', 'CE', 'Central', 3, false, false),
    ('LISTA_POS_OF_3X1', 'LD', 'Lateral direito', 4, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_POS_OF_4X0
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_POS_OF_4X0', 'LE', 'Lateral esquerdo', 1, false, false),
    ('LISTA_POS_OF_4X0', 'CE_LE', 'Central-esquerdo', 2, false, false),
    ('LISTA_POS_OF_4X0', 'CE_LD', 'Central-direito', 3, false, false),
    ('LISTA_POS_OF_4X0', 'LD', 'Lateral direito', 4, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_FUNCAO_ESPECIAL_OFENSIVA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_FUNCAO_ESPECIAL_OFENSIVA', 'ESPECIALISTA', 'Especialista', 1, false, false),
    ('LISTA_FUNCAO_ESPECIAL_OFENSIVA', 'PLAYMAKER', 'Playmaker', 2, false, false),
    ('LISTA_FUNCAO_ESPECIAL_OFENSIVA', 'GOLEIRA_LINHA', 'Goleira de linha', 3, false, false),
    ('LISTA_FUNCAO_ESPECIAL_OFENSIVA', 'ARMADORA', 'Armadora', 4, false, false),
    ('LISTA_FUNCAO_ESPECIAL_OFENSIVA', 'PIVO_FIXA', 'Pivô fixa', 5, false, false),
    ('LISTA_FUNCAO_ESPECIAL_OFENSIVA', 'PIVO_TEMP', 'Pivô temporária', 6, false, false),
    ('LISTA_FUNCAO_ESPECIAL_OFENSIVA', 'NAO_APLICA', 'Não Aplica', 7, true, false),
    ('LISTA_FUNCAO_ESPECIAL_OFENSIVA', 'NAO_OBSERVADO', 'Não Observado', 8, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_PARTICIPA_DEFINICAO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_PARTICIPA_DEFINICAO', 'FINALIZADORA', 'Finalizadora', 1, false, false),
    ('LISTA_PARTICIPA_DEFINICAO', 'ASSISTENTE_DIRETA', 'Assistente direta', 2, false, false),
    ('LISTA_PARTICIPA_DEFINICAO', 'ASSISTENTE_INDIRETA', 'Assistente indireta', 3, false, false),
    ('LISTA_PARTICIPA_DEFINICAO', 'APOIO', 'Apoio', 4, false, false),
    ('LISTA_PARTICIPA_DEFINICAO', 'FIXACAO', 'Fixação', 5, false, false),
    ('LISTA_PARTICIPA_DEFINICAO', 'SEM_PARTICIPACAO_DIRETA', 'Sem participação dir.', 6, false, false),
    ('LISTA_PARTICIPA_DEFINICAO', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_OCUPACAO_PIVO_TEMP_RESULTADO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_OCUPACAO_PIVO_TEMP_RESULTADO', 'VANTAGEM', 'Vantagem', 1, false, false),
    ('LISTA_OCUPACAO_PIVO_TEMP_RESULTADO', 'FINALIZACAO', 'Finalização', 2, false, false),
    ('LISTA_OCUPACAO_PIVO_TEMP_RESULTADO', 'GOL', 'Gol', 3, false, false),
    ('LISTA_OCUPACAO_PIVO_TEMP_RESULTADO', 'PERDA', 'Perda', 4, false, false),
    ('LISTA_OCUPACAO_PIVO_TEMP_RESULTADO', 'NEUTRALIZADA', 'Neutralizada', 5, false, false),
    ('LISTA_OCUPACAO_PIVO_TEMP_RESULTADO', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_POSICAO_DEFENSIVA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_SOLTA', 'Solta', 1, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_BASE', 'Base', 2, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_ATRAS_PIVO', 'Atrás do pivô', 3, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_AVANCADA', 'Avançada', 4, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_BASE_ESQ', 'Base esquerda', 5, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_BASE_DIR', 'Base direita', 6, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_PRESSAO', 'Pressão', 7, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_COB_ESQ', 'Cobertura esq.', 8, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_COB_DIR', 'Cobertura dir.', 9, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_OUT_BASE', 'Out base', 10, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'DEF_OUT_COB', 'Out cobertura', 11, false, false),
    ('LISTA_POSICAO_DEFENSIVA', 'NAO_OBSERVADO', 'Não Observado', 12, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_POS_DEF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_POS_DEF', 'DEF_SOLTA', 'Solta', 1, false, false),
    ('LISTA_POS_DEF', 'DEF_BASE', 'Base', 2, false, false),
    ('LISTA_POS_DEF', 'DEF_ATRAS_PIVO', 'Atrás do pivô', 3, false, false),
    ('LISTA_POS_DEF', 'DEF_AVANCADA', 'Avançada', 4, false, false),
    ('LISTA_POS_DEF', 'DEF_BASE_ESQ', 'Base esquerda', 5, false, false),
    ('LISTA_POS_DEF', 'DEF_BASE_DIR', 'Base direita', 6, false, false),
    ('LISTA_POS_DEF', 'DEF_PRESSAO', 'Pressão', 7, false, false),
    ('LISTA_POS_DEF', 'DEF_COB_ESQ', 'Cobertura esq.', 8, false, false),
    ('LISTA_POS_DEF', 'DEF_COB_DIR', 'Cobertura dir.', 9, false, false),
    ('LISTA_POS_DEF', 'DEF_OUT_BASE', 'Out base', 10, false, false),
    ('LISTA_POS_DEF', 'DEF_OUT_COB', 'Out cobertura', 11, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_POS_DEF_3X0
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_POS_DEF_3X0', 'DEF_SOLTA', 'Solta', 1, false, false),
    ('LISTA_POS_DEF_3X0', 'DEF_BASE', 'Base', 2, false, false),
    ('LISTA_POS_DEF_3X0', 'DEF_ATRAS_PIVO', 'Atrás do pivô', 3, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_COMPORTAMENTO_DEFENSIVO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'DISSUADE', 'Dissuade', 1, false, false),
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'INDIVIDUALIZA', 'Individualiza', 2, false, false),
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'FECHA_SETOR', 'Fecha setor', 3, false, false),
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'PRESSIONA_PASSE', 'Pressiona passe', 4, false, false),
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'INTERCEPTA', 'Intercepta', 5, false, false),
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'DESLIZA_RECOMPOE', 'Desliza/recompõe', 6, false, false),
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'BLOQUEIA', 'Bloqueia', 7, false, false),
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'NEUTRA', 'Neutra', 8, false, false),
    ('LISTA_COMPORTAMENTO_DEFENSIVO', 'NAO_OBSERVADO', 'Não Observado', 9, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_CONEXAO_DEFENSIVA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_CONEXAO_DEFENSIVA', 'CONECTADA', 'Conectada', 1, false, false),
    ('LISTA_CONEXAO_DEFENSIVA', 'PARCIAL', 'Parcial', 2, false, false),
    ('LISTA_CONEXAO_DEFENSIVA', 'DESCONECTADA', 'Desconectada', 3, false, false),
    ('LISTA_CONEXAO_DEFENSIVA', 'NAO_OBSERVADO', 'Não Observado', 4, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_AJUSTE_DEFENSIVO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_AJUSTE_DEFENSIVO', 'MARCAR_ESPECIALISTA', 'Marcar especialista', 1, false, false),
    ('LISTA_AJUSTE_DEFENSIVO', 'NEGAR_2PTS', 'Negar 2 pontos', 2, false, false),
    ('LISTA_AJUSTE_DEFENSIVO', 'PROTEGER_CENTRO', 'Proteger centro', 3, false, false),
    ('LISTA_AJUSTE_DEFENSIVO', 'FORCAR_SIMPLES', 'Forçar simples', 4, false, false),
    ('LISTA_AJUSTE_DEFENSIVO', 'PRESSAO_BOLA', 'Pressão na bola', 5, false, false),
    ('LISTA_AJUSTE_DEFENSIVO', 'ZONA_COMPACTA', 'Zona compacta', 6, false, false),
    ('LISTA_AJUSTE_DEFENSIVO', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_AMEACA_OFENSIVA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_AMEACA_OFENSIVA', 'ESPECIALISTA', 'Especialista', 1, false, false),
    ('LISTA_AMEACA_OFENSIVA', 'GIRO', 'Giro', 2, false, false),
    ('LISTA_AMEACA_OFENSIVA', 'AEREA', 'Aérea', 3, false, false),
    ('LISTA_AMEACA_OFENSIVA', 'PIVO_FIXA', 'Pivô fixa', 4, false, false),
    ('LISTA_AMEACA_OFENSIVA', 'PIVO_TEMP', 'Pivô temporária', 5, false, false),
    ('LISTA_AMEACA_OFENSIVA', 'ARREM_SIMP', 'Arremesso simples', 6, false, false),
    ('LISTA_AMEACA_OFENSIVA', 'PASSE_FINAL', 'Passe final', 7, false, false),
    ('LISTA_AMEACA_OFENSIVA', 'GOL_SEM_GOLEIRA', 'Gol sem goleira', 8, false, false),
    ('LISTA_AMEACA_OFENSIVA', 'NAO_OBSERVADO', 'Não Observado', 9, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RESULTADO_AJUSTE_DEFENSIVO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RESULTADO_AJUSTE_DEFENSIVO', 'SUCESSO', 'Sucesso', 1, false, false),
    ('LISTA_RESULTADO_AJUSTE_DEFENSIVO', 'FALHA', 'Falha', 2, false, false),
    ('LISTA_RESULTADO_AJUSTE_DEFENSIVO', 'REDUZIU_VANTAGEM', 'Reduziu vantagem', 3, false, false),
    ('LISTA_RESULTADO_AJUSTE_DEFENSIVO', 'MERITO_ADV', 'Mérito adv.', 4, false, false),
    ('LISTA_RESULTADO_AJUSTE_DEFENSIVO', 'NEUTRO', 'Neutro', 5, false, false),
    ('LISTA_RESULTADO_AJUSTE_DEFENSIVO', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_DESTINO_ARREMESSO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_DESTINO_ARREMESSO', 'A1', 'Alto esq.', 1, false, false),
    ('LISTA_DESTINO_ARREMESSO', 'A2', 'Alto cent.', 2, false, false),
    ('LISTA_DESTINO_ARREMESSO', 'A3', 'Alto dir.', 3, false, false),
    ('LISTA_DESTINO_ARREMESSO', 'M1', 'Médio esq.', 4, false, false),
    ('LISTA_DESTINO_ARREMESSO', 'M2', 'Médio cent.', 5, false, false),
    ('LISTA_DESTINO_ARREMESSO', 'M3', 'Médio dir.', 6, false, false),
    ('LISTA_DESTINO_ARREMESSO', 'B1', 'Baixo esq.', 7, false, false),
    ('LISTA_DESTINO_ARREMESSO', 'B2', 'Baixo cent.', 8, false, false),
    ('LISTA_DESTINO_ARREMESSO', 'B3', 'Baixo dir.', 9, false, false),
    ('LISTA_DESTINO_ARREMESSO', 'NAO_OBSERVADO', 'Não Observado', 10, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_REGIAO_ARREMESSO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_REGIAO_ARREMESSO', 'ALTO', 'Alto', 1, false, false),
    ('LISTA_REGIAO_ARREMESSO', 'MEDIO', 'Médio', 2, false, false),
    ('LISTA_REGIAO_ARREMESSO', 'BAIXO', 'Baixo', 3, false, false),
    ('LISTA_REGIAO_ARREMESSO', 'NAO_OBSERVADO', 'Não Observado', 4, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RESULTADO_ANALISE
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RESULTADO_ANALISE', 'SUCESSO', 'Sucesso', 1, false, false),
    ('LISTA_RESULTADO_ANALISE', 'FALHA', 'Falha', 2, false, false),
    ('LISTA_RESULTADO_ANALISE', 'MERITO_ADV', 'Mérito adv.', 3, false, false),
    ('LISTA_RESULTADO_ANALISE', 'NEUTRO', 'Neutro', 4, false, false),
    ('LISTA_RESULTADO_ANALISE', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RESULTADO_INDIVIDUAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RESULTADO_INDIVIDUAL', 'SUCESSO', 'Sucesso', 1, false, false),
    ('LISTA_RESULTADO_INDIVIDUAL', 'FALHA', 'Falha', 2, false, false),
    ('LISTA_RESULTADO_INDIVIDUAL', 'MERITO_ADV', 'Mérito adv.', 3, false, false),
    ('LISTA_RESULTADO_INDIVIDUAL', 'NEUTRO', 'Neutro', 4, false, false),
    ('LISTA_RESULTADO_INDIVIDUAL', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_PONTOS
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_PONTOS', '0', '0 ponto', 1, false, false),
    ('LISTA_PONTOS', '1', '1 ponto', 2, false, false),
    ('LISTA_PONTOS', '2', '2 pontos', 3, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_DECISAO_EXECUCAO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_DECISAO_EXECUCAO', 'BOA', 'Boa', 1, false, false),
    ('LISTA_DECISAO_EXECUCAO', 'RUIM', 'Ruim', 2, false, false),
    ('LISTA_DECISAO_EXECUCAO', 'NEUTRA', 'Neutra', 3, false, false),
    ('LISTA_DECISAO_EXECUCAO', 'NAO_APLICA', 'Não Aplica', 4, true, false),
    ('LISTA_DECISAO_EXECUCAO', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_TECNICA_DEFESA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_TECNICA_DEFESA', 'SALTO_X', 'Salto em X', 1, false, false),
    ('LISTA_TECNICA_DEFESA', 'MEMBRO_SUP', 'Membro sup.', 2, false, false),
    ('LISTA_TECNICA_DEFESA', 'MEMBRO_INF', 'Membro inf.', 3, false, false),
    ('LISTA_TECNICA_DEFESA', 'ESPACATO', 'Espacato', 4, false, false),
    ('LISTA_TECNICA_DEFESA', 'DEF_TRONCO', 'Tronco', 5, false, false),
    ('LISTA_TECNICA_DEFESA', 'PONTA_DEDO', 'Ponta do dedo', 6, false, false),
    ('LISTA_TECNICA_DEFESA', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_POSTURA_GOLEIRA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_POSTURA_GOLEIRA', 'BASE_ALTA', 'Base alta', 1, false, false),
    ('LISTA_POSTURA_GOLEIRA', 'BASE_MEDIA', 'Base média', 2, false, false),
    ('LISTA_POSTURA_GOLEIRA', 'BASE_BAIXA', 'Base baixa', 3, false, false),
    ('LISTA_POSTURA_GOLEIRA', 'DESLOCAMENTO', 'Deslocamento', 4, false, false),
    ('LISTA_POSTURA_GOLEIRA', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_REACAO_GOLEIRA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_REACAO_GOLEIRA', 'ANTECIPADA', 'Antecipada', 1, false, false),
    ('LISTA_REACAO_GOLEIRA', 'REACAO', 'Reação', 2, false, false),
    ('LISTA_REACAO_GOLEIRA', 'LEITURA_MAO', 'Leitura de mão', 3, false, false),
    ('LISTA_REACAO_GOLEIRA', 'NAO_OBSERVADO', 'Não Observado', 4, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_DECISAO_GOLEIRA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_DECISAO_GOLEIRA', 'CORRETA', 'Correta', 1, false, false),
    ('LISTA_DECISAO_GOLEIRA', 'EQUIVOCADA', 'Equivocada', 2, false, false),
    ('LISTA_DECISAO_GOLEIRA', 'INDECISA', 'Indecisa', 3, false, false),
    ('LISTA_DECISAO_GOLEIRA', 'NAO_OBSERVADO', 'Não Observado', 4, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RESPOSTA_GOLEIRA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RESPOSTA_GOLEIRA', 'BOA', 'Boa', 1, false, false),
    ('LISTA_RESPOSTA_GOLEIRA', 'FALHA', 'Falha', 2, false, false),
    ('LISTA_RESPOSTA_GOLEIRA', 'NEUTRA', 'Neutra', 3, false, false),
    ('LISTA_RESPOSTA_GOLEIRA', 'NAO_APLICA', 'Não Aplica', 4, true, false),
    ('LISTA_RESPOSTA_GOLEIRA', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_QUALIDADE_REPOSICAO_GOL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_QUALIDADE_REPOSICAO_GOL', 'EXCELENTE', 'Excelente', 1, false, false),
    ('LISTA_QUALIDADE_REPOSICAO_GOL', 'EFICAZ', 'Eficaz', 2, false, false),
    ('LISTA_QUALIDADE_REPOSICAO_GOL', 'LENTA', 'Lenta', 3, false, false),
    ('LISTA_QUALIDADE_REPOSICAO_GOL', 'ERRO', 'Erro', 4, false, false),
    ('LISTA_QUALIDADE_REPOSICAO_GOL', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_TIPO_PASSE_GOL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_TIPO_PASSE_GOL', 'LONGO_DIRETO', 'Longo direto', 1, false, false),
    ('LISTA_TIPO_PASSE_GOL', 'CURTO_SEGURANCA', 'Curto/segurança', 2, false, false),
    ('LISTA_TIPO_PASSE_GOL', 'AEREA_TRANS', 'Aérea trans.', 3, false, false),
    ('LISTA_TIPO_PASSE_GOL', 'NAO_OBSERVADO', 'Não Observado', 4, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_VISAO_JOGO_GOL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_VISAO_JOGO_GOL', 'LEITURA_CORRETA', 'Leitura correta', 1, false, false),
    ('LISTA_VISAO_JOGO_GOL', 'IGNOROU_VANTAGEM', 'Ignorou vantagem', 2, false, false),
    ('LISTA_VISAO_JOGO_GOL', 'PRECIPITADA', 'Precipitada', 3, false, false),
    ('LISTA_VISAO_JOGO_GOL', 'NAO_OBSERVADO', 'Não Observado', 4, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_FORM_TRANS_OF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_FORM_TRANS_OF', 'TRANS_OF_ESP_LE', 'Trans. of. esp. esq.', 1, false, false),
    ('LISTA_FORM_TRANS_OF', 'TRANS_OF_ESP_CE', 'Trans. of. esp. cent.', 2, false, false),
    ('LISTA_FORM_TRANS_OF', 'TRANS_OF_ESP_LD', 'Trans. of. esp. dir.', 3, false, false),
    ('LISTA_FORM_TRANS_OF', 'TRANS_OF_4_ABERTAS', 'Trans. of. 4 abertas', 4, false, false),
    ('LISTA_FORM_TRANS_OF', 'TRANS_OF_3_ABERTAS_1_INT', 'Trans. of. 3 abertas 1 int.', 5, false, false),
    ('LISTA_FORM_TRANS_OF', 'TRANS_OF_DIRETA_GOL', 'Trans. of. direta ao gol', 6, false, false),
    ('LISTA_FORM_TRANS_OF', 'TRANS_OF_SEGURANCA', 'Trans. of. segurança', 7, false, false),
    ('LISTA_FORM_TRANS_OF', 'NAO_OBSERVADO', 'Não Observado', 8, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_OBJETIVO_FORM_TRANS_OF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'ATACAR_DEF_DESARRUMADA', 'Atacar def. desarrumada', 1, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'GERAR_GOL_SEM_GOLEIRA', 'Gerar gol sem goleira', 2, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'ACIONAR_ESPECIALISTA_RAPIDO', 'Acionar esp. rápido', 3, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'GERAR_GIRO_TRANS', 'Gerar giro na trans.', 4, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'GERAR_AEREA_TRANS', 'Gerar aérea na trans.', 5, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'FIXAR_E_ENTRAR_AT_POS', 'Fixar e entrar at. pos.', 6, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'MANTER_POSSE', 'Manter posse', 7, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'SURPREENDER_ORDEM_DEF', 'Surpreender ordem def.', 8, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_OF', 'NAO_OBSERVADO', 'Não Observado', 9, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_POS_TRANS_OF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_POS_TRANS_OF', 'TR_LE', 'Trans. esquerda', 1, false, false),
    ('LISTA_POS_TRANS_OF', 'TR_CE_LE', 'Trans. centro-esq.', 2, false, false),
    ('LISTA_POS_TRANS_OF', 'TR_CE', 'Trans. central', 3, false, false),
    ('LISTA_POS_TRANS_OF', 'TR_CE_LD', 'Trans. centro-dir.', 4, false, false),
    ('LISTA_POS_TRANS_OF', 'TR_LD', 'Trans. direita', 5, false, false),
    ('LISTA_POS_TRANS_OF', 'TR_INT', 'Trans. interna', 6, false, false),
    ('LISTA_POS_TRANS_OF', 'TR_PROF', 'Trans. profundidade', 7, false, false),
    ('LISTA_POS_TRANS_OF', 'TR_SEG', 'Trans. segurança', 8, false, false),
    ('LISTA_POS_TRANS_OF', 'NAO_OBSERVADO', 'Não Observado', 9, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_FUNCAO_TRANS_OF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_FUNCAO_TRANS_OF', 'ESPECIALISTA_TRANS', 'Especialista trans.', 1, false, false),
    ('LISTA_FUNCAO_TRANS_OF', 'RECEBE_SAIDA', 'Recebe saída', 2, false, false),
    ('LISTA_FUNCAO_TRANS_OF', 'PROFUNDIDADE', 'Profundidade', 3, false, false),
    ('LISTA_FUNCAO_TRANS_OF', 'APOIO_SEGURANCA', 'Apoio/segurança', 4, false, false),
    ('LISTA_FUNCAO_TRANS_OF', 'FIXA_DEF_TRANS', 'Fixa def. trans.', 5, false, false),
    ('LISTA_FUNCAO_TRANS_OF', 'ATACA_GOL_VAZIO', 'Ataca gol vazio', 6, false, false),
    ('LISTA_FUNCAO_TRANS_OF', 'PREPARA_AT_POS', 'Prepara at. pos.', 7, false, false),
    ('LISTA_FUNCAO_TRANS_OF', 'ENTRA_ZONA_INTERNA', 'Entra zona interna', 8, false, false),
    ('LISTA_FUNCAO_TRANS_OF', 'NAO_OBSERVADO', 'Não Observado', 9, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_STATUS_ESTABILIZACAO_AT_POS
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_STATUS_ESTABILIZACAO_AT_POS', 'ESTABILIZOU_COMPLETO', 'Estabilizou completo', 1, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_AT_POS', 'ESTABILIZOU_PARCIAL', 'Estabilizou parcial', 2, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_AT_POS', 'NAO_ESTABILIZOU', 'Não estabilizou', 3, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_AT_POS', 'FINALIZOU_ANTES', 'Finalizou antes', 4, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_AT_POS', 'PERDEU_ANTES', 'Perdeu antes', 5, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_AT_POS', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_MOTIVO_FIM_TRANS_OF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_MOTIVO_FIM_TRANS_OF', 'DEF_ADV_ESTABILIZADA', 'Def. adv. estabilizada', 1, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_OF', 'ATAQUE_ESTABILIZOU', 'Ataque estabilizou', 2, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_OF', 'FINALIZACAO_TRANS', 'Finalização na trans.', 3, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_OF', 'PERDA_TRANS', 'Perda na trans.', 4, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_OF', 'INTERRUPCAO', 'Interrupção', 5, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_OF', 'SEM_VANTAGEM_TEMPORAL', 'Sem vantagem temporal', 6, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_OF', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_FORM_TRANS_DEF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_FORM_TRANS_DEF', 'TRANS_DEF_ENTRADA_RAPIDA', 'Entrada rápida', 1, false, false),
    ('LISTA_FORM_TRANS_DEF', 'TRANS_DEF_ZONA_PRIORITARIA', 'Zona prioritária', 2, false, false),
    ('LISTA_FORM_TRANS_DEF', 'TRANS_DEF_MARCA_AMEACA', 'Marca ameaça', 3, false, false),
    ('LISTA_FORM_TRANS_DEF', 'TRANS_DEF_3X0_TEMP', '3x0 temporário', 4, false, false),
    ('LISTA_FORM_TRANS_DEF', 'TRANS_DEF_2X1_TEMP', '2x1 temporário', 5, false, false),
    ('LISTA_FORM_TRANS_DEF', 'TRANS_DEF_1X2_TEMP', '1x2 temporário', 6, false, false),
    ('LISTA_FORM_TRANS_DEF', 'TRANS_DEF_EMERGENCIAL', 'Emergencial', 7, false, false),
    ('LISTA_FORM_TRANS_DEF', 'NAO_OBSERVADO', 'Não Observado', 8, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_OBJETIVO_FORM_TRANS_DEF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_OBJETIVO_FORM_TRANS_DEF', 'NEUTRALIZAR_TRANS_DIRETA', 'Neutralizar trans. direta', 1, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_DEF', 'ATRASAR_PRIMEIRA_ACAO', 'Atrasar 1ª ação', 2, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_DEF', 'NEGAR_GOL_SEM_GOLEIRA', 'Negar gol sem goleira', 3, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_DEF', 'PROTEGER_ZONA_CRITICA', 'Proteger zona crítica', 4, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_DEF', 'MARCAR_ESPECIALISTA_ADV', 'Marcar esp. adv.', 5, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_DEF', 'MARCAR_PIVO_ADV', 'Marcar pivô adv.', 6, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_DEF', 'GANHAR_TEMPO_ESTABILIZAR', 'Ganhar tempo p/ estab.', 7, false, false),
    ('LISTA_OBJETIVO_FORM_TRANS_DEF', 'NAO_OBSERVADO', 'Não Observado', 8, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_SISTEMA_DEF_TRANS_TEMP
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_SISTEMA_DEF_TRANS_TEMP', 'TRANS_DEF_3X0_TEMP', '3x0 temporário', 1, false, false),
    ('LISTA_SISTEMA_DEF_TRANS_TEMP', 'TRANS_DEF_2X1_TEMP', '2x1 temporário', 2, false, false),
    ('LISTA_SISTEMA_DEF_TRANS_TEMP', 'TRANS_DEF_1X2_TEMP', '1x2 temporário', 3, false, false),
    ('LISTA_SISTEMA_DEF_TRANS_TEMP', 'TRANS_DEF_INDIV_TEMP', 'Individual temp.', 4, false, false),
    ('LISTA_SISTEMA_DEF_TRANS_TEMP', 'TRANS_DEF_EMERGENCIAL', 'Emergencial', 5, false, false),
    ('LISTA_SISTEMA_DEF_TRANS_TEMP', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_ZONA_TRANS_DEF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_ZONA_TRANS_DEF', 'ZONA_SOLTA', 'Zona solta', 1, false, false),
    ('LISTA_ZONA_TRANS_DEF', 'ZONA_BASE', 'Zona base', 2, false, false),
    ('LISTA_ZONA_TRANS_DEF', 'ZONA_ATRAS_PIVO', 'Zona atrás pivô', 3, false, false),
    ('LISTA_ZONA_TRANS_DEF', 'ZONA_AVANCADA', 'Zona avançada', 4, false, false),
    ('LISTA_ZONA_TRANS_DEF', 'ZONA_LATERAL_ESQ', 'Zona lat. esq.', 5, false, false),
    ('LISTA_ZONA_TRANS_DEF', 'ZONA_LATERAL_DIR', 'Zona lat. dir.', 6, false, false),
    ('LISTA_ZONA_TRANS_DEF', 'ZONA_CENTRAL', 'Zona central', 7, false, false),
    ('LISTA_ZONA_TRANS_DEF', 'ZONA_EMERGENCIAL', 'Zona emergencial', 8, false, false),
    ('LISTA_ZONA_TRANS_DEF', 'NAO_OBSERVADO', 'Não Observado', 9, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_ACAO_TRANS_DEF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_ACAO_TRANS_DEF', 'NEUTRALIZA_DIRETA', 'Neutraliza direta', 1, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'MARCA_INDIRETA', 'Marca indireta', 2, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'SOBE_PRESSAO', 'Sobe pressão', 3, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'OBRIGA_PASSE_LATERAL', 'Obriga passe lateral', 4, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'PROTEGE_CENTRO_TRANS', 'Protege centro trans.', 5, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'CORTA_LINHA_PASSE', 'Corta linha de passe', 6, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'ATRASA_ATAQUE', 'Atrasa ataque', 7, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'DESLIZA_REORGANIZA', 'Desliza/reorganiza', 8, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'TROCA_REFERENCIA', 'Troca referência', 9, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'COMUNICA_AJUSTE', 'Comunica ajuste', 10, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'BLOQUEIA_TRANS', 'Bloqueia trans.', 11, false, false),
    ('LISTA_ACAO_TRANS_DEF', 'NAO_OBSERVADO', 'Não Observado', 12, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_REORGANIZACAO_DEF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_REORGANIZACAO_DEF', 'DESLIZA_PARA_SOLTA', 'Desliza para solta', 1, false, false),
    ('LISTA_REORGANIZACAO_DEF', 'DESLIZA_PARA_BASE', 'Desliza para base', 2, false, false),
    ('LISTA_REORGANIZACAO_DEF', 'DESLIZA_PARA_ATRAS_PIVO', 'Desliza para atrás pivô', 3, false, false),
    ('LISTA_REORGANIZACAO_DEF', 'SAI_AVANCADA_RECOMP_SOLTA', 'Sai avançada/recomp.', 4, false, false),
    ('LISTA_REORGANIZACAO_DEF', 'TROCA_COM_COMPANHEIRA', 'Troca c/ companheira', 5, false, false),
    ('LISTA_REORGANIZACAO_DEF', 'MANTEM_POSICAO', 'Mantém posição', 6, false, false),
    ('LISTA_REORGANIZACAO_DEF', 'NAO_ESTABILIZOU', 'Não estabilizou', 7, false, false),
    ('LISTA_REORGANIZACAO_DEF', 'NAO_OBSERVADO', 'Não Observado', 8, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_STATUS_ESTABILIZACAO_DEF_POS
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_STATUS_ESTABILIZACAO_DEF_POS', 'ESTABILIZOU_COMPLETO', 'Estabilizou completo', 1, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_DEF_POS', 'ESTABILIZOU_PARCIAL', 'Estabilizou parcial', 2, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_DEF_POS', 'NAO_ESTABILIZOU', 'Não estabilizou', 3, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_DEF_POS', 'FINALIZACAO_ANTES', 'Finalização antes', 4, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_DEF_POS', 'RECUPEROU_ANTES', 'Recuperou antes', 5, false, false),
    ('LISTA_STATUS_ESTABILIZACAO_DEF_POS', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_MOTIVO_FIM_TRANS_DEF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_MOTIVO_FIM_TRANS_DEF', 'DEFESA_ESTABILIZADA', 'Defesa estabilizada', 1, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_DEF', 'AMEACA_TRANS_NEUTRALIZADA', 'Ameaça trans. neutralizada', 2, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_DEF', 'ADV_ENTROU_AT_POS', 'Adv. entrou at. pos.', 3, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_DEF', 'FINALIZACAO_ADV_TRANS', 'Finalização adv. trans.', 4, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_DEF', 'PERDA_ADV_TRANS', 'Perda adv. trans.', 5, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_DEF', 'INTERRUPCAO', 'Interrupção', 6, false, false),
    ('LISTA_MOTIVO_FIM_TRANS_DEF', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_VELOCIDADE_TRANS_OF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_VELOCIDADE_TRANS_OF', 'IMEDIATA', 'Imediata', 1, false, false),
    ('LISTA_VELOCIDADE_TRANS_OF', 'RAPIDA', 'Rápida', 2, false, false),
    ('LISTA_VELOCIDADE_TRANS_OF', 'CONTROLADA', 'Controlada', 3, false, false),
    ('LISTA_VELOCIDADE_TRANS_OF', 'LENTA', 'Lenta', 4, false, false),
    ('LISTA_VELOCIDADE_TRANS_OF', 'PARADA', 'Parada', 5, false, false),
    ('LISTA_VELOCIDADE_TRANS_OF', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_VANTAGEM_TRANS_OF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_VANTAGEM_TRANS_OF', 'GOL_SEM_GOLEIRA', 'Gol sem goleira', 1, false, false),
    ('LISTA_VANTAGEM_TRANS_OF', 'SUPERIORIDADE', 'Superioridade num.', 2, false, false),
    ('LISTA_VANTAGEM_TRANS_OF', 'ESPECIALISTA_LIVRE', 'Especialista livre', 3, false, false),
    ('LISTA_VANTAGEM_TRANS_OF', 'FINALIZACAO_2PTS', 'Finalização 2 pts', 4, false, false),
    ('LISTA_VANTAGEM_TRANS_OF', 'POSSE_COM_VANTAGEM', 'Posse c/ vantagem', 5, false, false),
    ('LISTA_VANTAGEM_TRANS_OF', 'SEM_VANTAGEM', 'Sem vantagem', 6, false, false),
    ('LISTA_VANTAGEM_TRANS_OF', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RESULTADO_TRANS_OF
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RESULTADO_TRANS_OF', 'GOL_1', 'Gol 1 pt', 1, false, false),
    ('LISTA_RESULTADO_TRANS_OF', 'GOL_2', 'Gol 2 pts', 2, false, false),
    ('LISTA_RESULTADO_TRANS_OF', 'FINALIZACAO_SEM_GOL', 'Finalização s/ gol', 3, false, false),
    ('LISTA_RESULTADO_TRANS_OF', 'PERDA', 'Perda', 4, false, false),
    ('LISTA_RESULTADO_TRANS_OF', 'POSSE_MANTIDA', 'Posse mantida', 5, false, false),
    ('LISTA_RESULTADO_TRANS_OF', 'ENTROU_AT_POS', 'Entrou at. pos.', 6, false, false),
    ('LISTA_RESULTADO_TRANS_OF', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_OUT_SITUACAO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_OUT_SITUACAO', 'SEM_OUT', 'Sem OUT', 1, false, false),
    ('LISTA_OUT_SITUACAO', 'OUT_ATAQUE', 'OUT ataque', 2, false, false),
    ('LISTA_OUT_SITUACAO', 'OUT_DEFESA', 'OUT defesa', 3, false, false),
    ('LISTA_OUT_SITUACAO', 'OUT_ADV_ATAQUE', 'OUT adv. ataque', 4, false, false),
    ('LISTA_OUT_SITUACAO', 'OUT_ADV_DEFESA', 'OUT adv. defesa', 5, false, false),
    ('LISTA_OUT_SITUACAO', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_ESTRUTURA_NUMERICA_REAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_ESTRUTURA_NUMERICA_REAL', 'OF_4_DEF_3', '4 of. vs 3 def.', 1, false, false),
    ('LISTA_ESTRUTURA_NUMERICA_REAL', 'OF_3_DEF_3', '3 of. vs 3 def.', 2, false, false),
    ('LISTA_ESTRUTURA_NUMERICA_REAL', 'OF_4_DEF_2', '4 of. vs 2 def.', 3, false, false),
    ('LISTA_ESTRUTURA_NUMERICA_REAL', 'OF_3_DEF_2', '3 of. vs 2 def.', 4, false, false),
    ('LISTA_ESTRUTURA_NUMERICA_REAL', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT', 'OF_OUT_3_ABERTO', 'OUT 3 aberto', 1, false, false),
    ('LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT', 'OF_OUT_2X1', 'OUT 2x1', 2, false, false),
    ('LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT', 'OF_OUT_ISO', 'OUT isolamento', 3, false, false),
    ('LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT', 'OF_OUT_SEGURANCA', 'OUT segurança', 4, false, false),
    ('LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT', 'OF_OUT_ESPECIALISTA', 'OUT especialista', 5, false, false),
    ('LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_AJUSTE_DEFENSIVO_OUT
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_AJUSTE_DEFENSIVO_OUT', 'PROTEGER_CENTRO', 'Proteger centro', 1, false, false),
    ('LISTA_AJUSTE_DEFENSIVO_OUT', 'NEGAR_2PTS', 'Negar 2 pontos', 2, false, false),
    ('LISTA_AJUSTE_DEFENSIVO_OUT', 'FORCAR_SIMPLES', 'Forçar simples', 3, false, false),
    ('LISTA_AJUSTE_DEFENSIVO_OUT', 'MARCAR_ESPECIALISTA', 'Marcar especialista', 4, false, false),
    ('LISTA_AJUSTE_DEFENSIVO_OUT', 'MARCAR_PIVO', 'Marcar pivô', 5, false, false),
    ('LISTA_AJUSTE_DEFENSIVO_OUT', 'PRESSAO_BOLA', 'Pressão na bola', 6, false, false),
    ('LISTA_AJUSTE_DEFENSIVO_OUT', 'ZONA_COMPACTA', 'Zona compacta', 7, false, false),
    ('LISTA_AJUSTE_DEFENSIVO_OUT', 'NAO_OBSERVADO', 'Não Observado', 8, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_AMEACA_PRIORITARIA_OUT
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_AMEACA_PRIORITARIA_OUT', 'ESPECIALISTA', 'Especialista', 1, false, false),
    ('LISTA_AMEACA_PRIORITARIA_OUT', 'GIRO', 'Giro', 2, false, false),
    ('LISTA_AMEACA_PRIORITARIA_OUT', 'AEREA', 'Aérea', 3, false, false),
    ('LISTA_AMEACA_PRIORITARIA_OUT', 'PIVO_FIXA', 'Pivô fixa', 4, false, false),
    ('LISTA_AMEACA_PRIORITARIA_OUT', 'PIVO_TEMP', 'Pivô temporária', 5, false, false),
    ('LISTA_AMEACA_PRIORITARIA_OUT', 'ARREM_SIMP', 'Arremesso simples', 6, false, false),
    ('LISTA_AMEACA_PRIORITARIA_OUT', 'PASSE_FINAL', 'Passe final', 7, false, false),
    ('LISTA_AMEACA_PRIORITARIA_OUT', 'NAO_OBSERVADO', 'Não Observado', 8, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RESULTADO_OUT
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RESULTADO_OUT', 'GOL_1', 'Gol 1 pt', 1, false, false),
    ('LISTA_RESULTADO_OUT', 'GOL_2', 'Gol 2 pts', 2, false, false),
    ('LISTA_RESULTADO_OUT', 'DEFESA_GOLEIRA', 'Defesa goleira', 3, false, false),
    ('LISTA_RESULTADO_OUT', 'BLOQUEIO', 'Bloqueio', 4, false, false),
    ('LISTA_RESULTADO_OUT', 'FORA', 'Fora', 5, false, false),
    ('LISTA_RESULTADO_OUT', 'TRAVE', 'Trave', 6, false, false),
    ('LISTA_RESULTADO_OUT', 'POSSE_MANTIDA', 'Posse mantida', 7, false, false),
    ('LISTA_RESULTADO_OUT', 'PERDA', 'Perda', 8, false, false),
    ('LISTA_RESULTADO_OUT', 'ERRO_ADV', 'Erro adversária', 9, false, false),
    ('LISTA_RESULTADO_OUT', 'REDUZIU_DANO', 'Reduziu dano', 10, false, false),
    ('LISTA_RESULTADO_OUT', 'NAO_OBSERVADO', 'Não Observado', 11, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_CAUSA_OUT
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_CAUSA_OUT', 'OUT_ESTRUTURAL', 'OUT estrutural', 1, false, false),
    ('LISTA_CAUSA_OUT', 'DEC_OF_OUT', 'Dec. of. OUT', 2, false, false),
    ('LISTA_CAUSA_OUT', 'EXEC_OF_OUT', 'Exec. of. OUT', 3, false, false),
    ('LISTA_CAUSA_OUT', 'DEC_DEF_OUT', 'Dec. def. OUT', 4, false, false),
    ('LISTA_CAUSA_OUT', 'EXEC_DEF_OUT', 'Exec. def. OUT', 5, false, false),
    ('LISTA_CAUSA_OUT', 'AJUSTE_OUT', 'Ajuste OUT', 6, false, false),
    ('LISTA_CAUSA_OUT', 'GOLEIRA_OUT', 'Goleira OUT', 7, false, false),
    ('LISTA_CAUSA_OUT', 'MERITO_ADV_OUT', 'Mérito adv. OUT', 8, false, false),
    ('LISTA_CAUSA_OUT', 'OK_OUT', 'OK (sem causa)', 9, false, false),
    ('LISTA_CAUSA_OUT', 'NAO_OBSERVADO', 'Não Observado', 10, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_OUT_GATILHO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_OUT_GATILHO', 'ERRO_TROCA', 'Erro de troca', 1, false, false),
    ('LISTA_OUT_GATILHO', 'CONTATO_EXCESSIVO', 'Contato excessivo', 2, false, false),
    ('LISTA_OUT_GATILHO', 'RECLAMACAO_ARBITRAGEM', 'Reclamação arbitragem', 3, false, false),
    ('LISTA_OUT_GATILHO', 'BLOQUEIO_CORPO', 'Bloqueio de corpo', 4, false, false),
    ('LISTA_OUT_GATILHO', 'ARREM_ROSTO_GOL', 'Arrem. no rosto goleira', 5, false, false),
    ('LISTA_OUT_GATILHO', 'FALTA_PROGRESSIVA', 'Falta progressiva', 6, false, false),
    ('LISTA_OUT_GATILHO', 'CONDUTA_ANTIDESPORTIVA', 'Conduta antidesportiva', 7, false, false),
    ('LISTA_OUT_GATILHO', 'ATRASO_REINICIO', 'Atraso no reinício', 8, false, false),
    ('LISTA_OUT_GATILHO', 'OUTRO', 'Outro', 9, false, false),
    ('LISTA_OUT_GATILHO', 'NAO_OBSERVADO', 'Não Observado', 10, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_PUNICAO_RESULTADO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_PUNICAO_RESULTADO', 'OUT_1', 'OUT 1 min.', 1, false, false),
    ('LISTA_PUNICAO_RESULTADO', 'OUT_2_RED', 'OUT 2 min. + redução', 2, false, false),
    ('LISTA_PUNICAO_RESULTADO', 'RED_CARD_DIRETO', 'Cartão vermelho direto', 3, false, false),
    ('LISTA_PUNICAO_RESULTADO', 'SEM_PUNICAO', 'Sem punição', 4, false, false),
    ('LISTA_PUNICAO_RESULTADO', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_MOMENTO_PUNICAO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_MOMENTO_PUNICAO', 'ATAQUE', 'Ataque', 1, false, false),
    ('LISTA_MOMENTO_PUNICAO', 'DEFESA', 'Defesa', 2, false, false),
    ('LISTA_MOMENTO_PUNICAO', 'TRANS_OF', 'Trans. of.', 3, false, false),
    ('LISTA_MOMENTO_PUNICAO', 'TRANS_DEF', 'Trans. def.', 4, false, false),
    ('LISTA_MOMENTO_PUNICAO', 'BOLA_PARADA', 'Bola parada', 5, false, false),
    ('LISTA_MOMENTO_PUNICAO', 'SHOOTOUT', 'Shootout', 6, false, false),
    ('LISTA_MOMENTO_PUNICAO', 'INTERVALO', 'Intervalo', 7, false, false),
    ('LISTA_MOMENTO_PUNICAO', 'NAO_OBSERVADO', 'Não Observado', 8, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_DEFESA_MISTA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_DEFESA_MISTA', 'INDIV_ESP', 'Individual esp.', 1, false, false),
    ('LISTA_DEFESA_MISTA', 'INDIV_PLAYMAKER', 'Individual playmaker', 2, false, false),
    ('LISTA_DEFESA_MISTA', 'INDIV_LATERAL', 'Individual lateral', 3, false, false),
    ('LISTA_DEFESA_MISTA', 'INDIV_PIVO', 'Individual pivô', 4, false, false),
    ('LISTA_DEFESA_MISTA', 'INDIV_PIVO_TEMP', 'Individual pivô temp.', 5, false, false),
    ('LISTA_DEFESA_MISTA', 'PRESSAO_BOLA_ZONA', 'Pressão bola + zona', 6, false, false),
    ('LISTA_DEFESA_MISTA', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_DEF_MISTO_RESULTADO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_DEF_MISTO_RESULTADO', 'SUCESSO', 'Sucesso', 1, false, false),
    ('LISTA_DEF_MISTO_RESULTADO', 'FALHA', 'Falha', 2, false, false),
    ('LISTA_DEF_MISTO_RESULTADO', 'PARCIAL', 'Parcial', 3, false, false),
    ('LISTA_DEF_MISTO_RESULTADO', 'MERITO_ADV', 'Mérito adv.', 4, false, false),
    ('LISTA_DEF_MISTO_RESULTADO', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_DEFESA_INDIVIDUAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_DEFESA_INDIVIDUAL', 'SEM_TROCA', 'Sem troca', 1, false, false),
    ('LISTA_DEFESA_INDIVIDUAL', 'TROCA_BLOQUEIO', 'Troca no bloqueio', 2, false, false),
    ('LISTA_DEFESA_INDIVIDUAL', 'TROCA_CRUZAMENTO', 'Troca no cruzamento', 3, false, false),
    ('LISTA_DEFESA_INDIVIDUAL', 'TROCA_PIVO_TEMP', 'Troca pivô temp.', 4, false, false),
    ('LISTA_DEFESA_INDIVIDUAL', 'TROCA_EMERGENCIAL', 'Troca emergencial', 5, false, false),
    ('LISTA_DEFESA_INDIVIDUAL', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_DEF_INDIV_RESULTADO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_DEF_INDIV_RESULTADO', 'SUCESSO', 'Sucesso', 1, false, false),
    ('LISTA_DEF_INDIV_RESULTADO', 'FALHA', 'Falha', 2, false, false),
    ('LISTA_DEF_INDIV_RESULTADO', 'PARCIAL', 'Parcial', 3, false, false),
    ('LISTA_DEF_INDIV_RESULTADO', 'MERITO_ADV', 'Mérito adv.', 4, false, false),
    ('LISTA_DEF_INDIV_RESULTADO', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_TIPO_BOLA_RETORNO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_TIPO_BOLA_RETORNO', 'RET_GIRO_AEREA', 'Ret. giro/aérea', 1, false, false),
    ('LISTA_TIPO_BOLA_RETORNO', 'RET_GIRO_ARREM_SIMP', 'Ret. giro/simples', 2, false, false),
    ('LISTA_TIPO_BOLA_RETORNO', 'RET_GIRO_GIRO', 'Ret. giro/giro', 3, false, false),
    ('LISTA_TIPO_BOLA_RETORNO', 'RET_ARREM_AEREA', 'Ret. arrem./aérea', 4, false, false),
    ('LISTA_TIPO_BOLA_RETORNO', 'RET_ARREM_SIMP', 'Ret. arrem. simples', 5, false, false),
    ('LISTA_TIPO_BOLA_RETORNO', 'RET_ESPECIALISTA', 'Ret. especialista', 6, false, false),
    ('LISTA_TIPO_BOLA_RETORNO', 'RET_PIVO', 'Ret. pivô', 7, false, false),
    ('LISTA_TIPO_BOLA_RETORNO', 'RET_PIVO_TEMP', 'Ret. pivô temp.', 8, false, false),
    ('LISTA_TIPO_BOLA_RETORNO', 'NAO_OBSERVADO', 'Não Observado', 9, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_FINALIZACAO_FINTADA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_FINALIZACAO_FINTADA', 'FINTA_GIRO', 'Finta de giro', 1, false, false),
    ('LISTA_FINALIZACAO_FINTADA', 'FINTA_ARREM_SIMP', 'Finta arrem. simples', 2, false, false),
    ('LISTA_FINALIZACAO_FINTADA', 'FINTA_AEREA', 'Finta aérea', 3, false, false),
    ('LISTA_FINALIZACAO_FINTADA', 'FINTA_ESPECIALISTA', 'Finta especialista', 4, false, false),
    ('LISTA_FINALIZACAO_FINTADA', 'NAO_APLICA', 'Não Aplica', 5, true, false),
    ('LISTA_FINALIZACAO_FINTADA', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_BLOQUEIO_ATRAIDO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_BLOQUEIO_ATRAIDO', 'SEM_BLOQUEIO', 'Sem bloqueio', 1, false, false),
    ('LISTA_BLOQUEIO_ATRAIDO', 'BLOQ_1_DEF', '1 defensora', 2, false, false),
    ('LISTA_BLOQUEIO_ATRAIDO', 'BLOQ_2_DEF', '2 defensoras', 3, false, false),
    ('LISTA_BLOQUEIO_ATRAIDO', 'BLOQ_3_DEF', '3 defensoras', 4, false, false),
    ('LISTA_BLOQUEIO_ATRAIDO', 'BLOQ_GOLEIRA', 'Goleira', 5, false, false),
    ('LISTA_BLOQUEIO_ATRAIDO', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RELACAO_NUMERICA_APOS_RETORNO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RELACAO_NUMERICA_APOS_RETORNO', 'RET_3X2', '3x2', 1, false, false),
    ('LISTA_RELACAO_NUMERICA_APOS_RETORNO', 'RET_3X1', '3x1', 2, false, false),
    ('LISTA_RELACAO_NUMERICA_APOS_RETORNO', 'RET_2X1', '2x1', 3, false, false),
    ('LISTA_RELACAO_NUMERICA_APOS_RETORNO', 'RET_LIVRE', 'Livre', 4, false, false),
    ('LISTA_RELACAO_NUMERICA_APOS_RETORNO', 'RET_SEM_VANTAGEM', 'Sem vantagem', 5, false, false),
    ('LISTA_RELACAO_NUMERICA_APOS_RETORNO', 'RET_RISCO', 'Risco', 6, false, false),
    ('LISTA_RELACAO_NUMERICA_APOS_RETORNO', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RESULTADO_ARREM_OBRIGATORIO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'ARREMESSOU_GOL_1', 'Gol 1 pt', 1, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'ARREMESSOU_GOL_2', 'Gol 2 pts', 2, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'ARREMESSOU_SEM_GOL', 'Arremessou s/gol', 3, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'ARREMESSOU_DEFENDIDO', 'Defendido', 4, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'ARREMESSOU_BLOQUEADO', 'Bloqueado', 5, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'ARREMESSOU_FORA', 'Fora', 6, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'ARREMESSOU_TRAVE', 'Trave', 7, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'PASSOU_INDEVIDO', 'Passou indevido', 8, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'PERDEU_BOLA', 'Perdeu bola', 9, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'VIOLACAO', 'Violação', 10, false, false),
    ('LISTA_RESULTADO_ARREM_OBRIGATORIO', 'NAO_OBSERVADO', 'Não Observado', 11, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_CONTADOR_PASSIVO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_CONTADOR_PASSIVO', '0', '0', 1, false, false),
    ('LISTA_CONTADOR_PASSIVO', '1', '1', 2, false, false),
    ('LISTA_CONTADOR_PASSIVO', '2', '2', 3, false, false),
    ('LISTA_CONTADOR_PASSIVO', '3', '3', 4, false, false),
    ('LISTA_CONTADOR_PASSIVO', '4', '4', 5, false, false),
    ('LISTA_CONTADOR_PASSIVO', 'MAIS_4', 'Mais de 4', 6, false, false),
    ('LISTA_CONTADOR_PASSIVO', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RESULTADO_REGRA_PASSIVO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RESULTADO_REGRA_PASSIVO', 'ARREMESSOU_DENTRO_LIMITE', 'Arremessou no limite', 1, false, false),
    ('LISTA_RESULTADO_REGRA_PASSIVO', 'PASSOU_MAIS_4', 'Passou mais de 4', 2, false, false),
    ('LISTA_RESULTADO_REGRA_PASSIVO', 'PERDEU_POSSE_PASSIVO', 'Perdeu posse (passivo)', 3, false, false),
    ('LISTA_RESULTADO_REGRA_PASSIVO', 'RECEPTORA_ARREMESSOU', 'Receptora arremessou', 4, false, false),
    ('LISTA_RESULTADO_REGRA_PASSIVO', 'RECEPTORA_NAO_ARREMESSOU', 'Receptora não arremessou', 5, false, false),
    ('LISTA_RESULTADO_REGRA_PASSIVO', 'SINAL_NULIFICADO_REBOTE_GOL_GK', 'Sinal nulificado (rebote/gol)', 6, false, false),
    ('LISTA_RESULTADO_REGRA_PASSIVO', 'SINAL_NULIFICADO_PUNICAO_DEF', 'Sinal nulificado (punição)', 7, false, false),
    ('LISTA_RESULTADO_REGRA_PASSIVO', 'NAO_OBSERVADO', 'Não Observado', 8, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_SHOOTOUT
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_SHOOTOUT', 'SHOOTOUT_DIRETO', 'Direto', 1, false, false),
    ('LISTA_SHOOTOUT', 'SHOOTOUT_GIRO', 'Giro', 2, false, false),
    ('LISTA_SHOOTOUT', 'SHOOTOUT_AEREA', 'Aérea', 3, false, false),
    ('LISTA_SHOOTOUT', 'SHOOTOUT_DRIBLE_GOLEIRA', 'Drible goleira', 4, false, false),
    ('LISTA_SHOOTOUT', 'SHOOTOUT_PASSA_GOLEIRA', 'Passa goleira', 5, false, false),
    ('LISTA_SHOOTOUT', 'SHOOTOUT_ERRO_PASSE', 'Erro passe', 6, false, false),
    ('LISTA_SHOOTOUT', 'SHOOTOUT_ERRO_RECEPCAO', 'Erro recepção', 7, false, false),
    ('LISTA_SHOOTOUT', 'SHOOTOUT_DEFESA_GOLEIRA', 'Defesa goleira', 8, false, false),
    ('LISTA_SHOOTOUT', 'SHOOTOUT_FORA', 'Fora', 9, false, false),
    ('LISTA_SHOOTOUT', 'SHOOTOUT_TRAVE', 'Trave', 10, false, false),
    ('LISTA_SHOOTOUT', 'NAO_OBSERVADO', 'Não Observado', 11, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_SHOOTOUT_RESULTADO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_SHOOTOUT_RESULTADO', 'GOL_1', 'Gol 1 pt', 1, false, false),
    ('LISTA_SHOOTOUT_RESULTADO', 'GOL_2', 'Gol 2 pts', 2, false, false),
    ('LISTA_SHOOTOUT_RESULTADO', 'DEFENDIDO', 'Defendido', 3, false, false),
    ('LISTA_SHOOTOUT_RESULTADO', 'FORA', 'Fora', 4, false, false),
    ('LISTA_SHOOTOUT_RESULTADO', 'TRAVE', 'Trave', 5, false, false),
    ('LISTA_SHOOTOUT_RESULTADO', 'BLOQUEADO', 'Bloqueado', 6, false, false),
    ('LISTA_SHOOTOUT_RESULTADO', 'VIOLACAO', 'Violação', 7, false, false),
    ('LISTA_SHOOTOUT_RESULTADO', 'PERDA', 'Perda', 8, false, false),
    ('LISTA_SHOOTOUT_RESULTADO', 'NAO_OBSERVADO', 'Não Observado', 9, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_SHOOTOUT_DECISAO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_SHOOTOUT_DECISAO', 'BOA', 'Boa', 1, false, false),
    ('LISTA_SHOOTOUT_DECISAO', 'RUIM', 'Ruim', 2, false, false),
    ('LISTA_SHOOTOUT_DECISAO', 'NEUTRA', 'Neutra', 3, false, false),
    ('LISTA_SHOOTOUT_DECISAO', 'NAO_OBSERVADO', 'Não Observado', 4, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_SHOOTOUT_EXECUCAO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_SHOOTOUT_EXECUCAO', 'BOA', 'Boa', 1, false, false),
    ('LISTA_SHOOTOUT_EXECUCAO', 'RUIM', 'Ruim', 2, false, false),
    ('LISTA_SHOOTOUT_EXECUCAO', 'NEUTRA', 'Neutra', 3, false, false),
    ('LISTA_SHOOTOUT_EXECUCAO', 'NAO_OBSERVADO', 'Não Observado', 4, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_CONTEXTO_ESPECIAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_CONTEXTO_ESPECIAL', 'NAO_APLICA', 'Não aplica', 1, true, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'SHOOTOUT', 'Shootout', 2, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'TIRO_6M', 'Tiro de 6m', 3, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'TIRO_LIVRE', 'Tiro livre', 4, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'REPOSICAO_LATERAL', 'Reposição lateral', 5, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'REPOSICAO_GOLEIRA', 'Reposição goleira', 6, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'REPOSICAO_APOS_GOL', 'Reposição após gol', 7, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'BOLA_FORA', 'Bola fora', 8, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'EXCLUSAO', 'Exclusão', 9, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'INFERIORIDADE_NUM', 'Inferioridade num.', 10, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'SUPERIORIDADE_NUM', 'Superioridade num.', 11, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'GOLDEN_GOAL', 'Golden goal', 12, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'FIM_SET', 'Fim de set', 13, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'ULTIMA_POSSE', 'Última posse', 14, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'ARBITRAGEM', 'Arbitragem', 15, false, false),
    ('LISTA_CONTEXTO_ESPECIAL', 'NAO_OBSERVADO', 'Não Observado', 16, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_TIPO_BOLA_PARADA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_TIPO_BOLA_PARADA', 'TIRO_6M', 'Tiro de 6m', 1, false, false),
    ('LISTA_TIPO_BOLA_PARADA', 'TIRO_LIVRE', 'Tiro livre', 2, false, false),
    ('LISTA_TIPO_BOLA_PARADA', 'REPOSICAO_LATERAL', 'Reposição lateral', 3, false, false),
    ('LISTA_TIPO_BOLA_PARADA', 'REPOSICAO_GOLEIRA', 'Reposição goleira', 4, false, false),
    ('LISTA_TIPO_BOLA_PARADA', 'REPOSICAO_APOS_GOL', 'Reposição após gol', 5, false, false),
    ('LISTA_TIPO_BOLA_PARADA', 'BOLA_FORA', 'Bola fora', 6, false, false),
    ('LISTA_TIPO_BOLA_PARADA', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_6M
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_6M', '6M_GOL_2', 'Gol 2 pts', 1, false, false),
    ('LISTA_6M', '6M_DEFENDIDO', 'Defendido', 2, false, false),
    ('LISTA_6M', '6M_FORA', 'Fora', 3, false, false),
    ('LISTA_6M', '6M_TRAVE', 'Trave', 4, false, false),
    ('LISTA_6M', '6M_VIOLACAO', 'Violação', 5, false, false),
    ('LISTA_6M', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_TIRO_LIVRE
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_TIRO_LIVRE', 'TL_DIRETO', 'Direto', 1, false, false),
    ('LISTA_TIRO_LIVRE', 'TL_JOGADA_COMBINADA', 'Jogada combinada', 2, false, false),
    ('LISTA_TIRO_LIVRE', 'TL_PASSE_CURTO', 'Passe curto', 3, false, false),
    ('LISTA_TIRO_LIVRE', 'TL_PERDA', 'Perda', 4, false, false),
    ('LISTA_TIRO_LIVRE', 'TL_GOL_1', 'Gol 1 pt', 5, false, false),
    ('LISTA_TIRO_LIVRE', 'TL_GOL_2', 'Gol 2 pts', 6, false, false),
    ('LISTA_TIRO_LIVRE', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_REPOSICAO_LATERAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_REPOSICAO_LATERAL', 'RL_RAPIDA', 'Rápida', 1, false, false),
    ('LISTA_REPOSICAO_LATERAL', 'RL_SEGURA', 'Segura', 2, false, false),
    ('LISTA_REPOSICAO_LATERAL', 'RL_JOGADA_COMBINADA', 'Jogada combinada', 3, false, false),
    ('LISTA_REPOSICAO_LATERAL', 'RL_ERRO', 'Erro', 4, false, false),
    ('LISTA_REPOSICAO_LATERAL', 'RL_PERDA', 'Perda', 5, false, false),
    ('LISTA_REPOSICAO_LATERAL', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_REPOSICAO_GOLEIRA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_REPOSICAO_GOLEIRA', 'RG_LONGA', 'Longa', 1, false, false),
    ('LISTA_REPOSICAO_GOLEIRA', 'RG_CURTA', 'Curta', 2, false, false),
    ('LISTA_REPOSICAO_GOLEIRA', 'RG_AEREA_TRANS', 'Aérea trans.', 3, false, false),
    ('LISTA_REPOSICAO_GOLEIRA', 'RG_ERRO', 'Erro', 4, false, false),
    ('LISTA_REPOSICAO_GOLEIRA', 'RG_LENTA', 'Lenta', 5, false, false),
    ('LISTA_REPOSICAO_GOLEIRA', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_REPOSICAO_APOS_GOL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_REPOSICAO_APOS_GOL', 'RAG_RAPIDA', 'Rápida', 1, false, false),
    ('LISTA_REPOSICAO_APOS_GOL', 'RAG_CONTROLADA', 'Controlada', 2, false, false),
    ('LISTA_REPOSICAO_APOS_GOL', 'RAG_LENTA', 'Lenta', 3, false, false),
    ('LISTA_REPOSICAO_APOS_GOL', 'RAG_ERRO', 'Erro', 4, false, false),
    ('LISTA_REPOSICAO_APOS_GOL', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_GOLDEN_GOAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_GOLDEN_GOAL', 'GG_POSSE_PROPRIA', 'Posse própria', 1, false, false),
    ('LISTA_GOLDEN_GOAL', 'GG_POSSE_ADV', 'Posse adv.', 2, false, false),
    ('LISTA_GOLDEN_GOAL', 'GG_GOL', 'Gol', 3, false, false),
    ('LISTA_GOLDEN_GOAL', 'GG_PERDA', 'Perda', 4, false, false),
    ('LISTA_GOLDEN_GOAL', 'GG_DEFESA', 'Defesa', 5, false, false),
    ('LISTA_GOLDEN_GOAL', 'GG_ERRO', 'Erro', 6, false, false),
    ('LISTA_GOLDEN_GOAL', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_CODIGO_MENTAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_CODIGO_MENTAL', 'AET', 'Autoeficácia técnica', 1, false, false),
    ('LISTA_CODIGO_MENTAL', 'PA', 'Persistência após adversidade', 2, false, false),
    ('LISTA_CODIGO_MENTAL', 'MD', 'Mentalidade de desempenho', 3, false, false),
    ('LISTA_CODIGO_MENTAL', 'EAP', 'Estado de ativação/pressão', 4, false, false),
    ('LISTA_CODIGO_MENTAL', 'CF', 'Comunicação funcional', 5, false, false),
    ('LISTA_CODIGO_MENTAL', 'CC', 'Comunicação contextual', 6, false, false),
    ('LISTA_CODIGO_MENTAL', 'PAF', 'Postura após falha', 7, false, false),
    ('LISTA_CODIGO_MENTAL', 'PJ', 'Presença no jogo', 8, false, false),
    ('LISTA_CODIGO_MENTAL', 'DT', 'Desempenho em tensão', 9, false, false),
    ('LISTA_CODIGO_MENTAL', 'LC', 'Liderança contextual', 10, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_MARCA_MENTAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_MARCA_MENTAL', '+', 'Positivo', 1, false, false),
    ('LISTA_MARCA_MENTAL', '0', 'Neutro', 2, false, false),
    ('LISTA_MARCA_MENTAL', '-', 'Negativo', 3, false, false),
    ('LISTA_MARCA_MENTAL', '?', 'A observar', 4, false, false),
    ('LISTA_MARCA_MENTAL', 'R', 'Recuperação', 5, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_CONTEXTO_PRESSAO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_CONTEXTO_PRESSAO', 'SEM_PRESSAO_ESPECIAL', 'Sem pressão especial', 1, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'APOS_ERRO_PROPRIO', 'Após erro próprio', 2, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'APOS_ERRO_EQUIPE', 'Após erro equipe', 3, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'APOS_GOL_SOF', 'Após gol sofrido', 4, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'APOS_GOL_PERDIDO', 'Após gol perdido', 5, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'ATRAS_PLACAR', 'Atrás no placar', 6, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'EMPATE_CRITICO', 'Empate crítico', 7, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'FECHAMENTO_SET', 'Fechamento de set', 8, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'SET_POINT_PRO', 'Set point a favor', 9, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'SET_POINT_CONTRA', 'Set point contra', 10, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'GOLDEN_GOAL', 'Golden goal', 11, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'SHOOTOUT', 'Shootout', 12, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'POS_OUT', 'Pós OUT', 13, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'ERROS_CONSECUTIVOS', 'Erros consecutivos', 14, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'DECISAO_ARBITRAGEM_CONTRA', 'Decisão arbitragem contra', 15, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'MOMENTO_ALTA_TENSAO', 'Momento de alta tensão', 16, false, false),
    ('LISTA_CONTEXTO_PRESSAO', 'NAO_OBSERVADO', 'Não Observado', 17, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_EVENTO_MENTAL_GATILHO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_EVENTO_MENTAL_GATILHO', 'ERRO_TECNICO_PROPRIO', 'Erro técnico próprio', 1, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'ERRO_DECISAO_PROPRIO', 'Erro decisão próprio', 2, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'ERRO_FINALIZACAO', 'Erro de finalização', 3, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'ERRO_DEFENSIVO', 'Erro defensivo', 4, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'GOL_SOF_RESPONSABILIDADE', 'Gol sofrido (resp.)', 5, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'GOL_SOF_EQUIPE', 'Gol sofrido equipe', 6, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'PERDA_BOLA', 'Perda de bola', 7, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'OUT_PROPRIO', 'OUT próprio', 8, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'OUT_COMPANHEIRA', 'OUT companheira', 9, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'DECISAO_ARBITRAGEM', 'Decisão arbitragem', 10, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'PRESSAO_PLACAR', 'Pressão no placar', 11, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'ERRO_COMPANHEIRA', 'Erro companheira', 12, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'COMUNICACAO_NEGATIVA', 'Comunicação negativa', 13, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'COMUNICACAO_POSITIVA', 'Comunicação positiva', 14, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'ACERTO_IMPORTANTE', 'Acerto importante', 15, false, false),
    ('LISTA_EVENTO_MENTAL_GATILHO', 'NAO_OBSERVADO', 'Não Observado', 16, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_RESPOSTA_APOS_ERRO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_RESPOSTA_APOS_ERRO', 'RESET_EFICIENTE', 'Reset eficiente', 1, false, false),
    ('LISTA_RESPOSTA_APOS_ERRO', 'RESET_PARCIAL', 'Reset parcial', 2, false, false),
    ('LISTA_RESPOSTA_APOS_ERRO', 'SEM_RESET', 'Sem reset', 3, false, false),
    ('LISTA_RESPOSTA_APOS_ERRO', 'EVITA_PARTICIPACAO', 'Evita participação', 4, false, false),
    ('LISTA_RESPOSTA_APOS_ERRO', 'FORCA_COMPENSACAO', 'Força compensação', 5, false, false),
    ('LISTA_RESPOSTA_APOS_ERRO', 'COMUNICA_POSITIVO', 'Comunica positivo', 6, false, false),
    ('LISTA_RESPOSTA_APOS_ERRO', 'COMUNICA_NEGATIVO', 'Comunica negativo', 7, false, false),
    ('LISTA_RESPOSTA_APOS_ERRO', 'BUSCA_PROXIMA_ACAO', 'Busca próxima ação', 8, false, false),
    ('LISTA_RESPOSTA_APOS_ERRO', 'QUEDA_LING_CORPORAL', 'Queda ling. corporal', 9, false, false),
    ('LISTA_RESPOSTA_APOS_ERRO', 'NAO_OBSERVADO', 'Não Observado', 10, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_IMPACTO_ERRO_ANTERIOR
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_IMPACTO_ERRO_ANTERIOR', 'SEM_IMPACTO', 'Sem impacto', 1, false, false),
    ('LISTA_IMPACTO_ERRO_ANTERIOR', 'IMPACTO_LEVE', 'Impacto leve', 2, false, false),
    ('LISTA_IMPACTO_ERRO_ANTERIOR', 'IMPACTO_MODERADO', 'Impacto moderado', 3, false, false),
    ('LISTA_IMPACTO_ERRO_ANTERIOR', 'IMPACTO_ALTO', 'Impacto alto', 4, false, false),
    ('LISTA_IMPACTO_ERRO_ANTERIOR', 'IMPACTO_POSITIVO', 'Impacto positivo', 5, false, false),
    ('LISTA_IMPACTO_ERRO_ANTERIOR', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_COMPORTAMENTO_PRESSAO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_COMPORTAMENTO_PRESSAO', 'CRESCE_PRESSAO', 'Cresce sob pressão', 1, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'MANTEM_PADRAO', 'Mantém padrão', 2, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'OSCILA_PRESSAO', 'Oscila sob pressão', 3, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'REDUZ_RENDIMENTO', 'Reduz rendimento', 4, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'EVITA_DECISAO', 'Evita decisão', 5, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'FORCA_DECISAO', 'Força decisão', 6, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'ACELERA_DEMAIS', 'Acelera demais', 7, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'TRAVA_DECISAO', 'Trava na decisão', 8, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'ORGANIZA_EQUIPE', 'Organiza equipe', 9, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'DESORGANIZA_EQUIPE', 'Desorganiza equipe', 10, false, false),
    ('LISTA_COMPORTAMENTO_PRESSAO', 'NAO_OBSERVADO', 'Não Observado', 11, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_QUALIDADE_RESET_MENTAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_QUALIDADE_RESET_MENTAL', 'ALTA', 'Alta', 1, false, false),
    ('LISTA_QUALIDADE_RESET_MENTAL', 'MEDIA', 'Média', 2, false, false),
    ('LISTA_QUALIDADE_RESET_MENTAL', 'BAIXA', 'Baixa', 3, false, false),
    ('LISTA_QUALIDADE_RESET_MENTAL', 'AUSENTE', 'Ausente', 4, false, false),
    ('LISTA_QUALIDADE_RESET_MENTAL', 'NAO_NECESSARIO', 'Não necessário', 5, false, false),
    ('LISTA_QUALIDADE_RESET_MENTAL', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_COMUNICACAO_MOMENTO_CRITICO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'POSITIVA_ORGANIZA', 'Positiva/organiza', 1, false, false),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'POSITIVA_ENCORAJAMENTO', 'Positiva/encorajamento', 2, false, false),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'TECNICA_OBJETIVA', 'Técnica objetiva', 3, false, false),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'NEUTRA', 'Neutra', 4, false, false),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'AUSENTE', 'Ausente', 5, false, false),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'NEGATIVA_RECLAMA', 'Negativa/reclama', 6, false, false),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'NEGATIVA_CULPA', 'Negativa/culpa', 7, false, false),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'NEGATIVA_ARBITRAGEM', 'Negativa/arbitragem', 8, false, false),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'CONFUSA', 'Confusa', 9, false, false),
    ('LISTA_COMUNICACAO_MOMENTO_CRITICO', 'NAO_OBSERVADO', 'Não Observado', 10, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_LINGUAGEM_CORPORAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_LINGUAGEM_CORPORAL', 'PRONTA_ATIVA', 'Pronta/ativa', 1, false, false),
    ('LISTA_LINGUAGEM_CORPORAL', 'CALMA_ORGANIZADA', 'Calma/organizada', 2, false, false),
    ('LISTA_LINGUAGEM_CORPORAL', 'ENERGIA_POSITIVA', 'Energia positiva', 3, false, false),
    ('LISTA_LINGUAGEM_CORPORAL', 'CABECA_BAIXA', 'Cabeça baixa', 4, false, false),
    ('LISTA_LINGUAGEM_CORPORAL', 'GESTO_FRUSTRACAO', 'Gesto frustração', 5, false, false),
    ('LISTA_LINGUAGEM_CORPORAL', 'ISOLAMENTO', 'Isolamento', 6, false, false),
    ('LISTA_LINGUAGEM_CORPORAL', 'AGITACAO_EXCESSIVA', 'Agitação excessiva', 7, false, false),
    ('LISTA_LINGUAGEM_CORPORAL', 'RECLAMACAO_GESTUAL', 'Reclamação gestual', 8, false, false),
    ('LISTA_LINGUAGEM_CORPORAL', 'NAO_OBSERVADO', 'Não Observado', 9, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_PERFIL_PRESSAO_JOGO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_PERFIL_PRESSAO_JOGO', 'CRESCE_EM_PRESSAO', 'Cresce em pressão', 1, false, false),
    ('LISTA_PERFIL_PRESSAO_JOGO', 'ESTAVEL_EM_PRESSAO', 'Estável em pressão', 2, false, false),
    ('LISTA_PERFIL_PRESSAO_JOGO', 'OSCILA_EM_PRESSAO', 'Oscila em pressão', 3, false, false),
    ('LISTA_PERFIL_PRESSAO_JOGO', 'SENTE_PRESSAO', 'Sente pressão', 4, false, false),
    ('LISTA_PERFIL_PRESSAO_JOGO', 'EVITA_PROTAGONISMO', 'Evita protagonismo', 5, false, false),
    ('LISTA_PERFIL_PRESSAO_JOGO', 'COMPENSA_ERRO', 'Compensa erro', 6, false, false),
    ('LISTA_PERFIL_PRESSAO_JOGO', 'ORGANIZADORA_EMOCIONAL', 'Organizadora emocional', 7, false, false),
    ('LISTA_PERFIL_PRESSAO_JOGO', 'GERADORA_RUIDO', 'Geradora de ruído', 8, false, false),
    ('LISTA_PERFIL_PRESSAO_JOGO', 'AMOSTRA_INSUFICIENTE', 'Amostra insuficiente', 9, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_SEQUENCIA_ERROS_ATLETA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_SEQUENCIA_ERROS_ATLETA', 'ERRO_ISOLADO', 'Erro isolado', 1, false, false),
    ('LISTA_SEQUENCIA_ERROS_ATLETA', 'ERRO_SEGUIDO_2', 'Erro seguido (2x)', 2, false, false),
    ('LISTA_SEQUENCIA_ERROS_ATLETA', 'ERRO_SEGUIDO_3_MAIS', 'Erro seguido (3+)', 3, false, false),
    ('LISTA_SEQUENCIA_ERROS_ATLETA', 'ERRO_RESETADO', 'Erro resetado', 4, false, false),
    ('LISTA_SEQUENCIA_ERROS_ATLETA', 'ERRO_COMPENSADO_FORCADO', 'Erro compensado (forç.)', 5, false, false),
    ('LISTA_SEQUENCIA_ERROS_ATLETA', 'NAO_OBSERVADO', 'Não Observado', 6, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_ACAO_POS_ERRO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_ACAO_POS_ERRO', 'ASSUME_FUNCAO', 'Assume função', 1, false, false),
    ('LISTA_ACAO_POS_ERRO', 'PEDE_BOLA', 'Pede bola', 2, false, false),
    ('LISTA_ACAO_POS_ERRO', 'EVITA_BOLA', 'Evita bola', 3, false, false),
    ('LISTA_ACAO_POS_ERRO', 'COMUNICA_EQUIPE', 'Comunica equipe', 4, false, false),
    ('LISTA_ACAO_POS_ERRO', 'RECLAMA', 'Reclama', 5, false, false),
    ('LISTA_ACAO_POS_ERRO', 'ERRA_NOVAMENTE', 'Erra novamente', 6, false, false),
    ('LISTA_ACAO_POS_ERRO', 'ACERTA_ACAO_SEGUINTE', 'Acerta ação seguinte', 7, false, false),
    ('LISTA_ACAO_POS_ERRO', 'FORCA_ACAO', 'Força ação', 8, false, false),
    ('LISTA_ACAO_POS_ERRO', 'NAO_PARTICIPA', 'Não participa', 9, false, false),
    ('LISTA_ACAO_POS_ERRO', 'NAO_OBSERVADO', 'Não Observado', 10, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_TIPO_FEEDBACK
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_TIPO_FEEDBACK', 'CORRECAO', 'Correção', 1, false, false),
    ('LISTA_TIPO_FEEDBACK', 'REFORCO', 'Reforço', 2, false, false),
    ('LISTA_TIPO_FEEDBACK', 'ALERTA', 'Alerta', 3, false, false),
    ('LISTA_TIPO_FEEDBACK', 'ELOGIO_TECNICO', 'Elogio técnico', 4, false, false),
    ('LISTA_TIPO_FEEDBACK', 'AJUSTE_TATICO', 'Ajuste tático', 5, false, false),
    ('LISTA_TIPO_FEEDBACK', 'ORIENTACAO_TREINO', 'Orientação treino', 6, false, false),
    ('LISTA_TIPO_FEEDBACK', 'REVISAO_VIDEO', 'Revisão em vídeo', 7, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_DESTINATARIO_FEEDBACK
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_DESTINATARIO_FEEDBACK', 'ATLETA', 'Atleta', 1, false, false),
    ('LISTA_DESTINATARIO_FEEDBACK', 'SETOR_OFENSIVO', 'Setor ofensivo', 2, false, false),
    ('LISTA_DESTINATARIO_FEEDBACK', 'SETOR_DEFENSIVO', 'Setor defensivo', 3, false, false),
    ('LISTA_DESTINATARIO_FEEDBACK', 'GOLEIRA', 'Goleira', 4, false, false),
    ('LISTA_DESTINATARIO_FEEDBACK', 'TRANSICAO', 'Transição', 5, false, false),
    ('LISTA_DESTINATARIO_FEEDBACK', 'EQUIPE', 'Equipe', 6, false, false),
    ('LISTA_DESTINATARIO_FEEDBACK', 'COMISSAO', 'Comissão', 7, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_PRIORIDADE_FEEDBACK
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_PRIORIDADE_FEEDBACK', 'ALTA', 'Alta', 1, false, false),
    ('LISTA_PRIORIDADE_FEEDBACK', 'MEDIA', 'Média', 2, false, false),
    ('LISTA_PRIORIDADE_FEEDBACK', 'BAIXA', 'Baixa', 3, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_STATUS_FEEDBACK
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_STATUS_FEEDBACK', 'PENDENTE', 'Pendente', 1, false, false),
    ('LISTA_STATUS_FEEDBACK', 'ENVIADO', 'Enviado', 2, false, false),
    ('LISTA_STATUS_FEEDBACK', 'REVISADO', 'Revisado', 3, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_BLOCO_RELATORIO
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_BLOCO_RELATORIO', 'ATAQUE', 'Ataque', 1, false, false),
    ('LISTA_BLOCO_RELATORIO', 'DEFESA', 'Defesa', 2, false, false),
    ('LISTA_BLOCO_RELATORIO', 'GOLEIRA', 'Goleira', 3, false, false),
    ('LISTA_BLOCO_RELATORIO', 'TRANS_OF', 'Trans. of.', 4, false, false),
    ('LISTA_BLOCO_RELATORIO', 'TRANS_DEF', 'Trans. def.', 5, false, false),
    ('LISTA_BLOCO_RELATORIO', 'SHOOTOUT', 'Shootout', 6, false, false),
    ('LISTA_BLOCO_RELATORIO', 'BOLA_PARADA', 'Bola parada', 7, false, false),
    ('LISTA_BLOCO_RELATORIO', 'OUT', 'OUT', 8, false, false),
    ('LISTA_BLOCO_RELATORIO', 'PASSIVO', 'Passivo', 9, false, false),
    ('LISTA_BLOCO_RELATORIO', 'MENTAL', 'Mental', 10, false, false),
    ('LISTA_BLOCO_RELATORIO', 'GERAL', 'Geral', 11, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_STATUS_DASHBOARD
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_STATUS_DASHBOARD', 'OK', 'OK', 1, false, false),
    ('LISTA_STATUS_DASHBOARD', 'ATENCAO', 'Atenção', 2, false, false),
    ('LISTA_STATUS_DASHBOARD', 'CRITICO', 'Crítico', 3, false, false),
    ('LISTA_STATUS_DASHBOARD', 'NAO_CALCULADO', 'Não calculado', 4, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_STATUS_ATLETA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_STATUS_ATLETA', 'ATIVA', 'Ativa', 1, false, false),
    ('LISTA_STATUS_ATLETA', 'INATIVA', 'Inativa', 2, false, false),
    ('LISTA_STATUS_ATLETA', 'LESIONADA', 'Lesionada', 3, false, false),
    ('LISTA_STATUS_ATLETA', 'CONVIDADA', 'Convidada', 4, false, false),
    ('LISTA_STATUS_ATLETA', 'NAO_OBSERVADO', 'Não Observado', 5, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_MAO_DOMINANTE
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_MAO_DOMINANTE', 'DESTRA', 'Destra', 1, false, false),
    ('LISTA_MAO_DOMINANTE', 'CANHOTA', 'Canhota', 2, false, false),
    ('LISTA_MAO_DOMINANTE', 'AMBIDESTRA', 'Ambidestra', 3, false, false),
    ('LISTA_MAO_DOMINANTE', 'NAO_OBSERVADO', 'Não Observado', 4, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_FUNCAO_PRINCIPAL
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_FUNCAO_PRINCIPAL', 'GOLEIRA', 'Goleira', 1, false, false),
    ('LISTA_FUNCAO_PRINCIPAL', 'ESPECIALISTA', 'Especialista', 2, false, false),
    ('LISTA_FUNCAO_PRINCIPAL', 'ARMADORA', 'Armadora', 3, false, false),
    ('LISTA_FUNCAO_PRINCIPAL', 'PIVO', 'Pivô', 4, false, false),
    ('LISTA_FUNCAO_PRINCIPAL', 'DEFENSORA', 'Defensora', 5, false, false),
    ('LISTA_FUNCAO_PRINCIPAL', 'UNIVERSAL', 'Universal', 6, false, false),
    ('LISTA_FUNCAO_PRINCIPAL', 'NAO_OBSERVADO', 'Não Observado', 7, false, true)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_TIPO_EQUIPE
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_TIPO_EQUIPE', 'PROPRIA', 'Própria', 1, false, false),
    ('LISTA_TIPO_EQUIPE', 'ADVERSARIA', 'Adversária', 2, false, false),
    ('LISTA_TIPO_EQUIPE', 'TREINO', 'Treino', 3, false, false),
    ('LISTA_TIPO_EQUIPE', 'OUTRA', 'Outra', 4, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;

-- LISTA_CATEGORIA
with value_seed(list_key, code, label, sort_order, is_nao_aplica, is_nao_observado) as (
  values
    ('LISTA_CATEGORIA', 'ADULTO', 'Adulto', 1, false, false),
    ('LISTA_CATEGORIA', 'JUVENIL', 'Juvenil', 2, false, false),
    ('LISTA_CATEGORIA', 'BASE', 'Base', 3, false, false),
    ('LISTA_CATEGORIA', 'MISTO', 'Misto', 4, false, false),
    ('LISTA_CATEGORIA', 'OUTRA', 'Outra', 5, false, false)
)
insert into public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
select
  l.id, v.code, v.label, v.sort_order, v.is_nao_aplica, v.is_nao_observado, true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
  set label = excluded.label,
      sort_order = excluded.sort_order,
      is_nao_aplica = excluded.is_nao_aplica,
      is_nao_observado = excluded.is_nao_observado,
      active = excluded.active;
