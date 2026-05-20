---
tipo: SSOT-TEMATICA
nome: "Scout — SSOT Semântica"
papel: "Define a semântica canônica do domínio de scout do HB Track/CEPRAEA: conceitos nucleares, precedência, distinções obrigatórias e regras de interpretação que devem governar catálogo, listas, validações e implementação futura."
autoridade: "Hierarquia 3/4 para o domínio scout — prevalece sobre interpretação livre de agentes e sobre artefatos órfãos de frontend; perde apenas para correção factual revalidada do catálogo operacional quando este documento ainda estiver incompleto."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "antes de planejar implementação do scout; ao modelar schema, types, formulários ou relatórios; ao decidir significado de campo, código ou lista do scout."
atualizado_por: "Codex — 18 de maio de 2026"
quando_atualizar: "um conceito central do scout mudar; um gap semântico do workbook/manual for resolvido; nova família de campos passar a fazer parte da SSOT."
validade: "2026-05-18"
status: ATIVO
status_nota: "ATIVO para COLETA_AO_VIVO (RULES-03, UX-04, CEPR-0046/0047 incorporados) e para a semântica das saídas do scout para atleta e metas. Outros contratos (COLETA_SCOUT, PARTICIPACOES, relatório e dashboard) ainda parciais."
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

O domínio do scout é composto por sete contratos lógicos:

1. `COLETA_SCOUT`
2. `PARTICIPACOES`
3. `EVENTOS_MENTAIS`
4. `VALIDACAO`
5. `RELATORIO`
6. `FEEDBACK`
7. `VISAO_ATLETA_SCOUT`

Regra:

- `COLETA_SCOUT` registra a jogada;
- `PARTICIPACOES` decompõe a jogada por atleta;
- `EVENTOS_MENTAIS` registra camada psicológica/comportamental;
- `VALIDACAO` registra correções e revisão;
- `RELATORIO` deriva leitura técnica agregada;
- `FEEDBACK` transforma leitura em orientação prática;
- `VISAO_ATLETA_SCOUT` transforma leitura validada em consumo individual controlado pela atleta.

### 3.3 Regra de saída derivada

O scout não termina na coleta.

Regra:

- a coleta gera leitura técnica;
- a leitura técnica pode gerar relatório;
- o relatório e o feedback podem gerar metas;
- a leitura validada pode gerar visualização para a atleta;
- nenhuma dessas saídas deve contradizer a sequência observada registrada por `ID_JOGADA`.

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

## 10. Prioridade de treino, metas e saídas analíticas

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

### 10.1 Saídas mínimas obrigatórias do scout

Quando o scout for consumido fora da coleta bruta, ele deve conseguir produzir pelo menos estas saídas:

1. `eventos brutos` da atleta;
2. `resumo por jogo`;
3. `indicadores agregados`;
4. `histórico por período`;
5. `prioridades de treino`;
6. `feedbacks acionáveis`;
7. `metas derivadas do scout`.

Regra:

- essas saídas são derivadas do scout, não reescritas manuais independentes;
- cada saída deve preservar rastreabilidade para `ID_JOGADA`, jogo, atleta, período ou agregação correspondente;
- nenhuma saída analítica deve apagar o dado bruto que a originou.

### 10.2 Metas derivadas do scout

O scout pode originar metas formais no produto.

Tipos mínimos reconhecidos:

- `META_INDIVIDUAL_SCOUT`: meta específica para uma atleta a partir de padrão observado no scout;
- `META_EQUIPE_SCOUT`: meta coletiva derivada de padrão recorrente da equipe.

Regra:

- meta derivada de scout não é comentário livre;
- deve estar vinculada a evidência observável, padrão agregado ou prioridade de treino;
- deve manter referência ao período, jogo ou conjunto de jogadas que motivou sua criação;
- quando a meta for individual, a visualização da atleta deve mostrar apenas a meta vinculada a si;
- quando a meta for da equipe, a visualização pode ser compartilhada com todo o grupo elegível.

### 10.3 Relação entre feedback e meta

`FEEDBACK` e `META_*` não são sinônimos.

Regra:

- `FEEDBACK` orienta, comenta e contextualiza;
- `META_*` formaliza objetivo acompanhável no produto;
- um feedback pode existir sem virar meta;
- uma meta derivada de scout deve nascer de leitura suficientemente estável para acompanhamento posterior.

## 11. Visibilidade e leitura para a atleta

O scout visível para a atleta faz parte do produto e não pode ser tratado como exportação improvisada.

### 11.1 Escopo mínimo da visualização da atleta

A atleta deve poder visualizar, no mínimo:

- seus eventos brutos;
- seu resumo por jogo;
- seus indicadores agregados;
- seu histórico por período;
- seus feedbacks vinculados;
- suas metas individuais derivadas do scout;
- metas da equipe derivadas do scout quando publicadas para o grupo.

### 11.2 Regra de escopo e privacidade

Regras obrigatórias:

- a atleta vê apenas dados individuais vinculados a si e metas de equipe publicadas para sua equipe;
- a atleta não vê eventos brutos, indicadores ou metas individuais de outras atletas;
- a comissão técnica pode acessar a visão ampliada da equipe;
- toda visualização atleta-facing deve vir de dado validado, e não de rascunho transitório de coleta.

### 11.3 Regra de interpretação na visualização da atleta

Regras obrigatórias:

- a visualização da atleta deve preservar diferença entre dado bruto, resumo, agregado e histórico;
- agregado não substitui evidência bruta quando a rastreabilidade for necessária;
- resumo por jogo não deve ser apresentado como avaliação global do período;
- feedback e meta derivados do scout devem deixar claro seu contexto de origem.

## 12. Não confundir

Estas distinções são obrigatórias:

### 12.1 `FASE_DA_BOLA` vs `FASE_DA_ATLETA`

- fase da bola = estado funcional da sequência;
- fase da atleta = estado funcional da participação individual.

### 12.2 Transição vs sistema estabilizado

- transição = antes da organização final;
- sistema estabilizado = organização coletiva já formada.

### 12.3 Pivô fixa vs pivô temporária

- pivô fixa = função estrutural estabilizada;
- pivô temporária = ocupação situacional.

### 12.4 Fato observado vs causa principal

- fato observado = o que aconteceu;
- causa principal = leitura analítica da origem mais provável.

### 12.5 Mérito adversário vs falha própria

- nem todo desfecho negativo é falha própria;
- nem todo sucesso próprio elimina mérito adversário ou contexto especial.

### 12.6 Contexto especial vs fase-base

- contexto especial qualifica a jogada;
- fase-base não substitui a necessidade de contexto especial quando ele existir.

## 13. Regras para implementação futura

Nenhuma implementação do scout deve começar sem respeitar estas condições:

1. catálogo textual de campos derivado do workbook;
2. listas textuais fechadas;
3. dicionário textual dos códigos;
4. validações textuais mínimas;
5. matriz de rastreabilidade:
   - `conceito -> campo -> lista -> validação -> derivado`
6. definição explícita das saídas atleta-facing do scout e das regras de visibilidade
7. regra explícita de vínculo entre prioridade, feedback e metas derivadas do scout

## 14. Próximos documentos derivados obrigatórios

Este documento deve ser seguido por:

1. `docs/scout/scout-campos.md`
2. `docs/scout/scout-listas.md`
3. `docs/scout/scout-dicionario-codigos.md`
4. `docs/scout/scout-validacoes.md`
5. `docs/scout/scout-rastreabilidade.md`
6. contrato de projeções de leitura atleta-facing no documento técnico do scout

## 15. Veredito atual

A SSOT da `COLETA_AO_VIVO` está **ativa e sincronizada** com `RULES-03`, `UX-04`, `CEPR-0046` e `CEPR-0047`.

Este status não declara o scout completo finalizado. `COLETA_SCOUT`, `PARTICIPACOES`, relatórios, dashboard e feedbacks completos continuam parciais, embora a semântica de leitura da atleta e de metas derivadas do scout passe a estar fixada aqui.

## 16. RULES-03/UX-04 — Decisões semânticas incorporadas (CEPR-0046/0047)

### 16.1 `RESULTADO_FACTUAL` como desfecho da sequência

`RESULTADO_FACTUAL` é o **desfecho objetivo da sequência observada**, não exclusivamente o resultado de um arremesso.

Pode ser:
- resultado de finalização: `GOL`, `DEFENDIDO`, `BLOQUEADO`, `FORA`, `TRAVE`
- violação: `VIOLACAO`
- perda de posse: `PERDA`, `ERRO_TROCA`, `FALTA_ATAQUE`, `PASSIVO`
- recuperação de posse: `RECUPERACAO_POSSE`
- desfecho de transição: `TRANSICAO_NEUTRALIZADA`, `DEFESA_ESTABILIZADA`, `VANTAGEM_CRIADA`, `VANTAGEM_PERDIDA`
- não observado: `NAO_OBSERVADO`

**Não é:** causa provável, diagnóstico técnico, prioridade de treino.
**Não é:** exclusivo de fases com arremesso — `DEF_POS`, `TRANS_OF` e `TRANS_DEF` têm desfechos próprios.

### 16.2 `MOTIVO_PONTUACAO` — campo condicional obrigatório

`MOTIVO_PONTUACAO` é obrigatório quando `RESULTADO_FACTUAL = GOL`.

Ele explica por que o gol vale 1 ou 2 pontos. **Não é causa do gol. Não é tipo de finalização genérico.**

Exemplos:
- `SIMPLES` → gol de 1 ponto por arremesso comum
- `GIRO` → gol de 2 pontos por arremesso de giro
- `AEREA` → gol de 2 pontos por aérea
- `ESPECIALISTA` → gol por especialista (2 pontos)
- `GOLEIRA` → gol da goleira (2 pontos)

Não se aplica quando `RESULTADO_FACTUAL ≠ GOL`.

### 16.3 Matriz Fase → Ação → Resultado (RULES-04/UX-04)

A tela de coleta ao vivo filtra `RESULTADO_FACTUAL` pela combinação de `FASE_DA_BOLA` + `ACAO_PRINCIPAL`.

Regras:
- ação de finalização (`GIRO`, `AEREA`, `ARREM_SIMP`, etc.) → resultados de arremesso
- ação sem finalização (`ERRO_PASSE`, `PERDA_OFENSIVA`, `PASSIVO_DECISAO`) → resultados ofensivos sem arremesso
- bloqueio defensivo (`BLOQUEIO` + finalização adversária enfrentada) → resultados de arremesso
- ações de transição → resultados de transição

**Ação custom/desconhecida:** aciona fallback por fase — não retorna lista global.

| Fase | Fallback para ação custom |
|---|---|
| `AT_POS` | `GOL`, `DEFENDIDO`, `BLOQUEADO`, `FORA`, `TRAVE`, `PERDA`, `VIOLACAO`, `PASSIVO`, `NAO_OBSERVADO` |
| `DEF_POS` | `GOL`, `DEFENDIDO`, `BLOQUEADO`, `RECUPERACAO_POSSE`, `FALTA_ATAQUE`, `PERDA`, `VIOLACAO`, `NAO_OBSERVADO` |
| `TRANS_OF` | `GOL`, `DEFENDIDO`, `BLOQUEADO`, `FORA`, `TRAVE`, `VANTAGEM_CRIADA`, `VANTAGEM_PERDIDA`, `PERDA`, `ERRO_TROCA`, `VIOLACAO`, `PASSIVO`, `NAO_OBSERVADO` |
| `TRANS_DEF` | `TRANSICAO_NEUTRALIZADA`, `DEFESA_ESTABILIZADA`, `RECUPERACAO_POSSE`, `GOL`, `DEFENDIDO`, `BLOQUEADO`, `PERDA`, `ERRO_TROCA`, `VIOLACAO`, `NAO_OBSERVADO` |

### 16.3.1 Passivo como Resultado vs Contexto

Jogo passivo pode ocorrer em `AT_POS` e `TRANS_OF`.

Em `COLETA_AO_VIVO`, `PASSIVO` como `RESULTADO_FACTUAL` só deve ser usado quando a posse é perdida ou interrompida pela regra. Quando ainda há arremesso, o passivo deve ser registrado como contexto do lance, não como resultado factual.

Regra operacional do `CEPR-0097/CEPR-0100`:

- o preset `Arremesso forçado por passivo` é atalho operacional da `COLETA_AO_VIVO`;
- ele não substitui a regra de jogo passivo;
- ele aparece em `AT_POS + ARREMESSO` e `TRANS_OF + ARREMESSO`;
- ele grava automaticamente `contexto_decisao_code = PASSIVO_SINALIZADO`;
- ele grava automaticamente `contexto_arremesso_code = SOB_PASSIVO`;
- o resultado factual continua sendo o desfecho observado do arremesso, por exemplo `GOL`, `DEFENDIDO`, `BLOQUEADO`, `FORA`, `TRAVE`, `VIOLACAO` ou `NAO_OBSERVADO`.

### 16.3.2 Bloco Visual `Finalização` (CEPR-0099/CEPR-0100)

`AT_POS + ARREMESSO` e `TRANS_OF + ARREMESSO` devem compartilhar o mesmo bloco visual `Finalização` na `COLETA_AO_VIVO`.

O bloco comum representa o arremesso em si:

- tipo técnico da finalização;
- resultado factual;
- motivo da pontuação quando houver `GOL`;
- pontos da jogada quando houver `GOL`.

Os contextos continuam separados por fase:

- `AT_POS`: sistema ofensivo, ação preparatória e preset rápido de passivo;
- `TRANS_OF`: estrutura da transição, preset rápido de passivo e detalhes avançados da transição.

Compatibilidade:

- em `AT_POS` e `TRANS_OF`, a UI exibe `Simples`, `Giro` e `Aérea` no bloco `Finalização` e persiste a escolha em `tipo_finalizacao_code`;
- `classificacao_acao_code` permanece legível para dados antigos e para fluxos que ainda usam classificação própria, como bloqueio/defesa;
- em `AT_POS + ARREMESSO` e `TRANS_OF + ARREMESSO`, `tipo_finalizacao_code` aceita apenas `SIMPLES`, `GIRO` e `AEREA` para arremesso corrido;
- `6M` não deve ser salvo como tipo manual de arremesso corrido; cobranças de 6m usam ações específicas (`FINALIZACAO_6M_FAV` ou `FINALIZACAO_6M_ADV`).

### 16.3.3 Bloqueio defensivo pós-CEPR-0092

Em `DEF_POS + BLOQUEIO`, a coleta separa dois conceitos:

- `classificacao_acao_code`: finalização adversária enfrentada (`GIRO`, `AEREA`, `ARREM_SIMPLES`, `6M_ADV`, `NAO_OBSERVADO`);
- `execucao_bloqueio_code`: execução do bloqueio (`EXECUTADO`, `NAO_EXECUTADO`, `ATRASADO`, `MAL_SINCRONIZADO`, `NAO_OBSERVADO`).

Codes legados `BLOQ_GIRO`, `BLOQ_ARREM_SIMPLES`, `BLOQ_AEREA` e `BLOQ_NAO_EXECUTADO` não devem aparecer em novos registros de `classificacao_acao_code`.

Regra operacional:

- `GIRO`, `AEREA`, `ARREM_SIMPLES` e `6M_ADV` podem derivar `tipo_finalizacao_code`;
- `NAO_OBSERVADO` salva sem `tipo_finalizacao_code` e fica pendente de revisão quando necessário;
- `TIRO_6M_CONCEDIDO` é resultado factual de concessão de tiro de 6m, não cobrança/finalização concluída.

### 16.4 `ACAO_PRINCIPAL` — campo semi-livre com sugestão por fase

`ACAO_PRINCIPAL` é alimentado por quatro listas sugestivas (`LISTA_ACAO_PRINCIPAL_*`), uma por fase. Essas listas **não são enum bloqueante**. Valor custom curto e controlado é permitido.

Consequência de valor custom:
- o sistema não reconhece como código oficial;
- o resultado factual cai no fallback por fase (não na lista global);
- o código custom não é persistido no codebook automaticamente.

### 16.5 Estado interno do formulário — `RESULTADO_FACTUAL = ''`

O formulário de coleta ao vivo usa `''` (string vazia) como estado "nenhum resultado selecionado". `PERDA` não é placeholder. Submit com `RESULTADO_FACTUAL = ''` é bloqueado com mensagem "Selecione o desfecho da sequência."
