> **POLÍTICA** · Política de Pull Requests — CEPRAEA
> **Papel:** Define as regras obrigatórias para criação, escopo, validação local e merge de PRs no CEPRAEA — previne regressão de CI, allowlist desatualizada e domínios mistos no mesmo PR.
> **Autoridade:** Hierarquia 2/4 operacional — vence interpretação livre de agente sobre o que vai em qual PR; perde para `plan.md` quando escopo de tarefa conflitar.
> **Lido por:** Todos os agentes · **Quando:** ao criar um branch; ao adicionar um arquivo a um commit; antes de `git push`; ao depurar falha de CI.
> **Atualizado por:** Humano (decisão explícita) · **Quando:** nova categoria de PR surgir, nova ferramenta de CI for adotada ou regra provar ser impraticável após evidência real.
> **Validade:** 2026-05-06 · **Status:** ATUAL — derivado de incidente real no PR #9 (branch `migration/athlete-auth-foundation`).
> **Conflito:** Esta política prevalece sobre conveniência de execução; se `plan.md` autorizar tarefa que viola esta política → escalar para humano antes de agir.
> **Proibido:** Agentes NÃO devem expandir o escopo de um PR sem atualizar a allowlist no mesmo commit; NÃO devem fazer push sem executar o scope check local; NÃO devem commitar artefatos gerados.
> **Não cobre:** Sequência de tarefas (→ `plan.md`), intenção de produto (→ `CEPRAEA.md`), como implementar cada feature.

# Política de Pull Requests — CEPRAEA

**Versão:** 1.0.0
**Data:** 6 de maio de 2026
**Origem:** Incidente PR #9 — job `athlete-auth` quebrou por allowlist desatualizada após commits T03–T05 acumulados no mesmo branch sem atualização do scope check.

---

## 1. Incidente de origem

Esta política nasceu de uma falha observada e resolvida.

### 1.1 O que aconteceu

O PR #9 (`migration/athlete-auth-foundation`) foi criado com escopo restrito: migration `0006` + autenticação frontend da atleta. O scope check foi desenhado para esse escopo e passava no CI.

Durante a mesma sessão de execução, as tarefas T03 (athleteStore), T04 (trainingStore) e T05 (attendanceStore) foram implementadas e commitadas no mesmo branch — domínios diferentes, sem atualização da allowlist. Resultado:

- o scope check detectou 15 arquivos fora da allowlist;
- o job `athlete-auth` falhou no CI;
- o sistema ficou com CI quebrado por um ciclo completo de sessão.

### 1.2 Causa raiz estrutural

Não foi erro de implementação. Foi ausência de protocolo:

| Causa | Efeito |
|---|---|
| Múltiplos domínios no mesmo branch | Allowlist projetada para um domínio não cobriu os demais |
| Nenhum gate local antes do push | CI foi o primeiro a detectar a violação |
| Allowlist não atualizada atomicamente com os commits | Cada commit T03→T05 ampliou o escopo sem atualizar o guard |
| Artefatos gerados rastreados pelo git | Apareceram no `git diff` e bloquearam o scope check |

### 1.3 Solução aplicada

- allowlist expandida para cobrir T03–T05;
- artefatos gerados restaurados para versão de `origin/main` via `git checkout origin/main -- <arquivo>`;
- `.gitignore` e `scripts/check-...-scope.sh` adicionados à allowlist;
- protocolo formalizado neste documento para evitar recorrência.

---

## 2. Regra de domínio único por PR

**A partir de T06, cada PR cobre exatamente um domínio funcional.**

### 2.1 Definição de domínio

Um domínio é um conjunto coerente de arquivos que serve a um propósito técnico único e que pode ser revisado, revertido e validado de forma independente.

Exemplos de domínios válidos:

| Domínio | Arquivos típicos |
|---|---|
| Auth da atleta | `AtletaGuard`, `AtletaLoginPage`, `athleteStore`, migration `0006` |
| Trainings Supabase-first | `trainingApi`, `trainingStore`, `TrainingsPage`, `TrainingDetailPage` |
| Attendance Supabase-first | `attendanceStore`, RPCs de presença, migration `0007` |
| Confirmação pública por token | `PublicConfirmPage`, `presenceTokenConfig`, testes E2E de token |
| Remoção de legado | `sync.ts`, referências em `scoutStore`, `export.ts` |
| Infraestrutura CI | workflows, scripts, `package.json`, `package-lock.json` |

### 2.2 Indicadores de domínio misturado

Se qualquer item abaixo for verdadeiro, o PR tem domínios misturados e precisa ser separado antes do push:

- o PR altera stores de domínios diferentes (`trainingStore` **e** `attendanceStore` no mesmo commit de feature);
- o PR altera migration de auth **e** migration de presença simultaneamente sem dependência técnica direta;
- o PR adiciona nova feature **e** remove legado de outra feature sem relação causal;
- a mensagem de commit precisa de mais de um substantivo de domínio para ser precisa.

### 2.3 Exceção permitida

Infraestrutura compartilhada pode ser incluída no mesmo PR que a feature que a requer, desde que:

- a mudança de infraestrutura é diretamente causada pela feature (ex: novo script de validação para a nova feature);
- o commit de infraestrutura e a feature que o requer estão no mesmo bloco lógico;
- a allowlist é atualizada no mesmo commit da adição dos arquivos de infraestrutura.

---

## 3. Regra atômica de allowlist

**Toda vez que um arquivo novo aparece em um commit, a allowlist do scope check desse branch deve ser atualizada no mesmo commit.**

### 3.1 Protocolo obrigatório por commit

Antes de `git commit`:

```bash
# 1. Listar o que vai entrar no commit
git diff --cached --name-only

# 2. Para cada arquivo listado, verificar se está na allowlist
grep "<arquivo>" scripts/check-<branch>-scope.sh

# 3. Se o arquivo NÃO estiver na allowlist, adicioná-lo antes de commitar
# Nunca fechar o commit sem a allowlist refletir todos os arquivos do commit
```

### 3.2 Formato de entrada na allowlist

Cada entrada nova deve ter um comentário de origem:

```bash
# T06 — confirmação pública por token
src/features/confirm/pages/PublicConfirmPage.tsx) return 0 ;;
src/features/presence-tokens/presenceTokenConfig.ts) return 0 ;;
```

O comentário deve referenciar a tarefa do `plan.md` que autoriza a mudança.

### 3.3 O que nunca deve estar na allowlist

- artefatos gerados (`*.tsbuildinfo`, `playwright-report/`, `tests/report.html`, `dist/`);
- arquivos de fora do escopo do branch que foram alterados por acidente;
- arquivos de outros domínios não cobertos pelo PR (a existência de um arquivo na allowlist é uma declaração de que aquela mudança pertence ao escopo deste PR).

---

## 4. Protocolo local antes de qualquer push

**Nenhum `git push` deve ocorrer sem que o scope check local passe com `EXIT: 0`.**

### 4.1 Sequência obrigatória

```bash
# Passo 1 — executar o scope check do branch atual
bash scripts/check-<branch>-scope.sh
# Esperado: "[scope] Auditoria de escopo ... aprovada." + EXIT: 0
# Se falhar: NÃO fazer push. Corrigir a allowlist ou remover os arquivos fora de escopo.

# Passo 2 — verificar que não há artefatos gerados no diff
git diff --name-only origin/main...HEAD | grep -E "\.tsbuildinfo|playwright-report|dist/|tests/report"
# Esperado: nenhuma saída.
# Se retornar arquivos: restaurar com git checkout origin/main -- <arquivo>

# Passo 3 — executar build e typecheck localmente
npm run typecheck && npm run build
# Esperado: EXIT: 0

# Passo 4 — executar os testes unitários
npm test
# Esperado: EXIT: 0

# Passo 5 — push
git push origin <branch>
```

### 4.2 Quando o scope check não existir ainda

Se o branch não tiver um scope check dedicado, criá-lo antes do primeiro push seguindo a seção 5 deste documento.

---

## 5. Protocolo de criação de branch e scope check

**Todo branch novo de feature deve ter seu scope check criado no commit inicial, antes de qualquer código de feature.**

### 5.1 Estrutura mínima do branch

```
Commit 1 — infra do branch
  scripts/check-<branch>-scope.sh    ← criado aqui
  .github/workflows/<branch>.yml     ← criado aqui (ou no commit 2 se CI for separado)
  package.json                       ← adicionar script "check:<branch>-scope" se necessário

Commit 2..N — implementação da feature
  <arquivos de feature>              ← cada um listado na allowlist do commit 1 ou adicionado atomicamente
```

### 5.2 Template do scope check

```bash
#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${GITHUB_BASE_REF:-main}"

if git rev-parse --verify "origin/${BASE_REF}" >/dev/null 2>&1; then
  BASE="origin/${BASE_REF}"
else
  git fetch origin "${BASE_REF}" --depth=1 >/dev/null 2>&1 || true
  BASE="origin/${BASE_REF}"
fi

if git rev-parse --verify "${BASE}" >/dev/null 2>&1; then
  CHANGED_FILES=$(git diff --name-only "${BASE}"...HEAD)
else
  CHANGED_FILES=$(git diff --name-only HEAD~1...HEAD)
fi

is_allowed() {
  local file="$1"
  case "$file" in
    # Infraestrutura do PR
    .gitignore) return 0 ;;
    package.json) return 0 ;;
    package-lock.json) return 0 ;;
    .github/workflows/<branch>.yml) return 0 ;;
    scripts/check-<branch>-scope.sh) return 0 ;;

    # Documentação
    CEPRAEA.md) return 0 ;;
    CHANGELOG.md) return 0 ;;
    .copilot/*) return 0 ;;

    # <FEATURE> — <descrição>
    # <arquivo>) return 0 ;;   ← adicionar aqui ao criar cada commit de feature

    *) return 1 ;;
  esac
}

blocked=0
while IFS= read -r file; do
  [ -z "$file" ] && continue
  if ! is_allowed "$file"; then
    echo "[scope] BLOQUEADO fora da allowlist de <branch>: $file"
    blocked=1
  fi
done <<< "$CHANGED_FILES"

if [ "$blocked" -ne 0 ]; then
  echo "[scope] Auditoria de escopo <branch> falhou."
  exit 1
fi

echo "[scope] Auditoria de escopo <branch> aprovada."
```

### 5.3 Convenção de nome de branch

```
migration/<domínio>          ← migração de store/feature para Supabase-first
feature/<domínio>            ← feature nova sem componente de migração
fix/<domínio>                ← correção isolada
infra/<componente>           ← CI, scripts, configuração
cleanup/<domínio>            ← remoção de legado
```

---

## 6. Protocolo de artefatos gerados

Artefatos gerados nunca devem aparecer no diff de um PR.

### 6.1 Artefatos conhecidos neste repositório

| Arquivo / Diretório | Origem | Tratamento |
|---|---|---|
| `tsconfig.tsbuildinfo` | `tsc --build` | Restaurar via `git checkout origin/main -- tsconfig.tsbuildinfo` |
| `playwright-report/` | `playwright test` | Restaurar via `git checkout origin/main -- playwright-report/` |
| `tests/report.html` | pytest | Restaurar via `git checkout origin/main -- tests/report.html` |
| `dist/` | `npm run build` | Já no `.gitignore`; se aparecer: `git rm --cached -r dist/` |

### 6.2 Quando o artefato gerado já existe na `main`

Se o artefato já está rastreado em `main`, `git rm --cached` requer um PR separado de cleanup. Enquanto isso não é feito, restaurar com:

```bash
git checkout origin/main -- <arquivo>
```

Isso faz o artefato sair do diff sem deletá-lo localmente.

### 6.3 Cleanup pendente

Os seguintes arquivos ainda são rastreados pelo git e devem ser desrastreados em T09 (remoção de legado):

- `playwright-report/index.html`
- `tests/report.html`
- `tsconfig.tsbuildinfo`

O desrastreamento requer `git rm --cached <arquivo>` + commit + entrada no `.gitignore`.

---

## 7. Protocolo de falha de CI

Quando um check do CI falhar, a sequência de diagnóstico é:

```
1. Identificar qual job falhou e qual step (scope check? supabase reset? test? build?)
2. Executar o step localmente para reproduzir:
   bash scripts/check-<branch>-scope.sh   ← para scope check
   npm run test:athlete-auth              ← para suíte SQL
   npm run build                          ← para build
3. Se for scope check → ver seção 3 desta política
4. Se for teste SQL → investigar migration ou RPC sem alterar o teste para esconder falha
5. Se for build → corrigir o código; nunca ignorar erro de TypeScript
6. Corrigir → executar o protocolo completo da seção 4 → push
```

**Nunca fazer `git push --force` para contornar falha de CI.**

---

## 8. Mapeamento de branches T06–T10

Derivado da decisão de separação de domínios a partir de T06:

| Tarefa(s) | Branch proposto | Scope check |
|---|---|---|
| T06 — confirmação pública por token | `migration/confirm-token-supabase` | `check-confirm-token-supabase-scope.sh` |
| T07 — account link state no painel coach | `migration/athlete-account-link` | `check-athlete-account-link-scope.sh` |
| T08 — import legacy JSON | `migration/legacy-import` | `check-legacy-import-scope.sh` |
| T09 — remover sync.ts e legado | `cleanup/remove-sync-legacy` | `check-remove-sync-legacy-scope.sh` |
| T10 — E2E final + fechar validate:mvp:v1 | `feature/mvp-e2e-gate` | `check-mvp-e2e-gate-scope.sh` |

Cada branch deve ter seu scope check criado no commit inicial antes de qualquer código de feature.

---

## 9. Checklist de abertura de PR

Antes de abrir o PR no GitHub, confirmar:

- [ ] scope check local passa com `EXIT: 0`
- [ ] nenhum arquivo fora do domínio do PR aparece em `git diff --name-only origin/main...HEAD`
- [ ] nenhum artefato gerado aparece no diff
- [ ] `npm run typecheck` passa com `EXIT: 0`
- [ ] `npm test` passa com `EXIT: 0`
- [ ] `npm run build` passa com `EXIT: 0`
- [ ] todos os arquivos novos do PR estão na allowlist do scope check
- [ ] a mensagem do PR descreve exatamente um domínio funcional
- [ ] o branch é derivado de `main` (não de outro feature branch, salvo dependência explícita documentada)

---

## 10. Checklist de merge

Antes de mergear o PR:

- [ ] todos os jobs do CI passam com ✓
- [ ] scope check específico do branch passa
- [ ] nenhum teste foi alterado para esconder falha (verificar `git diff --name-only` dos testes)
- [ ] `npm run validate:mvp:v1` foi executado e nenhum novo FAIL foi introduzido
- [ ] o PR não remove funcionalidade de domínio diferente sem PR dedicado
