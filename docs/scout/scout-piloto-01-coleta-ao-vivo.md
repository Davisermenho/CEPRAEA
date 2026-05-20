---
tipo: REGISTRO-PILOTO
nome: "PILOTO-01 — COLETA_AO_VIVO"
papel: "Documento consolidado do desenho operacional original do PILOTO-01 e da sua execução histórica com achados reais em uso humano."
autoridade: "Histórico operacional consolidado. Não é contrato vivo de produto, schema, RLS, navegação ou escopo atual."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "quando for necessário recuperar o escopo original do piloto, entender por que ele foi interrompido/retomado, ou consultar os achados reais da COLETA_AO_VIVO."
atualizado_por: "Codex — 18 de maio de 2026"
quando_atualizar: "apenas para acrescentar evidência histórica ou consolidar achados do piloto, sem retransformá-lo em documento normativo do produto atual."
validade: "2026-05-18"
status: HISTORICO
status_nota: "Piloto histórico consolidado. Não usar como contrato atual do Scout nem como prova de homologação do produto completo."
conflito: "Se divergir da SSOT, do contrato técnico, da matriz canônica ou da UX atual, prevalecem os documentos ativos e o runtime vigente."
proibido:
  - "Não usar este documento para definir arquitetura, persistência, permissões ou fluxos atuais do scout."
  - "Não tratar este piloto como evidência de homologação do scout completo."
nao_cobre: "Contrato técnico atual, projeções atleta-facing, metas derivadas do scout e o escopo vigente do produto."
---

# PILOTO-01 — COLETA_AO_VIVO

> **Status:** histórico consolidado. Este arquivo preserva tanto o desenho operacional original do `PILOTO-01` quanto o que de fato aconteceu durante sua execução. Para o contrato ativo do Scout, prevalecem os documentos vivos em `docs/scout/*`.

## Parte 1 — Desenho Operacional Original

## Objetivo

Validar a `COLETA_AO_VIVO` com uso humano real controlado, confirmando se a rota `/scout` sustenta captura rápida de sequências sem cansar, confundir ou induzir erro.

Este piloto **não** valida:

- `COLETA_SCOUT`
- `PARTICIPACOES`
- relatório
- dashboard
- análise individual completa
- feedback automático

Ele valida apenas a camada de **captura rápida** já implementada em `scout_live_entries`.

## Pré-condições

- `/scout` funcional no ambiente alvo
- login de treinador/analista disponível
- jogo de teste ou trecho de vídeo preparado
- backend local/remoto disponível
- coleta vinculada a jogo ativo

## Escopo mínimo

- `1` jogo ou trecho de vídeo curto
- entre `20` e `40` entradas reais
- idealmente pelo menos `5` entradas por fase:
  - `AT_POS`
  - `DEF_POS`
  - `TRANS_OF`
  - `TRANS_DEF`

## Regras do piloto

1. Registrar as entradas diretamente na rota `/scout`.
2. Não consultar manual durante o uso normal.
3. Só interromper o fluxo para anotar dúvida real de operação.
4. Usar `ACAO_PRINCIPAL` sugerida quando suficiente.
5. Usar `ACAO_PRINCIPAL` custom apenas quando o vocabulário sugerido não cobrir a sequência.
6. Não abrir nem usar análise detalhada paralela.

## Roteiro de execução

1. Entrar na rota `/scout`.
2. Criar ou selecionar o jogo do piloto.
3. Registrar as sequências em fluxo contínuo.
4. Anotar dúvidas, travas e campos ignorados.
5. Ao fim, revisar rapidamente a lista de entradas do jogo.
6. Conferir persistência no banco.
7. Classificar o resultado do piloto.

## O que medir

### 1. Tempo médio por entrada

- estimativa simples ou medição por bloco
- observar se a velocidade se mantém até o fim

### 2. Erros de preenchimento

- fase errada
- resultado errado
- ação principal mal escolhida
- campo preenchido no lugar errado

### 3. Campos ignorados

- campos que a pessoa quase nunca usa
- campos que parecem estar cedo demais

### 4. Campos que causam dúvida

- onde a pessoa para para pensar
- onde pergunta “o que significa isso?”

### 5. Uso de `ACAO_PRINCIPAL` custom

- quantas vezes o vocabulário sugerido não basta
- quais valores custom apareceram

### 6. Uso dos opcionais

- `CAUSA_PROVAVEL`
- `PRIORIDADE_TREINO`
- `VIDEO_REF`
- `OBS_GERAL`

Verificar se entram no momento certo ou se continuam competindo com a captura.

### 7. Necessidade de scroll

- verificar se ainda há momentos em que a ação principal da tela fica “fora da mão”

### 8. Clareza da lista de entradas

- a revisão rápida do que foi coletado precisa ser compreensível sem esforço alto

### 9. Fadiga operacional

- depois de `20–40` entradas, a pessoa ainda mantém ritmo?

## Checklist de conferência no banco

Ao final do piloto, validar:

1. existem novas linhas em `scout_live_entries`
2. não existem novas linhas em `scout_plays`
3. não existem novas linhas em `scout_play_participations`
4. as entradas nasceram com `status_validacao_code = PENDENTE`
5. `ACAO_PRINCIPAL` oficial salvou com sugestão quando aplicável
6. `ACAO_PRINCIPAL` custom não virou código oficial automaticamente

## Planilha simples de registro do piloto

| Item | Registro |
|---|---|
| Operadora |  |
| Data |  |
| Contexto | jogo / vídeo |
| Total de entradas |  |
| Tempo aproximado total |  |
| Tempo médio estimado |  |
| Fases mais fáceis |  |
| Fases mais lentas |  |
| Campos que confundem |  |
| Campos ignorados |  |
| Customs de `ACAO_PRINCIPAL` |  |
| Scroll ainda atrapalha? | sim / não |
| Lista de entradas ficou clara? | sim / não |
| Observações finais |  |

## Saída esperada

O piloto deve terminar em uma destas decisões:

### 1. Aprovado para teste com treinador

Usar quando:

- poucas dúvidas
- poucos erros
- ritmo sustentável
- vocabulário suficiente
- sem ruído estrutural forte

### 2. Precisa UX-03

Usar quando:

- muitos campos ainda confundem
- o ritmo cai demais
- ainda há scroll ou mudança de foco atrapalhando
- a lista de entradas não ajuda a revisão

### 3. Precisa revisar vocabulário de `ACAO_PRINCIPAL`

Usar quando:

- muitos customs aparecem
- a analista evita as sugestões
- o vocabulário por fase não representa bem o jogo

## Regra de governança

Enquanto o `PILOTO-01` não for concluído, **não abrir**:

- `COLETA_SCOUT`
- `PARTICIPACOES`
- relatório
- dashboard
- expansão de análise detalhada

O motivo é simples: qualquer camada acima da coleta rápida depende de dado suficientemente confiável na base.

## Parte 2 — Execução Histórica e Achados Consolidados

## Escopo real do `PILOTO-01`

Pelo histórico das mensagens, o `PILOTO-01` foi aberto para validar **apenas** a `COLETA_AO_VIVO`, não o Scout completo.

O piloto validava:

- captura rápida em `scout_live_entries`;
- clareza de preenchimento em uso humano real;
- ritmo de registro;
- qualidade do vocabulário/matriz sob uso com vídeo;
- risco de erro induzido pela UI.

O piloto **não** validava:

- `COLETA_SCOUT`;
- `PARTICIPACOES`;
- relatório;
- dashboard;
- análise individual completa;
- feedback automático.

## Regra histórica de parada

O critério prático que emergiu no chat foi:

- continuar quando a dúvida fosse pontual;
- interromper quando o sistema obrigasse adaptação recorrente do lance real a opções imprecisas;
- parar imediatamente quando surgissem `BLOCKERs` que contaminassem a qualidade do dado salvo.

Foi exatamente isso que aconteceu na primeira fase do piloto.

## Fase 1 — Execução inicial e interrupção

### PILOTO-01 / Confusão 01 — `DEF_POS`

Situação real:
Defensora que marcava atrás da pivô não saltou para bloquear o arremesso da lateral esquerda adversária. O lance terminou em gol sofrido.

Problema observado:
A UI oferece `BLOQUEIO + GOL_SOFRIDO`, mas essa combinação sugere que houve tentativa de bloqueio. No lance real, a ação esperada de bloqueio não foi executada.

Impacto:
O scout salva um dado tecnicamente impreciso. A análise posterior pode interpretar como falha de execução de bloqueio, quando na verdade foi ausência de contestação/bloqueio.

Classificação:
`HIGH` — gap de matriz/vocabulário defensivo.

Correção sugerida:
Adicionar opção defensiva para `bloqueio não executado`, `contestação atrasada` ou `não contestou arremesso`, vinculada a `DEF_POS + ACAO_DEFENSIVA`, com resultado factual `GOL_SOFRIDO`.

### PILOTO-01 / Confusão 02 — `DEF_POS`

Situação real:
A defensora de base e a defensora solta não conseguiram fechar a entrada da central adversária, que atuava como especialista. A atacante passou entre elas e fez o gol.

Registro feito:
`DEF_POS + ACAO_DEFENSIVA + COBERTURA + GOL_SOFRIDO`.

Problema observado:
A opção `Cobertura` foi usada como aproximação, mas não descreve com precisão o lance. A falha real foi de fechamento/contenção do corredor central entre base e solta.

Impacto:
O dado salvo pode gerar leitura imprecisa na análise defensiva. A comissão pode interpretar como falha genérica de cobertura, quando o ajuste de treino deveria ser fechamento central, contenção da entrada e sincronia entre base e solta.

Classificação:
`HIGH` — gap de vocabulário/matriz defensiva.

Correção sugerida:
Adicionar classificações defensivas em `DEF_POS` para:

- fechamento central;
- contenção da entrada;
- proteção do centro;
- falha no fechamento central;
- corredor central aberto;
- falha de sincronia base/solta.

### PILOTO-01 / Confusão 03 — `DEF_POS`

Situação real:
A defensora de base entrou na frente da central especialista. Com esse ajuste, a pivô ficou livre. A defensora atrás da pivô tentou marcar a pivô, que recebeu a bola em aérea e fez gol de 2.

Registro feito:
`DEF_POS + ACAO_DEFENSIVA + COBERTURA + GOL_SOFRIDO`.

Problema observado:
A opção `Cobertura` foi usada como aproximação, mas o lance exige uma leitura mais específica: falha de cobertura da pivô, falha de troca de referência ou falha de comunicação entre base e defensora atrás da pivô.

Impacto:
O dado salvo pode indicar apenas `cobertura`, mas não explica que a pivô ficou livre por ajuste defensivo/troca de referência. Isso prejudica a análise posterior e a definição de prioridade de treino.

Classificação:
`HIGH` — gap de vocabulário/matriz defensiva em `DEF_POS`.

Correção sugerida:
Adicionar classificações defensivas em `DEF_POS` para:

- cobertura da pivô;
- falha de cobertura da pivô;
- troca de referência;
- falha de troca de referência;
- pivô livre;
- falha de comunicação defensiva;
- falha de sincronia base/solta;
- ajuste defensivo abriu pivô.

### PILOTO-01 / Confusão 04 — `TRANS_OF`

Situação real:
Duas jogadoras atacaram em `2x1` pela lateral direita. A jogadora mais central passou para a companheira finalizar em aérea. A finalização não virou gol.

Registro feito:
Salvo como `Gol perdido`.

Problema observado:
A matriz atual não permite registrar ao mesmo tempo a estrutura da transição, `2x1`, e a técnica da finalização, `aérea`. A opção `Aérea na transição` estava definida como passe repositor direto, mas este lance foi uma aérea construída dentro de um `2x1`. Também não ficou claro como registrar o motivo de a finalização não ter virado gol.

Impacto:
O dado fica incompleto. A análise posterior pode não saber se o erro foi da estrutura da transição, do passe para aérea, da recepção, da finalização, da defesa da goleira ou de outro fator.

Classificação:
`HIGH` — gap de matriz em `TRANS_OF + ARREMESSO`.

Correção sugerida:
Separar estrutura da transição e tipo de finalização:

- `estrutura_transicao`: direta / indireta `2x1` / indireta `3x2` / indireta `4x3`;
- `tipo_finalizacao`: simples / aérea / giro;
- `resultado_factual`: defendido / bloqueado / fora / trave / violação / gol / não observado;
- `causa_provavel` opcional: erro no passe, tempo da aérea, recepção, finalização, defesa da goleira.

### PILOTO-01 / Confusão 05 — `AT_POS`

Situação real:
A central estava atuando como especialista. Ela fez uma finta de passe em suspensão para a lateral esquerda, a defesa caiu na finta, e a especialista entrou pelo meio da defesa para finalizar e fazer o gol.

Registro feito:
`AT_POS + ARREMESSO + GOL + motivo/pontuação da especialista`.

Problema observado:
O registro salva o desfecho da jogada, mas não captura a ação preparatória decisiva: finta de passe em suspensão. Do jeito que está, parece que a especialista apenas recebeu/pegou a bola e arremessou, sem registrar a criação da vantagem.

Impacto:
A análise posterior perde a informação tática mais importante do lance: a finta deslocou a defesa e abriu o corredor central. Isso prejudica leitura de tomada de decisão, fixação, engano defensivo e criação de vantagem ofensiva.

Classificação:
`HIGH` — gap de matriz ofensiva em `AT_POS`.

Correção sugerida:
Adicionar camada opcional de ação preparatória em `AT_POS + ARREMESSO`:

- finta de passe;
- finta de arremesso;
- finta corporal;
- fixação;
- entrada pelo meio;
- quebra de linha;
- defesa deslocada;
- vantagem criada.

### PILOTO-01 / Confusão 06 — `DEF_POS`

Situação real:
A central adversária fez uma diagonal longa e passou em aérea para a lateral esquerda. A defensora atrás da pivô tentou interceptar a bola no ar, mas não conseguiu. A lateral esquerda recebeu/finalizou e fez gol sem bloqueio.

Registro feito:
`DEF_POS + ACAO_DEFENSIVA + INTERCEPTACAO`.

Problema observado:
A opção `Interceptação` registra a tentativa da defensora, mas não permite indicar claramente que a interceptação falhou e que a sequência terminou em gol sofrido. A matriz atual trata `INTERCEPTACAO/ROUBO` como ações que não admitem `GOL` como resultado, o que impede representar a interceptação malsucedida seguida de gol.

Impacto:
O dado salvo pode sugerir uma ação defensiva válida/positiva, quando na prática houve falha de interceptação, bola aérea não cortada e gol sofrido sem bloqueio.

Classificação:
`HIGH` — gap de matriz defensiva em `DEF_POS + INTERCEPTACAO`.

Correção sugerida:
Adicionar distinção entre:

- interceptação tentada;
- interceptação bem-sucedida;
- interceptação malsucedida;
- passe aéreo não cortado;
- falha de interceptação;
- gol sofrido após falha de interceptação.

Também avaliar separar `resultado da ação defensiva` de `resultado factual da sequência`.

### PILOTO-01 / Confusão 07 — `TRANS_OF`

Situação real:
A goleira lançou a bola diretamente para a atleta que entrou pela lateral direita. A atacante recebeu, executou giro e fez o gol.

Registro feito:
`TRANS_OF + ARREMESSO + GOL`.

Problema observado:
O sistema não oferece `arremesso de giro` em `TRANS_OF`. A matriz atual permite classificar a transição como direta/indireta/aérea, mas não permite separar a estrutura da transição do tipo técnico da finalização. O lance correto seria `Transição direta + Giro + Gol`.

Impacto:
O dado salvo perde a informação técnica mais importante da finalização. A análise posterior não consegue diferenciar arremesso simples em transição de giro em transição, nem validar corretamente motivo da pontuação e pontuação esperada.

Classificação:
`HIGH` — gap de matriz em `TRANS_OF + ARREMESSO`.

Correção sugerida:
Separar em `TRANS_OF + ARREMESSO`:

- `estrutura_transicao`: direta / indireta `2x1` / indireta `3x2` / indireta `4x3`;
- `tipo_finalizacao`: simples / giro / aérea;
- `resultado_factual`: gol / defendido / bloqueado / fora / trave / violação / não observado;
- `motivo_pontuacao`: simples / giro / aérea / especialista / goleira / `6m`, conforme regra.

### PILOTO-01 / Confusão 08 — `TRANS_DEF`

Situação real:
Após o gol, a goleira adversária cobrou o tiro de meta. As atletas do CEPRAEA entraram marcando individual em um `3x3` momentâneo, deixando a goleira adversária como opção de passe. A goleira errou o passe e jogou a bola para fora.

Registro feito:
`TRANS_DEF + ACAO_DEFENSIVA + MARCACAO_PRESSAO`.

Problema observado:
A opção `Marcação/pressão` descreve a ação defensiva, mas não permite indicar claramente que a pressão provocou erro de passe adversário e gerou recuperação/posse para o CEPRAEA.

Impacto:
O dado salvo pode registrar que houve pressão, mas perde o motivo do sucesso defensivo. A análise posterior não identifica que a marcação individual momentânea induziu erro de passe da goleira adversária.

Classificação:
`HIGH` — gap de matriz em `TRANS_DEF + MARCACAO_PRESSAO`.

Correção sugerida:
Adicionar classificações/efeitos para ações defensivas em `TRANS_DEF`:

- pressão induziu erro de passe;
- pressão forçou passe para fora;
- pressão atrasou transição;
- marcação individual `3x3`;
- erro adversário provocado;
- recuperação de posse por erro adversário.

### PILOTO-01 / Confusão 09 — `TRANS_OF`

Situação real:
A goleira lançou a bola para as atacantes entrando pelo lado direito. Elas formaram um `2x1` na lateral. A atacante mais próxima da lateral tinha possibilidade de arremesso simples, mas retornou a bola para a jogadora no centro. Essa decisão caracterizou jogo passivo, obrigando a jogadora central a arremessar. A central tentou um giro de longe, com duas defensoras à frente, e o arremesso foi bloqueado.

Registro feito:
`TRANS_OF + ARREMESSO + GIRO`.

Problema observado:
O Scout permitiu registrar o gesto técnico final, mas não permitiu registrar a estrutura da transição `2x1`, a decisão de retorno da bola, o passivo gerado, nem o contexto do arremesso forçado/de longe. O resultado factual correto é `BLOQUEADO`, mas falta representar por que esse bloqueio aconteceu.

Impacto:
O dado salvo pode sugerir apenas `giro bloqueado`, quando o problema tático principal foi a decisão anterior: a atleta recusou a finalização em `2x1`, retornou a bola e colocou a equipe em situação de passivo, forçando um arremesso de baixa qualidade.

Classificação:
`HIGH` — gap de matriz em `TRANS_OF + ARREMESSO / contexto decisional`.

Correção sugerida:
Separar em `TRANS_OF`:

- `estrutura_transicao`: direta / indireta `2x1` / indireta `3x2` / indireta `4x3`;
- `tipo_finalizacao`: simples / giro / aérea;
- `contexto_decisao`: chance recusada / retorno de bola / passivo provocado / arremesso obrigatório;
- `contexto_arremesso`: giro de longe / arremesso forçado / com defensoras à frente;
- `resultado_factual`: gol / defendido / bloqueado / fora / trave / violação / não observado.

### PILOTO-01 / Confusão 10 — `DEF_POS`

Situação real:
As defensoras de base e solta demoraram a fechar o corredor central. A especialista adversária infiltrou pelo meio e saltou para dentro da área. Por chegarem atrasadas, as defensoras tocaram na atacante, e a arbitragem marcou tiro de `6m`.

Registro feito:
Não consegui salvar.

Problema observado:
A matriz atual não possui opção específica para tentativa de ação defensiva atrasada que resulta em tiro de `6m` contra. A opção genérica `VIOLACAO` não descreve adequadamente o evento, pois não diferencia uma violação comum de um `6m` concedido por contato defensivo atrasado.

Impacto:
O Scout não consegue registrar um dos desfechos defensivos mais importantes do beach handball: conceder tiro de `6m` por falha de fechamento, atraso ou contato defensivo. Isso impede análise correta de falha defensiva e prioridade de treino.

Classificação:
`BLOCKER` — gap de matriz em `DEF_POS`.

Correção sugerida:
Adicionar resultado factual específico para defesa:

- `TIRO_6M_CONCEDIDO`;
- `6M_CONTRA`;
- `FALTA_DEFENSIVA_6M`.

Adicionar classificações defensivas associadas:

- fechamento atrasado;
- contato defensivo atrasado;
- falha no fechamento central;
- falha de contenção da especialista;
- atraso base-solta;
- `6m` concedido por contato.

### PILOTO-01 / Confusão 11 — `DEF_POS`

Situação real:
Após tiro de `6m` concedido, a adversária realizou a cobrança de `6m` e converteu em gol.

Registro feito:
Não consegui salvar.

Problema observado:
No uso real do `PILOTO-01`, o usuário não encontrou caminho claro para registrar a cobrança de `6m` adversária. É importante separar dois momentos diferentes:

- `TIRO_6M_CONCEDIDO` = a defesa comete a falta/infração que gera o `6m`;
- cobrança de `6m` = a finalização da cobrança em si.

Como achado do piloto, o problema foi um `BLOCKER`, porque cobrança de `6m` é um evento básico do jogo e o lance não pôde ser salvo durante a coleta ao vivo.

Impacto:
Se a cobrança de `6m` não pode ser registrada de forma clara, o Scout não consegue diferenciar gol sofrido em jogo corrido de gol sofrido em cobrança de `6m`. Isso prejudica:

- análise da goleira;
- análise defensiva;
- controle de faltas que geram `6m`;
- leitura de bola parada;
- placar e pontuação do lance.

Classificação:
`BLOCKER` — achado operacional do `PILOTO-01` em `DEF_POS / cobrança de 6m adversária`.

Correção sugerida:
Criar caminho explícito e descobrível na `COLETA_AO_VIVO` para cobrança de `6m` adversária:

- `DEF_POS`
- `ACAO_DEFENSIVA`
- `FINALIZACAO_6M_ADV`
- `resultado_factual`: `GOL`, `DEFENDIDO`, `FORA`, `TRAVE`, `VIOLACAO`, `NAO_OBSERVADO`
- `tipo_finalizacao_code = 6M`
- pontuação auto-derivada para `2` quando o resultado for `GOL`

Estado atual validado:
Depois do `CEPR-0090`, o contrato semântico/executável já passou a prever a cobrança adversária de `6m` como:

- ação básica `FINALIZACAO_6M_ADV`;
- tipo de finalização fixo em `6M`;
- resultados permitidos `GOL`, `DEFENDIDO`, `FORA`, `TRAVE`, `VIOLACAO`, `NAO_OBSERVADO`.

Ou seja: o gap histórico do piloto era real e corretamente classificado como `BLOCKER`, mas hoje o problema principal já não é mais “a regra não existe”.

Estado posterior ao `CEPR-0096`:

- `DEF_POS + ACAO_DEFENSIVA + FINALIZACAO_6M_ADV` cobre cobrança adversária;
- `AT_POS + ARREMESSO + FINALIZACAO_6M_FAV` cobre cobrança favorável ao CEPRAEA;
- em ambos os casos, `tipo_finalizacao_code = 6M`;
- na cobrança favorável, se o resultado for `GOL`, `motivo_pontuacao_code = 6M` e `pontos_jogada = 2`.

## Fechamento da Fase 1

Status:
`INTERROMPIDO`.

Motivo:
A `COLETA_AO_VIVO` apresentou gaps semânticos recorrentes durante uso real com vídeo `CEPRAEA x Maricá`. O usuário conseguiu salvar algumas entradas, mas frequentemente precisou adaptar lances reais a opções genéricas ou imprecisas.

Decisão:
Não continuar o piloto antes de revisar a matriz/vocabulário.

Resultado:
Precisa revisar vocabulário de `COLETA_AO_VIVO`.

Principais blockers:

1. `DEF_POS` não diferencia tentativa defensiva, falha defensiva e resultado da sequência.
2. `DEF_POS` não representa bem `6m` concedido e cobrança de `6m` adversária.
3. `TRANS_OF` mistura estrutura da transição com tipo técnico da finalização.
4. `AT_POS` não registra ações preparatórias antes do arremesso.
5. `RESULTADO_FACTUAL` está sendo usado para cobrir eventos que precisam de campos próprios.

## Ajustes entre a Fase 1 e a retomada

Depois da interrupção, o histórico registra três ajustes centrais:

1. `CEPR-0090`
Corrigiu os blockers mais fortes da primeira fase, especialmente `TIRO_6M_CONCEDIDO` e a modelagem semântica básica de `DEF_POS`.
Também introduziu, no contrato, a cobrança de `6m` adversária como `FINALIZACAO_6M_ADV`, mas isso ainda exige validação operacional da UI e não fecha, por si só, a cobrança de `6m` favorável ao CEPRAEA.

1b. `CEPR-0096`
Fechou a modelagem equivalente da cobrança de `6m` favorável ao CEPRAEA:
- `AT_POS`
- `ARREMESSO`
- `FINALIZACAO_6M_FAV`
- `tipo_finalizacao_code = 6M`
- `motivo_pontuacao_code = 6M` e `pontos_jogada = 2` quando `resultado_factual_code = GOL`

2. `CEPR-0091`
Corrigiu UX operacional da `COLETA_AO_VIVO`:
- tempo `00:00` não nasce mais como padrão silencioso;
- `Registrar entrada` fica bloqueado sem tempo válido;
- entradas `PENDENTE` passaram a poder ser editadas/excluídas logicamente.

3. `CEPR-0092`
Separou, em `DEF_POS + BLOQUEIO`, duas coisas que antes estavam misturadas:
- qual finalização adversária a defesa enfrentou;
- se o bloqueio foi ou não executado.

Esses ajustes **não homologaram o Scout completo**. Eles apenas permitiram retomada parcial do piloto com menos contaminação.

## Fase 2 — Retomada parcial após ajustes

### PILOTO-01 / Confusão 12 — `DEF_POS`

Situação real:
A especialista adversária entrou pelo meio da defesa e fez o gol.

Registro feito:
`DEF_POS + finalização adversária enfrentada = Arremesso simples + Gol sofrido`.

Problema observado:
O registro técnico do `arremesso simples` está aceitável, mas o Scout não permite indicar claramente que foi uma especialista adversária infiltrando pelo centro da defesa. A opção esperada pelo usuário era algo como `Gol da especialista no centro`.

Impacto:
O dado salvo permite saber que houve gol sofrido em arremesso simples, mas perde a informação tática principal: infiltração central da especialista. Isso prejudica análise de fechamento central, contenção da especialista e proteção do corredor central.

Classificação:
`MEDIUM/HIGH` — gap de contexto defensivo.

Correção sugerida:
Adicionar ou planejar campos opcionais para:

- setor da finalização adversária: centro / lateral esquerda / lateral direita / pivô;
- perfil da finalizadora adversária: especialista / goleira / atleta de linha / não observado;
- contexto da finalização: infiltração central / entrada lateral / pivô livre.

### PILOTO-01 / Confusão 13 — `DEF_POS`

Situação real:
A adversária executou uma aérea pela lateral esquerda. A defensora não executou o bloqueio, e a finalização resultou em gol sofrido.

Registro feito:
`DEF_POS + BLOQUEIO + BLOQ_NAO_EXECUTADO + GOL_SOFRIDO`.

Problema observado:
A classificação `Bloqueio não executado` permite salvar gol sofrido, mas não permite informar qual era o tipo da finalização adversária enfrentada. No lance real era uma aérea, portanto o gol deveria ser tratado como `2` pontos. Do jeito atual, o registro não permite saber se o gol sofrido foi de `1` ou `2` pontos.

Impacto:
O dado defensivo fica incompleto e prejudica cálculo de pontuação, análise da falha defensiva e futura atualização automática do placar.

Classificação:
`HIGH` — gap pós-`CEPR-0090` em `DEF_POS + BLOQ_NAO_EXECUTADO`.

Correção sugerida:
Em `DEF_POS + BLOQUEIO + BLOQ_NAO_EXECUTADO`, quando o resultado envolver finalização adversária, exibir/exigir `Finalização adversária enfrentada` com `SIMPLES`, `GIRO`, `AEREA`, `6M` ou `NAO_OBSERVADO`.

Observação histórica:
Esse achado foi o gatilho direto para o `CEPR-0092`.

### PILOTO-01 / Confusão 14 — `TRANS_OF`

Situação real:
Na transição ofensiva indireta `3x3`, a lateral direita teve chance clara de finalização simples, saltou para dentro da área, mas retornou a bola para a central. Isso caracterizou jogo passivo. A central ficou obrigada a finalizar e tentou um giro de longe, dos `9m`, em condição forçada.

Registro feito:
Não consegui salvar.

Problema observado:
A matriz atual de `TRANS_OF` não permite representar transição indireta `3x3`, nem contexto de passivo provocado por chance clara recusada, nem arremesso forçado de giro de longe. Se o lance fosse salvo apenas como `GIRO`, o dado ficaria incorreto, pois seria contabilizado junto com giros normais de boa condição.

Classificação:
`BLOCKER` — gap em `TRANS_OF + ARREMESSO`.

Correção sugerida:
Adicionar:

- `estruturaTransicaoCode = TRANS_INDIRETA_3X3`;
- `contextoDecisaoCode` opcional: `CHANCE_CLARA_RECUSADA`, `RETORNO_BOLA`, `PASSIVO_SINALIZADO`, `ARREMESSO_OBRIGATORIO`;
- `contextoArremessoCode` opcional: `ARREMESSO_FORCADO`, `GIRO_DE_LONGE`, `SOB_PASSIVO`.

Observação histórica:
Esse achado apareceu **depois** de `CEPR-0092`. Portanto, ele não invalida o ajuste de bloqueio; ele abre um novo gap específico de `TRANS_OF`.

Estado posterior:
O `CEPR-0095` passou a cobrir esse lance com campos separados:

- `estruturaTransicaoCode = TRANS_INDIRETA_3X3`;
- `contextoDecisaoCode = PASSIVO_SINALIZADO` ou contexto equivalente;
- `contextoArremessoCode = GIRO_DE_LONGE` ou `ARREMESSO_FORCADO`;
- `tipo_finalizacao_code = GIRO`;
- `resultado_factual_code = BLOQUEADO`, `FORA`, `DEFENDIDO`, `GOL` etc.

Validação:
O E2E `scout-cepr0089-trans-of.spec.ts` cobre o caso `TRANS_INDIRETA_3X3 + PASSIVO_SINALIZADO + GIRO_DE_LONGE + GIRO + BLOQUEADO`, preservando o contexto sem contabilizar o lance como giro normal de boa condição.

Estado de UX:
A `COLETA_AO_VIVO` passou a separar coleta rápida e revisão:

- fluxo principal: estrutura da transição, bloco visual `Finalização` e preset opcional `Arremesso forçado por passivo`;
- bloco recolhido: contexto decisional e contexto do arremesso detalhados;
- motivo de pontuação e pontos ficam no bloco comum `Finalização`;
- observação semântica: jogo passivo pode ocorrer em ataque posicionado (`AT_POS`) ou em transição ofensiva (`TRANS_OF`).

Isso preserva a semântica do `CEPR-0095`, mas reduz o risco operacional de a coleta ao vivo virar revisão completa.

Estado posterior CEPR-0099:
`AT_POS + ARREMESSO` e `TRANS_OF + ARREMESSO` passaram a compartilhar o bloco visual `Finalização`. A diferença entre as fases fica nos blocos de contexto.

Estado posterior CEPR-0100:
O preset `Arremesso forçado por passivo` passou a existir nos dois fluxos (`AT_POS + ARREMESSO` e `TRANS_OF + ARREMESSO`). `PASSIVO` como resultado factual representa interrupção/perda da posse pela regra; quando ainda há arremesso, passivo deve ser registrado como contexto do lance. A escolha `Simples`, `Giro` ou `Aérea` agora persiste em `tipo_finalizacao_code` também em `AT_POS`.

Próxima validação:
Retomar o lance com o roteiro `docs/scout/contexto/05-roteiro-retomada-piloto-01.md`. O critério de aprovação não é apenas o E2E passar; o usuário precisa encontrar e salvar o caminho correto em velocidade real, sem consulta externa à matriz.

## Consolidação histórica do veredito

O `PILOTO-01` mostrou duas coisas ao mesmo tempo:

1. a `COLETA_AO_VIVO` era valiosa o suficiente para expor gaps reais em uso humano;
2. a modelagem ainda não estava pronta para ser tratada como captura confiável sem refinamentos semânticos e operacionais.

Veredito consolidado do histórico:

- o piloto **não homologou** o Scout completo;
- a primeira fase foi corretamente interrompida por contaminação semântica do dado;
- houve retomada parcial após ajustes;
- os ajustes reduziram atrito, e os gaps principais de `DEF_POS`, `6m` e `TRANS_OF + ARREMESSO` ganharam cobertura explícita em contrato/testes;
- no tema `6m`, o contrato passou a cobrir tanto cobrança adversária (`FINALIZACAO_6M_ADV`) quanto cobrança favorável (`FINALIZACAO_6M_FAV`);
- o maior valor do piloto foi transformar lances reais em backlog semântico objetivo.
