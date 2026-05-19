---
tipo: MATRIZ-RASTREABILIDADE
nome: "Scout — Matriz de Rastreabilidade"
papel: "Fecha a ponte explícita entre conceito de domínio, contrato lógico, campo operacional, lista categórica, regra de validação e saída derivada do scout."
autoridade: "Hierarquia 3/4 para o domínio scout — prevalece sobre leitura solta de artefatos isolados; perde apenas para correção factual revalidada quando um vínculo estiver materialmente errado no workbook ou na SSOT."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "antes de implementar schema, queries, formulários, pipelines de validação, relatórios ou feedbacks do scout; ao decidir qual campo ou lista concretiza um conceito do domínio."
atualizado_por: "Codex — 18 de maio de 2026"
quando_atualizar: "um conceito ganhar novo campo, lista, regra ou derivado; a SSOT mudar; um vínculo de rastreabilidade for corrigido."
validade: "2026-05-18"
status: PARCIAL
status_nota: "Matriz inicial consolidada da Etapa A. Cobre os conceitos centrais do scout, a captura rápida, as projeções atleta-facing e os vínculos com metas derivadas, suficiente para planejamento técnico; não replica ainda toda a rastreabilidade linha a linha das 466 linhas brutas da `TABELA_MESTRE`."
conflito: "Se esta matriz divergir da SSOT semântica, a SSOT prevalece; se divergir da `TABELA_MESTRE` ou da aba `DICIONARIO_CODIGOS` em vínculo factual de campo/lista, revalidar o workbook e corrigir a matriz."
proibido:
  - "Agentes NÃO devem implementar o scout mapeando conceito diretamente para UI sem passar por contrato, campo, lista e validação."
  - "NÃO devem tratar esta matriz como checklist opcional; ela é a ponte obrigatória entre método e implementação."
nao_cobre: "DDL final, migrações, nomes de tabelas/colunas Supabase, payloads exatos de API e testes automatizados finais."
---

# Scout — Matriz de Rastreabilidade

## 1. Objetivo

Este documento responde à pergunta final da Etapa A:

> como cada conceito importante do scout se materializa em contratos, campos, listas, validações e saídas derivadas?

Sem essa ponte, o risco é cair em um dos dois extremos:

1. texto metodológico sem implementação possível;
2. implementação técnica sem amarração ao método real.

## 2. Como ler a matriz

Cada linha da matriz liga:

1. `conceito`
2. `contrato(s)` onde ele vive
3. `campo(s)` operacionais
4. `lista(s)` ou enum(s) associados
5. `validação(ões)` mínimas
6. `derivado(s)` ou saídas impactadas

Regra:

- conceito sem campo não é implementável;
- campo sem lista/validação não é governável;
- coleta sem derivado/rastreio não fecha o ciclo do scout.

## 3. Convenções de leitura

- `Primário`: onde o conceito nasce.
- `Secundário`: onde o conceito reaparece para decomposição, revisão ou saída.
- `Derivado`: onde o conceito influencia leitura técnica, relatório, feedback ou prioridade.
- `Projeção`: onde o conceito aparece em superfície publicada para consumo da atleta.
- `Campos-chave`: nesta matriz, só entram nomes canônicos de campo já existentes no workbook; quando um conceito for representado por família repetida, usamos curingas explícitos como `ATQ_*` ou `DEF_*`.
- `COLETA_AO_VIVO`: aparece como camada própria de captura rápida; não substitui os campos canônicos de `COLETA_SCOUT` na modelagem principal.

## 4. Invariantes de rastreabilidade

1. `ID_JOGADA` é a chave transversal do scout.
2. Um conceito pode aparecer em mais de um contrato, mas tem um ponto primário de origem.
3. Lista sem campo associado é metadado morto.
4. Campo sem gate de validação é risco operacional.
5. Derivado sem rastro até a jogada é leitura fraca.
6. Projeção atleta-facing sem filtro de escopo e origem rastreável é publicação inválida.

## 5. Núcleo estrutural

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Unidade de observação analítica | `COLETA_SCOUT` | `ID_JOGADA`, `ID_JOGO` | n/a | IDs obrigatórios e não órfãos | `PARTICIPACOES`, `EVENTOS_MENTAIS`, `VALIDACAO`, `RELATORIO`, `FEEDBACK`, `VISAO_ATLETA_SCOUT` |
| Unidade de observação rápida | `COLETA_AO_VIVO` | `ID_JOGADA`, `ID_JOGO`, `TEMPO_JOGO` | n/a | entrada rápida válida, promoção auditável | promoção para `COLETA_SCOUT`, UX ao vivo |
| Contexto da sessão | `COLETA_SCOUT` | `DATA_SESSAO`, `TIPO_SESSAO`, `ADVERSARIO`, `PERIODO`, `TEMPO_JOGO`, `FONTE_COLETA` | `LISTA_TIPO_SESSAO`, `LISTA_PERIODO`, `LISTA_FONTE_COLETA` | `ADVERSARIO` obrigatório em `JOGO`/`AMISTOSO` | interpretação do jogo, relatório, filtros |
| Fase global da jogada | `COLETA_SCOUT` | `FASE_DA_BOLA` | `LISTA_FASES` | coerência entre fase, bloco e contexto | `PARTICIPACOES`, transições, leitura técnica |
| Status de validação operacional | `COLETA_SCOUT`, `COLETA_AO_VIVO`, `EVENTOS_MENTAIS`, `VALIDACAO` | `STATUS_VALIDACAO` | `LISTA_STATUS_VALIDACAO` | enum válido, sem atalho textual | revisão, publicação analítica |

## 6. Rastreabilidade tática ofensiva

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Sistema ofensivo estabilizado | `COLETA_SCOUT` | `SISTEMA_OFENSIVO` | `LISTA_SISTEMA_OFENSIVO` | não confundir com transição ou ocupação momentânea | `PARTICIPACOES`, relatório de ataque |
| Configuração ofensiva | `COLETA_SCOUT` | `CONFIGURACAO_OFENSIVA` | `LISTA_CONFIGURACAO_OFENSIVA`, `LISTA_CONFIG_3X1`, `LISTA_CONFIG_4X0` | requer sistema-base compatível | leitura de ataque, prioridade técnica |
| Pivô temporária | `COLETA_SCOUT` | `OCUPACAO_TEMPORARIA_PIVO`, `ATLETA_OCUPA_PIVO_TEMP`, `RESULTADO_OCUPACAO_PIVO_TEMP` | `LISTA_BOOLEANO_OBS`, `LISTA_OCUPACAO_PIVO_TEMP_RESULTADO` | se `SIM`, campos dependentes viram obrigatórios | leitura de `AT_4X0`, treino ofensivo |
| Ação ofensiva | `COLETA_SCOUT`, `PARTICIPACOES` | `ATQ_*_ACAO_OFENSIVA`, `ACAO` | `LISTA_ACAO_OFENSIVA` | enum válido, sem texto livre; em `COLETA_SCOUT`, o valor ofensivo nasce nas participações ofensivas da jogada | `RESULTADO_FACTUAL`, `CAUSA_PRINCIPAL`, feedback |
| Participação ofensiva | `PARTICIPACOES` | `PAPEL`, `POSICAO`, `FUNCAO_ESPECIAL`, `ACAO`, `RESULTADO_INDIVIDUAL` | `LISTA_PARTICIPA_DEFINICAO`, listas de posição/função/ação | coerência com jogada pai | leitura individual, feedback por atleta |

## 7. Rastreabilidade tática defensiva

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Sistema defensivo estabilizado | `COLETA_SCOUT` | `SISTEMA_DEFENSIVO` | `LISTA_SISTEMA_DEFENSIVO` | exige organização observável | `PARTICIPACOES`, relatório defensivo |
| Posição defensiva | `COLETA_SCOUT`, `PARTICIPACOES` | `DEF_*_POSICAO_DEFENSIVA`, `POSICAO` | `LISTA_POSICAO_DEFENSIVA`, `LISTA_POS_DEF`, `LISTA_POS_DEF_3X0` | não confundir posição com ação; em `COLETA_SCOUT`, a posição defensiva nasce por slot defensivo observado | leitura setorial e individual |
| Ação defensiva | `COLETA_SCOUT`, `PARTICIPACOES` | `DEF_*_ACAO_DEFENSIVA`, `ACAO` | `LISTA_ACAO_DEFENSIVA` | enum válido e compatível com fase | `RESULTADO_INDIVIDUAL`, `CAUSA_PRINCIPAL` |
| Conexão e resposta defensiva | `COLETA_SCOUT` | `CONEXAO_DEFENSIVA`, `ACAO_DEFENSIVA_ESPERADA`, `RESULTADO_DEFENSIVO` | `LISTA_CONEXAO_DEFENSIVA`, `LISTA_COMPORTAMENTO_DEFENSIVO` | não usar como substituto de sistema final; a leitura coletiva precisa se apoiar na execução defensiva observável | leitura coletiva, prioridade de treino |
| Ajuste defensivo | `COLETA_SCOUT` | `AJUSTE_CONTRA_SISTEMA_OF`, `AMEACA_OFENSIVA_PRINCIPAL`, `RESULTADO_AJUSTE_DEFENSIVO` | `LISTA_AJUSTE_DEFENSIVO`, `LISTA_AMEACA_OFENSIVA`, `LISTA_RESULTADO_AJUSTE_DEFENSIVO` | ajuste precisa ser coerente com ameaça e resultado | diagnóstico defensivo |

## 8. Rastreabilidade de transições

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Forma ofensiva de transição | `COLETA_SCOUT` | `FORM_TRANS_OF`, `OBJETIVO_FORM_TRANS_OF` | `LISTA_FORM_TRANS_OF`, `LISTA_OBJETIVO_FORM_TRANS_OF` | só usar antes da estabilização | leitura de transição ofensiva |
| Estrutura ofensiva transitória | `COLETA_SCOUT` | `TR_OF_*`, `STATUS_ESTABILIZACAO_AT_POS`, `MOTIVO_FIM_TRANS_OF` | `LISTA_POS_TRANS_OF`, `LISTA_FUNCAO_TRANS_OF`, `LISTA_STATUS_ESTABILIZACAO_AT_POS`, `LISTA_MOTIVO_FIM_TRANS_OF` | posição transitória não pode ser corrigida pela final | prioridade de treino em transição |
| Forma defensiva de transição | `COLETA_SCOUT` | `FORM_TRANS_DEF`, `OBJETIVO_FORM_TRANS_DEF` | `LISTA_FORM_TRANS_DEF`, `LISTA_OBJETIVO_FORM_TRANS_DEF` | só usar antes da estabilização | leitura de transição defensiva |
| Estrutura defensiva transitória | `COLETA_SCOUT` | `SISTEMA_DEF_TRANS_TEMP`, `ZONA_TRANS_DEF`, `ACAO_TRANS_DEF`, `STATUS_ESTABILIZACAO_DEF_POS`, `MOTIVO_FIM_TRANS_DEF` | `LISTA_SISTEMA_DEF_TRANS_TEMP`, `LISTA_ZONA_TRANS_DEF`, `LISTA_ACAO_TRANS_DEF`, `LISTA_STATUS_ESTABILIZACAO_DEF_POS`, `LISTA_MOTIVO_FIM_TRANS_DEF` | não confundir com sistema defensivo final | relatório e treino de transição |
| Fase da atleta | `PARTICIPACOES` | `FASE_DA_ATLETA` | usa semântica de `LISTA_FASES`/referência tática do contrato | pode divergir legitimamente da fase da bola | leitura individual da transição |

## 9. Rastreabilidade de `OUT` e estrutura numérica

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Situação de `OUT` | `COLETA_SCOUT` | `OUT_SITUACAO` | `LISTA_OUT_SITUACAO` | não usar sem alteração numérica/punitiva observável | leitura contextual do lance |
| Estrutura numérica real | `COLETA_SCOUT` | `ESTRUTURA_NUMERICA_REAL` | `LISTA_ESTRUTURA_NUMERICA_REAL` | obrigatória quando há `OUT` relevante | julgamento técnico correto |
| Ajuste ofensivo em `OUT` | `COLETA_SCOUT` | `SISTEMA_OFENSIVO_AJUSTADO_OUT` | `LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT` | compatível com a estrutura numérica | relatório e treino de `OUT` |
| Ajuste defensivo em `OUT` | `COLETA_SCOUT` | `AJUSTE_DEFENSIVO_OUT`, `AMEACA_PRIORITARIA_OUT` | `LISTA_AJUSTE_DEFENSIVO_OUT`, `LISTA_AMEACA_PRIORITARIA_OUT` | coerência entre ameaça e ajuste | diagnóstico defensivo em inferioridade |
| Resultado/causa de `OUT` | `COLETA_SCOUT` | `RESULTADO_OUT`, `CAUSA_OUT`, `OUT_GATILHO`, `PUNICAO_RESULTADO` | `LISTA_RESULTADO_OUT`, `LISTA_CAUSA_OUT`, `LISTA_OUT_GATILHO`, `LISTA_PUNICAO_RESULTADO` | sem `OUT` sem estrutura e sem causa | prioridade de treino de `OUT` |

## 10. Rastreabilidade de contextos especiais

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Contexto especial | `COLETA_SCOUT` | `CONTEXTO_ESPECIAL` | `LISTA_CONTEXTO_ESPECIAL` | contexto precisa ser compatível com a jogada | leitura de contexto e filtro analítico |
| Shootout | `COLETA_SCOUT` | `SHOOTOUT_ORDEM`, `SHOOTOUT_EQUIPE`, `SHOOTOUT_ATACANTE`, `SHOOTOUT_*` | `LISTA_SHOOTOUT`, `LISTA_SHOOTOUT_RESULTADO`, `LISTA_SHOOTOUT_DECISAO`, `LISTA_SHOOTOUT_EXECUCAO` | só usar em `CONTEXTO_ESPECIAL = SHOOTOUT` | relatório específico de shootout |
| Bola parada | `COLETA_SCOUT` | `TIPO_BOLA_PARADA`, `OBJETIVO_BOLA_PARADA`, `RESULTADO_BOLA_PARADA` | `LISTA_TIPO_BOLA_PARADA` | família precisa corresponder ao evento | leitura de bola parada |
| Tiro de 6m | `COLETA_SCOUT` | `6M_*`, especialmente `6M_RESULTADO` | `LISTA_6M` | só usar em contexto 6m | diagnóstico de cobrança/goleira |
| Tiro livre / reposições | `COLETA_SCOUT` | `TL_*`, `RL_*`, `RG_*`, `RAG_*`, `GG_*` | `LISTA_TIRO_LIVRE`, `LISTA_REPOSICAO_LATERAL`, `LISTA_REPOSICAO_GOLEIRA`, `LISTA_REPOSICAO_APOS_GOL`, `LISTA_GOLDEN_GOAL` | não misturar famílias | relatório e treino situacional |

## 11. Rastreabilidade de finalização e diagnóstico

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Tipo de finalização | `COLETA_SCOUT` | `TIPO_FINALIZACAO` | `LISTA_TIPO_FINALIZACAO` | enum válido e contexto compatível | resultado, goleira, relatório |
| Destino/região | `COLETA_SCOUT` | `DESTINO_ARREMESSO`, `REGIAO_ARREMESSO` | `LISTA_DESTINO_ARREMESSO`, `LISTA_REGIAO_ARREMESSO` | não confundir lado/altura | goleira, feedback técnico |
| Resultado factual e pontuação | `COLETA_SCOUT`, `COLETA_AO_VIVO` | `RESULTADO_FACTUAL`, `PONTOS_JOGADA`, `MOTIVO_PONTUACAO` | `LISTA_RESULTADO_FACTUAL` (16 desfechos), `LISTA_PONTOS`, `LISTA_MOTIVO_PONTUACAO` | resultado factual é desfecho da sequência, não só de finalização; `MOTIVO_PONTUACAO` obrigatório quando `GOL` | relatório, dashboard |
| Filtro Fase → Ação → Resultado | `COLETA_AO_VIVO` | `RESULTADO_FACTUAL`, `ACAO_PRINCIPAL`, `FASE_DA_BOLA` | `LISTA_ACAO_PRINCIPAL_AT_POS`, `LISTA_ACAO_PRINCIPAL_DEF_POS`, `LISTA_ACAO_PRINCIPAL_TRANS_OF`, `LISTA_ACAO_PRINCIPAL_TRANS_DEF`, `LISTA_RESULTADO_FACTUAL` | resultado filtrado por fase; ação custom aciona fallback por fase, não lista global; listas `LISTA_ACAO_PRINCIPAL_*` são sugestivas, não enum bloqueante | UX ao vivo, piloto |
| Causa principal | `COLETA_SCOUT`, `PARTICIPACOES` | `CAUSA_PRINCIPAL` | `LISTA_CAUSA_PRINCIPAL` | não usar como opinião solta | `PRIORIDADE_TREINO`, feedback |

## 12. Rastreabilidade da goleira

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Técnica da goleira em contextos especiais | `COLETA_SCOUT` | `SHOOTOUT_TECNICA_GOLEIRA`, `6M_TECNICA_GOLEIRA` | `LISTA_TECNICA_DEFESA` | separar técnica de resultado; não generalizar para jogada aberta sem evidência específica | relatório de goleira |
| Postura, reação e decisão da goleira | `COLETA_SCOUT` | `POSTURA_INICIAL_GOL`, `FORMA_DE_REACAO_GOL`, `TOMADA_DECISAO_GOL`, `RESPOSTA_GOLEIRA` | `LISTA_POSTURA_GOLEIRA`, `LISTA_REACAO_GOLEIRA`, `LISTA_DECISAO_GOLEIRA`, `LISTA_RESPOSTA_GOLEIRA` | não julgar só pelo desfecho | feedback específico |
| Continuidade ofensiva da goleira | `COLETA_SCOUT` | `QUALIDADE_REPOSICAO_GOL`, `TIPO_PASSE_GOL`, `VISAO_JOGO_GOL` | `LISTA_QUALIDADE_REPOSICAO_GOL`, `LISTA_TIPO_PASSE_GOL`, `LISTA_VISAO_JOGO_GOL` | precisa de evidência de leitura/continuidade | treino de goleira e saída |

## 13. Rastreabilidade mental/comportamental

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Evento mental longo | `EVENTOS_MENTAIS` | `CODIGO_MENTAL`, `MARCA_MENTAL`, `OBS_MENTAL` | `LISTA_CODIGO_MENTAL`, `LISTA_MARCA_MENTAL` | exige evidência observável | relatório mental, feedback |
| Contexto de pressão | `EVENTOS_MENTAIS`, `COLETA_SCOUT` | `CONTEXTO_PRESSAO` | `LISTA_CONTEXTO_PRESSAO` | condicional no workbook, mas obrigatório quando o evento depende do contexto | leitura contextual, rastreio mental |
| Gatilho/resposta | `EVENTOS_MENTAIS`, `COLETA_SCOUT` | `EVENTO_MENTAL_GATILHO`, `RESPOSTA_APOS_ERRO`, `IMPACTO_ERRO_ANTERIOR`, `COMPORTAMENTO_PRESSAO`, `QUALIDADE_RESET_MENTAL` | listas mentais correspondentes | não diagnosticar estado interno invisível | prioridade mental e feedback |
| Comunicação crítica | `COLETA_SCOUT`, `EVENTOS_MENTAIS` | `COMUNICACAO_MOMENTO_CRITICO` | `LISTA_COMUNICACAO_MOMENTO_CRITICO` | precisa de comportamento observável | liderança, feedback, relatório mental |
| Linguagem corporal/perfil | `COLETA_SCOUT`, `EVENTOS_MENTAIS` | `LINGUAGEM_CORPORAL`, `PERFIL_PRESSAO_JOGO`, `SEQUENCIA_ERROS_ATLETA`, `ACAO_POS_ERRO` | listas mentais correspondentes | não transformar amostra curta em perfil fechado | leitura longitudinal |

## 14. Rastreabilidade de prioridade, relatório e feedback

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Prioridade de treino | `COLETA_SCOUT`, `PARTICIPACOES`, `EVENTOS_MENTAIS`, `RELATORIO` | `PRIORIDADE_TREINO` | `LISTA_PRIORIDADE_TREINO` | precisa de causa/padrão/evidência | planejamento de treino |
| Revisão formal | `VALIDACAO` | `CAMPO_REVISADO`, `VALOR_ORIGINAL`, `VALOR_CORRIGIDO`, `STATUS_VALIDACAO`, `MOTIVO_CORRECAO` | `LISTA_STATUS_VALIDACAO` | sem revisão sem rastro | publicação analítica |
| Bloco de relatório | `RELATORIO` | `BLOCO_RELATORIO`, `INDICADOR`, `VALOR`, `AMOSTRA`, `IDS_EVIDENCIA` | `LISTA_BLOCO_RELATORIO` | relatório sem bloco/evidência não publica | leitura técnica agregada |
| Feedback | `FEEDBACK` | `DESTINATARIO_FEEDBACK`, `ATLETA_FEEDBACK`, `TIPO_FEEDBACK`, `TEMA_FEEDBACK`, `PRIORIDADE_FEEDBACK`, `STATUS_FEEDBACK` | `LISTA_DESTINATARIO_FEEDBACK`, `LISTA_TIPO_FEEDBACK`, `LISTA_PRIORIDADE_FEEDBACK`, `LISTA_STATUS_FEEDBACK` | destinatário deve bater com o alvo | ação prática no treino/jogo |

## 15. Rastreabilidade de projeções da atleta e metas derivadas

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Visão individual da atleta | `VISAO_ATLETA_SCOUT` | `ID_ATLETA`, `TIPO_VISAO`, `IDS_EVIDENCIA`, `ORIGEM_RELATORIO`, `ORIGEM_FEEDBACK` | tipos derivados do contrato técnico (`EVENTO_BRUTO`, `RESUMO_POR_JOGO`, `INDICADOR_AGREGADO`, `HISTORICO_POR_PERIODO`) | só publica visão rastreável, escopo individual correto | portal da atleta, leitura individual |
| Resumo por jogo da atleta | `VISAO_ATLETA_SCOUT` | `ID_ATLETA`, `ID_JOGO`, `RESUMO_VISUALIZAVEL`, `LEITURA_TECNICA_RESUMIDA` | tipo derivado `RESUMO_POR_JOGO` | precisa apontar para jogo e evidência reais | portal da atleta, histórico por jogo |
| Indicador agregado / histórico | `VISAO_ATLETA_SCOUT` | `PERIODO_REFERENCIA`, `INDICADOR`, `VALOR`, `AMOSTRA` | tipos derivados `INDICADOR_AGREGADO`, `HISTORICO_POR_PERIODO` | agregado não substitui origem rastreável | tendência, acompanhamento individual |
| Meta individual derivada do scout | vínculo derivado scout -> meta | `ID_META_INDIVIDUAL_SCOUT`, `ATLETA_FEEDBACK`, `PRIORIDADE_TREINO`, `IDS_EVIDENCIA` | depende do contrato principal de metas + listas de feedback/prioridade | alvo individual precisa bater com a evidência | metas da atleta, plano de treino |
| Meta de equipe derivada do scout | vínculo derivado scout -> meta | `ID_META_EQUIPE_SCOUT`, `DESTINATARIO_FEEDBACK`, `PRIORIDADE_TREINO`, `IDS_EVIDENCIA` | depende do contrato principal de metas + listas de feedback/prioridade | não publicar como meta individual | metas coletivas, planejamento da equipe |

## 16. Rastreabilidade de cadastros

| Conceito | Contrato primário | Campos-chave | Listas | Validação mínima | Derivados |
|---|---|---|---|---|---|
| Cadastro tático da atleta | `CAD_ATLETAS` | `ID_ATLETA`, `MAO_DOMINANTE`, `FUNCAO_PRINCIPAL`, `POS_OF_3X1`, `POS_OF_4X0`, `POS_DEF_3X0`, `GOLEIRA`, `ESPECIALISTA`, `PLAYMAKER` | listas de cadastro correspondentes | referência deve existir e ser padronizada | `PARTICIPACOES`, feedback, análise tática |
| Cadastro de equipe | `CAD_EQUIPES` | `ID_EQUIPE`, `NOME_EQUIPE`, `TIPO_EQUIPE`, `CATEGORIA` | `LISTA_TIPO_EQUIPE`, `LISTA_CATEGORIA` | equipe referida na sessão precisa existir | contexto de jogo, adversário, filtros |

## 17. Gates de rastreabilidade obrigatórios

### 17.1 Gate de origem

Todo conceito precisa apontar para ao menos um campo operacional real.

### 17.2 Gate de enum

Todo campo categórico precisa apontar para ao menos uma lista oficial.

### 17.3 Gate de consistência

Todo conceito precisa apontar para ao menos uma regra de validação relevante.

### 17.4 Gate de derivação

Todo conceito relevante para análise precisa apontar para saída derivada ou justificar por que não deriva.

### 17.5 Gate de publicação atleta-facing

Toda projeção para a atleta precisa apontar para:

- origem rastreável;
- escopo individual ou coletivo elegível;
- regra explícita de publicação.

## 18. Gaps residuais após a Etapa A

Depois desta matriz, os gaps restantes já não são de significado macro, mas de implementação detalhada:

1. escolher modelo físico Supabase-first;
2. decidir nomes finais de tabelas/colunas;
3. converter esta matriz em schema e testes;
4. sanear futuramente as linhas de template incorreto no workbook original.

## 19. Veredito

Com esta matriz, a Etapa A fica conceitualmente fechada.

Agora já existe ponte explícita entre:

- conceito
- contrato
- campo
- lista
- validação
- derivado
- projeção publicada

O próximo passo lógico deixa de ser “descobrir o scout”.

Passa a ser **planejar e implementar o contrato técnico Supabase-first do scout**.
