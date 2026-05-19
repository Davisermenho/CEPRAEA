---
tipo: MEMORANDO-ESTRATEGICO
nome: "Refazer o Scout — versão validada"
papel: "Memorando histórico de exploração, hipóteses e decisões intermediárias sobre o refactor do scout."
autoridade: "Histórico de trabalho. Não é a autoridade normativa final quando conflitar com os contratos ativos do diretório docs/scout."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "somente para recuperar contexto de investigação, alternativas descartadas ou motivação histórica de decisões posteriores."
atualizado_por: "Codex — 18 de maio de 2026"
quando_atualizar: "apenas para anotação histórica adicional; novas decisões devem entrar nos contratos ativos."
validade: "2026-05-18"
status: HISTORICO
status_nota: "Documento estratégico histórico. O contrato vivo do scout está nos documentos ativos `scout-ssot`, `scout-campos`, `scout-listas`, `scout-contrato-tecnico-supabase`, `scout-validacoes` e `scout-rastreabilidade`."
conflito: "Se divergir dos documentos ativos do scout, prevalecem os documentos ativos."
proibido:
  - "Não usar este documento isoladamente para implementar schema, runtime, RLS, RPCs ou UX do scout."
  - "Não tratar hipóteses ou alternativas aqui discutidas como decisão vigente sem confirmação nos contratos ativos."
nao_cobre: "Contrato técnico final consolidado, políticas finais de visibilidade da atleta e estado normativo atual do scout."
---

# Refazer o Scout: versão validada

> **Status:** histórico. Este arquivo preserva raciocínios, opções e conflitos intermediários. Para implementação e produto atuais, use os contratos ativos em `docs/scout/`.

## Base validada

Esta validação toma como fonte de verdade:

- [Codificação_e_Validação_do_Scout.md](/home/davis/cepraea-pwa/.files/Codificação_e_Validação_do_Scout.md:1)
- [Tabela_Mestre_dos_Campos.xlsx](</home/davis/cepraea-pwa/.files/analise/Tabela_Mestre_dos_Campos.xlsx>)

Artefatos documentais de apoio para implementação aderente:

1. [scout-ssot.md](/home/davis/cepraea-pwa/docs/scout/scout-ssot.md:1)
2. [scout-campos.md](/home/davis/cepraea-pwa/docs/scout/scout-campos.md:1)
3. [scout-listas.md](/home/davis/cepraea-pwa/docs/scout/scout-listas.md:1)
4. [scout-dicionario-codigos.md](/home/davis/cepraea-pwa/docs/scout/scout-dicionario-codigos.md:1)
5. [scout-validacoes.md](/home/davis/cepraea-pwa/docs/scout/scout-validacoes.md:1)
6. [scout-rastreabilidade.md](/home/davis/cepraea-pwa/docs/scout/scout-rastreabilidade.md:1)

Regra de precedência confirmada pelo manual:

1. o manual consolidado é a SSOT semântica do scout;
2. a `TABELA_MESTRE` implementa metadados derivados do manual;
3. a planilha não pode criar conceito novo nem corrigir silêncio metodológico por conta própria.

Consequência direta: o documento anterior estava superestimando a planilha como SSOT semântica autônoma e citando `.files/MANUSCOUT.md` como base principal. Isso não está validado pelos SSOTs atuais.

## O que está objetivamente validado

### Arquitetura oficial do scout

Os SSOTs confirmam estas abas oficiais:

- `COLETA_SCOUT`
- `COLETA_AO_VIVO`
- `PARTICIPACOES`
- `EVENTOS_MENTAIS`
- `CAD_ATLETAS`
- `CAD_EQUIPES`
- `LISTAS`
- `VALIDACAO`
- `RELATORIO`
- `FEEDBACK`
- `DASHBOARD`
- `TABELA_MESTRE`

Também está validado que:

- `COLETA_AO_VIVO` tem `18` campos oficiais;
- `PARTICIPACOES` é derivada da base principal;
- `EVENTOS_MENTAIS` fica em tabela longa própria;
- `FASE_DA_BOLA` é gatilho lógico de preenchimento;
- `STATUS_VALIDACAO` inicial deve ser `PENDENTE`, salvo exceções raras.

### Campos oficiais de `COLETA_AO_VIVO`

Os 18 campos mínimos oficiais confirmados no manual e na `TABELA_MESTRE` são:

1. `ID_JOGADA`
2. `ID_JOGO`
3. `TEMPO_JOGO`
4. `FASE_DA_BOLA`
5. `EQUIPE_ANALISADA`
6. `FASE_EQUIPE_ANALISADA`
7. `SISTEMA_OFENSIVO`
8. `SISTEMA_DEFENSIVO`
9. `ATLETA_PRINCIPAL`
10. `ACAO_PRINCIPAL`
11. `TIPO_FINALIZACAO`
12. `RESULTADO_FACTUAL`
13. `PONTOS_JOGADA`
14. `CAUSA_PROVAVEL`
15. `PRIORIDADE_TREINO`
16. `VIDEO_REF`
17. `STATUS_VALIDACAO`
18. `OBS_GERAL`

### Listas e tipos confirmados para `COLETA_AO_VIVO`

Os pontos abaixo estavam corretos no documento anterior e permanecem validados:

- `FASE_DA_BOLA` aceita apenas `AT_POS`, `DEF_POS`, `TRANS_OF`, `TRANS_DEF`;
- `FASE_EQUIPE_ANALISADA` aceita `ATAQUE`, `DEFESA`, `TRANS_OF`, `TRANS_DEF`, `TROCA`, `NAO_OBSERVADO`;
- `EQUIPE_ANALISADA` referencia `CAD_EQUIPES.ID_EQUIPE`;
- `ATLETA_PRINCIPAL` referencia `CAD_ATLETAS.ID_ATLETA`;
- `ACAO_PRINCIPAL` é `TEXTO` e a definição oficial é "texto curto controlado da ação principal";
- `PONTOS_JOGADA` é `NUMERO`;
- `VIDEO_REF` é `REFERENCIA` livre controlada;
- `OBS_GERAL` é `TEXTO` opcional.

Correção importante:

- em `COLETA_AO_VIVO`, `TIPO_FINALIZACAO` validado pela `TABELA_MESTRE` contém `SIMPLES`, `GIRO`, `AEREA`, `ESPECIALISTA`, `GOLEIRA`, `6M`, `SHOOTOUT`, `NAO_OBSERVADO`;
- os códigos `CONTRA` e `GOL_CONTRA` apareciam no texto anterior, mas não fazem parte da lista oficial desta aba.

## O que o código atual realmente já oferece

### Fundação de banco reaproveitável

Está confirmado no código que já existem:

- `public.scout_plays` em [0008_scout_contract_foundation.sql](/home/davis/cepraea-pwa/supabase/migrations/0008_scout_contract_foundation.sql:1)
- `public.scout_play_participations` em [0008_scout_contract_foundation.sql](/home/davis/cepraea-pwa/supabase/migrations/0008_scout_contract_foundation.sql:79)
- codebook central mínimo em [0009_scout_codebook_foundation.sql](/home/davis/cepraea-pwa/supabase/migrations/0009_scout_codebook_foundation.sql:1)
- RLS e grants em [0010_scout_security_policies_and_grants.sql](/home/davis/cepraea-pwa/supabase/migrations/0010_scout_security_policies_and_grants.sql:1)
- RPC de escrita/leitura do bundle em [0011_scout_rpc_write_read.sql](/home/davis/cepraea-pwa/supabase/migrations/0011_scout_rpc_write_read.sql:1)
- runtime Supabase do scout em [scoutApi.ts](/home/davis/cepraea-pwa/src/features/scout/scoutApi.ts:1)

O documento anterior acertava no ponto central: a fundação técnica não deve ser descartada por padrão.

### Gaps reais entre `COLETA_AO_VIVO` e o backend atual

Os seguintes gaps estão confirmados no schema/runtime atual:

- `ATLETA_PRINCIPAL` não tem coluna própria em `scout_plays`; hoje cabe só de forma indireta em `scout_play_participations.athlete_id`;
- `ACAO_PRINCIPAL` não tem coluna própria em `scout_plays`; hoje cabe só de forma indireta em `scout_play_participations.action_code`;
- `PRIORIDADE_TREINO` não tem coluna própria em `scout_plays`; hoje existe em `scout_play_participations.training_priority`;
- `PONTOS_JOGADA` no SSOT é número, mas `public.scout_plays.play_points` hoje é `text`;
- `EQUIPE_ANALISADA` no SSOT é referência a equipe cadastrada, mas o runtime atual do jogo ainda trabalha com `analyzed_team` textual em `scout_games`;
- o codebook mínimo atual não cobre toda a superfície de `COLETA_AO_VIVO`.

Em especial, a migration `0009` hoje semeia:

- `LISTA_FASES`
- `LISTA_SISTEMA_OFENSIVO`
- `LISTA_CONFIGURACAO_OFENSIVA`
- `LISTA_SISTEMA_DEFENSIVO`
- `LISTA_ACAO_OFENSIVA`
- `LISTA_ACAO_DEFENSIVA`
- `LISTA_RESULTADO_FACTUAL`
- `LISTA_CAUSA_PRINCIPAL`
- `LISTA_PRIORIDADE_TREINO`

Portanto, o documento anterior estava correto ao dizer que o codebook atual ainda é parcial, mas impreciso quando tratava isso como se a tela nova já exigisse necessariamente um novo contrato persistido.

### Problema semântico da UI atual

A UI atual em [ScoutWorkspacePage.tsx](/home/davis/cepraea-pwa/src/features/scout/pages/ScoutWorkspacePage.tsx:1) continua semanticamente desalinhada com a camada aprovada do scout porque expõe, entre outros:

- `participantScope`
- `participantSide`
- `slotOrder`
- `ANALYZED`
- `OPPONENT`

Esse diagnóstico do texto anterior permanece validado: a UI atual serve como spike funcional, não como referência final de produto.

## O que precisava ser corrigido no documento anterior

### Correções obrigatórias

1. A base documental principal não é `.files/MANUSCOUT.md`; a base válida para esta revisão é o manual consolidado `Codificação_e_Validação_do_Scout.md` com a `Tabela_Mestre` como derivada.
2. A planilha não pode ser tratada como SSOT semântica equivalente ao manual.
3. A lista de `TIPO_FINALIZACAO` de `COLETA_AO_VIVO` precisava ser corrigida.
4. A proposta de um contrato próprio `scout_live_entries` não é um fato semântico confirmado pelos SSOTs; ela deve ser lida como decisão técnica de execução adotada por este documento.

### O que segue válido como direção

Estas direções continuam coerentes e úteis:

- auditar implementação contra SSOT antes de expandir a UI;
- reaproveitar a fundação de banco e segurança;
- refatorar a camada de UX para obedecer `Nome visível`, `Tipo`, `Obrigatório`, `Opções/Origem` e `Regra/Definição`;
- expandir o codebook para refletir as listas aprovadas;
- tratar a coleta ao vivo como experiência enxuta e sem linguagem técnica de banco.

## Veredito validado

### Reaproveitar

- migrations `0008`, `0010` e a base da `0011`;
- boa parte dos testes SQL já existentes;
- `scoutApi.ts` como camada de acesso;
- rota e navegação atuais;
- a noção de que a fundação do scout já existe.

### Refatorar

- `0009_scout_codebook_foundation.sql` para cobrir as listas reais da SSOT;
- tipos do scout em [src/types/index.ts](/home/davis/cepraea-pwa/src/types/index.ts:116);
- `ScoutWorkspacePage.tsx`;
- o mapeamento entre `COLETA_AO_VIVO` e o bundle atual `play + participations`;
- a documentação técnica derivada do scout que ainda trate planilha e manual como equivalentes.

### O que não vem fechado pela SSOT, mas precisa de decisão técnica

Os SSOTs e o código atual não fecham sozinhos, de forma obrigatória, se a implementação deve:

- criar uma nova tabela como `scout_live_entries`; ou
- manter tudo apenas em `scout_plays` com adapter.

O que já está validado é o critério da decisão:

- preservar a semântica de `COLETA_AO_VIVO`;
- não criar duas verdades concorrentes para o mesmo lance;
- acomodar os gaps de `ATLETA_PRINCIPAL`, `ACAO_PRINCIPAL` e `PRIORIDADE_TREINO`;
- permitir derivação posterior para `PARTICIPACOES` e demais camadas.

## Decisão de execução deste documento

Para fins de execução do refactor, este documento fecha a decisão assim:

- a implementação deve seguir com uma camada própria de persistência para `COLETA_AO_VIVO`;
- o nome de trabalho recomendado permanece `scout_live_entries`;
- `scout_plays` e `scout_play_participations` permanecem como fundação analítica reaproveitável, não como destino direto obrigatório da coleta rápida.

Justificativa:

- a SSOT separa explicitamente `COLETA_AO_VIVO`, `COLETA_SCOUT` e `PARTICIPACOES`;
- os três gaps centrais do modelo atual (`ATLETA_PRINCIPAL`, `ACAO_PRINCIPAL`, `PRIORIDADE_TREINO`) continuam tortos se forem forçados como participação derivada desde o primeiro clique;
- a UI aprovada da coleta ao vivo pede um contrato próprio mais direto do que o bundle atual.

Leitura correta desta decisão:

- isso é uma decisão de implementação adotada por `REFAZERSCOUT.md`;
- não é uma nova SSOT semântica competindo com o manual;
- é a decisão técnica escolhida para executar o refactor de forma aderente aos SSOTs.

## Conclusão prática

O `REFAZERSCOUT.md` validado fica assim:

- a SSOT semântica é o manual consolidado;
- a `TABELA_MESTRE` orienta metadados e implementação;
- a fundação técnica atual é reaproveitável;
- a UI atual do `/scout` não é referência final;
- o maior trabalho imediato é alinhar codebook, tipos, payload e UX à `COLETA_AO_VIVO`;
- a decisão operacional deste documento é executar o refactor com uma camada própria de persistência para `COLETA_AO_VIVO`, usando o backend atual como fundação reaproveitada.



Sim. Para esses 3 campos, a minha recomendação é **criar um contrato próprio de `COLETA_AO_VIVO`**.

Não porque o backend atual esteja ruim, mas porque esses 3 campos têm uma semântica diferente da camada normalizada de `play + participations`.

Os 3 campos são:

- `ATLETA_PRINCIPAL`
- `ACAO_PRINCIPAL`
- `PRIORIDADE_TREINO`

E o problema de fundo é este:

- na planilha, eles pertencem à **coleta rápida do lance**
- no backend atual, eles só cabem de forma torta dentro de `scout_play_participations`
- isso mistura **coleta primária** com **detalhamento analítico**

## Comparação direta

| Opção | Vantagem | Problema real | Veredito |
|---|---|---|---|
| `Resolver no adapter` | Menor mudança imediata | Esconde conceitos da coleta em uma participação técnica artificial | **Não recomendo** |
| `Adicionar colunas` | Simples e rápido | Mistura quick-capture com modelo detalhado e cria duplicidade futura com `PARTICIPACOES` | **Aceitável como atalho, mas não ideal** |
| `Criar contrato próprio de coleta ao vivo` | Fica fiel à planilha e separa coleta de derivação | Exige mais trabalho estrutural agora | **Recomendado** |

## 1. Resolver no adapter

Seria algo como:
- a tela `COLETA_AO_VIVO` recebe `ATLETA_PRINCIPAL`
- o runtime cria automaticamente uma participação
- joga:
  - `ATLETA_PRINCIPAL -> athlete_id`
  - `ACAO_PRINCIPAL -> action_code`
  - `PRIORIDADE_TREINO -> training_priority`

### Por que parece bom
- reaproveita o que já existe
- não muda schema
- aproveita `upsert_scout_play_bundle`

### Por que é semanticamente ruim
Porque esses 3 campos **não são equivalentes perfeitos** a uma participação detalhada.

**`ATLETA_PRINCIPAL`**
- na coleta ao vivo, ela é a protagonista resumida do lance
- isso não significa automaticamente que você já quer abrir a lógica completa de participações

**`ACAO_PRINCIPAL`**
- na planilha, ela é `TEXTO curto controlado`
- no backend atual, `action_code` foi pensado como ação estruturada de participação
- isso não é a mesma coisa

**`PRIORIDADE_TREINO`**
- na coleta ao vivo, ela é uma leitura provisória do lance
- em `participations`, ela fica parecendo prioridade individual de uma atleta específica
- isso pode distorcer o sentido

### Risco principal
Você cria uma mentira técnica:
- parece que o sistema tem participação detalhada
- mas na prática ele só está guardando um resumo da coleta

### Veredito
**Não recomendo como solução principal.**  
Pode servir como gambiarra temporária, mas vai contaminar o domínio.

---

## 2. Adicionar colunas em `scout_plays`

Seria algo como adicionar em `scout_plays`:
- `main_athlete_id`
- `main_action`
- `live_training_priority`

### Por que é melhor que adapter
- a tela de `COLETA_AO_VIVO` passa a ter destino direto
- o backend fica mais simples para salvar/carregar
- evita a participação artificial

### Por que ainda não é a melhor opção
Porque `scout_plays` hoje está caminhando para ser:
- a camada normalizada do lance
- base para detalhamento
- base para participação, mental, validação, relatório

Se você coloca esses 3 campos ali, precisa responder depois:

- `main_athlete_id` é só da coleta rápida ou é verdade canônica do lance?
- `main_action` continua texto curto ou vira taxonomia oficial?
- `live_training_priority` é do lance bruto ou da análise consolidada?

Quando `PARTICIPACOES` entrar de verdade, pode haver conflito:

- o lance tem `ATLETA_PRINCIPAL = Aline`
- mas nas participações detalhadas a protagonista real vira Gabriela
- qual das duas vale?

### Quando essa opção faz sentido
Se você quiser um caminho tático:
- rápido
- com menos refatoração
- e aceitar dívida técnica controlada

### Veredito
**É aceitável como solução de transição**, mas eu não escolheria como arquitetura-alvo.

---

## 3. Criar contrato próprio de `COLETA_AO_VIVO`

Essa é a opção que mais respeita a planilha.

A lógica é:

- `COLETA_AO_VIVO` é uma camada própria de entrada
- ela não precisa ser idêntica à camada normalizada final
- depois, esse registro pode:
  - ficar como coleta rápida auditável
  - e/ou ser promovido para `scout_plays + participations`

### Por que isso é o mais correto
Porque a própria planilha já separa:
- `COLETA_AO_VIVO`
- `COLETA_SCOUT`
- `PARTICIPACOES`
- `EVENTOS_MENTAIS`
- `RELATORIO`
- `FEEDBACK`

Ou seja: a fonte já está dizendo que essas camadas **não são a mesma coisa**.

### O que esse contrato próprio resolveria
`ATLETA_PRINCIPAL`
- vira campo nativo da coleta rápida
- sem forçar participação detalhada

`ACAO_PRINCIPAL`
- continua sendo o texto curto controlado que a planilha quer
- sem obrigar mapeamento precoce para `action_code`

`PRIORIDADE_TREINO`
- continua sendo leitura provisória do lance
- sem fingir que já é prioridade derivada por participação

### Forma recomendada
Eu faria assim:

**Tabela/contrato novo**
- algo como `scout_live_captures` ou `scout_live_entries`

Campos:
- os 18 campos da aba `COLETA_AO_VIVO`
- `team_id`
- `scout_game_id`
- `created_at`
- `updated_at`
- opcionalmente `derived_scout_play_id`

### Relação com o resto do sistema
- `scout_games` continua sendo o contêiner do jogo
- `scout_live_entries` vira a camada de captura rápida
- `scout_plays` continua como camada normalizada do lance
- `scout_play_participations` continua como detalhamento por atleta

### Benefício maior
Você preserva a verdade do processo:

- **coletar rápido**
- **validar**
- **detalhar depois**

Em vez de fingir que tudo já nasceu detalhado.

### Veredito
**Essa é a solução recomendada.**

---

## Minha recomendação final

A ordem correta para esses 3 campos é:

1. **criar contrato próprio de `COLETA_AO_VIVO`**
2. manter `ATLETA_PRINCIPAL`, `ACAO_PRINCIPAL` e `PRIORIDADE_TREINO` como campos nativos dessa camada
3. depois decidir como um registro ao vivo:
   - permanece só como coleta
   - ou promove para `scout_plays`
   - ou gera `participations`

## Em uma frase

- `resolver no adapter` = rápido, mas semânticamente errado
- `adicionar colunas` = melhor, mas ainda mistura camadas
- `criar contrato próprio` = **a decisão certa se o objetivo é implementar a planilha aprovada com fidelidade**

## Recomendação prática

Se você me perguntar “o que o sistema realmente necessita agora?”, a resposta é:

**um contrato próprio de `COLETA_AO_VIVO`, usando o backend atual como fundação, mas sem forçar esses 3 campos dentro de `participations`.**

Se quiser, o próximo passo eu posso te entregar é a **proposta concreta desse contrato**, com:
- nome recomendado
- campos
- destino no banco
- relação com `scout_games`
- relação futura com `scout_plays` e `PARTICIPACOES`
```




# CONTRATO **`scout_live_entries`**

```md
- **`scout_live_entries`**

Esse nome é melhor que `captures` porque:
- comunica que é um **registro operacional**
- não pressupõe que já virou análise detalhada
- combina bem com `scout_games`, `scout_plays` e `scout_play_participations`

Se quiser um nome em português no domínio documental, ele pode ser tratado como:
- **Coleta ao vivo**
mas no banco eu manteria `scout_live_entries`.

**Objetivo do contrato**

Representar **um lance registrado na camada rápida de coleta**, fiel à aba `COLETA_AO_VIVO`, sem obrigar normalização prematura em `play + participations`.

Ele serve para:
- registrar rápido
- revisar
- corrigir
- validar
- depois promover, quando fizer sentido, para a camada analítica detalhada

---

**Campos**

Eu modelaria assim.

**Identidade e vínculo**
- `id uuid primary key`
- `team_id uuid not null`
- `scout_game_id uuid not null`

**Campos da planilha**
- `entry_code text not null`
  - corresponde a `ID_JOGADA`
- `game_code_snapshot text`
  - opcional, se quiser espelhar o `ID_JOGO` visível; o vínculo real continua em `scout_game_id`
- `game_clock text not null`
  - `TEMPO_JOGO`
- `phase_of_ball text not null`
  - `FASE_DA_BOLA`
- `analyzed_team_id uuid`
  - `EQUIPE_ANALISADA`
- `analyzed_team_phase text not null`
  - `FASE_EQUIPE_ANALISADA`
- `offensive_system text`
  - `SISTEMA_OFENSIVO`
- `defensive_system text`
  - `SISTEMA_DEFENSIVO`
- `main_athlete_id uuid`
  - `ATLETA_PRINCIPAL`
- `main_action_text text`
  - `ACAO_PRINCIPAL`
- `finish_type text`
  - `TIPO_FINALIZACAO`
- `factual_result text not null`
  - `RESULTADO_FACTUAL`
- `play_points smallint`
  - `PONTOS_JOGADA`
- `probable_cause text`
  - `CAUSA_PROVAVEL`
- `training_priority text`
  - `PRIORIDADE_TREINO`
- `video_ref text`
  - `VIDEO_REF`
- `validation_status text not null default 'PENDENTE'`
  - `STATUS_VALIDACAO`
- `general_note text`
  - `OBS_GERAL`

**Controle de ciclo**
- `source text not null default 'AO_VIVO'`
- `promoted_to_play_id uuid`
  - nullable, aponta para `scout_plays.id` quando houver promoção
- `promoted_at timestamptz`
- `created_by uuid`
- `updated_by uuid`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

---

**Destino no banco**

Tabela nova:

- **`public.scout_live_entries`**

Constraints principais:
- FK `(scout_game_id, team_id)` -> `scout_games(id, team_id)`
- FK `(main_athlete_id, team_id)` -> `athletes(id, team_id)`
- FK `(promoted_to_play_id, team_id)` -> `scout_plays(id, team_id)` se quiser manter consistência forte
- unique recomendado:
  - `(team_id, scout_game_id, entry_code)`

RLS:
- mesma regra do resto do scout:
  - `member read`
  - `owner/coach write`

Codebook:
- os campos de lista devem apontar para o mesmo codebook central
- `main_action_text` fica fora de enum rígido no início, porque a planilha trata como `TEXTO curto controlado`

---

**Relação com `scout_games`**

`scout_games` continua sendo o **contêiner do jogo**.

Relação:
- `1 scout_game` -> `N scout_live_entries`

Responsabilidades:
- `scout_games`
  - contexto macro do jogo
  - data
  - adversária
  - local
  - status do jogo
- `scout_live_entries`
  - cada lance rápido coletado dentro desse jogo

Importante:
- `ID_JOGO` da planilha não precisa virar uma segunda verdade paralela
- no sistema, a verdade relacional é `scout_game_id`
- se você quiser exibir um “código do jogo” amigável, isso pode ser um campo derivado do jogo, não a chave lógica principal

---

**Relação futura com `scout_plays`**

Aqui está a parte mais importante.

`scout_live_entries` **não substitui** `scout_plays`.  
Ele antecede ou convive com ele.

Eu recomendo três estados possíveis:

**1. Entrada só coletada**
- existe em `scout_live_entries`
- ainda não virou lance detalhado

**2. Entrada promovida**
- existe em `scout_live_entries`
- gerou um registro em `scout_plays`
- `promoted_to_play_id` preenchido

**3. Entrada absorvida com detalhamento**
- existe em `scout_live_entries`
- gerou `scout_play`
- gerou também `scout_play_participations`
- opcionalmente depois `mental_events`, `play_validations`, etc.

Então a relação é:

- `scout_live_entries` = **camada de coleta rápida**
- `scout_plays` = **camada analítica normalizada do lance**

Promoção recomendada:
- manual primeiro
- automática só depois que a semântica estiver estável

---

**Relação futura com `PARTICIPACOES`**

`PARTICIPACOES` não deve nascer automaticamente da coleta rápida como regra cega.

O correto é:

- `ATLETA_PRINCIPAL` em `scout_live_entries` é só a protagonista resumida
- `PARTICIPACOES` é o detalhamento analítico do lance

Então:

- `1 scout_live_entry`
- pode gerar `1 scout_play`
- que pode gerar `N scout_play_participations`

Isso evita a mentira semântica de tratar o resumo do lance como se já fosse participação estruturada.

Exemplo:
- na coleta ao vivo:
  - atleta principal = Gabriela
  - ação principal = passe para pivô
- no detalhamento posterior:
  - Gabriela participou
  - pivô participou
  - defesa adversária participou
  - goleira participou

Ou seja:
- `ATLETA_PRINCIPAL` não é sinônimo de “única participação relevante”
- é só a âncora rápida do lance

---

**Fluxo recomendado**

1. Criar ou selecionar `scout_game`
2. Registrar lance em `scout_live_entries`
3. Revisar/validar lance rápido
4. Quando necessário, promover para `scout_play`
5. Abrir detalhamento em `PARTICIPACOES`

---

**Veredito**

A proposta concreta é:

- **Nome recomendado**: `public.scout_live_entries`
- **Função**: camada própria de `COLETA_AO_VIVO`
- **Campos**: os 18 da planilha + metadados de promoção/auditoria
- **Relação com `scout_games`**: `N:1`
- **Relação com `scout_plays`**: promoção opcional via `promoted_to_play_id`
- **Relação com `PARTICIPACOES`**: indireta, sempre via `scout_play`, nunca forçada no ato da coleta

Se quiser, o próximo passo eu posso te entregar é a **especificação da promoção `scout_live_entry -> scout_play`**, definindo exatamente o que copia, o que transforma e o que continua pendente para `PARTICIPACOES`.
```
A melhor decisão **não é começar pela tela do zero**.

A melhor decisão agora é **auditar a implementação do scout que já existe, mas com foco de refatoração**, não com foco de rediscutir o manual.

Esse ponto importa porque hoje o sistema está neste estado:

- a **SSOT aprovada** existe em [.files/MANUSCOUT.md](/home/davis/cepraea-pwa/.files/MANUSCOUT.md:1) e [Tabela_Mestre_dos_Campos.xlsx](</home/davis/cepraea-pwa/.files/analise/Tabela_Mestre_dos_Campos.xlsx>)
- a **fundação técnica** do scout já existe em:
  - [supabase/migrations/0008_scout_contract_foundation.sql](/home/davis/cepraea-pwa/supabase/migrations/0008_scout_contract_foundation.sql:1)
  - [0009](/home/davis/cepraea-pwa/supabase/migrations/0009_scout_codebook_foundation.sql:1)
  - [0010](/home/davis/cepraea-pwa/supabase/migrations/0010_scout_security_policies_and_grants.sql:1)
  - [0011](/home/davis/cepraea-pwa/supabase/migrations/0011_scout_rpc_write_read.sql:1)
- o **client/runtime** já existe em [src/features/scout/scoutApi.ts](/home/davis/cepraea-pwa/src/features/scout/scoutApi.ts:1)
- a **UI atual** já existe em [src/features/scout/pages/ScoutWorkspacePage.tsx](/home/davis/cepraea-pwa/src/features/scout/pages/ScoutWorkspacePage.tsx:1)

Então o risco real agora é este:

- se você começar “pela tela” sem auditar o que já foi implementado, pode **jogar fora fundação boa**
- se você começar “pelo banco” de novo, pode **perder tempo repetindo algo que já está pronto**
- se você seguir expandindo a UI atual sem auditoria, pode **solidificar uma UX semanticamente errada**

## O que o sistema realmente precisa agora

Ele precisa de uma **auditoria de aderência da implementação ao scout aprovado**.

Não é auditoria metodológica.  
Essa fase já passou.

É auditoria de implementação, para responder 4 perguntas objetivas:

1. **O que já existe e pode ser reaproveitado sem refatoração?**
2. **O que existe, mas está com semântica errada na UI?**
3. **O que existe tecnicamente, mas está no nível errado da experiência?**
4. **O que ainda não existe e precisa ser implementado do zero?**

## Minha avaliação técnica hoje

### O backend não deve ser descartado de saída
A parte de Supabase e RPC muito provavelmente é **reaproveitável como fundação**, porque ela resolve:

- persistência de jogos
- persistência de jogadas
- persistência de participações
- codebook/listas
- leitura e escrita seguras

Ou seja: a base relacional não parece ser o principal problema.

### A UI atual não deve ser tomada como referência de produto
A tela atual já mostra que a camada de UX ficou contaminada por termos do contrato técnico, como:

- `participantScope`
- `participantSide`
- `slotOrder`
- códigos crus como `AT_POS`
- linguagem interna como `ANALYZED`

Isso indica que a UI atual deve ser tratada como:

- **spike funcional**
- **prova de persistência**
- **não como fluxo final do scout**

### O maior trabalho daqui para frente é de tradução da SSOT para fluxo
Porque a planilha já define:

- sequência
- blocos
- nome visível
- comportamento de listas
- contexto de uso

Então o trabalho certo não é “inventar uma tela”.  
É **mapear a implementação existente para a experiência já definida na planilha**.

## Portanto: qual é a melhor decisão?

**Auditar primeiro, implementar logo em seguida.**

Mas tem um detalhe importante:  
essa auditoria deve ser **curta, objetiva e orientada à refatoração**.

Não é uma auditoria longa de descoberta.  
É uma auditoria de corte técnico.

## Como eu faria isso na prática

Eu dividiria a próxima etapa em 3 blocos.

### 1. Auditoria de aderência implementação × SSOT
Comparar:

- workbook/manual aprovados
- schema + RPCs + types + scoutApi
- UI atual do `/scout`

Saída esperada:
- `reaproveita`
- `refatora`
- `descarta`
- `falta implementar`

### 2. Congelamento do que já serve
Provavelmente:
- migrations `0008–0011`
- testes SQL do scout
- parte de `scoutApi.ts`
- parte dos tipos

### 3. Refatoração da UX a partir da planilha
Começar pela experiência de:
- `COLETA_AO_VIVO`
- depois `COLETA_SCOUT`
- depois `PARTICIPACOES`

Isso é mais seguro do que continuar incrementando `ScoutWorkspacePage.tsx`.

## Resposta curta à sua pergunta

**Não, eu não começaria pela tela diretamente.**  
**Também não recomeçaria do zero.**

O próximo passo lógico é:

**auditar o scout já implementado para saber exatamente o que será reaproveitado, o que precisa ser refatorado e o que deve ser descartado.**

Essa é a melhor decisão porque o sistema hoje já tem fundação suficiente para não desperdiçar trabalho, mas ainda não tem aderência suficiente na UX para avançar sem esse corte.

## Veredito

A ordem correta agora é:

1. **auditar a implementação do scout existente**
2. **decidir o reaproveitamento**
3. **refatorar a UX com base na planilha aprovada**
4. **só então expandir novas telas**

Se quiser, o próximo passo eu posso fazer é te entregar exatamente essa auditoria em formato objetivo:

- `arquivo/componente`
- `o que ele faz hoje`
- `aderência ao workbook/manual`
- `reaproveitar / refatorar / descartar`

Sim. A decisão correta agora é **auditar o que já existe e cortar com precisão o que será reaproveitado**. Abaixo está a auditoria objetiva do scout implementado hoje.

**Fundação de dados**

| Arquivo/componente | O que faz hoje | Aderência ao workbook/manual | Decisão |
|---|---|---|---|
| [supabase/migrations/0008_scout_contract_foundation.sql](/home/davis/cepraea-pwa/supabase/migrations/0008_scout_contract_foundation.sql:1) | Cria as tabelas novas do scout: `scout_plays`, `scout_play_participations`, `scout_mental_events`, `scout_play_validations`, `athlete_scout_profiles`, `scout_catalog_teams`. | **Parcial boa.** A estrutura cobre blocos reais do scout e não conflita com a SSOT. O problema não é o banco; é que o slice atual só usa uma parte pequena disso. | **Reaproveitar** |
| [supabase/migrations/0009_scout_codebook_foundation.sql](/home/davis/cepraea-pwa/supabase/migrations/0009_scout_codebook_foundation.sql:1) | Cria `scout_code_lists`, `scout_code_values`, `scout_field_codebook_map` e semeia listas mínimas do slice 1. | **Parcial.** A ideia é correta, mas o seed ainda é um recorte mínimo e não a planilha aprovada inteira. | **Refatorar** |
| [supabase/migrations/0010_scout_security_policies_and_grants.sql](/home/davis/cepraea-pwa/supabase/migrations/0010_scout_security_policies_and_grants.sql:1) | Aplica RLS e grants do scout novo. | **Alta.** Segurança multi-tenant e leitura de codebook estão alinhadas ao que o sistema precisa, independentes da UX. | **Reaproveitar** |
| [supabase/migrations/0011_scout_rpc_write_read.sql](/home/davis/cepraea-pwa/supabase/migrations/0011_scout_rpc_write_read.sql:1) | Expõe RPCs de leitura/escrita do bundle `play + participations`, com validação pelo codebook. | **Parcial boa.** A interface é útil, mas está orientada ao slice técnico atual, não à sequência operacional da planilha. | **Refatorar** |

**Testes SQL**

| Arquivo/componente | O que faz hoje | Aderência ao workbook/manual | Decisão |
|---|---|---|---|
| [supabase/tests/scout_contract_foundation.test.sql](/home/davis/cepraea-pwa/supabase/tests/scout_contract_foundation.test.sql:1) | Valida tabelas, constraints e integridade da foundation. | **Alta** para camada de banco. | **Reaproveitar** |
| [supabase/tests/scout_codebook_foundation.test.sql](/home/davis/cepraea-pwa/supabase/tests/scout_codebook_foundation.test.sql:1) | Valida codebook mínimo e mappings. | **Parcial.** Continua útil, mas terá que crescer para refletir a planilha aprovada. | **Refatorar** |
| [supabase/tests/scout_security_grants.test.sql](/home/davis/cepraea-pwa/supabase/tests/scout_security_grants.test.sql:1) | Testa grants. | **Alta** | **Reaproveitar** |
| [supabase/tests/scout_security_rls.test.sql](/home/davis/cepraea-pwa/supabase/tests/scout_security_rls.test.sql:1) | Testa RLS. | **Alta** | **Reaproveitar** |
| [supabase/tests/scout_rpc_grants.test.sql](/home/davis/cepraea-pwa/supabase/tests/scout_rpc_grants.test.sql:1) | Testa grants das RPCs. | **Alta** | **Reaproveitar** |
| [supabase/tests/scout_rpc_write_read.test.sql](/home/davis/cepraea-pwa/supabase/tests/scout_rpc_write_read.test.sql:1) | Testa gravação/leitura do bundle do slice 1. | **Parcial.** Bom como base, mas hoje valida só o contrato técnico atual. | **Refatorar** |

**Runtime e contratos**

| Arquivo/componente | O que faz hoje | Aderência ao workbook/manual | Decisão |
|---|---|---|---|
| [src/features/scout/scoutApi.ts](/home/davis/cepraea-pwa/src/features/scout/scoutApi.ts:1) | Faz CRUD de `scout_games`, carrega codebook, lista jogadas, lê bundle e salva bundle via RPC. | **Parcial boa.** Como infraestrutura de acesso ao Supabase, está correta. O problema é o formato que a UI envia/consome. | **Reaproveitar com refatoração leve** |
| [src/types/index.ts](/home/davis/cepraea-pwa/src/types/index.ts:122) | Define tipos do scout novo: `ScoutPlay`, `ScoutPlayParticipation`, `ScoutCodeList`, etc. | **Parcial.** Útil como contrato interno, mas vários nomes refletem modelagem técnica e não a linguagem aprovada da planilha. | **Refatorar** |

**UI / fluxo atual**

| Arquivo/componente | O que faz hoje | Aderência ao workbook/manual | Decisão |
|---|---|---|---|
| [src/features/scout/pages/ScoutWorkspacePage.tsx](/home/davis/cepraea-pwa/src/features/scout/pages/ScoutWorkspacePage.tsx:1) | Tela única “Workspace do Slice 1”: cria jogo, lista jogadas, edita `play` e `participations`, salva via RPC. | **Baixa.** Expõe termos técnicos (`Escopo`, `Lado`, `ANALYZED`, `Slot`) e não segue a ordem operacional nem os `Nomes visíveis` da planilha. | **Refatorar profundamente** |
| [src/App.tsx](/home/davis/cepraea-pwa/src/App.tsx:18) | Registra a rota `/scout`. | **Neutra.** Só expõe a rota. | **Reaproveitar** |
| [src/shared/layouts/AppLayout.tsx](/home/davis/cepraea-pwa/src/shared/layouts/AppLayout.tsx:26) | Adiciona o item de menu `Scout`. | **Neutra.** Só navegação. | **Reaproveitar** |

**Artefatos legacy / spike anterior**

| Arquivo/componente | O que faz hoje | Aderência ao workbook/manual | Decisão |
|---|---|---|---|
| [src/features/scout/constants.ts](/home/davis/cepraea-pwa/src/features/scout/constants.ts:1) | Hardcodes grandes de listas, sistemas, funções, ações e categorias em linguagem mais próxima do handebol de praia. | **Parcial.** Semanticamente mais próximo do jogo do que a UI nova, mas não deriva da SSOT aprovada e pode divergir da planilha. | **Refatorar para mineração de referência, não como fonte** |
| [src/features/scout/components/EventFormV2.tsx](/home/davis/cepraea-pwa/src/features/scout/components/EventFormV2.tsx:1) | Wizard legacy de evento, bem mais “esportivo” e guiado, baseado em `ScoutEvent` antigo. | **Parcial boa na UX, baixa no contrato.** A linguagem está mais próxima do scout real, mas o modelo de dados é legado e não obedece a SSOT aprovada como fonte direta. | **Refatorar parcialmente** |
| [src/features/scout/components/EventForm.tsx](/home/davis/cepraea-pwa/src/features/scout/components/EventForm.tsx:1) | Só reexporta `EventFormV2`. | **Baixa relevância própria** | **Descartar** como camada separada |

**Documentação intermediária interna**

| Arquivo/componente | O que faz hoje | Aderência ao workbook/manual | Decisão |
|---|---|---|---|
| [docs/scout/scout-contrato-tecnico-supabase.md](/home/davis/cepraea-pwa/docs/scout/scout-contrato-tecnico-supabase.md:1) | Documenta a implementação técnica do scout novo. | **Útil, mas subordinada** à SSOT aprovada em `.files/`. | **Refatorar / rebaixar a documento técnico derivado** |
| [docs/scout/scout-ssot.md](/home/davis/cepraea-pwa/docs/scout/scout-ssot.md:1) e correlatos | Consolidam a etapa documental que fizemos antes. | **Hoje não devem competir com a SSOT aprovada.** Servem como material de apoio, não como fonte primária. | **Refatorar / alinhar como derivado** |

**Ponto crítico sobre salvar/carregar**
Eu **não afirmaria ainda** que o problema de salvar/carregar está provado no runtime. O que dá para afirmar pelo código é:

- existe caminho de salvar:
  - `handleSavePlay()` em [ScoutWorkspacePage.tsx](/home/davis/cepraea-pwa/src/features/scout/pages/ScoutWorkspacePage.tsx:345)
  - `upsertScoutPlayBundle()` em [scoutApi.ts](/home/davis/cepraea-pwa/src/features/scout/scoutApi.ts:1)
- existe caminho de carregar:
  - `fetchScoutPlaysForGame()`
  - `getScoutPlayBundle()`
  - `handleLoadPlay()`

Então hoje eu classificaria isso como:
- **funcionalidade implementada**
- **comportamento não verificado de ponta a ponta nesta revisão**

Ou seja: isso precisa de teste de uso, mas **não muda o diagnóstico principal**. Mesmo que estivesse salvando corretamente, a UX ainda estaria semanticamente errada.

**Veredito final**

O corte correto é este:

- **Reaproveitar**
  - `0008`
  - `0010`
  - boa parte dos testes SQL
  - rota/menu
  - base do `scoutApi`
- **Refatorar**
  - `0009`
  - `0011`
  - `src/types/index.ts`
  - `src/features/scout/scoutApi.ts`
  - `ScoutWorkspacePage.tsx`
  - `constants.ts`
  - `EventFormV2.tsx`
  - docs técnicas derivadas
- **Descartar**
  - `EventForm.tsx` como camada própria
  - a **UI atual do `/scout` como referência de produto**
  - a ideia de que `Escopo/Lado/Slot/ANALYZED` devem aparecer para a usuária

**Conclusão prática**
A fundação existente **não deve ser jogada fora**. O que precisa ser refeito é principalmente a **camada de interação**, agora obedecendo diretamente:

- `Nome visível`
- `Ordem`
- `Tipo`
- `Obrigatório`
- `Opções/Origem`
- `Regra/Definição`

da planilha aprovada.

Se quiser, o próximo passo eu posso te devolver como **plano de refatoração em fases**, começando por `COLETA_AO_VIVO` como primeira tela fiel à planilha.

**Plano**

A melhor estratégia é **refatorar por camadas de coleta**, não por “feature solta”.  
A primeira tela deve ser **`COLETA_AO_VIVO` fiel à planilha**, porque ela já é o recorte operacional mais enxuto e mais próximo do uso real durante ou logo após o jogo.

**Fase 0 — Congelamento e corte**
Objetivo: parar de expandir a UX errada e preparar a refatoração sem perder a fundação boa.

- Congelar [src/features/scout/pages/ScoutWorkspacePage.tsx](/home/davis/cepraea-pwa/src/features/scout/pages/ScoutWorkspacePage.tsx:1) como spike técnico.
- Tratar [src/features/scout/components/EventFormV2.tsx](/home/davis/cepraea-pwa/src/features/scout/components/EventFormV2.tsx:1) como referência de linguagem esportiva, não de contrato.
- Manter `0008`, `0010` e a base de [src/features/scout/scoutApi.ts](/home/davis/cepraea-pwa/src/features/scout/scoutApi.ts:1).
- Assumir a planilha e o manual aprovados em `.files/` como SSOT primária.
- Critério de aceite:
  - ninguém usa mais a UI atual como referência semântica;
  - todo novo trabalho parte de `Nome visível`, `Ordem`, `Tipo`, `Obrigatório`, `Opções/Origem`.

**Fase 1 — Mapeamento de COLETA_AO_VIVO para o contrato atual**
Objetivo: definir como a aba `COLETA_AO_VIVO` vira tela e payload.

Campos-alvo da primeira tela:
- `ID_JOGADA`
- `ID_JOGO`
- `TEMPO_JOGO`
- `FASE_DA_BOLA`
- `EQUIPE_ANALISADA`
- `FASE_EQUIPE_ANALISADA`
- `SISTEMA_OFENSIVO`
- `SISTEMA_DEFENSIVO`
- `ATLETA_PRINCIPAL`
- `ACAO_PRINCIPAL`
- `TIPO_FINALIZACAO`
- `RESULTADO_FACTUAL`
- `PONTOS_JOGADA`
- `CAUSA_PROVAVEL`
- `PRIORIDADE_TREINO`
- `VIDEO_REF`
- `STATUS_VALIDACAO`
- `OBS_GERAL`

Decisões dessa fase:
- o usuário vê só `Nome visível`, nunca nomes técnicos;
- dropdowns vêm do codebook derivado da planilha, não de labels hardcoded;
- `ATLETA_PRINCIPAL` usa cadastro real de atletas;
- `PRIORIDADE_TREINO` entra como campo opcional ou “marcar depois”, não como obrigação cega;
- `ID_JOGADA` pode ser gerado pelo sistema e exibido como código amigável.
- Critério de aceite:
  - existe uma tabela de mapeamento `campo da planilha -> campo/tabela do Supabase`;
  - nenhum campo da tela depende de `Escopo`, `Lado`, `ANALYZED`, `Slot`.

**Fase 2 — Refatoração do codebook**
Objetivo: fazer a UI falar a língua da planilha.

- Expandir [0009](/home/davis/cepraea-pwa/supabase/migrations/0009_scout_codebook_foundation.sql:1) para carregar:
  - listas reais da planilha;
  - `Nome visível`;
  - regras de uso mínimas;
  - dependências entre campos.
- Ajustar os tipos em [src/types/index.ts](/home/davis/cepraea-pwa/src/types/index.ts:122) para refletir campos da `COLETA_AO_VIVO`, não só `play/participation`.
- Critério de aceite:
  - `AT_POS` aparece como `Ataque posicionado`;
  - listas da primeira tela saem integralmente do codebook.

**Fase 3 — Primeira tela nova: COLETA_AO_VIVO**
Objetivo: substituir a entrada atual por uma coleta realmente usável.

Estrutura recomendada da tela:
- Bloco 1: contexto do lance
  - tempo do jogo
  - fase da bola
  - equipe analisada
  - fase da equipe analisada
- Bloco 2: organização tática
  - sistema ofensivo
  - sistema defensivo
- Bloco 3: protagonista do lance
  - atleta principal
  - ação principal
  - tipo de finalização
- Bloco 4: desfecho
  - resultado factual
  - pontos da jogada
  - causa provável
- Bloco 5: revisão
  - prioridade de treino
  - vídeo
  - status de validação
  - observação geral

Princípios de UX:
- ordem idêntica à aba;
- linguagem idêntica ao `Nome visível`;
- esconder códigos internos;
- mobile-first;
- defaults mínimos, não invasivos.
- Critério de aceite:
  - uma treinadora consegue registrar um lance sem conhecer o banco;
  - a tela não mostra `Escopo`, `Lado`, `ANALYZED` ou `Slot`.

**Fase 4 — Adapter para persistência**
Objetivo: salvar `COLETA_AO_VIVO` usando a fundação já existente.

- Criar um adapter no runtime:
  - `COLETA_AO_VIVO UI -> scout_plays + scout_play_participations`
- `ATLETA_PRINCIPAL` pode gerar:
  - `scout_play` com contexto do lance;
  - uma participação principal derivada, quando necessário.
- Refatorar [0011](/home/davis/cepraea-pwa/supabase/migrations/0011_scout_rpc_write_read.sql:1) se o bundle atual não acomodar bem essa semântica.
- Critério de aceite:
  - salvar e recarregar um lance preserva exatamente os campos da tela;
  - o usuário não precisa entender o modelo relacional.

**Fase 5 — Validação funcional da tela**
Objetivo: provar uso real.

Cenários:
- criar jogo;
- registrar lance;
- recarregar;
- editar lance;
- registrar lance ofensivo;
- registrar lance defensivo;
- registrar lance com atleta principal;
- registrar lance sem prioridade de treino;
- uso mobile.
- Critério de aceite:
  - salvar/carregar confirmado na prática;
  - nenhuma ambiguidade semântica bloqueando uso básico.

**Fase 6 — Expansão para COLETA_SCOUT completa**
Objetivo: depois da coleta enxuta estar correta, abrir a coleta completa.

- Introduzir os blocos da `COLETA_SCOUT` por grupos:
  - base do lance;
  - organização inicial;
  - finalização/goleira;
  - transições;
  - `OUT`;
  - contextos especiais.
- Não abrir tudo de uma vez.
- Critério de aceite:
  - cada bloco novo entra já fiel à ordem e aos rótulos da planilha.

**Fase 7 — PARTICIPACOES**
Objetivo: detalhamento por atleta sem poluir a coleta primária.

- Criar tela ou subfluxo separado baseado na aba `PARTICIPACOES`.
- Campos visíveis devem ser:
  - atleta
  - equipe
  - papel
  - fase da bola
  - fase da atleta
  - posição
  - ação
  - resultado individual
  - causa principal
  - prioridade de treino
  - feedback
- Critério de aceite:
  - `participantScope` e `slotOrder` viram detalhe interno, não campo mental do usuário.

**Fase 8 — EVENTOS_MENTAIS, RELATORIO e FEEDBACK**
Objetivo: fechar o scout completo.

Ordem:
1. `EVENTOS_MENTAIS`
2. `RELATORIO`
3. `FEEDBACK`

Motivo:
- mental ainda é coleta;
- relatório é derivação;
- feedback é saída aplicada.
- Critério de aceite:
  - o sistema passa de “registro de lances” para “análise operacional completa”.

**Veredito**
A sequência correta é:

1. congelar a UI atual como spike  
2. mapear `COLETA_AO_VIVO`  
3. refatorar codebook  
4. construir a nova tela de `COLETA_AO_VIVO`  
5. adaptar persistência  
6. validar salvar/carregar  
7. só depois expandir para `COLETA_SCOUT` e `PARTICIPACOES`


**Base**

Esta especificação toma como SSOT aprovada:

- [.files/MANUSCOUT.md](/home/davis/cepraea-pwa/.files/MANUSCOUT.md:1)
- [Tabela_Mestre_dos_Campos.xlsx](</home/davis/cepraea-pwa/.files/analise/Tabela_Mestre_dos_Campos.xlsx>)

E parte de um princípio simples:

- a tela `COLETA_AO_VIVO` deve ser uma **tradução fiel da aba `COLETA_AO_VIVO`**
- ela deve usar o **`Nome visível`** da `TABELA_MESTRE`
- ela deve **salvar códigos/IDs internamente**, mas **exibir linguagem humana**

Onde eu proponho comportamento de UX que não está literalmente escrito na planilha, eu marco como **decisão de implementação derivada**.

**Objetivo da tela**

Permitir que uma treinadora/analista registre **um lance ao vivo ou em revisão rápida** com o menor atrito possível, preservando:

- contexto do lance
- fase do jogo
- atleta principal
- ação principal
- resultado factual
- hipótese causal
- rastro de validação

A tela **não** deve expor conceitos técnicos do banco como:

- `participant_scope`
- `participant_side`
- `slot_order`
- `ANALYZED`
- `OPPONENT`

**Estrutura da tela**

A ordem deve ser a mesma da planilha, mas agrupada visualmente em blocos.

1. Identificação
2. Contexto do lance
3. Organização do jogo
4. Protagonista do lance
5. Desfecho
6. Revisão e rastreio

**Campos da tela**

| Ordem | Campo técnico | Nome visível | Tipo de UI | Obrigatório | Fonte |
|---|---|---|---|---|---|
| 1 | `ID_JOGADA` | `ID da jogada` | texto readonly ou gerado | Sim | sistema |
| 2 | `ID_JOGO` | `ID do jogo` | hidden/readonly vinculado ao jogo atual | Sim | sistema |
| 3 | `TEMPO_JOGO` | `Tempo do jogo` | input de tempo/texto controlado | Sim | manual |
| 4 | `FASE_DA_BOLA` | `Fase da bola` | select | Sim | `LISTA_FASES` |
| 5 | `EQUIPE_ANALISADA` | `Equipe analisada` | select | Sim | `CAD_EQUIPES.ID_EQUIPE` |
| 6 | `FASE_EQUIPE_ANALISADA` | `Fase da equipe analisada` | select | Sim | `LISTA_FASE_EQUIPE` |
| 7 | `SISTEMA_OFENSIVO` | `Sistema ofensivo` | select | Condicional | `LISTA_SISTEMA_OFENSIVO` |
| 8 | `SISTEMA_DEFENSIVO` | `Sistema defensivo` | select | Condicional | `LISTA_SISTEMA_DEFENSIVO` |
| 9 | `ATLETA_PRINCIPAL` | `Atleta principal` | select/autocomplete | Condicional | `CAD_ATLETAS.ID_ATLETA` |
| 10 | `ACAO_PRINCIPAL` | `Ação principal` | texto curto controlado | Condicional | entrada controlada |
| 11 | `TIPO_FINALIZACAO` | `Tipo de finalização` | select | Condicional | `LISTA_TIPO_FINALIZACAO` |
| 12 | `RESULTADO_FACTUAL` | `Resultado factual` | select | Sim | `LISTA_RESULTADO_FACTUAL` |
| 13 | `PONTOS_JOGADA` | `Pontos da jogada` | número | Condicional | manual/cálculo |
| 14 | `CAUSA_PROVAVEL` | `Causa provável` | select | Condicional | `LISTA_CAUSA_PRINCIPAL` |
| 15 | `PRIORIDADE_TREINO` | `Prioridade de treino` | select | Condicional | `LISTA_PRIORIDADE_TREINO` |
| 16 | `VIDEO_REF` | `Referência de vídeo` | texto | Opcional | livre controlado |
| 17 | `STATUS_VALIDACAO` | `Status de validação` | select | Sim | `LISTA_STATUS_VALIDACAO` |
| 18 | `OBS_GERAL` | `Observação geral` | textarea | Opcional | texto livre |

**Especificação campo por campo**

**1. `ID da jogada`**
- Origem da planilha:
  - tipo `CODIGO`
  - obrigatório `Sim`
  - “gerado pelo sistema ou entrada manual controlada”
- Comportamento:
  - não deve ser o primeiro esforço mental da usuária
  - deve nascer automaticamente ao criar o registro
- Decisão de implementação derivada:
  - mostrar como `readonly`
  - permitir edição manual só em modo avançado, se realmente necessário

**2. `ID do jogo`**
- Deve vir do jogo já selecionado.
- Não é campo de digitação normal.
- A tela deve pressupor que a usuária já está dentro de um jogo.

**3. `Tempo do jogo`**
- É um campo central.
- Deve aceitar algo como `03:21`, `08:44`, `SET2 01:15`, conforme o padrão operacional que vocês decidirem.
- A planilha só exige “formato tempo/vídeo”.
- Decisão de implementação derivada:
  - usar máscara `mm:ss` no fluxo principal
  - permitir edição livre controlada se o padrão real exigir mais nuance

**4. `Fase da bola`**
Valores da planilha:
- `AT_POS` → `Ataque posicionado`
- `DEF_POS` → `Defesa posicionada`
- `TRANS_OF` → `Transição ofensiva`
- `TRANS_DEF` → `Transição defensiva`

Regra de UI:
- salvar o código
- exibir o `Nome visível`

A usuária **nunca** deve ver `AT_POS` cru como label principal.

**5. `Equipe analisada`**
- Referência a `CAD_EQUIPES.ID_EQUIPE`
- A planilha valida por equipe cadastrada

Regra de UI:
- o select deve exibir `NOME_EQUIPE`
- o valor persistido pode ser `ID_EQUIPE`

**6. `Fase da equipe analisada`**
Valores:
- `ATAQUE`
- `DEFESA`
- `TRANS_OF`
- `TRANS_DEF`
- `TROCA`
- `NAO_OBSERVADO`

Uso:
- este campo existe para registrar o estado funcional da equipe observada
- ele não é redundante com `Fase da bola`, porque o lance pode ser olhado pela ótica da equipe analisada

**7. `Sistema ofensivo`**
Valores:
- `AT_3X1` → `Ataque 3x1`
- `AT_4X0` → `Ataque 4x0`
- `NAO_APLICA`
- `NAO_OBSERVADO`

Obrigatoriedade:
- `Condicional`

Decisão de implementação derivada:
- habilitar quando a leitura do lance pedir sistema ofensivo
- desabilitar/ocultar quando claramente não se aplica
- se ficar visível, usar:
  - `Não se aplica`
  - `Não observado`
  como escolhas explícitas, não vazio implícito

**8. `Sistema defensivo`**
Valores:
- `DEF_3X0`
- `DEF_2X1`
- `DEF_1X2`
- `DEF_MISTO`
- `DEF_INDIVIDUAL`
- `DEF_2X0_OUT`
- `NAO_OBSERVADO`

Mesma lógica:
- mostrar `Nome visível`
- salvar código

**9. `Atleta principal`**
- Referência a `CAD_ATLETAS.ID_ATLETA`
- A planilha deixa como `Condicional`

Regra de UI:
- exibir `NOME_ATLETA`
- opcionalmente complementar com apelido e equipe
- persistir `ID_ATLETA`

Decisão de implementação derivada:
- componente ideal: autocomplete
- não dropdown gigante simples

**10. `Ação principal`**
Este é um ponto importante.

Na `TABELA_MESTRE`, ela está como:
- `Tipo = TEXTO`
- “Texto curto controlado da ação principal”

Isso significa:
- **não é para ser um campo largado**
- mas também **não está definido como lista suspensa rígida** na aba `COLETA_AO_VIVO`

Então a melhor especificação é:
- input textual curto
- com sugestões/autocomplete
- com vocabulário controlado derivado do scout aprovado

Ou seja:
- não usar textarea livre
- não transformar automaticamente em enum fechado sem validação com a SSOT

**11. `Tipo de finalização`**
Valores:
- `SIMPLES`
- `GIRO`
- `AEREA`
- `ESPECIALISTA`
- `GOLEIRA`
- `6M`
- `SHOOTOUT`
- `CONTRA`
- `GOL_CONTRA`
- `NAO_OBSERVADO`

Obrigatoriedade:
- `Condicional`

Decisão de implementação derivada:
- habilitar quando houver finalização no lance
- caso contrário, permitir vazio ou `Não se aplica` só se a SSOT aprovar isso para este campo
- como a lista atual não traz `NAO_APLICA`, o melhor é:
  - manter vazio quando realmente não houver finalização
  - usar `NAO_OBSERVADO` só quando houve finalização mas não foi possível classificar

**12. `Resultado factual`**
Valores:
- `GOL`
- `DEFENDIDO`
- `BLOQUEADO`
- `FORA`
- `TRAVE`
- `VIOLACAO`
- `PERDA`
- `NAO_OBSERVADO`

Este é obrigatório e deve ser tratado como campo de fechamento objetivo do lance.

**13. `Pontos da jogada`**
- Tipo `NUMERO`
- Obrigatório `Condicional`

Decisão de implementação derivada:
- número pequeno
- não permitir texto
- pode ter preenchimento assistido em casos óbvios, mas não automático cego

Exemplo de uso:
- gol de 2 pontos
- gol de 1 ponto
- lance sem pontuação

**14. `Causa provável`**
- Usa `LISTA_CAUSA_PRINCIPAL`
- É explicitamente uma hipótese provisória na camada ao vivo

Isso é importante para a UX:
- o rótulo deve ser mesmo `Causa provável`
- não `Causa principal`
- porque a planilha já diferencia o grau de certeza

Valores incluem:
- `TEC_OF`
- `DEC_OF`
- `EXEC_OF`
- `TEC_DEF`
- `DEC_DEF`
- `COB`
- `BLOQ`
- `COM`
- `POS`
- `TROCA`
- `MERITO`
- `MERITO_ADV`
- `FIS`
- `REGRA`
- `OUT_ESTRUTURAL`
- `OK`
- `NAO_OBSERVADO`

Regra de UI:
- mostrar os nomes visíveis do dicionário
- idealmente com ajuda curta

**15. `Prioridade de treino`**
- Está na planilha
- É `Condicional`
- A sua crítica anterior continua válida: isso não deve virar obrigação prematura

Então a especificação correta é:
- campo visível, mas opcional no uso normal
- pode ficar em uma seção “Leitura técnica inicial”
- não deve bloquear salvar o lance

**16. `Referência de vídeo`**
- texto livre controlado
- pode receber:
  - minuto
  - nome do clipe
  - id do trecho
  - link curto
- não exigir formato excessivo no slice inicial

**17. `Status de validação`**
Valores:
- `PENDENTE`
- `REVISADO`
- `CORRIGIDO`
- `VALIDADO`
- `DUVIDA`

Decisão de implementação derivada:
- valor default: `Pendente`
- não pedir decisão editorial avançada no primeiro clique
- campo pode vir recolhido com valor inicial padrão

**18. `Observação geral`**
- textarea curta
- uso:
  - contexto extra
  - dúvida
  - nuance não capturada pelos outros campos

Não deve virar lugar para substituir campos estruturados.

**Layout recomendado da tela**

**Bloco 1 — Identificação**
- `ID da jogada`
- `ID do jogo`
- `Tempo do jogo`

**Bloco 2 — Contexto**
- `Fase da bola`
- `Equipe analisada`
- `Fase da equipe analisada`

**Bloco 3 — Organização**
- `Sistema ofensivo`
- `Sistema defensivo`

**Bloco 4 — Lance**
- `Atleta principal`
- `Ação principal`
- `Tipo de finalização`

**Bloco 5 — Desfecho**
- `Resultado factual`
- `Pontos da jogada`
- `Causa provável`

**Bloco 6 — Revisão**
- `Prioridade de treino`
- `Referência de vídeo`
- `Status de validação`
- `Observação geral`

Essa ordem respeita a lógica da planilha, mas melhora leitura humana.

**Comportamentos obrigatórios da tela**

**1. Mostrar nome visível, salvar código**
Exemplos:
- mostrar `Ataque posicionado`, salvar `AT_POS`
- mostrar `Defesa 3x0`, salvar `DEF_3X0`
- mostrar `Pendente`, salvar `PENDENTE`

**2. Usar referências reais**
- `Equipe analisada`: exibir `NOME_EQUIPE`, salvar `ID_EQUIPE`
- `Atleta principal`: exibir `NOME_ATLETA`, salvar `ID_ATLETA`

**3. Respeitar obrigatoriedade condicional**
A planilha marca vários campos como `Condicional`.  
Então a tela deve suportar lógica contextual, não só `required` bruto.

**4. Não expor abstrações do banco**
A tela não pode pedir:
- escopo
- lado
- slot
- side analyzed/opponent

Se isso existir internamente, fica no adapter de persistência.

**5. Salvar rápido**
A tela precisa favorecer fluxo curto:
- preencher
- salvar
- continuar para o próximo lance

**Validações mínimas da primeira versão**

Bloqueiam salvar:
- `ID do jogo` ausente
- `Tempo do jogo` vazio
- `Fase da bola` vazia
- `Equipe analisada` vazia
- `Fase da equipe analisada` vazia
- `Resultado factual` vazio
- `Status de validação` vazio

Validam com regra contextual:
- `Sistema ofensivo`
- `Sistema defensivo`
- `Atleta principal`
- `Ação principal`
- `Tipo de finalização`
- `Pontos da jogada`
- `Causa provável`
- `Prioridade de treino`

**Regras de UX derivadas que eu recomendo**

Estas não vêm literalmente da planilha, mas são a melhor implementação fiel:

- `Status de validação` inicia em `Pendente`
- `ID da jogada` é gerado automaticamente
- `ID do jogo` vem do contexto, não de digitação
- `Ação principal` usa autocomplete controlado
- `Atleta principal` usa busca por nome/apelido
- `Prioridade de treino` fica abaixo do desfecho, não no meio do lance
- `Observação geral` fica por último
- a tela deve funcionar bem em celular

**Exemplo de preenchimento**

- `ID da jogada`: `J-2026-05-0012`
- `ID do jogo`: `JG-2026-07`
- `Tempo do jogo`: `03:21`
- `Fase da bola`: `Ataque posicionado`
- `Equipe analisada`: `CEPRAEA`
- `Fase da equipe analisada`: `Ataque`
- `Sistema ofensivo`: `Ataque 3x1`
- `Sistema defensivo`: vazio
- `Atleta principal`: `Gabriela Peixinho`
- `Ação principal`: `Passe para pivô`
- `Tipo de finalização`: `Giro`
- `Resultado factual`: `Gol`
- `Pontos da jogada`: `2`
- `Causa provável`: `Dec of`
- `Prioridade de treino`: `Passe`
- `Referência de vídeo`: `set1_03m21s`
- `Status de validação`: `Pendente`
- `Observação geral`: `Boa leitura da especialista após estabilização`

**Conclusão**

A primeira tela do scout deve ser:

- curta
- sequencial
- fiel à aba `COLETA_AO_VIVO`
- baseada em `Nome visível`
- sem linguagem de banco
- com persistência escondida atrás do adapter

Se quiser, o próximo passo eu posso te entregar é a **matriz de mapeamento dessa tela para o backend atual**, campo por campo:
- `campo da planilha`
- `como aparece na UI`
- `onde salva hoje`
- `o que precisa mudar no adapter/RPC`


Sim. Para esses 3 campos, a minha recomendação é **criar um contrato próprio de `COLETA_AO_VIVO`**.

Não porque o backend atual esteja ruim, mas porque esses 3 campos têm uma semântica diferente da camada normalizada de `play + participations`.

Os 3 campos são:

- `ATLETA_PRINCIPAL`
- `ACAO_PRINCIPAL`
- `PRIORIDADE_TREINO`

E o problema de fundo é este:

- na planilha, eles pertencem à **coleta rápida do lance**
- no backend atual, eles só cabem de forma torta dentro de `scout_play_participations`
- isso mistura **coleta primária** com **detalhamento analítico**

## Comparação direta

| Opção | Vantagem | Problema real | Veredito |
|---|---|---|---|
| `Resolver no adapter` | Menor mudança imediata | Esconde conceitos da coleta em uma participação técnica artificial | **Não recomendo** |
| `Adicionar colunas` | Simples e rápido | Mistura quick-capture com modelo detalhado e cria duplicidade futura com `PARTICIPACOES` | **Aceitável como atalho, mas não ideal** |
| `Criar contrato próprio de coleta ao vivo` | Fica fiel à planilha e separa coleta de derivação | Exige mais trabalho estrutural agora | **Recomendado** |

## 1. Resolver no adapter

Seria algo como:
- a tela `COLETA_AO_VIVO` recebe `ATLETA_PRINCIPAL`
- o runtime cria automaticamente uma participação
- joga:
  - `ATLETA_PRINCIPAL -> athlete_id`
  - `ACAO_PRINCIPAL -> action_code`
  - `PRIORIDADE_TREINO -> training_priority`

### Por que parece bom
- reaproveita o que já existe
- não muda schema
- aproveita `upsert_scout_play_bundle`

### Por que é semanticamente ruim
Porque esses 3 campos **não são equivalentes perfeitos** a uma participação detalhada.

**`ATLETA_PRINCIPAL`**
- na coleta ao vivo, ela é a protagonista resumida do lance
- isso não significa automaticamente que você já quer abrir a lógica completa de participações

**`ACAO_PRINCIPAL`**
- na planilha, ela é `TEXTO curto controlado`
- no backend atual, `action_code` foi pensado como ação estruturada de participação
- isso não é a mesma coisa

**`PRIORIDADE_TREINO`**
- na coleta ao vivo, ela é uma leitura provisória do lance
- em `participations`, ela fica parecendo prioridade individual de uma atleta específica
- isso pode distorcer o sentido

### Risco principal
Você cria uma mentira técnica:
- parece que o sistema tem participação detalhada
- mas na prática ele só está guardando um resumo da coleta

### Veredito
**Não recomendo como solução principal.**  
Pode servir como gambiarra temporária, mas vai contaminar o domínio.

---

## 2. Adicionar colunas em `scout_plays`

Seria algo como adicionar em `scout_plays`:
- `main_athlete_id`
- `main_action`
- `live_training_priority`

### Por que é melhor que adapter
- a tela de `COLETA_AO_VIVO` passa a ter destino direto
- o backend fica mais simples para salvar/carregar
- evita a participação artificial

### Por que ainda não é a melhor opção
Porque `scout_plays` hoje está caminhando para ser:
- a camada normalizada do lance
- base para detalhamento
- base para participação, mental, validação, relatório

Se você coloca esses 3 campos ali, precisa responder depois:

- `main_athlete_id` é só da coleta rápida ou é verdade canônica do lance?
- `main_action` continua texto curto ou vira taxonomia oficial?
- `live_training_priority` é do lance bruto ou da análise consolidada?

Quando `PARTICIPACOES` entrar de verdade, pode haver conflito:

- o lance tem `ATLETA_PRINCIPAL = Aline`
- mas nas participações detalhadas a protagonista real vira Gabriela
- qual das duas vale?

### Quando essa opção faz sentido
Se você quiser um caminho tático:
- rápido
- com menos refatoração
- e aceitar dívida técnica controlada

### Veredito
**É aceitável como solução de transição**, mas eu não escolheria como arquitetura-alvo.

---

## 3. Criar contrato próprio de `COLETA_AO_VIVO`

Essa é a opção que mais respeita a planilha.

A lógica é:

- `COLETA_AO_VIVO` é uma camada própria de entrada
- ela não precisa ser idêntica à camada normalizada final
- depois, esse registro pode:
  - ficar como coleta rápida auditável
  - e/ou ser promovido para `scout_plays + participations`

### Por que isso é o mais correto
Porque a própria planilha já separa:
- `COLETA_AO_VIVO`
- `COLETA_SCOUT`
- `PARTICIPACOES`
- `EVENTOS_MENTAIS`
- `RELATORIO`
- `FEEDBACK`

Ou seja: a fonte já está dizendo que essas camadas **não são a mesma coisa**.

### O que esse contrato próprio resolveria
`ATLETA_PRINCIPAL`
- vira campo nativo da coleta rápida
- sem forçar participação detalhada

`ACAO_PRINCIPAL`
- continua sendo o texto curto controlado que a planilha quer
- sem obrigar mapeamento precoce para `action_code`

`PRIORIDADE_TREINO`
- continua sendo leitura provisória do lance
- sem fingir que já é prioridade derivada por participação

### Forma recomendada
Eu faria assim:

**Tabela/contrato novo**
- algo como `scout_live_captures` ou `scout_live_entries`

Campos:
- os 18 campos da aba `COLETA_AO_VIVO`
- `team_id`
- `scout_game_id`
- `created_at`
- `updated_at`
- opcionalmente `derived_scout_play_id`

### Relação com o resto do sistema
- `scout_games` continua sendo o contêiner do jogo
- `scout_live_entries` vira a camada de captura rápida
- `scout_plays` continua como camada normalizada do lance
- `scout_play_participations` continua como detalhamento por atleta

### Benefício maior
Você preserva a verdade do processo:

- **coletar rápido**
- **validar**
- **detalhar depois**

Em vez de fingir que tudo já nasceu detalhado.

### Veredito
**Essa é a solução recomendada.**

---

## Minha recomendação final

A ordem correta para esses 3 campos é:

1. **criar contrato próprio de `COLETA_AO_VIVO`**
2. manter `ATLETA_PRINCIPAL`, `ACAO_PRINCIPAL` e `PRIORIDADE_TREINO` como campos nativos dessa camada
3. depois decidir como um registro ao vivo:
   - permanece só como coleta
   - ou promove para `scout_plays`
   - ou gera `participations`

## Em uma frase

- `resolver no adapter` = rápido, mas semânticamente errado
- `adicionar colunas` = melhor, mas ainda mistura camadas
- `criar contrato próprio` = **a decisão certa se o objetivo é implementar a planilha aprovada com fidelidade**

## Recomendação prática

Se você me perguntar “o que o sistema realmente necessita agora?”, a resposta é:

**um contrato próprio de `COLETA_AO_VIVO`, usando o backend atual como fundação, mas sem forçar esses 3 campos dentro de `participations`.**

Se quiser, o próximo passo eu posso te entregar é a **proposta concreta desse contrato**, com:
- nome recomendado
- campos
- destino no banco
- relação com `scout_games`
- relação futura com `scout_plays` e `PARTICIPACOES`

**Proposta**

Minha recomendação é criar um contrato próprio chamado:

- **`scout_live_entries`**

Esse nome é melhor que `captures` porque:
- comunica que é um **registro operacional**
- não pressupõe que já virou análise detalhada
- combina bem com `scout_games`, `scout_plays` e `scout_play_participations`

Se quiser um nome em português no domínio documental, ele pode ser tratado como:
- **Coleta ao vivo**
mas no banco eu manteria `scout_live_entries`.

**Objetivo do contrato**

Representar **um lance registrado na camada rápida de coleta**, fiel à aba `COLETA_AO_VIVO`, sem obrigar normalização prematura em `play + participations`.

Ele serve para:
- registrar rápido
- revisar
- corrigir
- validar
- depois promover, quando fizer sentido, para a camada analítica detalhada

---

**Campos**

Eu modelaria assim.

**Identidade e vínculo**
- `id uuid primary key`
- `team_id uuid not null`
- `scout_game_id uuid not null`

**Campos da planilha**
- `entry_code text not null`
  - corresponde a `ID_JOGADA`
- `game_code_snapshot text`
  - opcional, se quiser espelhar o `ID_JOGO` visível; o vínculo real continua em `scout_game_id`
- `game_clock text not null`
  - `TEMPO_JOGO`
- `phase_of_ball text not null`
  - `FASE_DA_BOLA`
- `analyzed_team_id uuid`
  - `EQUIPE_ANALISADA`
- `analyzed_team_phase text not null`
  - `FASE_EQUIPE_ANALISADA`
- `offensive_system text`
  - `SISTEMA_OFENSIVO`
- `defensive_system text`
  - `SISTEMA_DEFENSIVO`
- `main_athlete_id uuid`
  - `ATLETA_PRINCIPAL`
- `main_action_text text`
  - `ACAO_PRINCIPAL`
- `finish_type text`
  - `TIPO_FINALIZACAO`
- `factual_result text not null`
  - `RESULTADO_FACTUAL`
- `play_points smallint`
  - `PONTOS_JOGADA`
- `probable_cause text`
  - `CAUSA_PROVAVEL`
- `training_priority text`
  - `PRIORIDADE_TREINO`
- `video_ref text`
  - `VIDEO_REF`
- `validation_status text not null default 'PENDENTE'`
  - `STATUS_VALIDACAO`
- `general_note text`
  - `OBS_GERAL`

**Controle de ciclo**
- `source text not null default 'AO_VIVO'`
- `promoted_to_play_id uuid`
  - nullable, aponta para `scout_plays.id` quando houver promoção
- `promoted_at timestamptz`
- `created_by uuid`
- `updated_by uuid`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

---

**Destino no banco**

Tabela nova:

- **`public.scout_live_entries`**

Constraints principais:
- FK `(scout_game_id, team_id)` -> `scout_games(id, team_id)`
- FK `(main_athlete_id, team_id)` -> `athletes(id, team_id)`
- FK `(promoted_to_play_id, team_id)` -> `scout_plays(id, team_id)` se quiser manter consistência forte
- unique recomendado:
  - `(team_id, scout_game_id, entry_code)`

RLS:
- mesma regra do resto do scout:
  - `member read`
  - `owner/coach write`

Codebook:
- os campos de lista devem apontar para o mesmo codebook central
- `main_action_text` fica fora de enum rígido no início, porque a planilha trata como `TEXTO curto controlado`

---

**Relação com `scout_games`**

`scout_games` continua sendo o **contêiner do jogo**.

Relação:
- `1 scout_game` -> `N scout_live_entries`

Responsabilidades:
- `scout_games`
  - contexto macro do jogo
  - data
  - adversária
  - local
  - status do jogo
- `scout_live_entries`
  - cada lance rápido coletado dentro desse jogo

Importante:
- `ID_JOGO` da planilha não precisa virar uma segunda verdade paralela
- no sistema, a verdade relacional é `scout_game_id`
- se você quiser exibir um “código do jogo” amigável, isso pode ser um campo derivado do jogo, não a chave lógica principal

---

**Relação futura com `scout_plays`**

Aqui está a parte mais importante.

`scout_live_entries` **não substitui** `scout_plays`.  
Ele antecede ou convive com ele.

Eu recomendo três estados possíveis:

**1. Entrada só coletada**
- existe em `scout_live_entries`
- ainda não virou lance detalhado

**2. Entrada promovida**
- existe em `scout_live_entries`
- gerou um registro em `scout_plays`
- `promoted_to_play_id` preenchido

**3. Entrada absorvida com detalhamento**
- existe em `scout_live_entries`
- gerou `scout_play`
- gerou também `scout_play_participations`
- opcionalmente depois `mental_events`, `play_validations`, etc.

Então a relação é:

- `scout_live_entries` = **camada de coleta rápida**
- `scout_plays` = **camada analítica normalizada do lance**

Promoção recomendada:
- manual primeiro
- automática só depois que a semântica estiver estável

---

**Relação futura com `PARTICIPACOES`**

`PARTICIPACOES` não deve nascer automaticamente da coleta rápida como regra cega.

O correto é:

- `ATLETA_PRINCIPAL` em `scout_live_entries` é só a protagonista resumida
- `PARTICIPACOES` é o detalhamento analítico do lance

Então:

- `1 scout_live_entry`
- pode gerar `1 scout_play`
- que pode gerar `N scout_play_participations`

Isso evita a mentira semântica de tratar o resumo do lance como se já fosse participação estruturada.

Exemplo:
- na coleta ao vivo:
  - atleta principal = Gabriela
  - ação principal = passe para pivô
- no detalhamento posterior:
  - Gabriela participou
  - pivô participou
  - defesa adversária participou
  - goleira participou

Ou seja:
- `ATLETA_PRINCIPAL` não é sinônimo de “única participação relevante”
- é só a âncora rápida do lance

---

**Fluxo recomendado**

1. Criar ou selecionar `scout_game`
2. Registrar lance em `scout_live_entries`
3. Revisar/validar lance rápido
4. Quando necessário, promover para `scout_play`
5. Abrir detalhamento em `PARTICIPACOES`

---

**Veredito**

A proposta concreta é:

- **Nome recomendado**: `public.scout_live_entries`
- **Função**: camada própria de `COLETA_AO_VIVO`
- **Campos**: os 18 da planilha + metadados de promoção/auditoria
- **Relação com `scout_games`**: `N:1`
- **Relação com `scout_plays`**: promoção opcional via `promoted_to_play_id`
- **Relação com `PARTICIPACOES`**: indireta, sempre via `scout_play`, nunca forçada no ato da coleta

Se quiser, o próximo passo eu posso te entregar é a **especificação da promoção `scout_live_entry -> scout_play`**, definindo exatamente o que copia, o que transforma e o que continua pendente para `PARTICIPACOES`.

Segue a versão enxuta do `REFAZERSCOUT`, separada entre fatos validados e decisões técnicas.

**Parte A — Fatos Validados Pela SSOT**

**1. Fontes de verdade**
- SSOT semântica oficial: [Codificação_e_Validação_do_Scout.md](/home/davis/cepraea-pwa/.files/Codificação_e_Validação_do_Scout.md:1)
- SSOT de implementação derivada: [Tabela_Mestre_dos_Campos.xlsx](</home/davis/cepraea-pwa/.files/analise/Tabela_Mestre_dos_Campos.xlsx>)
- [.files/MANUSCOUT.md](/home/davis/cepraea-pwa/.files/MANUSCOUT.md:1) não é base normativa; é auditoria histórica.

**2. Regra de precedência**
- O manual consolidado decide a semântica.
- A `TABELA_MESTRE` traduz isso em metadados de implementação.
- A planilha não cria semântica nova por conta própria.

**3. Arquitetura oficial do scout**
- Abas oficiais:
  - `COLETA_SCOUT`
  - `COLETA_AO_VIVO`
  - `PARTICIPACOES`
  - `EVENTOS_MENTAIS`
  - `CAD_ATLETAS`
  - `CAD_EQUIPES`
  - `LISTAS`
  - `VALIDACAO`
  - `RELATORIO`
  - `FEEDBACK`
  - `DASHBOARD`
  - `TABELA_MESTRE`

**4. Papel oficial das camadas**
- `COLETA_AO_VIVO`: captura mínima durante o jogo
- `COLETA_SCOUT`: base principal por sequência observada
- `PARTICIPACOES`: base derivada por atleta e sequência
- `EVENTOS_MENTAIS`: base derivada longa própria
- `VALIDACAO`: revisão e correção
- `RELATORIO` e `FEEDBACK`: saídas derivadas

**5. Unidade de observação**
- Uma linha representa uma sequência observada.
- Toda sequência precisa preservar vínculo com `ID_JOGADA`, `ID_JOGO`, `TEMPO_JOGO` e, quando houver, `VIDEO_REF`.

**6. Princípios semânticos obrigatórios**
- fato observado ≠ interpretação técnica
- evento principal ≠ descritores/contexto
- tipo de finalização ≠ pontuação
- `FASE_DA_BOLA` funciona como gatilho lógico de preenchimento
- a coleta ao vivo é reduzida por design
- a revisão por vídeo e a validação pós-jogo são obrigatórias

**7. COLETA_AO_VIVO oficial**
A aba tem 18 campos oficiais:
1. `ID_JOGADA`
2. `ID_JOGO`
3. `TEMPO_JOGO`
4. `FASE_DA_BOLA`
5. `EQUIPE_ANALISADA`
6. `FASE_EQUIPE_ANALISADA`
7. `SISTEMA_OFENSIVO`
8. `SISTEMA_DEFENSIVO`
9. `ATLETA_PRINCIPAL`
10. `ACAO_PRINCIPAL`
11. `TIPO_FINALIZACAO`
12. `RESULTADO_FACTUAL`
13. `PONTOS_JOGADA`
14. `CAUSA_PROVAVEL`
15. `PRIORIDADE_TREINO`
16. `VIDEO_REF`
17. `STATUS_VALIDACAO`
18. `OBS_GERAL`

**8. Tipos e listas confirmados para COLETA_AO_VIVO**
- `FASE_DA_BOLA`: `AT_POS`, `DEF_POS`, `TRANS_OF`, `TRANS_DEF`
- `FASE_EQUIPE_ANALISADA`: `ATAQUE`, `DEFESA`, `TRANS_OF`, `TRANS_DEF`, `TROCA`, `NAO_OBSERVADO`
- `SISTEMA_OFENSIVO`: `AT_3X1`, `AT_4X0`, `NAO_APLICA`, `NAO_OBSERVADO`
- `SISTEMA_DEFENSIVO`: `DEF_3X0`, `DEF_2X1`, `DEF_1X2`, `DEF_MISTO`, `DEF_INDIVIDUAL`, `DEF_2X0_OUT`, `NAO_OBSERVADO`
- `TIPO_FINALIZACAO`: `SIMPLES`, `GIRO`, `AEREA`, `ESPECIALISTA`, `GOLEIRA`, `6M`, `SHOOTOUT`, `NAO_OBSERVADO`
- `RESULTADO_FACTUAL`: `GOL`, `DEFENDIDO`, `BLOQUEADO`, `FORA`, `TRAVE`, `VIOLACAO`, `PERDA`, `NAO_OBSERVADO`
- `CAUSA_PROVAVEL`: usa a lista oficial de causa principal
- `PRIORIDADE_TREINO`: usa a lista oficial de prioridade
- `STATUS_VALIDACAO`: `PENDENTE`, `REVISADO`, `CORRIGIDO`, `VALIDADO`, `DUVIDA`

**9. Metadados obrigatórios da implementação**
- A UI deve obedecer:
  - `Nome visível`
  - `Tipo`
  - `Obrigatório`
  - `Opções/Origem`
  - `Regra/Definição`
- A tela não deve expor termos de banco como:
  - `participantScope`
  - `participantSide`
  - `slotOrder`
  - `ANALYZED`
  - `OPPONENT`

**10. Estado atual do código**
- Existe fundação técnica reaproveitável:
  - [0008](/home/davis/cepraea-pwa/supabase/migrations/0008_scout_contract_foundation.sql:1)
  - [0009](/home/davis/cepraea-pwa/supabase/migrations/0009_scout_codebook_foundation.sql:1)
  - [0010](/home/davis/cepraea-pwa/supabase/migrations/0010_scout_security_policies_and_grants.sql:1)
  - [0011](/home/davis/cepraea-pwa/supabase/migrations/0011_scout_rpc_write_read.sql:1)
  - [scoutApi.ts](/home/davis/cepraea-pwa/src/features/scout/scoutApi.ts:1)
- A UI atual de [ScoutWorkspacePage.tsx](/home/davis/cepraea-pwa/src/features/scout/pages/ScoutWorkspacePage.tsx:1) não é aderente ao scout aprovado.

**Parte B — Decisões Técnicas Do Refactor**

**1. Reaproveitar**
- `0008`
- `0010`
- boa parte da base de `0011`
- `scoutApi.ts` como infraestrutura
- rota `/scout` e navegação

**2. Refatorar**
- `0009` para refletir as listas reais da SSOT
- tipos do scout em [src/types/index.ts](/home/davis/cepraea-pwa/src/types/index.ts:122)
- `ScoutWorkspacePage.tsx`
- o mapeamento entre UI e payload atual
- a documentação técnica derivada que ainda confunda manual e planilha

**3. Decisão técnica em aberto**
A SSOT não obriga uma única arquitetura para persistência da `COLETA_AO_VIVO`. As opções técnicas continuam sendo:
- adapter sobre `scout_plays + participations`
- expansão de `scout_plays`
- contrato próprio de persistência para `COLETA_AO_VIVO`

**4. Decisão técnica recomendada**
Minha recomendação continua sendo uma camada própria para `COLETA_AO_VIVO`, porque preserva melhor:
- `ATLETA_PRINCIPAL`
- `ACAO_PRINCIPAL`
- `PRIORIDADE_TREINO`

Mas isso é **decisão técnica**, não regra da SSOT.

**5. Direção de execução**
- começar pela experiência de `COLETA_AO_VIVO`
- esconder a linguagem técnica do banco
- só depois abrir `COLETA_SCOUT`, `PARTICIPACOES`, `EVENTOS_MENTAIS`, `RELATORIO` e `FEEDBACK`

**O que falta para iniciar a implementação corretamente**

A boa notícia: **não falta nova aprovação metodológica**.  
A SSOT já está suficiente para começar.

O que falta agora é técnico e de recorte.

**1. Fechar a decisão de persistência da COLETA_AO_VIVO**
Esse é o maior ponto em aberto.

Precisa decidir uma destas três:
- `adapter` em cima de `scout_plays + participations`
- ampliar `scout_plays`
- criar persistência própria da coleta ao vivo

Sem isso, você não consegue começar a tela com contrato estável.

**2. Fechar o contrato de entrada da tela**
A tela já está especificada conceitualmente, mas ainda falta o contrato técnico final:
- quais campos entram no payload
- quais são `required` no submit
- quais são `condicionais`
- quais vão como código e quais vão como referência

Especialmente para:
- `ACAO_PRINCIPAL`
- `ATLETA_PRINCIPAL`
- `PRIORIDADE_TREINO`

**3. Corrigir o codebook para refletir a SSOT**
Hoje o seed de [0009](/home/davis/cepraea-pwa/supabase/migrations/0009_scout_codebook_foundation.sql:1) ainda é parcial.

Antes de subir a tela correta, precisa existir codebook pelo menos para:
- `FASE_DA_BOLA`
- `FASE_EQUIPE_ANALISADA`
- `SISTEMA_OFENSIVO`
- `SISTEMA_DEFENSIVO`
- `TIPO_FINALIZACAO`
- `RESULTADO_FACTUAL`
- `CAUSA_PROVAVEL`
- `PRIORIDADE_TREINO`
- `STATUS_VALIDACAO`

**4. Fechar a estratégia de `ACAO_PRINCIPAL`**
Esse é um gap importante.

A SSOT diz:
- `TEXTO`
- “texto curto controlado”

Então ainda falta decidir tecnicamente:
- campo livre com validação leve
- autocomplete
- vocabulário sugerido
- dicionário controlado próprio

Sem essa decisão, a implementação pode sair semanticamente frouxa.

**5. Definir as regras condicionais de submit**
A `TABELA_MESTRE` marca vários campos como `Condicional`, mas a tela precisa de regra operacional clara de bloqueio.

Exemplos:
- quando `SISTEMA_OFENSIVO` é obrigatório
- quando `SISTEMA_DEFENSIVO` é obrigatório
- quando `TIPO_FINALIZACAO` deve aparecer
- quando `PONTOS_JOGADA` deve ser exigido
- quando `PRIORIDADE_TREINO` é opcional de verdade

Isso precisa ser congelado em uma matriz de validação da tela.

**6. Fechar o mapeamento de referências reais**
Precisa alinhar:
- `EQUIPE_ANALISADA` com `CAD_EQUIPES.ID_EQUIPE`
- `ATLETA_PRINCIPAL` com `CAD_ATLETAS.ID_ATLETA`

No app atual, o backend ainda usa:
- `scout_games.analyzed_team` como texto
- e a tela atual carrega atletas do sistema, não da estrutura formal da planilha

Isso precisa ser reconciliado antes da implementação correta.

**7. Decidir o primeiro slice de uso**
A implementação correta não precisa abrir tudo de uma vez.

O recorte mínimo recomendado é:
- criar/selecionar jogo
- registrar `COLETA_AO_VIVO`
- salvar
- carregar
- editar
- validar visualmente a sequência real de uso

Sem puxar ainda:
- `PARTICIPACOES`
- `EVENTOS_MENTAIS`
- `RELATORIO`
- `FEEDBACK`

**8. Validar o comportamento real do salvar/carregar nesse novo fluxo**
Hoje existe suspeita de que salvar/carregar não esteja claro ou confiável na UI atual. Mesmo sem tratar isso como bug provado, o novo fluxo precisa nascer já com este critério:
- salvar um lance
- recarregar
- reencontrar exatamente o lance
- editar sem ambiguidade

**Veredito final**

Para começar a implementação correta do scout conforme os SSOTs, faltam basicamente **5 decisões técnicas operacionais**:

1. decidir a persistência da `COLETA_AO_VIVO`
2. congelar o contrato técnico da tela
3. expandir o codebook oficial mínimo
4. definir a estratégia controlada de `ACAO_PRINCIPAL`
5. fechar a matriz de obrigatoriedade condicional

Depois disso, **já dá para implementar de forma correta**.  
Não vejo mais bloqueio metodológico real.

**Checklist de readiness para iniciar a implementação do scout**

## Bloqueia

**1. Decisão de persistência da `COLETA_AO_VIVO`**
- Status: `Bloqueia`
- Motivo: sem decidir se a coleta ao vivo vai para:
  - adapter sobre `scout_plays + participations`
  - expansão de `scout_plays`
  - contrato próprio
  não existe contrato técnico estável para a primeira tela.

**2. Contrato técnico final da tela `COLETA_AO_VIVO`**
- Status: `Bloqueia`
- Motivo: a tela está especificada conceitualmente, mas ainda falta congelar:
  - payload
  - tipos
  - campos obrigatórios
  - campos condicionais
  - formato de submit

**3. Estratégia de `ACAO_PRINCIPAL`**
- Status: `Bloqueia`
- Motivo: a SSOT define `TEXTO curto controlado`, mas ainda não está decidido se isso vira:
  - texto livre controlado
  - autocomplete
  - vocabulário controlado próprio
- Sem isso, a implementação da tela nasce ambígua.

**4. Matriz de obrigatoriedade condicional**
- Status: `Bloqueia`
- Motivo: a `TABELA_MESTRE` marca vários campos como `Condicional`, mas a UI precisa saber exatamente:
  - quando mostra
  - quando exige
  - quando deixa vazio
- Sem essa regra, a tela não consegue validar corretamente.

## Decisão necessária

**5. Estratégia para `ATLETA_PRINCIPAL`**
- Status: `Decisão necessária`
- Motivo: a SSOT manda referenciar `CAD_ATLETAS.ID_ATLETA`, mas o app precisa decidir:
  - select simples
  - autocomplete
  - filtragem por equipe/status
- Não bloqueia a arquitetura geral, mas bloqueia a UX final da tela.

**6. Estratégia para `EQUIPE_ANALISADA`**
- Status: `Decisão necessária`
- Motivo: a SSOT quer referência real a `CAD_EQUIPES.ID_EQUIPE`, enquanto o backend atual de `scout_games` ainda usa `analyzed_team` textual.
- Precisa decidir se:
  - ajusta `scout_games`
  - ou resolve por adapter/contexto na primeira fase.

**7. Papel de `PRIORIDADE_TREINO` na coleta ao vivo**
- Status: `Decisão necessária`
- Motivo: a SSOT permite o campo na coleta ao vivo, mas a UX precisa decidir:
  - aparece sempre
  - aparece recolhido
  - aparece como opcional
  - aparece só em revisão
- Não impede modelagem, mas impacta muito a usabilidade.

**8. Política de geração de `ID_JOGADA`**
- Status: `Decisão necessária`
- Motivo: a SSOT aceita “gerado pelo sistema ou entrada manual controlada”.
- Precisa definir:
  - geração automática padrão
  - formato exibido
  - se usuário pode editar

## Não bloqueia

**9. Fundação de banco existente**
- Status: `Não bloqueia`
- Motivo: já existe base reaproveitável:
  - `0008`
  - `0010`
  - base de `0011`
- Não é preciso redesenhar tudo antes de começar.

**10. Segurança / RLS**
- Status: `Não bloqueia`
- Motivo: `0010` já resolve o controle principal de acesso.

**11. Runtime base do scout**
- Status: `Não bloqueia`
- Motivo: [scoutApi.ts](/home/davis/cepraea-pwa/src/features/scout/scoutApi.ts:1) já oferece infraestrutura útil, mesmo que precise refatoração.

**12. Rota `/scout` e navegação**
- Status: `Não bloqueia`
- Motivo: a superfície de entrada já existe. O problema é semântico/estrutural, não de roteamento.

**13. Existência de `COLETA_SCOUT`, `PARTICIPACOES`, `EVENTOS_MENTAIS`, `RELATORIO`, `FEEDBACK`**
- Status: `Não bloqueia`
- Motivo: para iniciar corretamente, não é necessário abrir todas essas camadas agora.
- O primeiro slice pode ser só `COLETA_AO_VIVO`.

**14. Suspeita atual de salvar/carregar no spike**
- Status: `Não bloqueia`
- Motivo: isso não impede o redesenho correto.
- Deve entrar como critério de validação do novo fluxo, não como pré-requisito para começar.

## Ordem mínima para ficar pronto para implementar

1. decidir a persistência da `COLETA_AO_VIVO`
2. congelar o contrato técnico da tela
3. decidir `ACAO_PRINCIPAL`
4. fechar a matriz de obrigatoriedade condicional
5. alinhar referências de atleta/equipe
6. expandir o codebook mínimo da `COLETA_AO_VIVO`

## Veredito

Hoje, o scout **ainda não está pronto para implementação correta imediata**, porque há **4 bloqueios reais**:

- persistência da `COLETA_AO_VIVO`
- contrato técnico da tela
- estratégia de `ACAO_PRINCIPAL`
- matriz de obrigatoriedade condicional

O resto é importante, mas entra como ajuste de execução, não como impeditivo.
