---
tipo: CATALOGO-TEMATICO
nome: "Scout — Catálogo de Campos"
papel: "Traduz a estrutura de campos do workbook do scout para um catálogo textual versionável, organizado por contrato lógico e bloco funcional, sem depender da navegação direta na planilha."
autoridade: "Hierarquia 3/4 para o domínio scout — prevalece sobre interpretação livre de agentes na organização dos campos; perde para revalidação factual do workbook se algum campo, contagem ou nome estiver divergente."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "antes de modelar schema, types, formulários, importadores, relatórios ou telas do scout; ao decidir quais campos pertencem a cada contrato lógico."
atualizado_por: "Codex — 18 de maio de 2026"
quando_atualizar: "um bloco funcional do workbook mudar; nova aba ou família de campos entrar no scout; divergência factual do catálogo for corrigida."
validade: "2026-05-18"
status: PARCIAL
status_nota: "Catálogo textual inicial da Etapa A. Organiza contratos, famílias de campos e projeções atleta-facing do scout, mas não substitui ainda o dicionário completo, as listas e todas as validações."
conflito: "Se este documento divergir do workbook em nome exato de campo, quantidade ou presença de aba, o workbook prevalece até correção textual; se divergir de código residual de frontend scout, este documento prevalece."
proibido:
  - "Agentes NÃO devem usar este catálogo como licença para inferir enums não listados aqui; enums completos pertencem a `docs/scout/scout-listas.md`."
  - "NÃO devem reativar runtime de scout usando apenas componentes órfãos sem conferir este catálogo e a SSOT semântica."
nao_cobre: "Schema final de banco, payloads de API, regras completas de enumeração, validações linha a linha e layout de UI."
---

# Scout — Catálogo de Campos

## 1. Objetivo

Este documento transforma a estrutura da planilha de scout em um catálogo textual navegável.

Ele responde a três perguntas práticas:

1. quais contratos lógicos o scout possui;
2. quais abas e blocos de campo formam cada contrato;
3. quais famílias de campo precisam existir antes de qualquer implementação Supabase-first.

## 2. Como ler este catálogo

### 2.1 Precedência

Durante a Etapa A, usar esta ordem:

1. `docs/scout/scout-ssot.md`
2. `docs/scout/scout-campos.md`
3. `.files/analise/Tabela_Mestre_dos_Campos.xlsx`
4. `.files/MANUSCOUT.md`

Regra:

- `scout-ssot.md` governa significado;
- este documento governa organização e destino dos campos;
- o workbook continua sendo a referência factual de nome exato e distribuição atual.

### 2.2 O que está fora de escopo aqui

Este documento **não** lista todos os valores possíveis de cada lista.

Para isso, a Etapa A ainda precisa produzir:

- `docs/scout/scout-listas.md`
- `docs/scout/scout-dicionario-codigos.md`
- `docs/scout/scout-validacoes.md`

### 2.3 Convenção de leitura

Sempre separar:

- `coleta principal da jogada`;
- `decomposição por atleta`;
- `camada mental`;
- `revisão/validação`;
- `saídas derivadas`;
- `projeções atleta-facing`;
- `cadastros de apoio`.

## 3. Mapa geral do catálogo

Resumo factual revalidado do workbook:

Convenção usada neste documento:

- `linhas brutas` = volume de linhas de dados na aba, excluindo apenas o cabeçalho;
- `registros catalogados` = linhas da `TABELA_MESTRE` agrupadas por contrato lógico.

- `TABELA_MESTRE`: `466` linhas brutas
- `COLETA_SCOUT`: `337` registros catalogados
- `PARTICIPACOES`: `17` campos
- `EVENTOS_MENTAIS`: `16` campos
- `CAD_ATLETAS`: `19` campos
- `CAD_EQUIPES`: `5` campos
- `LISTAS`: `16` registros catalogados na `TABELA_MESTRE` e `57` linhas na aba `LISTAS`
- `VALIDACAO`: `10` campos
- `RELATORIO`: `10` campos
- `FEEDBACK`: `12` campos
- `VISAO_ATLETA_SCOUT`: projeção derivada obrigatória para consumo individual
- `DASHBOARD`: `6` linhas-resumo de auditoria
- `COLETA_AO_VIVO`: `19` registros catalogados na `TABELA_MESTRE`

## 4. Contratos lógicos obrigatórios

| Contrato | Aba principal | Volume atual | Papel no domínio |
|---|---:|---:|---|
| `COLETA_SCOUT` | `COLETA_SCOUT` | 337 | Registro principal da jogada observada |
| `COLETA_AO_VIVO` | `COLETA_AO_VIVO` | 19 | Captura compacta durante observação ao vivo |
| `PARTICIPACOES` | `PARTICIPACOES` | 17 | Decomposição da jogada por atleta |
| `EVENTOS_MENTAIS` | `EVENTOS_MENTAIS` | 16 | Registro longitudinal da camada mental/comportamental |
| `VALIDACAO` | `VALIDACAO` | 10 | Correção e revisão dos dados coletados |
| `RELATORIO` | `RELATORIO` | 10 | Leitura técnica agregada por jogo/sessão |
| `FEEDBACK` | `FEEDBACK` | 12 | Transformação da leitura em orientação prática |
| `VISAO_ATLETA_SCOUT` | projeção derivada | n/a no workbook atual | Consumo individual validado pela atleta |
| `CAD_ATLETAS` | `CAD_ATLETAS` | 19 | Cadastro de atletas e perfis de uso |
| `CAD_EQUIPES` | `CAD_EQUIPES` | 5 | Cadastro de equipes de referência |

Regra:

- qualquer implementação futura do scout deve preservar esses contratos;
- projeções atleta-facing não podem nascer como payload improvisado fora desse mapa;
- UI, schema e importadores devem nascer desse recorte, e não de componentes antigos órfãos.

## 5. `COLETA_SCOUT`

`COLETA_SCOUT` é o contrato nuclear do domínio.

Ele concentra a jogada observada e serve de pivô para:

- `PARTICIPACOES`;
- `EVENTOS_MENTAIS`;
- `VALIDACAO`;
- `RELATORIO`;
- `FEEDBACK`;
- `VISAO_ATLETA_SCOUT`;
- evidência de vídeo.

### 5.1 Estrutura por bloco funcional

| Bloco | Ordem na tabela-mestre | Volume | Papel |
|---|---|---:|---|
| `Base 1-153` | 1–153 | 153 | Identidade da jogada, contexto, fase, sistema, ações e resultado-base |
| `Shootout 154-173` | 154–173 | 20 | Família específica de shootout |
| `Bola parada e situações especiais 174-227` | 174–227 | 54 | Tiros, reposições e contextos especiais |
| `Sistemas defensivos e OUT 228-243` | 228–243 | 16 | OUT, defesa mista/individual e leitura numérica |
| `Organização inicial das transições 244-308` | 244–308 | 65 | Transição ofensiva e defensiva antes da estabilização |
| `Bola de retorno, passivo e punições 309-326` | 309–326 | 18 | Rebote, passivo, arremesso obrigatório e punições |
| `Avaliação mental detalhada 327-337` | 327–337 | 11 | Contexto de pressão e resposta mental observável |

### 5.2 Base 1–153

Este bloco é a espinha dorsal da coleta.

Famílias que precisam existir em qualquer modelo futuro:

- identificação e vínculo:
  - `ID_JOGADA`
  - `ID_JOGO`
  - `DATA_SESSAO`
  - `TIPO_SESSAO`
  - `ADVERSARIO`
- contexto temporal:
  - `PERIODO`
  - `TEMPO_JOGO`
  - `PLACAR_MOMENTO`
  - `VIDEO_REF`
  - `FONTE_COLETA`
- fase e posse:
  - `FASE_DA_BOLA`
  - `EQUIPE_ATACANTE`
  - `EQUIPE_DEFENSORA`
- leitura estrutural:
  - `SISTEMA_OFENSIVO`
  - `CONFIGURACAO_OFENSIVA`
  - `SISTEMA_DEFENSIVO`
  - `CONFIGURACAO_DEFENSIVA`
- jogadora principal e relações táticas:
  - atleta principal
  - atletas associadas
  - posição ofensiva ou posição contextual observada
  - função defensiva ou função especial contextual
  - ação principal
  - comportamento específico
- resultado:
  - `TIPO_FINALIZACAO`
  - `RESULTADO_FACTUAL`
  - `PONTOS_JOGADA`
  - `CAUSA_PRINCIPAL`
  - `PRIORIDADE_TREINO`

Regra:

- este bloco não pode ser fragmentado em múltiplas estruturas concorrentes;
- ele é a linha-mãe da jogada e deve permanecer referenciável por `ID_JOGADA`.

### 5.3 Shootout 154–173

Este bloco trata shootout como família própria, e não como variação rasa da jogada-base.

Campos representativos:

- `CONTEXTO_ESPECIAL`
- `SHOOTOUT_ORDEM`
- `SHOOTOUT_EQUIPE`
- `SHOOTOUT_ATACANTE`
- `SHOOTOUT_PASSADORA`
- `SHOOTOUT_GOLEIRA_DEF`
- `SHOOTOUT_TIPO_PASSE`
- `SHOOTOUT_QUALIDADE_PASSE`
- `SHOOTOUT_QUALIDADE_RECEPCAO`
- `SHOOTOUT_DECISAO_ATACANTE`
- `SHOOTOUT_EXECUCAO_ATACANTE`
- `SHOOTOUT_TIPO_FINALIZACAO`

Regra:

- o modelo do scout deve preservar shootout como subdomínio explícito;
- campos `SHOOTOUT_*` não devem ser espremidos dentro do bloco-base como observações livres.

### 5.4 Bola parada e situações especiais 174–227

Este bloco concentra bolas paradas e contextos com regime interpretativo próprio.

Famílias já evidentes:

- metacampos do contexto:
  - `TIPO_BOLA_PARADA`
  - `OBJETIVO_BOLA_PARADA`
  - `RESULTADO_BOLA_PARADA`
- família `6M_*`:
  - `6M_COBRADORA`
  - `6M_GOLEIRA_DEF`
  - `6M_TIPO_FINALIZACAO`
  - `6M_DESTINO_ARREMESSO`
  - `6M_TECNICA_GOLEIRA`
  - `6M_DECISAO_GOLEIRA`
  - `6M_RESULTADO`
  - `6M_PONTOS`
  - `6M_CAUSA_PRINCIPAL`
- famílias especiais ainda a textualizar integralmente:
  - `TL_*`
  - `RL_*`
  - `RG_*`
  - `RAG_*`
  - `GG_*`
  - `ULTIMA_POSSE_*`

Regra:

- contextos especiais devem continuar agrupados por famílias próprias;
- não é aceitável perder o prefixo e virar um JSON genérico de observações.

### 5.5 Sistemas defensivos e OUT 228–243

Este bloco fecha o recorte mínimo de OUT e ajustes defensivos.

Campos representativos:

- `OUT_SITUACAO`
- `ATLETA_OUT`
- `EQUIPE_OUT`
- `ESTRUTURA_NUMERICA_REAL`
- `SISTEMA_OFENSIVO_AJUSTADO_OUT`
- `AJUSTE_DEFENSIVO_OUT`
- `AMEACA_PRIORITARIA_OUT`
- `RESULTADO_OUT`
- `CAUSA_OUT`
- `PRIORIDADE_TREINO_OUT`
- `DEF_MISTO_ALVO`
- `DEF_MISTO_TIPO`

Regra:

- `OUT` exige leitura numérica explícita;
- `ESTRUTURA_NUMERICA_REAL` é parte do contrato, não pós-processamento opcional.

### 5.6 Organização inicial das transições 244–308

Este é o bloco mais importante para não confundir transição com sistema estabilizado.

Famílias representativas:

- transição ofensiva:
  - `FORM_TRANS_OF`
  - `OBJETIVO_FORM_TRANS_OF`
  - `STATUS_ESTABILIZACAO_AT_POS`
  - `MOTIVO_FIM_TRANS_OF`
- slots de participação em transição ofensiva:
  - `TR_OF_1_ATLETA`
  - `TR_OF_1_ORDEM_ENTRADA`
  - `TR_OF_1_POSICAO_TRANS`
  - `TR_OF_1_FUNCAO_TRANS`
  - `TR_OF_1_POSICAO_AT_POS_FINAL`
  - `TR_OF_1_ACAO_TRANS`
  - `TR_OF_1_RESULTADO`
- transição defensiva:
  - `FORM_TRANS_DEF`
  - `OBJETIVO_FORM_TRANS_DEF`
  - `SISTEMA_DEF_TRANS_TEMP`
  - `ZONA_TRANS_DEF`
  - `ACAO_TRANS_DEF`
  - `REORGANIZACAO_DEF`
  - `STATUS_ESTABILIZACAO_DEF_POS`
  - `MOTIVO_FIM_TRANS_DEF`

Regra:

- este bloco deve continuar separado da leitura do sistema final;
- slots `TR_*` indicam que a planilha já assume decomposição estruturada da transição.

### 5.7 Bola de retorno, passivo e punições 309–326

Este bloco captura eventos que alteram a continuidade da posse ou o regime de decisão.

Campos representativos:

- `BOLA_RETORNO`
- `TIPO_BOLA_RETORNO`
- `FINALIZACAO_FINTADA`
- `BLOQUEIO_ATRAIDO`
- `RELACAO_NUMERICA_APOS_RETORNO`
- `ATLETA_RETORNO_ORIGEM`
- `ATLETA_RETORNO_RECEBE`
- `ARREMESSO_OBRIGATORIO_APOS_RETORNO`
- `RESULTADO_ARREM_OBRIGATORIO`
- `PASSIVO_SINALIZADO`
- `CONTADOR_PASSES_PASSIVO`
- `PASSE_EVITA_ARREMESSO_CLARO`

Regra:

- rebote, passivo e punição não são “observações soltas”;
- eles são variáveis estruturadas da jogada.

### 5.8 Avaliação mental detalhada 327–337

Este bloco mantém a camada mental já conectada à jogada-base.

Campos representativos:

- `CONTEXTO_PRESSAO`
- `EVENTO_MENTAL_GATILHO`
- `RESPOSTA_APOS_ERRO`
- `IMPACTO_ERRO_ANTERIOR`
- `COMPORTAMENTO_PRESSAO`
- `QUALIDADE_RESET_MENTAL`
- `COMUNICACAO_MOMENTO_CRITICO`
- `LINGUAGEM_CORPORAL`
- `PERFIL_PRESSAO_JOGO`
- `SEQUENCIA_ERROS_ATLETA`
- `ACAO_POS_ERRO`

Regra:

- esse bloco não substitui `EVENTOS_MENTAIS`;
- ele complementa a jogada-base com leitura condensada do contexto mental.

## 6. `COLETA_AO_VIVO`

`COLETA_AO_VIVO` existe como superfície compacta de registro em tempo real.

Ela está representada na `TABELA_MESTRE` por `19` linhas próprias e não deve ser confundida com o contrato nuclear `COLETA_SCOUT`.

Colunas atuais:

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
- `MOTIVO_PONTUACAO` *(obrigatório quando `RESULTADO_FACTUAL = GOL`; explica por que o gol vale 1 ou 2 pontos; não é causa do gol nem tipo de finalização; não se aplica quando `RESULTADO_FACTUAL ≠ GOL`)*
- `PONTOS_JOGADA`
- `CAUSA_PROVAVEL`
- `PRIORIDADE_TREINO`
- `VIDEO_REF`
- `STATUS_VALIDACAO`
- `OBS_GERAL`

Regra:

- esta aba não substitui `COLETA_SCOUT`;
- ela deve ser tratada como captura operacional resumida que depois converge para a coleta principal ou para pipeline de revisão.

## 7. `PARTICIPACOES`

`PARTICIPACOES` decompõe a jogada por atleta.

Campos atuais:

- `ID_JOGADA`
- `ID_JOGO`
- `ATLETA`
- `EQUIPE`
- `PAPEL`
- `FASE_DA_BOLA`
- `FASE_DA_ATLETA`
- `SISTEMA_OFENSIVO`
- `SISTEMA_DEFENSIVO`
- `POSICAO`
- `FUNCAO_ESPECIAL`
- `ACAO`
- `COMPORTAMENTO_ESPECIFICO`
- `RESULTADO_INDIVIDUAL`
- `CAUSA_PRINCIPAL`
- `PRIORIDADE_TREINO`
- `FEEDBACK`

Regra:

- `PARTICIPACOES` é o lugar correto para a decomposição individual da jogada;
- ele não deve ser “embutido” em colunas repetidas infinitas da coleta principal fora dos slots já existentes de transição.

## 8. `EVENTOS_MENTAIS`

`EVENTOS_MENTAIS` registra eventos mentais em formato longo.

Campos atuais:

- `ID_EVENTO_MENTAL`
- `ID_JOGADA`
- `ID_JOGO`
- `TEMPO_VIDEO`
- `TEMPO_JOGO`
- `ATLETA_OBSERVADA`
- `EQUIPE_ATLETA`
- `EVENTO_JOGO_ASSOCIADO`
- `CODIGO_MENTAL`
- `MARCA_MENTAL`
- `OBS_MENTAL`
- `CONTEXTO_PRESSAO`
- `IMPACTO_NO_LANCE`
- `ACAO_RECOMENDADA`
- `PRIORIDADE_TREINO`
- `STATUS_VALIDACAO`

Regra:

- este contrato existe para observação longitudinal e não apenas para resumo da jogada;
- a implementação futura deve respeitar esse formato longo.

## 9. `VALIDACAO`

`VALIDACAO` materializa a revisão dos dados.

Campos atuais:

- `ID_VALIDACAO`
- `ID_JOGADA`
- `CAMPO_REVISADO`
- `VALOR_ORIGINAL`
- `VALOR_CORRIGIDO`
- `STATUS_VALIDACAO`
- `VALIDADOR`
- `DATA_VALIDACAO`
- `MOTIVO_CORRECAO`
- `OBS_VALIDACAO`

Regra:

- correção faz parte do modelo, não do processo informal;
- qualquer fluxo real de scout precisa prever revisão explícita.

## 10. `RELATORIO`

`RELATORIO` é a saída técnica agregada por jogo/sessão.

Campos atuais:

- `ID_RELATORIO`
- `ID_JOGO`
- `BLOCO_RELATORIO`
- `INDICADOR`
- `VALOR`
- `AMOSTRA`
- `LEITURA_TECNICA`
- `PRIORIDADE_TREINO`
- `IDS_EVIDENCIA`
- `OBS_RELATORIO`

Regra:

- o relatório deriva do scout; ele não deve ser tratado como documento externo sem rastreabilidade para `ID_JOGO` e evidências.
- ele deve ser capaz de alimentar projeções de `resumo por jogo`, `indicadores agregados` e `histórico por período`.

## 11. `FEEDBACK`

`FEEDBACK` traduz leitura em ação prática.

Campos atuais:

- `ID_FEEDBACK`
- `ID_JOGO`
- `ID_JOGADA`
- `DESTINATARIO_FEEDBACK`
- `ATLETA_FEEDBACK`
- `TIPO_FEEDBACK`
- `TEMA_FEEDBACK`
- `EVIDENCIA_FEEDBACK`
- `MENSAGEM_FEEDBACK`
- `ACAO_RECOMENDADA`
- `PRIORIDADE_FEEDBACK`
- `STATUS_FEEDBACK`

Regra:

- feedback é contrato de saída, não comentário avulso;
- ele deve continuar vinculado à evidência que o originou.
- quando o feedback gerar meta formal, a referência de evidência e a atleta/equipe alvo devem permanecer preservadas.

## 12. `VISAO_ATLETA_SCOUT`

`VISAO_ATLETA_SCOUT` é a projeção derivada que transforma scout validado em leitura individual no produto.

Esta projeção não é nova coleta. Ela reorganiza dados já validados para consumo da atleta.

Famílias mínimas que precisam existir em qualquer modelo futuro:

- identidade e escopo:
  - `ID_VISAO_ATLETA`
  - `ID_ATLETA`
  - `ID_EQUIPE`
  - `TIPO_VISAO`
  - `PERIODO_REFERENCIA`
  - `ID_JOGO` quando aplicável
- rastreabilidade:
  - `IDS_EVIDENCIA`
  - `ORIGEM_RELATORIO`
  - `ORIGEM_FEEDBACK`
  - `STATUS_VALIDACAO_FONTE`
- conteúdo derivado:
  - `RESUMO_VISUALIZAVEL`
  - `INDICADOR`
  - `VALOR`
  - `AMOSTRA`
  - `LEITURA_TECNICA_RESUMIDA`
- vínculo com ação prática:
  - `PRIORIDADE_TREINO`
  - `ID_META_INDIVIDUAL_SCOUT` quando houver
  - `ID_META_EQUIPE_SCOUT` quando houver

Tipos mínimos de visão:

- `EVENTO_BRUTO`
- `RESUMO_POR_JOGO`
- `INDICADOR_AGREGADO`
- `HISTORICO_POR_PERIODO`

Regra:

- a atleta vê apenas a própria projeção individual e metas de equipe publicadas para seu grupo;
- a projeção deve preservar distinção entre dado bruto, resumo, agregado e histórico;
- nenhuma visão da atleta pode existir sem vínculo rastreável a `ID_JOGADA`, `ID_JOGO`, relatório ou feedback correspondente.

## 13. Cadastros de apoio

### 13.1 `CAD_ATLETAS`

Campos atuais:

- `ID_ATLETA`
- `NOME_ATLETA`
- `APELIDO_ATLETA`
- `EQUIPE_ATLETA`
- `STATUS_ATLETA`
- `MAO_DOMINANTE`
- `FUNCAO_PRINCIPAL`
- `FUNCOES_SECUNDARIAS`
- `POS_OF_3X1`
- `POS_OF_4X0`
- `POS_DEF_3X0`
- `GOLEIRA`
- `ESPECIALISTA`
- `PLAYMAKER`
- `PERFIL_FINALIZACAO`
- `PERFIL_DEFENSIVO`
- `OBS_PERFIL`
- `DATA_CADASTRO`
- `ATUALIZADO_EM`

Regra:

- o scout presume cadastro tático das atletas, não apenas nome e email;
- posições e papéis por sistema fazem parte do contrato.

### 13.2 `CAD_EQUIPES`

Campos atuais:

- `ID_EQUIPE`
- `NOME_EQUIPE`
- `TIPO_EQUIPE`
- `CATEGORIA`
- `OBS_EQUIPE`

Regra:

- equipes são referência operacional para sessões, adversários e contexto competitivo.

## 14. Abas auxiliares que não são contratos de persistência principal

Estas abas existem no workbook, mas não devem ser confundidas com o núcleo transacional do scout:

- `LISTAS`
- `LISTAS_INDICE`
- `DICIONARIO_CODIGOS`
- `DICIONARIO_INDICE`
- `VALIDACOES_APLICADAS`
- `VALIDACOES_PENDENTES`
- `DASHBOARD`
- `AUDITORIA_TM`
- `AUDITORIA_SSOT`

Papel dessas abas:

- governança;
- enumeração;
- dicionário de uso;
- auditoria;
- acompanhamento de completude.

## 15. Implicações técnicas imediatas

Este catálogo já força algumas decisões de implementação futura:

1. o scout precisa de uma entidade principal por jogada;
2. precisa de tabela/coleção filha para participações;
3. precisa de tabela/coleção filha para eventos mentais;
4. precisa de pipeline formal de validação;
5. precisa de saída derivada para relatório e feedback;
6. precisa de projeções atleta-facing para scout validado;
7. precisa de vínculo explícito entre feedback, prioridade de treino e metas derivadas do scout;
8. precisa de cadastros táticos, não só cadastros administrativos.

## 16. Próximos artefatos obrigatórios

Depois deste catálogo, a Etapa A ainda precisa fechar:

1. `docs/scout/scout-listas.md`
2. `docs/scout/scout-dicionario-codigos.md`
3. `docs/scout/scout-validacoes.md`
4. `docs/scout/scout-rastreabilidade.md`
5. contrato técnico das projeções atleta-facing no documento técnico de scout

## 17. Veredito

O workbook já define um scout com estrutura suficientemente madura para implementação futura.

O que faltava aqui não era “inventar campos”.

Faltava **promover a organização dos campos para texto versionável**, de modo que schema, UI e relatórios futuros possam nascer de uma base explícita no repositório.
