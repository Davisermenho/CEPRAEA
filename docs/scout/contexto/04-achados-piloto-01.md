# Achados do `PILOTO-01`

Este arquivo nao substitui o historico completo do piloto. Ele lista apenas os achados que continuam relevantes para leitura rapida.

## 1. `DEF_POS` ainda foi a area com mais atrito semantico

Padroes recorrentes do piloto:

- bloqueio esperado, mas nao executado;
- falha de fechamento central;
- falha de cobertura coordenada entre duas defensoras;
- diferenca entre acao defensiva executada e resultado final do lance.

Impacto:

- o usuario era forcado a salvar combinacoes semanticamente imprecisas;
- a analise posterior podia diagnosticar o treino errado.

## 2. `TRANS_OF` mostrou mistura indevida entre contexto e finalizacao

Padroes recorrentes do piloto:

- estrutura da transicao misturada com tipo tecnico da finalizacao;
- dificuldade para registrar a acao preparatoria que criou o arremesso;
- lacunas quando a finalizacao dependia do contexto da transicao e nao apenas do gesto tecnico final.
- caso critico posterior: transição indireta `3x3`, chance clara recusada, retorno de bola, passivo sinalizado e giro de longe/arremesso forçado.

Impacto:

- a UI parecia permitir salvar, mas o dado nao preservava bem o que ocorreu no jogo.
- se salvo apenas como `GIRO`, o lance fica contaminado como giro normal em boa condição.

Estado atual:

- `CEPR-0095` introduziu campos de contexto para `TRANS_OF + ARREMESSO`;
- as opções atuais cobrem o lance real de passivo e arremesso forçado;
- o E2E `scout-cepr0089-trans-of.spec.ts` validou o fluxo `TRANS_INDIRETA_3X3 + PASSIVO_SINALIZADO + GIRO_DE_LONGE + GIRO + BLOQUEADO`;
- a UI passou a separar coleta rápida de detalhes avançados, com preset `Arremesso forçado por passivo`.

Opções esperadas para validação:

- `estruturaTransicaoCode`: representa transição indireta `3x3`;
- `contextoDecisaoCode`: representa chance clara recusada, retorno de bola, passivo sinalizado ou arremesso obrigatório;
- `contextoArremessoCode`: representa arremesso forçado, giro de longe ou sob passivo.

## 3. O piloto confirmou que UX ruim vira dado ruim

Padroes recorrentes do piloto:

- campo ou label tecnicamente possivel, mas dificil de usar em velocidade;
- opcao generica sendo usada para lances diferentes demais;
- necessidade de parar para pensar em vez de registrar naturalmente.

Impacto:

- problema nao era so de implementacao;
- parte do erro vinha de excesso de carga cognitiva na tela.

## 4. O melhor insumo do piloto foi o lance real descrito em linguagem de jogo

Quando o usuario descreveu:

- fase da bola;
- situacao real do video;
- onde travou;
- o que esperava encontrar;

o chat produziu diagnosticos muito melhores do que quando a conversa partia de codigo ou enum.

Regra pratica:

- para evoluir a `COLETA_AO_VIVO`, priorizar exemplos reais de jogo antes de ampliar lista de codigos.

## 5. O piloto nao deve ser reusado como contrato vivo

Valor correto do piloto:

- fonte de evidência historica;
- mapa de gaps encontrados em uso real;
- material para novos slices e testes.

Valor incorreto do piloto:

- prova de que toda a arquitetura atual esta homologada;
- substituto da matriz, SSOT ou contrato tecnico.

## 6. Achado de `6m` foi fechado em contrato e E2E

O achado historico de `6m` continua valido como evidência do piloto, mas o estado atual mudou:

- cobrança de `6m` adversária: `FINALIZACAO_6M_ADV`;
- cobrança de `6m` favorável ao CEPRAEA: `FINALIZACAO_6M_FAV`;
- ambos derivam `tipo_finalizacao_code = 6M`;
- cobrança favorável com `GOL` deriva `motivo_pontuacao_code = 6M` e `pontos_jogada = 2`;
- validação ampla do Scout passou com `102` testes E2E.
