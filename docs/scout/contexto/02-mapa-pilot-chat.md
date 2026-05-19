# Mapa do `pilot-chat.json`

## Metadados uteis

- arquivo: `/home/davis/cepraea-pwa/pilot-chat.json`
- tamanho aproximado: `2.1 MB`
- total de mensagens: `460`
- papeis: `228` user, `232` assistant
- estrutura principal: array JSON com `contents[]`

## Regra de leitura

Nao leia o arquivo inteiro por padrao. Localize primeiro o bloco certo e abra apenas o intervalo relevante.

## Macroblocos

### Bloco 1 — Fundacao conceitual e manual

- mensagens: `0-123`
- datas: `2026-05-04` a `2026-05-05`
- foco: definicao semantica do scout, manual, dicionario, tabela mestre, listas, validacoes
- artefatos citados: manual, tabela mestre, dicionario de codigos, validacoes
- usar quando: a duvida for sobre origem do modelo conceitual do scout

### Bloco 2 — Implementacao inicial da `COLETA_AO_VIVO`

- mensagens: `124-182`
- datas: `2026-05-08` a `2026-05-09`
- foco: persistencia, RPC/API, primeira UI real, UX inicial, regras reais do handebol de praia
- artefatos citados: `scout_live_entries`, `ScoutWorkspacePage.tsx`, migrations iniciais, smoke tests
- usar quando: a duvida for sobre o recorte original da coleta ao vivo

### Bloco 3 — Base de contexto e decisoes arquiteturais

- mensagens: `183-215`
- datas: `2026-05-10` a `2026-05-11`
- foco: Notion como contexto principal na epoca, consolidacao das `DEC-001` a `DEC-006`, checklist
- artefatos citados: base de contexto, decisoes arquiteturais, checklist
- usar quando: a duvida for sobre precedencia e racional das decisoes

### Bloco 4 — UX, Scout Central e matriz canonica

- mensagens: `216-357`
- datas: `2026-05-12` a `2026-05-14`
- foco: fluxo de entrada do Scout, `Scout Central`, matriz de compatibilidade, CEPR-0083 a CEPR-0088
- artefatos citados: `/scout`, matriz canonica, pages do Scout, testes E2E, centralizacao da matriz no repo
- usar quando: a duvida for sobre fluxo de produto, compatibilidade semantica e organizacao da UI

### Bloco 5 — Preparacao e abertura do `PILOTO-01`

- mensagens: `358-380`
- datas: `2026-05-14` a `2026-05-15`
- foco: correcao dos blockers do piloto, alinhamento do elenco, definicao do escopo do piloto
- artefatos citados: `CEPR-0088A`, `CEPR-0088B`, `CEPR-0089`, `docs/scout/scout-piloto-01-coleta-ao-vivo.md`
- usar quando: a duvida for sobre por que o piloto comecou e o que ele validava

### Bloco 6 — Execucao do `PILOTO-01` e refinamentos finais

- mensagens: `381-459`
- datas: `2026-05-16` a `2026-05-18`
- foco: registros de confusao, blockers defensivos, cortes de escopo, `CEPR-0090`, `CEPR-0091`, `CEPR-0092`, problema de migration remota, novos gaps em `TRANS_OF`
- artefatos citados: `ScoutWorkspacePage.tsx`, migrations `0031-0034`, testes SQL, ajustes de UX operacional
- usar quando: a duvida for sobre estado recente, gaps vivos e feedback real de uso

## Padrao dos trechos mais valiosos

Dentro do bloco 6, os trechos de maior valor costumam seguir este formato:

1. usuario descreve um lance real em linguagem de jogo;
2. assistente classifica se e gap de matriz, gap de label, gap de fluxo ou blocker;
3. a conversa vira plano de slice/CEPR;
4. depois aparece evidência de implementacao e validacao.

Esse padrao e o que deve ser extraido para contexto curado. O restante e historico auxiliar.
