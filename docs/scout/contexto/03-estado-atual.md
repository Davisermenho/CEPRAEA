# Estado Atual do Scout

Referencia curta para um agente entrar no trabalho sem reler todo o historico.

## Estado geral

- o Scout ja tem camada documental forte no repo;
- o chat historico mostra a evolucao do modelo, mas nao deve ser usado como fonte primaria de leitura;
- a `COLETA_AO_VIVO` foi a camada mais iterada e ja passou por piloto real;
- o projeto ainda mistura partes estaveis e partes em refinamento fino, principalmente em semantica defensiva e transicao ofensiva.

## Fontes ativas no repo

- semantica base: [scout-ssot.md](/home/davis/cepraea-pwa/docs/scout/scout-ssot.md)
- compatibilidade da coleta: [matriz-compatibilidade-coleta-ao-vivo.md](/home/davis/cepraea-pwa/docs/scout/matriz-compatibilidade-coleta-ao-vivo.md)
- contrato tecnico: [scout-contrato-tecnico-supabase.md](/home/davis/cepraea-pwa/docs/scout/scout-contrato-tecnico-supabase.md)
- piloto historico: [scout-piloto-01-coleta-ao-vivo.md](/home/davis/cepraea-pwa/docs/scout/scout-piloto-01-coleta-ao-vivo.md)

## O que parece estabilizado

- necessidade de separar semantica do dominio de implementacao casual de UI;
- uso de matriz canonica para governar compatibilidades da `COLETA_AO_VIVO`;
- contrato operacional executavel complementar para fluxo de tela da `COLETA_AO_VIVO`;
- leitura do scout em camadas, nao apenas captura de evento bruto;
- distincao entre contexto vivo, SSOT, historico e evidência.
- `liveCollectionCompatibility.matrix.ts` continua como contrato semantico executavel;
- `liveCollectionFlow.contract.ts` governa `mainFields`, `optionalFields`, `advancedFields`, `uiOrder` e `requiredFields` condicionais apenas dos fluxos ja cobertos.
- Fluxos cobertos pelo contrato operacional em 2026-05-20:
  - `AT_POS.ARREMESSO.ARREMESSO`;
  - `AT_POS.ARREMESSO.FINALIZACAO_6M_FAV`;
  - `TRANS_OF.ARREMESSO.ARREMESSO`.
- `6m` na `COLETA_AO_VIVO`:
  - cobrança adversária: `DEF_POS + ACAO_DEFENSIVA + FINALIZACAO_6M_ADV`;
  - cobrança favorável ao CEPRAEA: `AT_POS + ARREMESSO + FINALIZACAO_6M_FAV`;
  - ambos derivam `tipo_finalizacao_code = 6M`;
  - no caso favorável com `GOL`, deriva `motivo_pontuacao_code = 6M` e `pontos_jogada = 2`;
  - validação ampla do Scout teve execução verde com `102` E2E após a UI consumir o contrato operacional.

## O que continua sensivel

- `DEF_POS` quando a acao esperada nao foi executada;
- `DEF_POS` quando duas defensoras falham juntas em fechamento/cobertura/sincronia;
- `TRANS_OF` quando a modelagem precisa diferenciar estrutura, contexto decisional e contexto do arremesso;
- UX operacional que induz dado impreciso mesmo quando a matriz esta melhor.
- `requiredFields` condicionais ja foram conectados ao submit dos 3 fluxos cobertos: `PASSIVO` nao exige tipo de finalizacao, enquanto `GOL` exige finalizacao, motivo de pontuacao e pontos.
- Ainda nao expandir o mesmo modelo para `DEF_POS + BLOQUEIO` antes de validar condicionais defensivas.
- Evidencia intermediaria: em 2026-05-20, uma reexecucao de `npx playwright test e2e/scout --project=desktop --reporter=line` falhou `101/102` em `scout-cepr0088a-roster.spec.ts` ao localizar `Coletar ao vivo`.
- Evidencia atual: em 2026-05-20, o teste `scout-cepr0088a-roster.spec.ts` passou isolado com trace; depois `scout-cepr0089-trans-of.spec.ts` foi endurecido para filtrar consultas SQL por `scout_game_id`; a suite `e2e/scout` passou `102/102`. Tratar as falhas anteriores como problemas de estabilidade de E2E, nao como quebra do contrato operacional.
- Evidencia ampla atual: `npm run validate:mvp:v1` passou em 2026-05-20, incluindo E2E global `167 passed / 5 skipped`.

## Proximo foco recomendado

Validar em uso humano o fluxo de `TRANS_OF + ARREMESSO` em lances de passivo/arremesso forçado.

Roteiro operacional:

- `docs/scout/contexto/05-roteiro-retomada-piloto-01.md`

Problema historico do piloto:

- transição indireta `3x3`;
- chance clara recusada;
- retorno de bola;
- passivo sinalizado;
- giro de longe / arremesso forçado;
- resultado factual como `BLOQUEADO`, `FORA`, `DEFENDIDO`, `GOL` etc.

Estado atual:

- já existem campos separados para `estruturaTransicaoCode`, `contextoDecisaoCode` e `contextoArremessoCode`;
- as opções atuais cobrem o lance real do `PILOTO-01 #14`;
- E2E validou `TRANS_INDIRETA_3X3 + PASSIVO_SINALIZADO + GIRO_DE_LONGE + GIRO + BLOQUEADO`;
- a UI foi simplificada para `TRANS_OF + ARREMESSO`: estrutura e contexto detalhado ficam fora do bloco de finalização;
- existe preset rápido `Arremesso forçado por passivo` em `AT_POS + ARREMESSO` e `TRANS_OF + ARREMESSO`;
- `AT_POS + ARREMESSO` e `TRANS_OF + ARREMESSO` compartilham o bloco visual `Finalização` (CEPR-0099/CEPR-0100), mantendo contextos separados por fase;
- esses fluxos agora sao governados por `liveCollectionFlow.contract.ts` para campos principais, opcionais, avancados e ordem de UI;
- o submit desses fluxos ja consulta `requiredFields`/`conditionalRequiredFields` do contrato operacional;
- o passivo pode ocorrer em `AT_POS` ou `TRANS_OF`;
- o próximo risco é validação humana em velocidade real de coleta, não mais ausência de caminho técnico.

## Leitura operacional do `PILOTO-01`

- o `PILOTO-01` nao homologou o Scout completo;
- ele validou apenas a antiga camada de `COLETA_AO_VIVO`;
- os registros de confusao do piloto sao material de alto valor, porque traduzem lances reais em gaps de modelo.

## Como um agente deve entrar hoje

1. entender o estado atual neste arquivo;
2. ler a matriz canonica e a SSOT;
3. identificar se a tarefa e de semantica, UX, contrato tecnico ou validacao;
4. consultar os achados do piloto antes de mexer em `COLETA_AO_VIVO`;
5. usar `pilot-chat.json` apenas para recuperar contexto fino de um bloco ou decisao especifica.

## Anti-padrao

Nao voltar a operar assim:

- reler 400+ mensagens para descobrir o estado atual;
- usar uma fala antiga como se ainda fosse a regra viva;
- misturar backlog, decisao aprovada e evidência de teste no mesmo resumo;
- abrir `pilot-chat.json` inteiro para cada nova tarefa.
