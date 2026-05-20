---
tipo: CATALOGO-TEMATICO
nome: "Scout — Dicionário de Códigos"
papel: "Consolida em texto versionável a lógica de uso, não uso, exemplo e erro comum dos códigos do scout, derivada da aba `DICIONARIO_CODIGOS`, para orientar coleta, revisão, schema, formulários e leitura técnica."
autoridade: "Hierarquia 3/4 para o domínio scout — prevalece sobre interpretação livre de códigos no runtime; perde para correção factual revalidada do workbook se algum código, bloco ou regra estiver divergente."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "antes de modelar enums, tipos, formulários, revisões, importadores, pipelines de validação e relatórios do scout; ao decidir quando um código deve ou não ser usado."
atualizado_por: "Agente executor + confirmação humana"
quando_atualizar: "o workbook alterar definição, uso ou erro comum de um bloco; novos códigos entrarem; uma deriva textual do dicionário for corrigida."
validade: "2026-05-07"
status: PARCIAL
status_nota: "Documento textual inicial do dicionário. Reorganiza a lógica de uso por bloco e normaliza desvios de linhas herdadas por template, mas não replica as 942 entradas linha a linha."
conflito: "Se este documento divergir do workbook em código ou pertencimento de bloco, revalidar o workbook; se uma linha do workbook trouxer orientação evidentemente herdada do bloco errado, a SSOT semântica e este documento prevalecem até saneamento do workbook."
proibido:
  - "Agentes NÃO devem usar um código fora da lista de origem."
  - "NÃO devem interpretar textos genéricos do dicionário como se anulassem a SSOT semântica do scout."
nao_cobre: "Réplica integral das 942 linhas do workbook, modelagem final de banco, validações condicionais completas e mapeamento campo -> código linha a linha."
---

# Scout — Dicionário de Códigos

## 1. Objetivo

Este documento transforma a aba `DICIONARIO_CODIGOS` em referência textual de uso e não uso dentro do repositório.

Ele existe para impedir quatro erros:

1. usar códigos como texto livre;
2. confundir `NAO_APLICA` com `NAO_OBSERVADO`;
3. inferir significado de um código só pelo nome;
4. seguir cegamente uma linha do workbook quando ela herdou orientação de template errado.

## 2. O que foi revalidado

Resumo factual do workbook:

- aba `DICIONARIO_CODIGOS`: `942` linhas de código
- `124` listas referenciadas
- colunas presentes:
  - `ID_CODIGO`
  - `LISTA`
  - `BLOCO`
  - `CODIGO`
  - `NOME_VISIVEL`
  - `DEFINICAO`
  - `QUANDO_USAR`
  - `QUANDO_NAO_USAR`
  - `EXEMPLO`
  - `ERRO_COMUM`
  - `STATUS`
  - `VERSAO`
- versão operacional: `v1.0`

Contagem por bloco:

| Bloco | Entradas |
|---|---:|
| `Geral` | 147 |
| `Mental/comportamental` | 125 |
| `Defesa` | 122 |
| `Transições` | 112 |
| `Finalização/resultado/diagnóstico` | 88 |
| `OUT/punição` | 72 |
| `Prioridades de treino` | 60 |
| `Bola parada/situações especiais` | 58 |
| `Ataque` | 46 |
| `Goleira` | 33 |
| `Relatório/feedback` | 32 |
| `Shootout` | 28 |
| `Cadastro` | 19 |

## 3. Ressalva crítica sobre o workbook

O dicionário do workbook é valioso, mas **não é homogêneo**.

Durante a revalidação apareceram linhas com orientação herdada por template que não combina com o código real. Exemplos claros:

- `LISTA_CONTEXTO_ESPECIAL::SHOOTOUT` com texto de uso herdado de `OUT`;
- `LISTA_PERIODO::GOLDEN_GOAL` com texto herdado de goleira/resultado;
- alguns códigos de contexto mental com orientação puxada de “resultado/goleira”.

Regra operacional:

- quando a linha do workbook conflitar com:
  - o `scout-ssot.md`;
  - o bloco semântico do próprio código;
  - a lista de origem;
  - o contrato do campo;
  então **não** seguir a linha literalmente.

Prevalece esta ordem:

1. `docs/scout/scout-ssot.md`
2. `docs/scout/scout-campos.md`
3. `docs/scout/scout-listas.md`
4. este documento
5. linha individual do workbook

## 4. Como usar este dicionário

### 4.1 Regra-base

Todo código deve responder a quatro perguntas:

1. a lista de origem está correta?
2. o bloco semântico está correto?
3. o contexto da jogada permite esse código?
4. existe evidência suficiente para escolher esse código?

### 4.2 Regra de não improviso

Nunca:

- criar variação manual do código;
- digitar texto livre onde existe lista;
- trocar código por sinônimo “parecido”;
- migrar um código de uma lista para outra só porque o nome coincide.

### 4.3 `NAO_APLICA` vs `NAO_OBSERVADO`

`NAO_APLICA`:

- usar quando a lógica do campo não pertence ao contexto da jogada;
- não usar quando o dado existe, mas não foi visto.

`NAO_OBSERVADO`:

- usar quando vídeo, ângulo, ritmo da coleta ou evidência não permitem confirmar;
- não usar para escapar de uma decisão ou porque faltou revisão.

## 5. Regras recorrentes de uso e não uso

### 5.1 Códigos de fase

Usar:

- `AT_POS` e `DEF_POS` apenas quando a organização já estiver estabilizada;
- `TRANS_OF` e `TRANS_DEF` apenas antes da estabilização.

Não usar:

- `TRANS_*` depois que o sistema já estabilizou;
- `AT_POS`/`DEF_POS` para descrever ajuste momentâneo.

Erro comum:

- inferir a transição pela posição final do sistema.

### 5.2 Códigos de sistema

Usar:

- sistema ofensivo ou defensivo apenas quando a estrutura real foi observada;
- configuração ofensiva somente depois de confirmar o sistema-base.

Não usar:

- configuração sem o sistema correspondente;
- sistema estabilizado para mascarar ocupação momentânea.

Erro comum:

- confundir ajuste momentâneo com sistema estabilizado.

### 5.3 Códigos de decisão/execução

Usar:

- códigos de decisão, execução e resposta quando houver referência clara ao objetivo da ação.

Não usar:

- apenas pelo resultado final da jogada.

Erro comum:

- julgar a qualidade da decisão só porque a jogada terminou em gol ou erro.

### 5.4 Códigos mentais

Usar:

- apenas quando houver comportamento observável no vídeo ou na coleta.

Não usar:

- para diagnosticar estado psicológico interno não observável;
- para rotular personalidade.

Erro comum:

- trocar observação de comportamento por rótulo subjetivo.

### 5.5 Códigos de prioridade

Usar:

- `LISTA_PRIORIDADE_TREINO` quando a jogada gerar evidência treinável.

Não usar:

- sem causa principal, padrão ou evidência suficiente.

Erro comum:

- escolher prioridade por impressão e não por recorrência/leitura técnica.

## 6. Bloco `Geral`

Famílias centrais:

- `LISTA_FASES`
- `LISTA_TIPO_SESSAO`
- `LISTA_PERIODO`
- `LISTA_FONTE_COLETA`
- `LISTA_STATUS_VALIDACAO`
- `LISTA_BOOLEANO`
- `LISTA_BOOLEANO_OBS`
- `LISTA_NAO_OBSERVADO`
- `LISTA_NAO_APLICA`

Padrão de uso:

- usar código exato da lista correspondente;
- preservar distinção entre contexto aplicável e observabilidade.

Padrão de não uso:

- não usar código como sinônimo livre;
- não transformar booleano em opinião;
- não usar `SIM` ou `NAO` quando o correto é `NAO_OBSERVADO`.

Erros comuns:

- texto livre fora da lista;
- `NAO_OBSERVADO` usado em excesso;
- `NAO_APLICA` usado para esconder incerteza.

Códigos críticos:

- `LISTA_FASES::TRANS_OF`
  usar: antes da estabilização do sistema
  não usar: depois do posicionamento já consolidado
  erro comum: inferir a fase pela posição final
- `LISTA_BOOLEANO::SIM`
  usar: quando há evidência clara da ocorrência
  não usar: sem prova no vídeo
  erro comum: marcar `SIM` por impressão

## 7. Bloco `Ataque`

Famílias centrais:

- `LISTA_SISTEMA_OFENSIVO`
- `LISTA_CONFIGURACAO_OFENSIVA`
- `LISTA_ACAO_OFENSIVA`
- `LISTA_OCUPACAO_PIVO_TEMP_RESULTADO`

Padrão de uso:

- confirmar o sistema-base antes da configuração;
- usar ocupação temporária sem mutar automaticamente o sistema;
- tratar ação ofensiva como enum fechado, não texto livre.

Padrão de não uso:

- não preencher configuração se o sistema não foi confirmado;
- não usar `AT_3X1` só porque houve ocupação interna momentânea.

Erros comuns:

- usar configuração sem confirmar o sistema ofensivo;
- confundir pivô temporária com pivô fixa;
- inventar verbos ofensivos fora da lista.

Códigos críticos:

- `LISTA_SISTEMA_OFENSIVO::AT_3X1`
  usar: quando a estrutura ofensiva realmente estabilizou em `3x1`
  não usar: em ocupação momentânea no `4x0`
- `LISTA_CONFIGURACAO_OFENSIVA::AT_4X0_ESP_CE_LE`
  usar: quando a posição da especialista/playmaker corresponde ao código
  não usar: sem confirmar o sistema-base
- `LISTA_OCUPACAO_PIVO_TEMP_RESULTADO::*`
  usar: para descrever o efeito da ocupação temporária
  não usar: como substituto de `SISTEMA_OFENSIVO`

## 8. Bloco `Defesa`

Famílias centrais:

- `LISTA_SISTEMA_DEFENSIVO`
- `LISTA_POSICAO_DEFENSIVA`
- `LISTA_ACAO_DEFENSIVA`
- `LISTA_COMPORTAMENTO_DEFENSIVO`
- `LISTA_CONEXAO_DEFENSIVA`

Padrão de uso:

- usar sistema defensivo apenas quando a organização real for observável;
- usar ação e comportamento defensivo como categorias distintas.

Padrão de não uso:

- não usar sistema como rótulo genérico sem organização observada;
- não misturar posição defensiva com ação defensiva.

Erros comuns:

- confundir ajuste momentâneo com sistema estabilizado;
- usar comportamento defensivo como substituto de resultado.

Códigos críticos:

- `LISTA_SISTEMA_DEFENSIVO::DEF_3X0`
  usar: quando a organização defensiva realmente corresponde a `3x0`
  não usar: em ajuste ou transição
- `LISTA_ACAO_DEFENSIVA::BLOQ_GIRO`
  usar: quando a ação observada foi exatamente esse bloqueio
  não usar: como categoria genérica de boa defesa

## 9. Bloco `Transições`

Famílias centrais:

- `LISTA_FORM_TRANS_OF`
- `LISTA_OBJETIVO_FORM_TRANS_OF`
- `LISTA_POS_TRANS_OF`
- `LISTA_FUNCAO_TRANS_OF`
- `LISTA_FORM_TRANS_DEF`
- `LISTA_OBJETIVO_FORM_TRANS_DEF`
- `LISTA_SISTEMA_DEF_TRANS_TEMP`
- `LISTA_STATUS_ESTABILIZACAO_AT_POS`
- `LISTA_STATUS_ESTABILIZACAO_DEF_POS`

Padrão de uso:

- usar códigos de transição apenas antes da estabilização;
- registrar forma, posição e função transitória como leitura própria da jogada.

Padrão de não uso:

- não preencher `TRANS_*` quando ataque ou defesa já estabilizaram;
- não corrigir posição transitória pela posição final.

Erros comuns:

- inferir posição da transição pelo sistema posicionado;
- apagar a camada transitória depois da estabilização.

Códigos críticos:

- `LISTA_FORM_TRANS_OF::TRANS_OF_ESP_LE`
  usar: quando a forma ofensiva observada ocorre antes da estabilização
  não usar: depois do ataque posicionado
- `LISTA_STATUS_ESTABILIZACAO_AT_POS::NAO_ESTABILIZOU`
  usar: quando a jogada não chegou ao ataque posicionado
  não usar: como sinônimo de erro técnico
- `LISTA_FORM_TRANS_DEF::TRANS_DEF_ENTRADA_RAPIDA`
  usar: na organização defensiva ainda não estabilizada
  não usar: como sistema defensivo final

## 10. Bloco `Finalização/resultado/diagnóstico`

Famílias centrais:

- `LISTA_TIPO_FINALIZACAO`
- `LISTA_DESTINO_ARREMESSO`
- `LISTA_REGIAO_ARREMESSO`
- `LISTA_RESULTADO_FACTUAL`
- `LISTA_MOTIVO_PONTUACAO`
- `LISTA_RESULTADO_ANALISE`
- `LISTA_RESULTADO_INDIVIDUAL`
- `LISTA_PONTOS`
- `LISTA_CAUSA_PRINCIPAL`

Definição canônica de `RESULTADO_FACTUAL`:

> `RESULTADO_FACTUAL` é o **desfecho objetivo da sequência observada**.
> Pode ser resultado de finalização, perda de posse, recuperação de posse, violação, passivo, erro de troca ou desfecho de transição.
> **Não é causa provável, não é diagnóstico técnico e não é prioridade de treino.**
> A presença de `RESULTADO_FACTUAL` não implica que houve arremesso.

Padrão de uso:

- separar claramente tipo, destino, região, resultado factual e leitura analítica;
- usar `CAUSA_PRINCIPAL` como diagnóstico fechado, não narrativa livre;
- quando `RESULTADO_FACTUAL = GOL`, preencher `MOTIVO_PONTUACAO` obrigatoriamente.

Padrão de não uso:

- não usar resultado factual como se fosse causa;
- não usar ponto como diagnóstico técnico;
- não usar `MOTIVO_PONTUACAO` quando `RESULTADO_FACTUAL ≠ GOL`.

Erros comuns:

- confundir lado da goleira com lado da atacante;
- reduzir a leitura à consequência final;
- substituir causa por opinião;
- usar `PERDA` como placeholder de "nenhum resultado selecionado" — `PERDA` é desfecho real.

Códigos críticos:

- `LISTA_TIPO_FINALIZACAO::GOLEIRA`
  usar: quando a tipologia da finalização é essa
  não usar: apenas porque a goleira participou do desfecho
- `LISTA_RESULTADO_FACTUAL::GOL`
  usar: como desfecho factual de gol marcado
  não usar: como sinônimo de sucesso técnico automático
- `LISTA_RESULTADO_FACTUAL::RECUPERACAO_POSSE`
  usar: quando a defesa ou a transição termina com recuperação de posse sem arremesso
  não usar: para arremesso bloqueado ou defendido (usar `BLOQUEADO`/`DEFENDIDO`)
- `LISTA_RESULTADO_FACTUAL::FALTA_ATAQUE`
  usar: quando a sequência termina com falta cometida pelo ataque
  não usar: para perda de posse sem falta (usar `PERDA`)
- `LISTA_RESULTADO_FACTUAL::PASSIVO`
  usar: quando a sequência termina por decisão de passivo
  não usar: para situação de pressão de passivo que não gerou perda (usar `PASSIVO_DECISAO` na ação)
- `LISTA_RESULTADO_FACTUAL::ERRO_TROCA`
  usar: quando a sequência termina em erro de troca ofensiva ou defensiva durante transição
  não usar: para erro de passe em AT_POS estabilizado (usar `PERDA`)
- `LISTA_RESULTADO_FACTUAL::TRANSICAO_NEUTRALIZADA`
  usar: quando a transição ofensiva adversária é neutralizada sem gol, recuperação ou falta
  não usar: fora do contexto de TRANS_DEF
- `LISTA_RESULTADO_FACTUAL::DEFESA_ESTABILIZADA`
  usar: quando a defesa estabiliza antes da finalização adversária
  não usar: quando houve finalização (usar `BLOQUEADO`, `DEFENDIDO`, etc.)
- `LISTA_RESULTADO_FACTUAL::VANTAGEM_CRIADA`
  usar: quando a transição ofensiva gera superioridade que se converte em AT_POS
  não usar: quando a vantagem não se materializou (usar `VANTAGEM_PERDIDA`)
- `LISTA_RESULTADO_FACTUAL::VANTAGEM_PERDIDA`
  usar: quando a transição ofensiva começa com vantagem e a perde antes de finalizar
  não usar: para perda de posse por erro técnico (usar `PERDA` ou `ERRO_TROCA`)
- `LISTA_MOTIVO_PONTUACAO::SIMPLES`
  usar: quando o gol vale 1 ponto por arremesso comum sem característica especial
  não usar: como fallback genérico para qualquer gol; verificar se a modalidade é GIRO, AEREA ou especialista
- `LISTA_CAUSA_PRINCIPAL::TEC_OF`
  usar: quando a causa principal é técnica ofensiva
  não usar: como rótulo genérico de "deu errado"

## 11. Bloco `OUT/punição`

Famílias centrais:

- `LISTA_OUT_SITUACAO`
- `LISTA_ESTRUTURA_NUMERICA_REAL`
- `LISTA_SISTEMA_OFENSIVO_AJUSTADO_OUT`
- `LISTA_AJUSTE_DEFENSIVO_OUT`
- `LISTA_RESULTADO_OUT`
- `LISTA_CAUSA_OUT`
- `LISTA_OUT_GATILHO`
- `LISTA_PUNICAO_RESULTADO`

Padrão de uso:

- usar `OUT` só quando houver alteração numérica, punição observável ou contexto equivalente;
- manter a estrutura numérica explícita;
- separar situação, causa, gatilho e resultado.

Padrão de não uso:

- não analisar inferioridade como falha técnica comum sem registrar `OUT`;
- não usar `OUT` sem alteração numérica ou punição observável, salvo contexto `SEM_PUNICAO`.

Erros comuns:

- tratar `OUT` como comentário lateral;
- julgar a ação sem contexto numérico.

Códigos críticos:

- `LISTA_OUT_SITUACAO::OUT_ATAQUE`
  usar: quando a equipe observada está em inferioridade ofensiva correspondente
  não usar: sem alteração numérica observável
- `LISTA_ESTRUTURA_NUMERICA_REAL::OF_3_DEF_3`
  usar: para registrar a realidade numérica da jogada
  não usar: como aproximação “parecida”
- `LISTA_CAUSA_OUT::OUT_ESTRUTURAL`
  usar: quando a causa do resultado em `OUT` é estrutural
  não usar: sem evidência do contexto de inferioridade

## 12. Bloco `Bola parada/situações especiais`

Famílias centrais:

- `LISTA_CONTEXTO_ESPECIAL`
- `LISTA_TIPO_BOLA_PARADA`
- `LISTA_6M`
- `LISTA_TIRO_LIVRE`
- `LISTA_REPOSICAO_LATERAL`
- `LISTA_REPOSICAO_GOLEIRA`
- `LISTA_REPOSICAO_APOS_GOL`
- `LISTA_GOLDEN_GOAL`

Padrão de uso:

- usar o código apenas quando a jogada pertence ao contexto especial correspondente;
- preservar a família do evento especial, não colapsar tudo em “bola parada”.

Padrão de não uso:

- não usar `NAO_APLICA` quando o evento existiu, mas não foi visto;
- não usar código de tiro livre em reposição lateral ou vice-versa.

Erros comuns:

- confundir contexto especial com desfecho;
- colapsar famílias `6M_*`, `TL_*`, `RL_*`, `RG_*`, `RAG_*`, `GG_*`.

Códigos críticos:

- `LISTA_CONTEXTO_ESPECIAL::NAO_APLICA`
  usar: quando a lógica do campo não pertence ao evento
  não usar: quando o evento existia, mas não foi observado
- `LISTA_CONTEXTO_ESPECIAL::SHOOTOUT`
  usar: apenas para jogadas de shootout
  não usar: fora desse contexto, mesmo se a jogada “parecer decisiva”
- `LISTA_GOLDEN_GOAL::*`
  usar: apenas em jogadas de golden goal
  não usar: como marcador genérico de momento crítico

## 13. Bloco `Goleira`

Famílias centrais:

- `LISTA_TECNICA_DEFESA`
- `LISTA_POSTURA_GOLEIRA`
- `LISTA_REACAO_GOLEIRA`
- `LISTA_DECISAO_GOLEIRA`
- `LISTA_RESPOSTA_GOLEIRA`
- `LISTA_QUALIDADE_REPOSICAO_GOL`
- `LISTA_TIPO_PASSE_GOL`
- `LISTA_VISAO_JOGO_GOL`

Padrão de uso:

- avaliar técnica, decisão, resposta e continuidade ofensiva como camadas separadas;
- registrar a goleira pela qualidade da ação, não só pelo resultado final.

Padrão de não uso:

- não reduzir a goleira ao desfecho do arremesso;
- não avaliar decisão apenas porque terminou em gol ou defesa.

Erros comuns:

- avaliar pela consequência final e não pela qualidade da decisão;
- misturar técnica defensiva com leitura ofensiva da reposição.

Códigos críticos:

- `LISTA_DECISAO_GOLEIRA::CORRETA`
  usar: quando a decisão foi adequada ao objetivo da ação
  não usar: só porque a jogada terminou bem
- `LISTA_VISAO_JOGO_GOL::IGNOROU_VANTAGEM`
  usar: quando havia leitura melhor disponível e a goleira não a aproveitou
  não usar: sem referência clara da vantagem
- `LISTA_QUALIDADE_REPOSICAO_GOL::EXCELENTE`
  usar: quando a continuidade ofensiva foi de alta qualidade
  não usar: apenas por passe longo

## 14. Bloco `Mental/comportamental`

Famílias centrais:

- `LISTA_CODIGO_MENTAL`
- `LISTA_MARCA_MENTAL`
- `LISTA_CONTEXTO_PRESSAO`
- `LISTA_EVENTO_MENTAL_GATILHO`
- `LISTA_RESPOSTA_APOS_ERRO`
- `LISTA_COMPORTAMENTO_PRESSAO`
- `LISTA_QUALIDADE_RESET_MENTAL`
- `LISTA_COMUNICACAO_MOMENTO_CRITICO`
- `LISTA_LINGUAGEM_CORPORAL`
- `LISTA_PERFIL_PRESSAO_JOGO`
- `LISTA_SEQUENCIA_ERROS_ATLETA`
- `LISTA_ACAO_POS_ERRO`

Padrão de uso:

- sempre ancorar o código em comportamento observável;
- usar contexto, gatilho e resposta como camadas complementares;
- tratar comunicação e linguagem corporal como evidência, não diagnóstico interno.

Padrão de não uso:

- não rotular personalidade;
- não usar código mental sem gatilho ou observação suficiente;
- não transformar um único lance em perfil consolidado sem amostra.

Erros comuns:

- rotular a atleta em vez de descrever comportamento;
- confundir pressão do contexto com traço fixo;
- ignorar `AMOSTRA_INSUFICIENTE`.

Códigos críticos:

- `LISTA_CONTEXTO_PRESSAO::APOS_ERRO_PROPRIO`
  usar: quando o comportamento observado ocorre após erro próprio
  não usar: sem evidência da sequência causal
- `LISTA_COMUNICACAO_MOMENTO_CRITICO::POSITIVA_ORGANIZA`
  usar: quando a comunicação organiza a equipe em momento crítico
  não usar: por impressão positiva genérica
- `LISTA_LINGUAGEM_CORPORAL::CABECA_BAIXA`
  usar: quando a postura observável corresponde de fato ao código
  não usar: para inferir emoção sem evidência corporal

## 15. Bloco `Prioridades de treino`

Família central:

- `LISTA_PRIORIDADE_TREINO`

Padrão de uso:

- usar quando o padrão observado indicar tema claro de manutenção, correção ou treino;
- vincular a prioridade à causa principal, repetição e impacto.

Padrão de não uso:

- não preencher prioridade sem evidência treinável;
- não usar a lista como comentário solto pós-jogo.

Erros comuns:

- escolher prioridade sem causa principal;
- confundir um lance isolado com necessidade de bloco de treino.

Subfamílias relevantes dentro da lista:

- defesa:
  - `DEF_GIRO`
  - `DEF_AEREA`
  - `DEF_ESP`
  - `COBERTURA`
  - `COM_DEF`
  - `BLOQUEIO`
- goleira:
  - `GOLEIRA`
  - `GOL_REACAO_GIRO`
  - `GOL_FECHAMENTO_ANGULO`
  - `GOL_OUTLET_PASS`
  - `GOL_DEF_BAIXO`
- transição:
  - `TRANS_DEF`
  - `TRANS_OF`
  - `FORM_TRANS_OF`
  - `TRANS_DEF_PRIMEIRA_ENTRADA`
  - `ESTABILIZACAO_AT_POS`
  - `ESTABILIZACAO_DEF_POS`
  - `REORGANIZACAO_DEF`
- `OUT`:
  - `OUT_ATAQUE_3X3`
  - `OUT_DEFESA_4X2`
  - `OUT_GESTAO_RISCO`
  - `OUT_NEGAR_2PTS`
  - `OUT_MANUTENCAO_POSSE`
  - `OUT_GOLEIRA`
- mental:
  - `RESET_MENTAL`
  - `POS_ERRO`
  - `PRESSAO_DECISAO`
  - `FECHAMENTO_SET_MENTAL`
  - `GOLDEN_GOAL_MENTAL`
  - `SHOOTOUT_MENTAL`
  - `COMUNICACAO_CRITICA`
  - `LIDERANCA_FUNCIONAL`

## 16. Bloco `Relatório/feedback`

Famílias centrais:

- `LISTA_TIPO_FEEDBACK`
- `LISTA_DESTINATARIO_FEEDBACK`
- `LISTA_STATUS_FEEDBACK`
- `LISTA_BLOCO_RELATORIO`
- `LISTA_STATUS_DASHBOARD`

Padrão de uso:

- separar tipo, destinatário e status do feedback;
- manter bloco de relatório como enum explícito.

Padrão de não uso:

- não transformar feedback em comentário sem destinatário;
- não inventar bloco de relatório fora da lista.

Erros comuns:

- usar “ataque” ou “defesa” em texto livre quando já existe `LISTA_BLOCO_RELATORIO`;
- misturar status do feedback com prioridade.

## 17. Bloco `Cadastro`

Famílias centrais:

- `LISTA_STATUS_ATLETA`
- `LISTA_MAO_DOMINANTE`
- `LISTA_TIPO_EQUIPE`
- `LISTA_CATEGORIA`

Padrão de uso:

- usar cadastro como base de referência operacional do scout;
- preservar enums administrativos separados dos táticos.

Padrão de não uso:

- não usar categoria como papel tático;
- não usar status de atleta como leitura de disponibilidade pontual de jogada.

Erros comuns:

- misturar cadastro com leitura de jogo;
- usar categoria para explicar decisão técnica.

## 18. O que fazer quando uma linha do workbook parece errada

Se uma linha individual trouxer `QUANDO_USAR` ou `ERRO_COMUM` incompatível com o código:

1. conferir a `LISTA` de origem;
2. conferir o `BLOCO`;
3. conferir `docs/scout/scout-ssot.md`;
4. conferir `docs/scout/scout-listas.md`;
5. aplicar a regra semântica correta do bloco;
6. registrar a deriva como pendência para saneamento futuro do workbook.

Exemplos já detectados:

- linhas de `CONTEXTO_ESPECIAL` com texto herdado de `OUT`;
- linhas de período/contexto com texto herdado de goleira;
- algumas linhas mentais com orientação excessivamente genérica.

## 19. Implicações técnicas imediatas

Este dicionário já impõe decisões importantes:

1. enums devem carregar contexto de lista, não só valor bruto;
2. formulários precisam distinguir `NAO_APLICA` de `NAO_OBSERVADO`;
3. camadas de transição precisam ser modeladas separadas da estabilização;
4. goleira precisa de avaliação por decisão, técnica e continuidade;
5. mental/comportamental precisa exigir evidência observável;
6. prioridade de treino não pode ser campo de texto livre.

## 20. Próximos artefatos obrigatórios

Depois deste documento, a Etapa A ainda precisa fechar:

1. `docs/scout/scout-validacoes.md`
2. `docs/scout/scout-rastreabilidade.md`

## 21. Veredito

O `DICIONARIO_CODIGOS` já contém massa suficiente para orientar o uso correto dos códigos do scout.

O problema não era falta de definição.

O problema era que essa definição ainda estava dispersa e, em algumas linhas, parcialmente contaminada por textos herdados de template.

Este documento transforma essa massa em uma referência textual governável para o repositório.
