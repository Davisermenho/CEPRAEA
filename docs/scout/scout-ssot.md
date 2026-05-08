---
tipo: SSOT-TEMATICA
nome: "Scout — SSOT Semântica"
papel: "Define a semântica canônica do domínio de scout do HB Track/CEPRAEA: conceitos nucleares, precedência, distinções obrigatórias e regras de interpretação que devem governar catálogo, listas, validações e implementação futura."
autoridade: "Hierarquia 3/4 para o domínio scout — prevalece sobre interpretação livre de agentes e sobre artefatos órfãos de frontend; perde apenas para correção factual revalidada do catálogo operacional quando este documento ainda estiver incompleto."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "antes de planejar implementação do scout; ao modelar schema, types, formulários ou relatórios; ao decidir significado de campo, código ou lista do scout."
atualizado_por: "Agente executor + confirmação humana"
quando_atualizar: "um conceito central do scout mudar; um gap semântico do workbook/manual for resolvido; nova família de campos passar a fazer parte da SSOT."
validade: "2026-05-07"
status: PARCIAL
status_nota: "Documento semântico inicial da Etapa A. Não substitui ainda catálogo completo de campos, listas, dicionário e validações."
conflito: "Se este documento divergir da planilha operacional em catálogo ou enumeração exata, revalidar o workbook; se divergir sobre semântica e o workbook não fechar a semântica, este documento prevalece até decisão explícita."
proibido:
  - "Agentes NÃO devem implementar o scout usando apenas código residual ou memória de planilhas antigas."
  - "NÃO devem inferir significado de código sem base nesta SSOT, no dicionário ou no catálogo derivado."
nao_cobre: "Schema final de banco, layout de UI, catálogo completo de todos os campos, todas as listas e todos os códigos."
---

# Scout — SSOT Semântica

## 1. Objetivo

Este documento fixa a **semântica canônica** do scout antes da implementação.

Ele existe para impedir quatro erros recorrentes:

1. confundir fase da bola com fase da atleta;
2. confundir transição com sistema estabilizado;
3. confundir ocupação temporária com mudança de sistema;
4. codar a partir de interpretação livre quando a planilha já contém estrutura operacional.

## 2. Precedência durante a consolidação

Enquanto a Etapa A não estiver completa, usar esta precedência:

1. `docs/scout/scout-ssot.md`
2. `docs/scout/scout-reconciliacao-manuscout-xlsx.md`
3. `.files/analise/Tabela_Mestre_dos_Campos.xlsx`
4. `.files/MANUSCOUT.md`
5. código residual do scout apenas como referência histórica

Regra:

- este documento governa **significado**;
- a planilha governa **catálogo operacional**;
- documentos derivados futuros governarão **campos, listas, dicionário e validações**.

## 3. Unidade de observação

### 3.1 Unidade primária

A unidade primária do scout é a **sequência observada** identificada por `ID_JOGADA`.

`ID_JOGADA` deve ligar:

- coleta principal;
- participações por atleta;
- eventos mentais;
- validação;
- relatório;
- feedback;
- evidência de vídeo.

### 3.2 Estruturas derivadas

O domínio do scout é composto por seis contratos lógicos:

1. `COLETA_SCOUT`
2. `PARTICIPACOES`
3. `EVENTOS_MENTAIS`
4. `VALIDACAO`
5. `RELATORIO`
6. `FEEDBACK`

Regra:

- `COLETA_SCOUT` registra a jogada;
- `PARTICIPACOES` decompõe a jogada por atleta;
- `EVENTOS_MENTAIS` registra camada psicológica/comportamental;
- `VALIDACAO` registra correções e revisão;
- `RELATORIO` deriva leitura técnica agregada;
- `FEEDBACK` transforma leitura em orientação prática.

## 4. Conceitos nucleares

### 4.1 `FASE_DA_BOLA`

`FASE_DA_BOLA` descreve a **fase funcional da sequência**.

Valores-base:

- `AT_POS`
- `DEF_POS`
- `TRANS_OF`
- `TRANS_DEF`

Regra:

- ela governa quais blocos de análise são compatíveis com a jogada;
- é a referência principal para decidir o tipo de organização da sequência;
- não deve ser reescrita com base em impressão subjetiva posterior.

### 4.2 `FASE_DA_ATLETA`

`FASE_DA_ATLETA` descreve a **fase funcional em que a atleta estava atuando dentro da sequência**, que pode diferir da fase global da bola.

Regra:

- a atleta pode estar em transição antes de o sistema coletivo estabilizar;
- a atleta pode antecipar função, troca ou cobertura sem que isso mude sozinha a fase da bola;
- `FASE_DA_ATLETA` nunca deve ser inferida automaticamente da posição final estabilizada.

### 4.3 Transição

Transição é o estado em que ação, posição ou função ainda ocorre **antes da estabilização do sistema final**.

Regra:

- transição não é “erro de preenchimento”;
- transição é um estado observável com semântica própria;
- posição/função registrada na transição não deve ser corrigida retroativamente pela posição do sistema posicionado.

### 4.4 Sistema estabilizado

Sistema estabilizado é a organização coletiva já formada e reconhecível como ataque ou defesa posicionada.

Regra:

- só depois da estabilização é legítimo preencher leitura de sistema final;
- estabilização não apaga a leitura anterior da transição;
- transição e sistema estabilizado são camadas complementares, não concorrentes.

## 5. Taxonomia tática ofensiva

### 5.1 `AT_3X1`

`AT_3X1` é a estrutura ofensiva com:

- três armadoras/externas de construção;
- uma pivô fixa como referência interna estabilizada.

### 5.2 `AT_4X0`

`AT_4X0` é a estrutura ofensiva com:

- quatro armadoras/externas;
- ausência de pivô fixa estabilizada.

### 5.3 Pivô fixa

Pivô fixa é a atleta que ocupa de forma estabilizada a função interna de pivô no sistema ofensivo.

### 5.4 Pivô temporária

Pivô temporária é a ocupação **situacional** da zona/função de pivô dentro de uma ação, sem redefinir por si só o sistema estabilizado.

### 5.5 Regra de não mutação indevida

Regra obrigatória:

- ocupação interna temporária no `AT_4X0` **não transforma automaticamente** a jogada em `AT_3X1`;
- para mudar de `AT_4X0` para `AT_3X1`, é necessária evidência de estabilização estrutural com pivô fixa;
- “pareceu 3x1” não é critério válido sem evidência funcional.

## 6. Estrutura numérica e OUT

### 6.1 `ESTRUTURA_NUMERICA_REAL`

Este campo registra a realidade numérica da jogada.

Valores-base conhecidos no catálogo:

- `OF_4_DEF_3`
- `OF_3_DEF_3`
- `OF_4_DEF_2`
- `OF_3_DEF_2`
- `NAO_OBSERVADO`

### 6.2 Regra funcional de OUT

Regras obrigatórias:

- `OUT_ATAQUE` deve ser interpretado no contexto de `OF_3_DEF_3`;
- `OUT_DEFESA` deve ser interpretado no contexto de `OF_4_DEF_2`;
- um gol sofrido em `OF_4_DEF_2` não é automaticamente falha defensiva;
- contexto numérico altera o critério de julgamento da ação.

## 7. Goleira

A goleira deve ser analisada como:

1. última peça defensiva;
2. primeira peça ofensiva.

O subdomínio da goleira deve considerar, no mínimo:

- leitura do desfecho;
- lateralidade da atacante;
- qualidade da reposição;
- tipo de passe da goleira;
- visão/decisão de jogo da goleira.

Campos nucleares já identificados no catálogo:

- `MAO_DOMINANTE_ATACANTE`
- `QUALIDADE_REPOSICAO_GOL`
- `TIPO_PASSE_GOL`
- `VISAO_JOGO_GOL`

Regra:

- a análise da goleira não pode ser reduzida ao resultado do arremesso;
- deve incorporar técnica, decisão e continuidade ofensiva.

## 8. Contextos especiais

`CONTEXTO_ESPECIAL` existe para sinalizar situações cuja leitura não deve seguir o mesmo regime de uma jogada-base comum.

Este documento reconhece como mínimos:

- `SHOOTOUT`
- `TIRO_6M`
- `TIRO_LIVRE`
- `REPOSICAO_LATERAL`
- `REPOSICAO_GOLEIRA`
- `REPOSICAO_APOS_GOL`
- `BOLA_FORA`
- `EXCLUSAO`
- `INFERIORIDADE_NUM`
- `SUPERIORIDADE_NUM`
- `GOLDEN_GOAL`
- `FIM_SET`
- `ULTIMA_POSSE`

Regra:

- contextos especiais exigem famílias próprias de campos e listas;
- eles não devem ser comprimidos à leitura simplificada de ataque/defesa posicionado;
- o contexto especial modifica a interpretação da ação e do julgamento.

## 9. Eventos mentais e comunicação crítica

O scout mental/comportamental é parte do domínio oficial, não apêndice opcional.

### 9.1 Princípio

Registrar:

- fato observável;
- contexto de pressão;
- impacto no lance;
- consequência recomendada.

Não registrar:

- rótulo subjetivo solto;
- traço de personalidade inferido sem evidência observável.

### 9.2 `COMUNICACAO_MOMENTO_CRITICO`

Esta família deve distinguir pelo menos:

- comunicação positiva;
- comunicação técnica/funcional;
- comunicação ausente;
- comunicação negativa;
- comunicação confusa.

Regra:

- a taxonomia final deve ser fechada no dicionário textual;
- até lá, nenhuma categoria nova deve ser inventada fora da lista oficial.

## 10. Prioridade de treino

`PRIORIDADE_TREINO` é uma saída analítica, não um palpite livre.

Ela deve ser derivada de combinação explícita de:

- impacto da jogada;
- recorrência do padrão;
- gravidade do erro ou mérito;
- valor contextual da sequência;
- efeito coletivo observado.

Regra:

- prioridade de treino deve existir em `COLETA_SCOUT`, `PARTICIPACOES`, `EVENTOS_MENTAIS`, `RELATORIO` e `FEEDBACK` apenas como consequência de análise;
- não deve ser preenchida por preferência momentânea da analista.

## 11. Não confundir

Estas distinções são obrigatórias:

### 11.1 `FASE_DA_BOLA` vs `FASE_DA_ATLETA`

- fase da bola = estado funcional da sequência;
- fase da atleta = estado funcional da participação individual.

### 11.2 Transição vs sistema estabilizado

- transição = antes da organização final;
- sistema estabilizado = organização coletiva já formada.

### 11.3 Pivô fixa vs pivô temporária

- pivô fixa = função estrutural estabilizada;
- pivô temporária = ocupação situacional.

### 11.4 Fato observado vs causa principal

- fato observado = o que aconteceu;
- causa principal = leitura analítica da origem mais provável.

### 11.5 Mérito adversário vs falha própria

- nem todo desfecho negativo é falha própria;
- nem todo sucesso próprio elimina mérito adversário ou contexto especial.

### 11.6 Contexto especial vs fase-base

- contexto especial qualifica a jogada;
- fase-base não substitui a necessidade de contexto especial quando ele existir.

## 12. Regras para implementação futura

Nenhuma implementação do scout deve começar sem respeitar estas condições:

1. catálogo textual de campos derivado do workbook;
2. listas textuais fechadas;
3. dicionário textual dos códigos;
4. validações textuais mínimas;
5. matriz de rastreabilidade:
   - `conceito -> campo -> lista -> validação -> derivado`

## 13. Próximos documentos derivados obrigatórios

Este documento deve ser seguido por:

1. `docs/scout/scout-campos.md`
2. `docs/scout/scout-listas.md`
3. `docs/scout/scout-dicionario-codigos.md`
4. `docs/scout/scout-validacoes.md`
5. `docs/scout/scout-rastreabilidade.md`

## 14. Veredito atual

**Veredito:** o domínio do scout já está suficientemente estruturado para consolidação textual, mas **ainda não está pronto para implementação direta**.

O próximo passo lógico após este documento é expandir o catálogo textual e o dicionário, não abrir runtime de scout no app.
