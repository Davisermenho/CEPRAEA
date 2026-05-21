# Roteiro de Retomada do PILOTO-01

Objetivo: validar se a `COLETA_AO_VIVO` consegue registrar lances reais do `PILOTO-01` sem adaptação forçada, sem consulta à matriz durante a coleta e sem perda semântica do dado.

Este roteiro não substitui E2E. O E2E valida contrato técnico. Este roteiro valida uso humano em velocidade de coleta.

## Critério Geral

Um lance só pode ser considerado resolvido quando todos os critérios abaixo forem verdadeiros:

- o usuário encontra o caminho correto sem orientação externa;
- o usuário consegue salvar;
- o dado salvo representa o que aconteceu no vídeo;
- o registro não exige observação manual para compensar falta de campo;
- o registro não mistura fato observado com interpretação técnica;
- o lance não contamina métricas agregadas, por exemplo contar giro forçado de longe como giro normal em boa condição.

Se qualquer item falhar, o achado continua aberto como problema de UX, matriz ou contrato.

## Preparação

Antes da sessão manual:

- abrir a tela `/scout/ao-vivo/{gameId}` em ambiente de teste;
- usar os mesmos vídeos/lances que geraram confusão no `PILOTO-01`;
- não deixar a matriz aberta para consulta durante a coleta;
- registrar para cada lance: tempo aproximado, caminho escolhido, se salvou, dúvida encontrada e dado final salvo;
- ao final, comparar o registro salvo com a expectativa abaixo.
- considerar `liveCollectionFlow.contract.ts` como contrato operacional da UI apenas para os fluxos de arremesso já cobertos;
- considerar que `requiredFields` condicionais ja estao conectados nesses fluxos;
- não expandir o contrato operacional para `DEF_POS + BLOQUEIO` antes de validar condicionais defensivas.

## Estado técnico do contrato operacional — 2026-05-20

- Contrato criado em `src/features/scout/domain/liveCollectionFlow.contract.ts`.
- Fluxos cobertos:
  - `AT_POS.ARREMESSO.ARREMESSO`;
  - `AT_POS.ARREMESSO.FINALIZACAO_6M_FAV`;
  - `TRANS_OF.ARREMESSO.ARREMESSO`.
- `ScoutWorkspacePage.tsx` ja consome `mainFields`, `optionalFields`, `advancedFields`, `uiOrder` e `requiredFields` condicionais.
- Regra conectada: `PASSIVO` em arremesso ofensivo nao exige `tipo_finalizacao_code`; `GOL` exige finalizacao, motivo de pontuacao e pontos antes do submit.
- Evidencia historica: `npx playwright test e2e/scout --project=desktop --reporter=line` passou `102/102` apos a adaptacao da UI.
- Evidencia intermediaria: a reexecucao de 2026-05-20 falhou `101/102` em `scout-cepr0088a-roster.spec.ts` ao procurar `Coletar ao vivo`.
- Evidencia atual: em 2026-05-20, o teste falho `scout-cepr0088a-roster.spec.ts` passou isolado com trace; a spec `scout-cepr0089-trans-of.spec.ts` foi endurecida para filtrar consultas SQL por `scout_game_id`; a suite `e2e/scout` completa passou `102/102`.
- Evidencia CEPR-0098D: `npx playwright test e2e/scout/scout-pontuacao-gol.spec.ts --project=desktop --reporter=line` passou `16/16`, incluindo os casos de `PASSIVO` sem finalizacao e `GOL` bloqueado por campos obrigatorios condicionais.
- Evidencia ampla atual: `npm run validate:mvp:v1` passou em 2026-05-20, incluindo E2E global `167 passed / 5 skipped`.

## Caso Prioritário — PILOTO-01 #14

Situação real:

Na transição ofensiva indireta `3x3`, a lateral direita teve chance clara de finalização simples, saltou para dentro da área, mas retornou a bola para a central. Isso caracterizou jogo passivo. A central ficou obrigada a finalizar e tentou um giro de longe, dos `9m`, em condição forçada. O arremesso foi bloqueado.

Caminho esperado na `COLETA_AO_VIVO`:

- fase da bola: `TRANS_OF`;
- categoria: `ARREMESSO`;
- ação básica: `ARREMESSO`;
- estrutura da transição: `TRANS_INDIRETA_3X3`;
- tipo de finalização: `GIRO`;
- resultado factual: `BLOQUEADO`;
- contexto rápido opcional: `Arremesso forçado por passivo`;
- detalhes avançados, se houver tempo: `PASSIVO_SINALIZADO` + `GIRO_DE_LONGE` ou `ARREMESSO_FORCADO`;
- motivo de pontuação: vazio;
- pontos da jogada: `0`.

Resultado esperado no banco:

```txt
estrutura_transicao_code = TRANS_INDIRETA_3X3
contexto_decisao_code = PASSIVO_SINALIZADO
contexto_arremesso_code = GIRO_DE_LONGE ou ARREMESSO_FORCADO
tipo_finalizacao_code = GIRO
resultado_factual_code = BLOQUEADO
motivo_pontuacao_code = NULL
pontos_jogada = 0
```

Critério específico de aprovação:

- o usuário não salva apenas como `TRANS_OF + ARREMESSO + GIRO + BLOQUEADO`;
- o usuário percebe que `passivo` é contexto decisional, não resultado factual;
- o usuário percebe que `giro de longe/arremesso forçado` é contexto do arremesso, não novo tipo de finalização;
- o usuário consegue salvar a versão rápida sem abrir revisão completa;
- se abrir detalhes avançados, o texto da UI ajuda a encontrar os campos contextuais sem explicação externa.

## Casos de Regressão Manual

Depois do caso #14, repetir o mesmo protocolo nos grupos abaixo:

- `6m` adversária: cobrança de 6m da adversária deve salvar como `DEF_POS + ACAO_DEFENSIVA + FINALIZACAO_6M_ADV`;
- `6m` favorável: cobrança de 6m do CEPRAEA deve salvar como `AT_POS + ARREMESSO + FINALIZACAO_6M_FAV`;
- `DEF_POS + BLOQUEIO`: bloqueio não executado com gol sofrido deve permitir informar a finalização adversária enfrentada;
- `DEF_POS + INTERCEPTACAO`: interceptação malsucedida seguida de gol não pode parecer interceptação positiva;
- `AT_POS + ARREMESSO`: ação preparatória deve capturar finta/fixação sem substituir o tipo da finalização;
- `TRANS_OF + ARREMESSO`: transição direta/indireta deve ficar separada do tipo técnico da finalização.

## Registro da Sessão

Para cada lance validado, registrar:

```txt
Lance:
Tempo do vídeo:
Situação real:
Caminho escolhido:
Salvou? sim/não
Dado salvo representa o vídeo? sim/não
Houve dúvida? qual?
Classificação: resolvido / UX pendente / matriz pendente / contrato pendente
Correção necessária:
```

## Veredito Esperado

O `PILOTO-01` só deve ser marcado como retomado com segurança quando:

- os blockers de `6m` salvarem sem adaptação;
- o caso `TRANS_OF + ARREMESSO + 3x3 + passivo + giro de longe` salvar e for encontrado naturalmente;
- os principais casos de `DEF_POS` não exigirem observação livre para preservar sentido;
- não houver novo caso em que o usuário diga "não consegui salvar" para evento básico do jogo.
