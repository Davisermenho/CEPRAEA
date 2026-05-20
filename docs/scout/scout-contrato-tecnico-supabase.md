---
tipo: CONTRATO-TECNICO
nome: "Scout — Contrato Técnico Supabase-first"
papel: "Abre a Etapa B do scout com o desenho técnico canônico para persistência, RLS, contratos de dados, migrações e estratégia de implementação incremental sobre a base Supabase do produto."
autoridade: "Hierarquia 4/4 para implementação do scout — prevalece sobre frontend legado órfão, sobre o payload genérico atual de `scout_events`, e sobre decisões ad hoc de schema; perde apenas para correção factual revalidada da Etapa A ou decisão explícita humana posterior."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "antes de criar migrações, tabelas, RPCs, tipos TypeScript, stores, formulários ou testes do scout."
atualizado_por: "Codex — 18 de maio de 2026"
quando_atualizar: "uma decisão estrutural de persistência mudar; uma tabela nova entrar; a estratégia de migração do scout legado mudar; uma regra de RLS do scout for refinada."
validade: "2026-05-18"
status: INICIAL
status_nota: "Abertura formal consolidada da Etapa B. Fecha a decisão de persistência da COLETA_AO_VIVO, separa captura rápida de camada analítica normalizada e fixa a leitura atleta-facing como projeção derivada controlada."
conflito: "Se este documento divergir da Etapa A em semântica, a Etapa A prevalece. Se divergir do schema Supabase atual, este documento governa a evolução futura do scout, não a leitura histórica do legado."
proibido:
  - "Agentes NÃO devem reativar o scout criando runtime novo sobre `scout_events.payload` como fonte canônica."
  - "NÃO devem copiar a planilha linha por linha para tabelas físicas sem normalização."
  - "NÃO devem abrir UI final do scout antes da migração foundation, contratos e RLS mínimos existirem."
nao_cobre: "DDL final completo, todos os índices finais, implementação de formulários, telas finais e suíte automatizada completa."
---

# Scout — Contrato Técnico Supabase-first

## 1. Objetivo

Abrir a Etapa B com uma decisão técnica clara:

- **a Etapa A fixa significado**
- **a Etapa B fixa persistência**

O scout não deve voltar como:

1. formulário solto em frontend;
2. `payload jsonb` sem contrato;
3. espelho literal da planilha;
4. conjunto de telas sem rastreabilidade entre jogada, participação, mental, validação, relatório e feedback.

## 2. Ponto de partida real do sistema

O repositório já possui:

- `public.scout_games`
- `public.scout_events`
- RLS para leitura por membro e escrita por `owner`/`coach`
- um `payload jsonb` genérico em `scout_events`
- artefatos frontend antigos em `src/features/scout/**`

Mas isso **não é suficiente** para o scout v1 Supabase-first, porque:

- o contrato persistido hoje é genérico demais;
- os dados táticos, mentais e derivados ainda não têm forma relacional canônica;
- o frontend legado usa semântica anterior à Etapa A;
- a planilha tem repetições por slot que não devem virar schema físico literal.

## 3. Decisões estruturais centrais

### 3.1 O scout futuro não será baseado em `payload jsonb`

`public.scout_events.payload` passa a ser tratado como:

- compatibilidade histórica do scout legado;
- fonte eventual de import/migração;
- superfície de leitura temporária, se necessário.

Ele **não** deve ser a fonte canônica de novos fluxos do scout.

### 3.2 A planilha não será espelhada coluna por coluna

A `TABELA_MESTRE` é fonte metodológica e de catálogo.

Ela **não** deve ser convertida diretamente em:

- uma tabela com `466` colunas;
- campos físicos repetidos do tipo `ATQ_1_*`, `ATQ_2_*`, `DEF_1_*`;
- contrato duplicado entre `COLETA_SCOUT` e `PARTICIPACOES`.

Decisão:

- o banco será **normalizado por contrato lógico**
- não por layout do workbook.

### 3.3 `COLETA_AO_VIVO` terá camada própria de persistência

`COLETA_AO_VIVO` será tratado como:

- camada própria de captura rápida;
- modo de entrada operacional enxuto;
- superfície auditável anterior à promoção analítica.

Decisão:

- o nome de trabalho recomendado é `public.scout_live_entries`;
- essa tabela representa a captura rápida fiel à aba `COLETA_AO_VIVO`;
- ela não substitui `scout_plays`;
- ela pode permanecer apenas como coleta auditável, ou ser promovida para `scout_plays` + `scout_play_participations`;
- `PARTICIPACOES` não deve nascer automaticamente da coleta rápida como regra cega.

### 3.4 `RELATORIO` e `FEEDBACK` são contratos persistidos, mas derivados

`RELATORIO` e `FEEDBACK` não são a origem dos dados.

Eles devem nascer de:

- `COLETA_SCOUT`
- `PARTICIPACOES`
- `EVENTOS_MENTAIS`
- `VALIDACAO`

Decisão:

- podem ser persistidos como materialização editorial/auditável;
- mas nunca como substituto da evidência de jogada.

### 3.5 `VISAO_ATLETA_SCOUT` e metas derivadas também são contratos derivados

O produto atual exige leitura do scout pela atleta e metas derivadas do scout.

Decisão:

- a atleta não lê `scout_plays`, `scout_play_participations` ou `scout_mental_events` diretamente;
- a leitura atleta-facing deve existir em projeções derivadas controladas;
- metas derivadas do scout devem manter vínculo com evidência, relatório, feedback ou prioridade de treino;
- a política de exposição para atleta deve incidir apenas sobre projeções e metas elegíveis, nunca sobre a base analítica bruta completa.

## 4. Modelo alvo de persistência

## 4.1 Cabeçalho da sessão

### Tabela base: `public.scout_games`

Esta tabela deve ser **mantida e evoluída**, não descartada.

Papel:

- representar jogo, treino, amistoso ou sessão analisada;
- servir de pai para jogadas e derivados;
- respeitar o modelo multi-time já existente no produto.

Campos existentes aproveitáveis:

- `id`
- `team_id`
- `game_date`
- `analyzed_team`
- `opponent`
- `location`
- `notes`
- `status`
- `created_at`
- `updated_at`

Campos prováveis a adicionar na fundação da Etapa B:

- `session_type`
- `period`
- `source`
- `video_ref`
- `timezone`
- `catalog_opponent_id`

Regra:

- `team_id` continua sendo o time proprietário dos dados;
- `opponent` textual deve tender a virar referência a catálogo, sem quebrar o histórico.

### 4.1.1 Camada de captura rápida: `public.scout_live_entries`

Representa um lance registrado na camada rápida de `COLETA_AO_VIVO`.

Campos-base mínimos:

- `id uuid primary key`
- `team_id uuid not null`
- `scout_game_id uuid not null`
- `entry_code text not null`
- `game_clock text not null`
- `phase_of_ball text not null`
- `analyzed_team_side text`
- `analyzed_team_phase text`
- `offensive_system text`
- `defensive_system text`
- `main_athlete_id uuid`
- `main_athlete_label text`
- `main_action_code text`
- `finish_type text`
- `factual_result text not null`
- `score_reason text`
- `play_points smallint`
- `probable_cause text`
- `training_priority text`
- `video_ref text`
- `validation_status text not null default 'PENDENTE'`
- `promoted_to_play_id uuid`
- `promotion_status text not null default 'CAPTURADA'`
- `captured_by uuid`
- `captured_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Regra:

- `scout_live_entries` é a camada de captura rápida;
- `scout_plays` é a camada analítica normalizada do lance;
- a promoção de uma entrada rápida para jogada analítica deve ser explícita e auditável;
- o mesmo jogo pode conter entradas apenas capturadas e entradas já promovidas.

## 4.2 Contrato canônico da jogada

### Nova tabela: `public.scout_plays`

Equivale ao contrato lógico `COLETA_SCOUT`.

Uma linha = uma `ID_JOGADA`.

Regra adicional:

- `scout_plays` não é o destino direto obrigatório de toda entrada rápida;
- ele representa a jogada analítica normalizada, seja criada diretamente por fluxo completo, seja por promoção a partir de `scout_live_entries`.

Campos-base obrigatórios:

- `id uuid primary key`
- `team_id uuid not null`
- `scout_game_id uuid not null`
- `play_code text not null`
- `session_date date not null`
- `session_type text not null`
- `opponent_name text`
- `period text not null`
- `game_clock text not null`
- `source text not null`
- `phase_of_ball text not null`
- `attacking_team_side text not null`
- `defending_team_side text not null`
- `analyzed_team_phase text`
- `offensive_system text`
- `offensive_configuration text`
- `special_offensive_role text`
- `temporary_pivot_occupation text`
- `temporary_pivot_athlete_id uuid`
- `temporary_pivot_result text`
- `defensive_system text`
- `expected_defensive_action text`
- `defensive_connection text`
- `defensive_adjustment text`
- `main_offensive_threat text`
- `defensive_adjustment_result text`
- `finish_type text`
- `shot_destination text`
- `shot_region text`
- `factual_result text not null`
- `play_points text`
- `play_score_reason text`
- `main_cause text`
- `goalkeeper_initial_posture text`
- `goalkeeper_reaction_form text`
- `goalkeeper_decision text`
- `goalkeeper_response text`
- `goalkeeper_pass_quality text`
- `goalkeeper_pass_type text`
- `goalkeeper_game_vision text`
- `transition_offensive_form text`
- `transition_offensive_goal text`
- `transition_defensive_form text`
- `transition_defensive_goal text`
- `out_situation text`
- `numerical_structure_real text`
- `offensive_system_adjusted_out text`
- `defensive_adjustment_out text`
- `priority_out_threat text`
- `out_result text`
- `out_cause text`
- `special_context text`
- `validation_status text not null default 'PENDENTE'`
- `video_ref text`
- `free_notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

Observações:

- os nomes finais em SQL podem ficar em inglês para coerência com o schema atual;
- os conceitos continuam sendo governados pela Etapa A;
- `play_code` é o equivalente técnico de `ID_JOGADA`, com `unique(team_id, scout_game_id, play_code)`.

## 4.3 Participações por atleta

### Nova tabela: `public.scout_play_participations`

Equivale ao contrato lógico `PARTICIPACOES`.

Decisão central:

- **as famílias repetidas `ATQ_*` e `DEF_*` não viram colunas físicas repetidas**
- elas viram linhas normalizadas nesta tabela.

Campos-base:

- `id uuid primary key`
- `team_id uuid not null`
- `scout_game_id uuid not null`
- `scout_play_id uuid not null`
- `play_code text not null`
- `participant_scope text not null`
- `participant_side text not null`
- `slot_order smallint not null`
- `athlete_id uuid`
- `external_athlete_label text`
- `phase_of_athlete text`
- `participation_role text not null`
- `position_code text`
- `special_function_code text`
- `action_code text`
- `individual_result text`
- `main_cause text`
- `training_priority text`
- `created_at timestamptz not null default now()`

Semântica dos campos críticos:

- `participant_scope`: `ATQ` ou `DEF`
- `participant_side`: `ANALYZED` ou `OPPONENT`
- `slot_order`: ordem observada do slot na jogada
- `athlete_id`: usado quando a atleta pertence ao `team_id`
- `external_athlete_label`: fallback controlado para adversária não cadastrada

Regra:

- tudo que hoje aparece em `ATQ_1_*`, `ATQ_2_*`, `DEF_1_*` etc. deve convergir para esta tabela;
- qualquer UI futura pode reconstruir a visão por slot a partir dessa estrutura.

## 4.4 Eventos mentais

### Nova tabela: `public.scout_mental_events`

Equivale ao contrato `EVENTOS_MENTAIS`.

Campos-base:

- `id uuid primary key`
- `team_id uuid not null`
- `scout_game_id uuid not null`
- `scout_play_id uuid not null`
- `play_code text not null`
- `athlete_id uuid`
- `external_athlete_label text`
- `mental_code text not null`
- `mental_mark text not null`
- `pressure_context text`
- `mental_trigger text`
- `response_after_error text`
- `impact_previous_error text`
- `pressure_behavior text`
- `reset_quality text`
- `critical_communication text`
- `body_language text`
- `pressure_profile_game text`
- `error_sequence text`
- `post_error_action text`
- `mental_observation text`
- `validation_status text not null default 'PENDENTE'`
- `created_at timestamptz not null default now()`

Regra:

- evento mental precisa continuar ligado à jogada;
- mas nem todo evento mental precisa apontar para uma participação individual formal.

## 4.5 Revisão e validação

### Nova tabela: `public.scout_play_validations`

Equivale ao contrato `VALIDACAO`.

Campos-base:

- `id uuid primary key`
- `team_id uuid not null`
- `scout_game_id uuid not null`
- `scout_play_id uuid not null`
- `play_code text not null`
- `field_name text not null`
- `original_value text`
- `corrected_value text`
- `validation_status text not null`
- `validator_user_id uuid`
- `validation_at timestamptz`
- `correction_reason text not null`
- `validation_notes text`
- `created_at timestamptz not null default now()`

Decisão:

- este contrato deve ser append-only em nível lógico;
- correção não apaga histórico;
- publicação analítica deve olhar o estado revisado mais recente.

## 4.6 Relatório técnico

### Nova tabela: `public.scout_report_items`

Equivale ao contrato `RELATORIO`.

Campos-base:

- `id uuid primary key`
- `team_id uuid not null`
- `scout_game_id uuid not null`
- `report_block text not null`
- `indicator_code text not null`
- `indicator_value numeric`
- `sample_size int`
- `evidence_play_ids uuid[] not null default '{}'`
- `status text not null default 'RASCUNHO'`
- `generated_by uuid`
- `generated_at timestamptz`
- `notes text`

Regra:

- relatório pode ser recalculável;
- mas, quando publicado, deve manter trilha editorial e evidência.

## 4.7 Feedback técnico

### Nova tabela: `public.scout_feedback_items`

Equivale ao contrato `FEEDBACK`.

Campos-base:

- `id uuid primary key`
- `team_id uuid not null`
- `scout_game_id uuid not null`
- `target_type text not null`
- `athlete_id uuid`
- `theme_code text not null`
- `feedback_type text not null`
- `priority_level text not null`
- `status text not null default 'PENDENTE'`
- `source_play_ids uuid[] not null default '{}'`
- `message text not null`
- `created_by uuid`
- `created_at timestamptz not null default now()`

Regra:

- feedback sem evidência vinculada não deve ser publicado como oficial.

## 4.8 Projeções atleta-facing do scout

### Nova tabela: `public.scout_athlete_views`

Equivale ao contrato derivado `VISAO_ATLETA_SCOUT`.

Campos-base:

- `id uuid primary key`
- `team_id uuid not null`
- `athlete_id uuid not null`
- `scout_game_id uuid`
- `view_type text not null`
- `reference_period text`
- `summary_text text`
- `indicator_code text`
- `indicator_value numeric`
- `sample_size int`
- `source_play_ids uuid[] not null default '{}'`
- `source_report_item_ids uuid[] not null default '{}'`
- `source_feedback_item_ids uuid[] not null default '{}'`
- `training_priority text`
- `publication_status text not null default 'RASCUNHO'`
- `published_by uuid`
- `published_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Tipos mínimos de visão:

- `EVENTO_BRUTO`
- `RESUMO_POR_JOGO`
- `INDICADOR_AGREGADO`
- `HISTORICO_POR_PERIODO`

Regra:

- esta tabela é a superfície oficial de leitura do scout pela atleta;
- só deve receber dado validado ou explicitamente publicado;
- deve preservar rastreabilidade com jogadas, relatórios e feedbacks de origem.

## 4.9 Metas derivadas do scout

### Nova tabela: `public.scout_goal_links`

Vincula evidências do scout a metas do produto sem duplicar a tabela principal de metas.

Campos-base:

- `id uuid primary key`
- `team_id uuid not null`
- `goal_scope text not null`
- `goal_id uuid not null`
- `athlete_id uuid`
- `scout_game_id uuid`
- `source_play_ids uuid[] not null default '{}'`
- `source_report_item_ids uuid[] not null default '{}'`
- `source_feedback_item_ids uuid[] not null default '{}'`
- `source_training_priority text`
- `created_by uuid`
- `created_at timestamptz not null default now()`

Regra:

- `goal_scope` deve distinguir `INDIVIDUAL` e `EQUIPE`;
- metas derivadas do scout devem manter evidência rastreável;
- esta tabela não substitui a tabela principal de metas do produto; ela apenas preserva o vínculo de origem analítica.

## 4.10 Extensão scout do cadastro de atletas

### Nova tabela: `public.athlete_scout_profiles`

Equivale ao núcleo de `CAD_ATLETAS`, mas sem duplicar o cadastro base de `athletes`.

Campos-base:

- `athlete_id uuid primary key`
- `team_id uuid not null`
- `dominant_hand text`
- `main_function text`
- `pos_of_3x1 text`
- `pos_of_4x0 text`
- `pos_def_3x0 text`
- `is_goalkeeper boolean not null default false`
- `is_specialist boolean not null default false`
- `is_playmaker boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Decisão:

- o cadastro civil continua em `athletes`;
- o perfil tático do scout fica separado.

## 4.11 Catálogo externo de equipes

### Nova tabela: `public.scout_catalog_teams`

Equivale ao contrato `CAD_EQUIPES` para equipes externas ou referências analíticas.

Campos-base:

- `id uuid primary key`
- `team_id uuid not null`
- `name text not null`
- `team_type text`
- `category text`
- `is_internal boolean not null default false`
- `linked_team_id uuid`
- `created_at timestamptz not null default now()`

Regra:

- a equipe dona dos dados continua sendo `public.teams`;
- `scout_catalog_teams` resolve adversárias, aliases e agrupamentos operacionais do scout.

## 5. Estratégia para listas e dicionário

## 5.1 Não usar 124 tipos `ENUM` do Postgres

Isso criaria rigidez excessiva e custo alto de manutenção.

Decisão:

- os códigos do scout devem ser armazenados como `text`;
- a autoridade semântica e operacional virá de um **codebook central**.

## 5.2 Tabelas de codebook recomendadas

### `public.scout_code_lists`

- `id uuid primary key`
- `list_key text unique not null`
- `label text not null`
- `contract_scope text`
- `active boolean not null default true`
- `source_version text`

### `public.scout_code_values`

- `id uuid primary key`
- `list_id uuid not null`
- `code text not null`
- `label text not null`
- `sort_order int`
- `is_nao_aplica boolean not null default false`
- `is_nao_observado boolean not null default false`
- `notes text`
- `active boolean not null default true`
- `unique(list_id, code)`

### `public.scout_field_codebook_map`

- `id uuid primary key`
- `field_name text not null`
- `contract_name text not null`
- `selector_key text not null default '*'`
- `selector_value text not null default '*'`
- `list_key text not null`
- `allow_nao_aplica boolean not null default false`
- `allow_nao_observado boolean not null default true`
- `unique(contract_name, field_name, selector_key, selector_value)`

Papel:

- permitir validação central por campo;
- permitir listas condicionais para o mesmo campo, como `action_code` em `scout_play_participations` conforme `participant_scope`;
- evitar explosão de enums;
- permitir geração futura de tipos, selects e validadores.

## 6. RLS e segurança

O scout novo deve herdar a filosofia do produto atual:

- `owner` e `coach` leem e escrevem a base analítica;
- atletas leem apenas projeções derivadas autorizadas;
- efeitos derivados críticos podem ser editoriais.

## 6.1 Leituras

Leituras não devem usar uma única policy genérica para todos os contratos.

Regra:

- contratos analíticos brutos devem usar predicate de staff do time (`owner`/`coach`) ou equivalente;
- projeções atleta-facing podem usar predicate de membro do time com filtro adicional por `athlete_id`;
- codebooks continuam leitura global para `authenticated`.

Aplica-se a:

- `scout_live_entries`
- `scout_games`
- `scout_plays`
- `scout_play_participations`
- `scout_mental_events`
- `scout_play_validations`
- `scout_report_items`
- `scout_feedback_items`
- `athlete_scout_profiles`
- `scout_goal_links`
- `scout_athlete_views`
- `scout_catalog_teams`

Exceções:

- `scout_athlete_views` admite leitura da atleta apenas sobre a própria projeção publicada;
- os codebooks do scout não têm `team_id`, então a leitura deles deve ser global para `authenticated`, e não filtrada por time.

## 6.2 Escrita

Regra padrão:

- `owner` e `coach` escrevem contratos-base;
- contratos derivados editoriais podem continuar restritos a `owner`/`coach`.

Exceção controlada da atleta:

- atleta autenticada não escreve contratos de scout;
- atleta pode ler apenas `scout_athlete_views` onde `athlete_id` corresponda ao seu vínculo no time;
- atleta pode ler metas derivadas do scout apenas pelo fluxo principal de metas do produto, respeitando o vínculo da meta.

Para codebooks:

- `authenticated` lê;
- ninguém escreve por policy no slice atual.

## 6.3 Observação importante

No produto atual, atletas autenticadas **serão** expostas a recortes do scout.

Regra:

- isso deve ocorrer apenas por `scout_athlete_views` e pelo fluxo principal de metas;
- não há leitura bruta automática de `scout_plays`, `scout_play_participations`, `scout_mental_events` ou `scout_play_validations` para atleta;
- campos mentais sensíveis não devem vazar para atleta sem decisão editorial explícita.

## 7. Estratégia de migração do legado

## 7.1 O que fazer com `scout_games`

Manter e evoluir.

## 7.2 O que fazer com `scout_events`

Congelar como legado.

Decisão:

- não deletar agora;
- não expandir o `payload`;
- usar como fonte de import se for necessário reaproveitar histórico.

## 7.3 Como migrar sem quebrar

Sequência recomendada:

1. criar novas tabelas canônicas sem mexer no runtime atual;
2. criar testes de grants/RLS do scout novo;
3. adicionar funções de escrita/leitura do novo contrato;
4. implementar um vertical slice mínimo;
5. só depois decidir migração de histórico do `payload`.

## 8. Vertical slice recomendado

O primeiro slice da Etapa B não deve tentar cobrir todo o workbook.

## 8.1 Slice mínimo recomendado

Implementar primeiro:

1. `scout_games` evoluído
2. `scout_live_entries`
3. `scout_plays`
4. `scout_play_participations`
5. `athlete_scout_profiles`
6. codebook mínimo para:
   - `FASE_DA_BOLA`
   - `SISTEMA_OFENSIVO`
   - `CONFIGURACAO_OFENSIVA`
   - `SISTEMA_DEFENSIVO`
   - `LISTA_ACAO_OFENSIVA`
   - `LISTA_ACAO_DEFENSIVA`
   - `LISTA_RESULTADO_FACTUAL`
   - `LISTA_CAUSA_PRINCIPAL`
   - `LISTA_PRIORIDADE_TREINO`

Motivo:

- isso já habilita captura rápida, promoção de jogada e participação;
- evita começar pela camada mental/editorial;
- permite validar o coração do scout com menor risco.

## 8.2 O que fica para o slice 2

- `scout_mental_events`
- `scout_play_validations`
- `scout_report_items`
- `scout_feedback_items`
- `scout_athlete_views`
- `scout_goal_links`
- contextos especiais completos
- import do legado

## 9. Migrações recomendadas

Sequência sugerida:

1. `0008_scout_contract_foundation.sql`
2. `0009_scout_codebook_foundation.sql`
3. `0010_scout_security_policies_and_grants.sql`
4. `0011_scout_rpc_write_read.sql`
5. `0012_scout_derived_contracts.sql`
6. `0013_scout_athlete_views_and_goal_links.sql`

## 9.1 RPCs do slice 1

O primeiro slice de runtime do scout não deve abrir acesso bruto às tabelas novas.

Decisão:

- escrita da captura rápida via `public.upsert_scout_live_entry(uuid, uuid, jsonb)`;
- promoção opcional via `public.promote_scout_live_entry(uuid, uuid)`;
- escrita da camada analítica completa via `public.upsert_scout_play_bundle(uuid, uuid, jsonb, jsonb)`;
- leitura via `public.get_scout_play_bundle(uuid, uuid)`;
- leitura atleta-facing via `public.get_athlete_scout_view(uuid, uuid, text, text)`;
- validação de codebook via helper interno `public.scout_field_value_allowed(...)`, sem grant para cliente.

### `upsert_scout_live_entry`

Contrato:

- recebe `team_id`, `scout_game_id` e um objeto `entry`;
- exige `auth.uid()` com papel `owner` ou `coach` no `team_id`;
- persiste a camada rápida de `COLETA_AO_VIVO` sem obrigar normalização imediata em participações;
- grava `audit_logs` ao final da operação.

Validações mínimas do slice 1:

- campos obrigatórios da captura rápida;
- listas de `phase_of_ball`, `offensive_system`, `defensive_system`, `factual_result` e `probable_cause` quando aplicáveis;
- lista de `training_priority` via codebook;
- semântica de `NAO_APLICA` e `NAO_OBSERVADO` respeitada pelo mapeamento de codebook.

### `promote_scout_live_entry`

Contrato:

- recebe `team_id` e `scout_live_entry_id`;
- exige `auth.uid()` com papel `owner` ou `coach` no `team_id`;
- promove a entrada rápida para `scout_plays` e, quando houver detalhe suficiente, para `scout_play_participations`;
- atualiza `promotion_status` e `promoted_to_play_id`.

### `upsert_scout_play_bundle`

Contrato:

- recebe `team_id`, `scout_game_id`, um objeto `play` e uma lista `participations`;
- exige `auth.uid()` com papel `owner` ou `coach` no `team_id`;
- aceita `insert` e `update` no mesmo endpoint por presença opcional de `play.id`;
- substitui o conjunto de participações da jogada no update;
- grava `audit_logs` ao final da operação.

Validações mínimas do slice 1:

- campos obrigatórios de `scout_plays`;
- listas de `phase_of_ball`, `offensive_system`, `offensive_configuration`, `defensive_system`, `factual_result` e `main_cause`;
- lista condicional de `action_code` em `scout_play_participations` conforme `participant_scope`;
- semântica de `NAO_APLICA` e `NAO_OBSERVADO` respeitando `allow_nao_aplica` e `allow_nao_observado` do mapeamento.

### `get_scout_play_bundle`

Contrato:

- recebe `team_id` e `scout_play_id`;
- exige `auth.uid()` com papel `owner` ou `coach` no `team_id`;
- retorna um `jsonb` com:
  - `play`
  - `participations`

Objetivo:

- expor um bundle estável para o frontend do slice 1;
- evitar acoplamento inicial a múltiplas queries cliente-side.

### `get_athlete_scout_view`

Contrato:

- recebe `team_id`, `athlete_id`, `view_type` e `reference_period` opcional;
- exige `auth.uid()` membro do time; quando o papel for atleta, a função só retorna dados do próprio vínculo;
- retorna projeções publicadas da tabela `scout_athlete_views`.

## 10. Tipos TypeScript

O arquivo [src/types/index.ts](/home/davis/cepraea-pwa/src/types/index.ts:1) ainda carrega tipos de scout antigos baseados em:

- `ScoutEvent`
- blocos fixos de ataque/defesa
- análises legadas acopladas ao formulário antigo

Decisão:

- esses tipos devem ser considerados legado;
- a Etapa B deve gerar novos contratos TypeScript alinhados ao banco;
- a UI nova deve consumir contratos normalizados, não `ScoutEvent` antigo.

Estado atual desta etapa:

- contratos normalizados do slice 1 já foram introduzidos em [src/types/index.ts](/home/davis/cepraea-pwa/src/types/index.ts:122);
- o client Supabase do scout novo já existe em [src/features/scout/scoutApi.ts](/home/davis/cepraea-pwa/src/features/scout/scoutApi.ts:1);
- o frontend mínimo do slice 1 já está exposto em [src/features/scout/pages/ScoutWorkspacePage.tsx](/home/davis/cepraea-pwa/src/features/scout/pages/ScoutWorkspacePage.tsx:1) e conectado à navegação principal;
- `ScoutEvent` e o runtime IndexedDB permanecem apenas como legado, sem receber novos acoplamentos.

## 11. O que o sistema realmente precisa agora

Depois da Etapa A, o próximo passo lógico **não** é:

- reativar páginas do scout;
- editar `EventFormV2.tsx`;
- recriar store local;
- persistir mais `payload jsonb`.

O que o sistema precisa agora é:

1. migração foundation do scout normalizado;
2. RLS e grants corretos;
3. codebook mínimo versionado;
4. tipos novos;
5. um slice de captura rápida + promoção analítica;
6. projeções controladas para a atleta.

## 12. Veredito

A Etapa B fica aberta com esta posição:

- manter `scout_games`;
- congelar `scout_events.payload` como legado;
- adotar `scout_live_entries` como camada própria de `COLETA_AO_VIVO`;
- normalizar o scout por contratos;
- não espelhar a planilha literalmente;
- começar por `scout_live_entries` + `scout_plays` + `scout_play_participations` + codebook mínimo;
- adiar mental/relatório/feedback/projeções da atleta para o segundo slice.

Esse é o menor caminho tecnicamente correto para recolocar o scout no produto sem voltar ao modelo frágil anterior.
