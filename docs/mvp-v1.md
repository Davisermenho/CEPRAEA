# MVP v1.0 — CEPRAEA

## O que é

CEPRAEA é uma PWA de gestão de treinos e controle de presença para handebol de praia (Rio de Janeiro). O MVP v1.0 é a primeira versão completamente operacional com Supabase como fonte de verdade.

## Funcionalidades do MVP

| Funcionalidade | Quem usa | Como |
|---|---|---|
| Login com email e senha | Treinador | `/login` — Supabase Auth |
| Cadastro e visualização de atletas | Treinador | `/atletas` |
| Badge de vínculo de conta | Treinador | `/atletas/:id` — derivado de `athletes.user_id` |
| Criação e gerenciamento de treinos | Treinador | `/treinos` — com recorrência via RPC `generate_trainings` |
| Registro de presença | Treinador | `/treinos/:id` — via RPC `upsert_coach_attendance` |
| Relatórios de frequência | Treinador | `/relatorios` |
| Confirmação pública por token | Público | `/confirmar-presenca?token=…` |
| Login da atleta com email e senha | Atleta | `/atleta/login` — Supabase Auth |
| Primeiro acesso (cadastro + vínculo) | Atleta | `/atleta/login` — modo "primeiro acesso" → RPC `link_athlete_user_id` |
| Visualização de treinos e presenças | Atleta | `/atleta/treinos` |
| Redefinição de senha | Atleta | `/atleta/nova-senha` |

## Arquitetura

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** Supabase (PostgreSQL + Auth + RLS + RPCs)
- **Auth:** Supabase Auth — treinador e atleta via email/senha
- **Sem legado:** Apps Script, IndexedDB como fonte principal, e sync remoto foram removidos em T09

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
# Gate completo — deve retornar exit 0
npm run validate:mvp:v1
```

O gate executa em sequência:
1. `npm run typecheck` — TypeScript sem erros
2. `npm test` — testes unitários Vitest
3. `npm run build` — bundle de produção
4. `npm run deps:check` — dependências sem conflito
5. `npm audit` — zero vulnerabilidades
6. `supabase db reset` — banco determinístico
7. `npm run test:supabase` — suíte SQL (RLS + RPCs)
8. `npm run test:e2e` — Playwright (login, guards, athletes, trainings, attendance, presence tokens, onboarding atleta, smoke)
9. `bash scripts/check-runtime-legacy.sh` — zero referências a runtime legado

## Acesso de teste

Em ambiente local com `supabase start`, o `global.setup.ts` do Playwright provisiona automaticamente um coach E2E com as credenciais de `.env.test`.

## Próximos passos (pós-MVP)

- Suporte a múltiplos times
- Dashboard de estatísticas avançadas
- Notificações push de treino
- Modo offline com sync Supabase Realtime
