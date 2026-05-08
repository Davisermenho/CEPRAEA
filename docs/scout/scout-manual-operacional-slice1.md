---
tipo: MANUAL-OPERACIONAL
nome: "Scout — Manual Operacional do Slice 1"
papel: "Explica como usar a rota /scout no estado atual do produto: fluxo de trabalho, significado de cada campo, quando usar, quando não usar e um exemplo de preenchimento por jogada."
autoridade: "Guia operacional do frontend atual do scout. Não substitui a SSOT semântica nem o contrato técnico; traduz esses artefatos para uso prático."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "antes de usar a rota /scout; ao treinar equipe de coleta; ao revisar como preencher o scout novo em produção/local."
atualizado_por: "Agente executor + confirmação humana"
quando_atualizar: "sempre que a UX da rota /scout mudar; quando novos campos forem expostos; quando o fluxo operacional do slice 1 mudar."
validade: "2026-05-08"
status: ATUAL
status_nota: "Manual do scout novo no estado do vertical slice mínimo já integrado na rota /scout."
conflito: "Se este manual divergir da UX real da rota /scout, a UX real prevalece; se divergir da semântica canônica, prevalece a SSOT."
proibido:
  - "Não usar este manual para inferir regras que ainda não existem na tela."
  - "Não tratar este manual como descrição do scout completo do MANUSCOUT."
nao_cobre: "Camada mental, validação editorial, relatórios, feedback agregado, import de legado e o scout antigo baseado em ScoutEvent."
---

# Scout — Manual Operacional do Slice 1

## 1. O que esta tela já faz

A rota `/scout` já permite:

1. criar um `scout_game`;
2. abrir um jogo existente;
3. criar uma `jogada`;
4. registrar `participações` por atleta ou slot externo;
5. salvar e reabrir tudo no contrato novo do scout.

Ela **ainda não** fecha o scout completo. Hoje o objetivo é registrar jogadas de forma estruturada, consistente e revisável.

## 2. Quando usar este scout

Use esta rota quando você quiser:

- registrar lances importantes de um jogo;
- marcar contexto tático básico da jogada;
- identificar quem participou e o que fez;
- transformar a jogada em insumo de treino.

Não use esta rota, por enquanto, para:

- registrar todas as camadas mentais do jogo;
- fechar relatório final automático;
- produzir feedback consolidado por atleta;
- substituir sozinho toda a metodologia completa do `MANUSCOUT`.

## 3. Fluxo operacional correto

Ordem recomendada de uso:

1. criar o jogo;
2. selecionar o jogo;
3. abrir uma nova jogada;
4. preencher o contexto da jogada;
5. preencher as participações;
6. salvar;
7. reabrir para revisar ou corrigir.

Regra:

- uma jogada sempre pertence a um jogo;
- uma participação sempre pertence a uma jogada.

## 4. Bloco 1 — Criar jogo

Esse bloco cria o contêiner macro da análise.

### 4.1 `Data`

O que é:

- data do jogo ou da sessão observada.

Quando usar:

- sempre que a partida ou sessão tiver uma data definida;
- em jogo normal, usar a data real da partida.

Quando não usar:

- não usar data inventada só para “destravar” o formulário, se você ainda não sabe qual jogo está registrando.

Exemplo:

- `2026-05-08`

### 4.2 `Equipe analisada`

O que é:

- o time que está sendo observado como referência principal do scout.

Quando usar:

- normalmente será `CEPRAEA`;
- use o nome da equipe que você quer analisar.

Quando não usar:

- não usar o nome da adversária aqui;
- não usar rótulo genérico se você já sabe qual equipe está sendo estudada.

Exemplo:

- `CEPRAEA`

### 4.3 `Adversária`

O que é:

- nome do oponente daquele jogo.

Quando usar:

- sempre que a sessão for um jogo contra outro time;
- útil para revisão posterior e filtros humanos.

Quando não usar:

- não deixar texto ambíguo como `Time A` se você já sabe o nome real;
- em treino interno, pode ficar vazio ou receber descrição coerente.

Exemplo:

- `Flamengo Praia`

### 4.4 `Local`

O que é:

- ginásio, quadra ou arena onde o jogo aconteceu.

Quando usar:

- quando o local ajuda a contextualizar a sessão.

Quando não usar:

- não inventar um local se ele não agrega nada à análise.

Exemplo:

- `Arena Central`

### 4.5 `Notas do jogo`

O que é:

- observações amplas do jogo, não de uma jogada específica.

Quando usar:

- para contexto geral:
  - campeonato;
  - série;
  - condição do vento/quadra;
  - recorte de vídeo.

Quando não usar:

- não colocar aqui descrição de uma jogada isolada;
- não duplicar o que deveria ficar em `Notas da jogada`.

Exemplo:

- `Semifinal. Recorte principal em vídeo do segundo set.`

## 5. Bloco 2 — Jogos e jogadas

Esse bloco serve para navegar.

### 5.1 Lista de jogos

O que faz:

- mostra todos os `scout_games` já criados;
- define qual jogo está ativo.

Quando usar:

- sempre antes de registrar ou revisar jogadas.

Quando não usar:

- não criar jogada sem ter certeza do jogo selecionado.

### 5.2 `Nova`

O que faz:

- limpa o editor da jogada atual e prepara uma nova jogada dentro do jogo selecionado.

Quando usar:

- ao começar um novo lance;
- ao mudar do modo revisão para modo criação.

Quando não usar:

- não clicar se você ainda não salvou uma edição importante em andamento.

### 5.3 Lista de jogadas do jogo

O que mostra:

- `playCode`
- `period`
- `gameClock`
- `factualResult`

Quando usar:

- para reabrir uma jogada já registrada e corrigir ou revisar.

Quando não usar:

- não tratar essa lista como relatório final; ela é só navegação do slice 1.

## 6. Bloco 3 — Jogada + participações

Esse é o núcleo da coleta.

## 6.1 Campos básicos da jogada

### 6.1.1 `Código da jogada`

O que é:

- identificador humano da jogada.

Quando usar:

- sempre;
- use um padrão estável para facilitar revisão.

Quando não usar:

- não usar códigos aleatórios sem lógica;
- não repetir o mesmo código no mesmo jogo.

Exemplos:

- `SET1-001`
- `Q2-014`
- `GG-003`

### 6.1.2 `Data da sessão`

O que é:

- data da jogada, normalmente herdada do jogo.

Quando usar:

- manter a data do jogo, salvo se o scout for de treino/simulador.

Quando não usar:

- não usar data diferente da sessão real sem motivo claro.

### 6.1.3 `Período`

O que é:

- recorte macro do lance dentro da sessão.

Quando usar:

- para separar `SET_1`, `SET_2`, `OT`, `SHOOTOUT` ou outro recorte adotado pela equipe.

Quando não usar:

- não misturar formato dentro do mesmo projeto.

Exemplo:

- `SET_1`

### 6.1.4 `Relógio`

O que é:

- momento aproximado da jogada no período.

Quando usar:

- sempre que houver marca temporal disponível no vídeo ou na coleta.

Quando não usar:

- não deixar um valor ornamental se você pretende revisar o vídeo depois.

Exemplo:

- `03:21`

## 6.2 Menus suspensos da jogada

### 6.2.1 `Fase da bola`

O que é:

- fase funcional global da sequência.

Lista:

- `AT_POS`
- `DEF_POS`
- `TRANS_OF`
- `TRANS_DEF`

Quando usar:

- sempre;
- é uma das chaves semânticas principais da jogada.

Quando não usar:

- não usar por “sensação geral” sem olhar o que a jogada realmente é;
- não confundir com fase individual da atleta.

Exemplo:

- `AT_POS`

### 6.2.2 `Sistema ofensivo`

O que é:

- organização ofensiva macro da jogada.

Lista típica atual:

- `AT_3X1`
- `AT_4X0`
- `NAO_APLICA`
- `NAO_OBSERVADO`

Quando usar:

- quando a jogada tiver leitura ofensiva relevante;
- pode usar `NAO_APLICA` quando o conceito não se aplica;
- pode usar `NAO_OBSERVADO` quando a informação não foi observada.

Quando não usar:

- não preencher com um sistema só porque ele é “o padrão do time” se a jogada não mostra isso;
- não confundir com configuração ofensiva.

Exemplo:

- `AT_3X1`

### 6.2.3 `Configuração ofensiva`

O que é:

- refinamento do sistema ofensivo.

Quando usar:

- quando você consegue ver a configuração concreta da jogada;
- útil especialmente em ataque posicional.

Quando não usar:

- não usar uma configuração inventada sem evidência;
- se não souber, use o comportamento permitido pelo codebook em vez de improvisar texto.

Exemplo:

- `AT_3X1_ESP_CE`

### 6.2.4 `Sistema defensivo`

O que é:

- organização defensiva macro.

Quando usar:

- quando a jogada tiver leitura defensiva relevante.

Quando não usar:

- não preencher arbitrariamente em jogada onde isso não foi observado;
- não confundir com ação defensiva individual.

Exemplo:

- `DEF_3X0`

### 6.2.5 `Resultado factual`

O que é:

- desfecho objetivo da jogada.

Lista típica atual:

- `GOL`
- `DEFENDIDO`
- `BLOQUEADO`
- `FORA`
- `TRAVE`
- `VIOLACAO`
- `PERDA`
- `NAO_OBSERVADO`

Quando usar:

- sempre;
- é o fechamento factual da jogada.

Quando não usar:

- não transformar interpretação em resultado factual;
- por exemplo, `boa decisão` não é resultado factual.

Exemplo:

- `GOL`

### 6.2.6 `Causa principal`

O que é:

- principal explicação causal da jogada.

Lista típica atual:

- `TEC_OF`
- `DEC_OF`
- `EXEC_OF`
- `TEC_DEF`
- `DEC_DEF`
- `COB`
- `BLOQ`
- `COM`
- `POS`
- `TROCA`
- `GOL`
- `MERITO`
- `MERITO_ADV`
- `FIS`
- `REGRA`
- `OUT_ESTRUTURAL`
- `OK`
- `NAO_OBSERVADO`

Quando usar:

- quando você já consegue explicar o lance com uma causa dominante.

Quando não usar:

- não usar como campo “genérico de comentário”;
- não empilhar várias causas no mesmo valor.

Exemplo:

- `OK`
- `COM`
- `DEC_OF`

### 6.2.7 `Lado atacando`

O que é:

- quem está com a bola.

Valores:

- `ANALYZED`
- `OPPONENT`

Quando usar:

- sempre;
- é essencial para interpretar a jogada.

Quando não usar:

- não marcar `ANALYZED` e depois descrever a jogada como ataque da adversária.

Exemplo:

- `ANALYZED`

### 6.2.8 `Lado defendendo`

O que é:

- quem está sem a bola e defendendo.

Valores:

- `ANALYZED`
- `OPPONENT`

Quando usar:

- sempre, como contraponto do lado atacante.

Quando não usar:

- não usar o mesmo valor do lado atacante, salvo se um caso especial futuro exigir isso explicitamente.

Exemplo:

- `OPPONENT`

### 6.2.9 `Tipo da sessão`

O que é:

- classificação da sessão de coleta.

Valores:

- `JOGO`
- `TREINO`
- `AMISTOSO`
- `SIMULADO`

Quando usar:

- sempre;
- no fluxo atual de jogo real, normalmente será `JOGO`.

Quando não usar:

- não usar `TREINO` em partida oficial só porque foi um treino tático em vídeo.

### 6.2.10 `Fonte`

O que é:

- origem da observação.

Valores:

- `VIDEO`
- `AO_VIVO`
- `MISTA`

Quando usar:

- sempre;
- ajuda a calibrar confiança e revisabilidade.

Quando não usar:

- não usar `MISTA` sem necessidade; prefira refletir a origem real.

### 6.2.11 `Adversária da jogada`

O que é:

- referência textual da equipe oposta dentro da jogada.

Quando usar:

- quando você quer deixar a jogada autocontida, mesmo fora do contexto do jogo.

Quando não usar:

- não duplicar de forma desnecessária se o jogo já está claro e não há ambiguidade.

### 6.2.12 `Notas da jogada`

O que é:

- comentário curto e localizado da jogada.

Quando usar:

- para registrar nuance que o codebook atual não cobre bem.

Quando não usar:

- não transformar o campo em narrativa longa;
- não usar para substituir causa, ação ou resultado factual.

Exemplo:

- `Ataque estabilizado após retorno da bola.`

## 7. Participações

Cada participação representa uma atleta ou slot observado na jogada.

## 7.1 Campos da participação

### 7.1.1 `Escopo`

O que é:

- se a participação está sendo lida como ofensiva ou defensiva.

Valores:

- `ATQ`
- `DEF`

Quando usar:

- sempre;
- esse campo governa o dropdown de `Ação`.

Quando não usar:

- não deixar `ATQ` em uma participação que você quer avaliar por ação defensiva.

Efeito importante:

- se mudar de `ATQ` para `DEF`, a lista de `Ação` muda e a ação anterior é limpa.

### 7.1.2 `Lado`

O que é:

- se a participação é da equipe analisada ou da adversária.

Valores:

- `ANALYZED`
- `OPPONENT`

Quando usar:

- sempre;
- principalmente para separar atleta do CEPRAEA de slot externo.

Quando não usar:

- não marcar `ANALYZED` para uma adversária só porque a ação interessa à análise.

### 7.1.3 `Slot`

O que é:

- ordem lógica da participação dentro da jogada.

Quando usar:

- sempre;
- ajuda a manter identidade e ordenação.

Quando não usar:

- não usar como número de camisa;
- não usar a mesma ordem para várias participações da mesma combinação lógica.

### 7.1.4 `Papel`

O que é:

- papel funcional da participação.

Quando usar:

- quando você consegue dizer qual foi a função daquela atleta no lance.

Quando não usar:

- não usar papel genérico só para preencher campo.

Exemplos:

- `FINALIZADORA`
- `APOIO`
- `MARCADORA`

### 7.1.5 `Atleta vinculada`

O que é:

- vínculo da participação com uma atleta real do cadastro.

Quando usar:

- para atletas do time analisado já cadastradas.

Quando não usar:

- não usar para adversária sem cadastro local;
- não usar junto com label externa se o vínculo já está claro.

### 7.1.6 `Label externa`

O que é:

- identificação textual quando não há atleta vinculada.

Quando usar:

- para adversária;
- para slot observado sem vínculo com cadastro.

Quando não usar:

- não usar se a atleta já foi vinculada pelo dropdown.

Exemplos:

- `Adversária 7`
- `Goleira adversária`

### 7.1.7 `Fase da atleta`

O que é:

- fase funcional daquela atleta dentro da jogada.

Valores atuais:

- `AT_POS`
- `DEF_POS`
- `TRANS_OF`
- `TRANS_DEF`

Quando usar:

- quando a leitura individual da atleta é importante.

Quando não usar:

- não copiar automaticamente a fase da bola sem pensar;
- pode coincidir, mas não é a mesma coisa conceitualmente.

### 7.1.8 `Posição`

O que é:

- posição funcional/código livre da atleta.

Quando usar:

- para registrar setor, posição ou papel espacial.

Quando não usar:

- não usar texto inconsistente entre jogadas se você quer comparar depois.

Exemplos:

- `LE`
- `CE`
- `DEF_BASE`

### 7.1.9 `Ação`

O que é:

- ação principal da participação.

Quando usar:

- sempre que a participação tiver uma ação clara.

Quando não usar:

- não usar ação ofensiva num escopo defensivo;
- não escolher uma ação por aproximação sem olhar a lista correta.

Exemplos ofensivos:

- `GIRO`
- `ASSIST`
- `ARREM_SIMP`
- `ERRO_PASSE`

Exemplos defensivos:

- `BLOQ_GIRO`
- `AJUDA`
- `INTERC`
- `FECHAR_SETOR`

### 7.1.10 `Causa`

O que é:

- causa principal da participação individual.

Quando usar:

- quando a causa da ação individual está clara.

Quando não usar:

- não repetir por reflexo a causa global da jogada se a participação pede outra leitura.

### 7.1.11 `Prioridade de treino`

O que é:

- encaminhamento prático que nasce da participação.

Quando usar:

- quando o lance aponta uma direção clara de treino.

Quando não usar:

- não usar como comentário genérico;
- não escolher prioridade aleatória para “completar a linha”.

Exemplos:

- `MANTER`
- `PASSE`
- `DEF_GIRO`
- `DECISAO`

### 7.1.12 `Função especial`

O que é:

- detalhe complementar que não cabe nos outros campos.

Quando usar:

- quando existir função especial relevante e curta.

Quando não usar:

- não duplicar papel, posição ou ação.

## 8. Como analisar um jogo com esse scout hoje

Fluxo recomendado:

1. não tente registrar absolutamente tudo;
2. escolha as jogadas-chave do jogo;
3. para cada jogada, registre:
   - contexto tático;
   - resultado factual;
   - causa principal;
   - quem participou;
   - qual ação cada uma executou;
   - qual prioridade de treino nasce dali.

Estratégia prática:

- jogadas de gol;
- perdas de posse importantes;
- erros repetidos de decisão;
- sequências defensivas críticas;
- lances que geram prioridade clara de treino.

## 9. Exemplo completo de uma jogada

### 9.1 Contexto do jogo

- `Data`: `2026-05-08`
- `Equipe analisada`: `CEPRAEA`
- `Adversária`: `Flamengo Praia`
- `Local`: `Arena Central`
- `Notas do jogo`: `Semifinal. Recorte principal do segundo set.`

### 9.2 Jogada

- `Código da jogada`: `SET2-014`
- `Data da sessão`: `2026-05-08`
- `Período`: `SET_2`
- `Relógio`: `03:21`
- `Fase da bola`: `AT_POS`
- `Sistema ofensivo`: `AT_3X1`
- `Configuração ofensiva`: `AT_3X1_ESP_CE`
- `Sistema defensivo`: `DEF_3X0`
- `Resultado factual`: `GOL`
- `Causa principal`: `OK`
- `Lado atacando`: `ANALYZED`
- `Lado defendendo`: `OPPONENT`
- `Tipo da sessão`: `JOGO`
- `Fonte`: `VIDEO`
- `Adversária da jogada`: `Flamengo Praia`
- `Notas da jogada`: `Ataque estabilizado após bola de retorno.`

### 9.3 Participação 1

- `Escopo`: `ATQ`
- `Lado`: `ANALYZED`
- `Slot`: `1`
- `Papel`: `APOIO`
- `Atleta vinculada`: `Ana`
- `Fase da atleta`: `AT_POS`
- `Posição`: `CE`
- `Ação`: `ASSIST`
- `Causa`: `OK`
- `Prioridade de treino`: `PASSE`

Leitura:

- atleta do CEPRAEA deu a assistência principal da jogada.

### 9.4 Participação 2

- `Escopo`: `ATQ`
- `Lado`: `ANALYZED`
- `Slot`: `2`
- `Papel`: `FINALIZADORA`
- `Atleta vinculada`: `Bia`
- `Fase da atleta`: `AT_POS`
- `Posição`: `LE`
- `Ação`: `GIRO`
- `Causa`: `OK`
- `Prioridade de treino`: `MANTER`

Leitura:

- atleta finalizou a jogada com êxito em ação de giro.

### 9.5 Participação 3

- `Escopo`: `DEF`
- `Lado`: `OPPONENT`
- `Slot`: `1`
- `Papel`: `MARCADORA`
- `Label externa`: `Adversária 7`
- `Fase da atleta`: `DEF_POS`
- `Posição`: `DEF_BASE`
- `Ação`: `BLOQ_GIRO`
- `Causa`: `BLOQ`
- `Prioridade de treino`: `DEF_GIRO`

Leitura:

- a defesa tentou bloquear o giro, o que ajuda a qualificar a oposição da jogada.

## 10. Erros operacionais comuns

1. Criar jogada sem jogo selecionado.
2. Marcar `Escopo = ATQ` e escolher uma ação defensiva.
3. Usar `Label externa` e `Atleta vinculada` ao mesmo tempo sem necessidade.
4. Tratar `Causa principal` como comentário aberto.
5. Preencher `Fase da atleta` como cópia automática da `Fase da bola`.
6. Usar `Prioridade de treino` sem intenção real de treino.
7. Tentar fechar o relatório completo do jogo a partir desta tela.

## 11. Veredito operacional

Hoje, o scout atual deve ser usado como:

- **coleta estruturada de jogadas-chave**;
- **registro de participações**;
- **ponte entre lance observado e prioridade de treino**.

Ele ainda não deve ser usado como:

- scout completo do produto;
- relatório agregado final;
- substituto integral da metodologia completa do workbook/manual.
