# MVP v1.0 — CEPRAEA

## O que é

CEPRAEA é uma PWA de gestão operacional para uma equipe adulta feminina de handebol de praia, formada por atletas de alto rendimento em nível de competição.

O MVP v1.0 é a primeira versão operacional do produto com Supabase como fonte de verdade para os fluxos centrais de treino, presença, plano de treino do dia, metas, scout e agenda competitiva.

## Recorte funcional do MVP

O MVP v1.0 deve permitir que treinador e atletas operem, no mesmo produto:

- acesso autenticado por perfil;
- gestão de atletas no contexto oficial `adulto feminino` e `competição`;
- gestão de treinos;
- publicação e consulta do plano de treino do dia;
- registro e leitura de presença;
- gestão de metas individuais e metas da equipe;
- visualização de scout;
- agenda da equipe;
- jogos, viagens, convocações e competições.

## Funcionalidades do MVP

| Funcionalidade | Quem usa | Como |
|---|---|---|
| Login com email e senha | Treinador | `/login` — Supabase Auth |
| Login com email e senha | Atleta | `/atleta/login` — Supabase Auth |
| Primeiro acesso e vínculo da conta | Atleta | `/atleta/login` — vínculo com `athletes.user_id` |
| Redefinição de senha | Atleta | `/atleta/nova-senha` |
| Cadastro e visualização de atletas | Treinador | `/atletas` |
| Estado de vínculo de conta | Treinador | `/atletas/:id` |
| Gestão de dados esportivos da atleta | Treinador | cadastro com `posição_ofensiva`, `função_defensiva`, status e observações |
| Criação e gerenciamento de treinos | Treinador | `/treinos` — com recorrência via RPC `generate_trainings` |
| Plano de treino do dia | Treinador e Atleta | publicação pelo treinador e leitura pela atleta no portal |
| Registro de presença | Treinador | `/treinos/:id` — via RPC `upsert_coach_attendance` |
| Confirmação de presença | Atleta | portal da atleta |
| Confirmação pública por token | Público | `/confirmar-presenca?token=…` |
| Relatórios de frequência | Treinador | `/relatorios` |
| Metas individuais | Treinador e Atleta | criação e acompanhamento com origem `atleta`, `treinador` e `scout` |
| Metas da equipe | Treinador | criação e acompanhamento com origem `treinador` e `scout` |
| Scout tático | Treinador | captura, revisão e leitura técnica |
| Scout individual da atleta | Atleta | leitura de eventos brutos, resumo por jogo, indicadores agregados e histórico por período |
| Agenda da equipe | Treinador e Atleta | eventos de treino, jogo, viagem e competição |
| Convocações e listagens | Treinador e Atleta | publicação pelo treinador e confirmação ativa pela atleta |
| Jogos, viagens e competições | Treinador e Atleta | leitura e acompanhamento no contexto da agenda competitiva |

## Arquitetura

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** Supabase (PostgreSQL + Auth + RLS + RPCs)
- **Auth:** Supabase Auth — treinador e atleta via email/senha
- **Fonte de verdade:** Supabase para os dados operacionais do MVP
- **Sem legado no contrato final:** Apps Script, IndexedDB como fonte principal e sync remoto não fazem parte da arquitetura oficial do produto

## Como rodar localmente

```bash
# Pré-requisitos: Node.js 20+, Supabase CLI
supabase start
cp .env.test .env.local  # ajustar VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev
```

## Como validar o MVP

```bash
# Gate técnico atual do repositório — deve retornar exit 0
npm run validate:mvp:v1
```

O gate técnico atual executa em sequência:
1. `npm run typecheck` — TypeScript sem erros
2. `npm test` — testes unitários Vitest
3. `npm run build` — bundle de produção
4. `npm run deps:check` — dependências sem conflito
5. `npm audit` — zero vulnerabilidades
6. `supabase db reset` — banco determinístico
7. `npm run test:supabase` — suíte SQL (RLS + RPCs)
8. `npm run test:e2e` — Playwright
9. `bash scripts/check-runtime-legacy.sh` — zero referências a runtime legado

### Nota de alinhamento

O recorte funcional descrito neste documento já foi ampliado para refletir o PRD oficial.

Isso significa que, para representar integralmente este MVP v1.0, o gate técnico ainda precisa ganhar cobertura explícita para:

- plano de treino do dia;
- metas individuais;
- metas da equipe;
- agenda da equipe;
- jogos, viagens, convocações e competições;
- scout visível à atleta.

## Acesso de teste

Em ambiente local com `supabase start`, o `global.setup.ts` do Playwright provisiona automaticamente um coach E2E com as credenciais de `.env.test`.

## Próximos passos após o alinhamento documental

- alinhar `plan.md` ao novo recorte do MVP;
- alinhar diagramas de navegação;
- alinhar a ponte operacional em `planilha_xlsx.md`;
- expandir a cobertura E2E para os fluxos novos do portal da atleta e da agenda competitiva.
