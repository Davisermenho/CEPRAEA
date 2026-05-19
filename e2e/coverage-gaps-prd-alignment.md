---
tipo: CHECKLIST-E2E
nome: "E2E — Cobertura Faltante para Rotas Novas do PRD"
papel: "Lista objetiva da cobertura E2E que ainda falta quando as rotas novas do produto forem implementadas no runtime."
autoridade: "Checklist operacional de testes. Não substitui PRD nem contrato técnico, mas orienta a expansão mínima da suíte Playwright."
atualizado_por: "Codex — 18 de maio de 2026"
status: ATIVO
status_nota: "Baseado no PRD atualizado e no runtime atual. As rotas abaixo ainda não existem na área da atleta, então a cobertura está pendente por ausência de implementação."
---

# E2E — Cobertura Faltante para Rotas Novas do PRD

## Estado atual

Hoje o runtime da atleta expõe:

- `/atleta/treinos`
- `/atleta/treinos/:id`
- `/atleta/perfil`

Logo, a cobertura abaixo só deve ser criada quando as rotas correspondentes existirem de fato no app.

## Rotas novas da atleta

### `/atleta/metas`

Fluxos mínimos:

- listar metas individuais da atleta com origem `atleta`, `treinador` e `scout`
- listar metas de equipe publicadas para o grupo
- diferenciar status da meta
- bloquear visualização de meta individual de outra atleta

Asserções mínimas:

- a atleta vê a própria meta criada por ela
- a atleta vê a própria meta criada pelo treinador
- a atleta vê a própria meta derivada do scout
- a atleta vê metas de equipe
- a atleta não vê meta individual de outra atleta

### `/atleta/scout`

Fluxos mínimos:

- abrir visão individual publicada
- alternar entre `eventos brutos`, `resumo por jogo`, `indicadores agregados` e `histórico por período`
- bloquear acesso a dados de outra atleta

Asserções mínimas:

- renderiza apenas projeções publicadas
- `TIPO_VISAO` correto aparece no filtro ou na aba
- a atleta não consegue acessar scout de outra atleta pela URL ou por manipulação de estado

### `/atleta/agenda`

Fluxos mínimos:

- listar `treinos`, `jogos`, `viagens` e `competições`
- diferenciar tipo de evento
- abrir detalhe do evento

Asserções mínimas:

- agenda mistura mais de um tipo de evento sem colapsar tudo em “treino”
- badges ou rótulos de tipo aparecem corretamente
- evento cancelado ou encerrado aparece com estado coerente

### `/atleta/convocacoes`

Fluxos mínimos:

- listar convocações de `jogos` e `viagens`
- confirmar participação
- recusar participação
- exibir estado `pendente`, `confirmada` e `recusada`

Asserções mínimas:

- a atleta consegue confirmar a própria convocação
- a atleta consegue recusar a própria convocação
- a resposta persiste no banco
- a atleta não responde convocação de outra atleta

## Fluxos novos do treinador

### Coach — metas

Rotas esperadas:

- `/metas`
- `/metas/:id` ou equivalente

Cobertura mínima:

- criar meta individual com origem `treinador`
- publicar meta de equipe
- visualizar meta derivada do scout
- filtrar por atleta, equipe, status e origem

### Coach — agenda competitiva

Rotas esperadas:

- `/agenda`
- `/jogos`
- `/viagens`
- `/competicoes`

Cobertura mínima:

- criar evento de agenda
- criar jogo vinculado a competição
- criar viagem
- verificar listagem por tipo

### Coach — convocações

Rotas esperadas:

- `/convocacoes`
- `/convocacoes/:id` ou equivalente

Cobertura mínima:

- publicar convocação por jogo ou viagem
- visualizar respostas `confirmada`, `recusada`, `pendente`
- garantir que a comissão vê a lista consolidada

## Scout atleta-facing

Mesmo com o scout técnico já alinhado, a suíte ainda não cobre:

- publicação de `scout_athlete_views`
- leitura restrita por `athlete_id`
- vínculo de feedback com meta derivada do scout

Cobertura mínima:

- coach publica projeção da atleta
- atleta autenticada vê apenas a própria projeção
- meta derivada do scout aponta para evidência rastreável

## Critério de aceite para considerar o PRD coberto

- existe ao menos um fluxo feliz E2E por rota nova da atleta
- existe ao menos um fluxo feliz E2E por módulo novo do treinador
- existe ao menos um teste de autorização negativa por superfície sensível
- a suíte cobre persistência mínima de respostas, publicações e vínculos derivados
