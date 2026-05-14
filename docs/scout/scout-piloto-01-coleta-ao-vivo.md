# PILOTO-01 — Teste Humano Controlado da `/scout`

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
