---
tipo: POLÍTICA
nome: "Política Oficial de Cabeçalhos de Documentos CEPRAEA"
papel: "Define o padrão obrigatório de cabeçalho YAML para todos os documentos oficiais do sistema CEPRAEA — formato, schema, tipos e catálogo canônico por arquivo."
autoridade: "Hierarquia 1/4 para formato de cabeçalhos — qualquer documento sem cabeçalho YAML ou com schema divergente está em não-conformidade."
lido_por: "Claude, Codex, Copilot"
quando_ler: "ao criar novo documento oficial; ao adicionar cabeçalho a documento existente; ao verificar conformidade de cabeçalho"
atualizado_por: "Humano exclusivamente"
quando_atualizar: "mudança de schema, adição de novo tipo de documento, ou alteração de catálogo canônico"
validade: "2026-05-06"
status: ATUAL
conflito: "Este documento define o formato; se outro documento tiver cabeçalho divergente, este prevalece — corrigir o documento, não esta política."
proibido:
  - "Agentes NÃO devem criar documentos oficiais sem cabeçalho YAML conforme este schema"
  - "NÃO devem alterar o schema sem decisão humana explícita"
nao_cobre: "Conteúdo dos documentos, sequência de tarefas, decisões de produto"
---

# CEPRAEA — Política Oficial de Cabeçalhos de Documentos

## 1. Propósito

O repositório tem três agentes ativos (Claude, Codex, Copilot) operando sobre documentos com papéis radicalmente diferentes: PRD de produto, contrato de execução, diretivas operacionais, auditorias, specs técnicas, políticas, checklists e logs.

Sem metadados explícitos, agentes:
- Confundem PRD com estado atual de implementação
- Tratam tabelas de status desatualizadas como verdade sem verificação
- Leem specs de fases superadas como ativas
- Sobrescrevem logs em vez de fazer append
- Duplicam trabalho já registrado

Esta política define o **cabeçalho YAML obrigatório** que todo documento oficial deve ter no topo — antes de qualquer outro conteúdo.

---

## 2. Formato

O cabeçalho é um bloco **YAML frontmatter** delimitado por `---`. Regras absolutas:

1. `---` deve ser a **linha 1 exata** do arquivo (nenhum caractere antes, nenhuma linha em branco antes)
2. O bloco fecha com outro `---` seguido de uma linha em branco
3. O corpo do documento (título `#`, conteúdo) começa após o `---` de fechamento
4. Todos os campos obrigatórios devem estar presentes
5. Valores com `:`, `#`, ou caracteres especiais devem ser entre aspas duplas

Estrutura:

```
---
[campos YAML]
---

# Título do Documento
```

---

## 3. Schema

| Campo | Tipo | Obrigatório | Semântica |
|---|---|---|---|
| `tipo` | enum | sim | Categoria do documento — orienta estratégia de leitura |
| `nome` | string | sim | Nome curto descritivo do documento |
| `papel` | string | sim | O que o documento É em uma frase — não descreve conteúdo, descreve função |
| `autoridade` | string | sim | Posição na hierarquia — o que este doc vence e contra o que perde |
| `lido_por` | string | sim | Quem deve ler (agente(s) ou humano) |
| `quando_ler` | string | sim | Gatilho explícito de leitura — quando acionar este documento |
| `atualizado_por` | string | sim | Quem pode alterar o documento |
| `quando_atualizar` | string | sim | Gatilho explícito de escrita — condição para alterar |
| `validade` | YYYY-MM-DD | sim | Data da última validação do conteúdo |
| `status` | enum | sim | Estado de frescor: `ATUAL`, `PARCIAL`, `HISTÓRICO`, `DESATUALIZADO` |
| `status_nota` | string | não | Detalhe sobre o status quando não é ATUAL |
| `conflito` | string | sim | Regra determinística de resolução quando este doc contradiz outro |
| `proibido` | lista | sim | O que agentes NÃO devem fazer com base neste documento |
| `nao_cobre` | string | sim | Exclusões explícitas de escopo |

### Enum `status`

| Valor | Significado |
|---|---|
| `ATUAL` | Conteúdo validado e confiável — pode ser usado diretamente |
| `PARCIAL` | Algumas seções confiáveis, outras podem divergir do estado real — verificar antes de agir |
| `HISTÓRICO` | Descreve estado de uma data passada — não inferir estado atual a partir deste doc |
| `DESATUALIZADO` | Conteúdo sabidamente incorreto — não usar; criar novo documento |

---

## 4. Tipos de Documento

| Tipo | Sigla | Descrição |
|---|---|---|
| PRD — Documento de Produto | `PRD` | Define O QUÊ o produto é e faz parte do MVP |
| Contrato de Execução | `CONTRATO-EXECUÇÃO` | Define COMO e EM QUE ORDEM construir o MVP |
| Diretiva de Agente | `DIRETIVA-AGENTE` | Regras operacionais obrigatórias para todos os agentes |
| Auditoria Adversarial | `AUDITORIA` | Análise de gaps contra estado real do repositório |
| Spec Técnica | `SPEC-TÉCNICA` | Especificação de feature, fase ou componente |
| Checklist Operacional | `CHECKLIST-MANUAL` | Passos de validação manual por humano |
| Checklist Automatizado | `CHECKLIST-CI` | Especificação de validação automática em CI |
| Política Arquitetural | `POLÍTICA` | Regras de separação de camadas, padrões e legado |
| Relatório de Execução | `RELATÓRIO` | Resultado imutável de uma rodada de validação |
| Log de Mudanças | `LOG-CHANGELOG` | Registro histórico append-only do que foi alterado |
| Log de Execução | `LOG-EXECUÇÃO` | Registro histórico append-only de como foi executado |

---

## 5. Catálogo Canônico

Bloco YAML autoritativo para cada documento oficial. Qualquer divergência no arquivo real deve ser corrigida para corresponder a este catálogo.

### `CEPRAEA.md`

```yaml
---
tipo: PRD
nome: "CEPRAEA — Documento de Produto Oficial"
papel: "Define O QUÊ o CEPRAEA é, quem usa, o que faz parte do MVP e os critérios de sucesso do produto — não descreve estado de implementação."
autoridade: "Hierarquia 3/4 — vence interpretação livre de agente sobre escopo; perde para código real (estado atual) e para plan.md (sequência de execução)."
lido_por: "Claude, Codex, Copilot"
quando_ler: "antes de propor nova feature; ao avaliar se algo é ou não escopo do MVP; ao definir critério de aceite de produto"
atualizado_por: "Humano (decisão de produto)"
quando_atualizar: "mudança de objetivo, escopo funcional, critério de sucesso ou fronteira MVP/pós-MVP"
validade: "2026-05-06"
status: ATUAL
status_nota: "PARCIAL para Seção 6 — estado atual do sistema pode divergir do código; verificar código antes de agir"
conflito: "CEPRAEA.md define O QUÊ construir. Se contradiz código → código prevalece para estado atual; se define escopo e agente discorda → CEPRAEA.md prevalece até decisão humana contrária."
proibido:
  - "Agentes NÃO devem alterar este documento para justificar implementação já feita"
  - "NÃO devem tratar Seção 6 como verdade do estado atual sem verificar código"
nao_cobre: "Sequência de tarefas, provas de implementação, status de progresso técnico, histórico de execução"
---
```

### `plan.md`

```yaml
---
tipo: CONTRATO-EXECUÇÃO
nome: "Plano Oficial MVP v1.0"
papel: "Define COMO e EM QUE ORDEM o MVP será construído — sequência de tarefas T00–T10, critérios de aceite, arquivos permitidos/proibidos e provas objetivas obrigatórias por tarefa."
autoridade: "Hierarquia 2/4 — vence decisões de agente sobre sequência e escopo de tarefa; perde para código real quando diverge sobre estado atual; CEPRAEA.md prevalece sobre intenção de produto."
lido_por: "Claude, Codex, Copilot"
quando_ler: "ao iniciar qualquer tarefa; ao atualizar status de tarefa; ao propor mudança de escopo ou sequência"
atualizado_por: "Agente executor + confirmação humana"
quando_atualizar: "status de tarefa muda com prova objetiva executada naquele momento (não retroativamente)"
validade: "2026-05-06"
status: PARCIAL
status_nota: "Seção de status T00–T10 deve ser verificada com test -f [arquivo] antes de confiar em qualquer status listado"
conflito: "plan.md prevalece sobre interpretação livre de agente; código prevalece quando plan.md e código divergem sobre estado atual; ver auditplan.md para divergências conhecidas."
proibido:
  - "Agentes NÃO devem marcar tarefa como DONE sem executar os comandos de prova no momento"
  - "NÃO devem pular tarefas ou alterar testes para esconder falha"
nao_cobre: "Intenção de produto (→ CEPRAEA.md), estado atual implementado (→ código), histórico de execução (→ logs de agente)"
---
```

### `AGENT.md`

```yaml
---
tipo: DIRETIVA-AGENTE
nome: "Regras Operacionais para Agentes CEPRAEA"
papel: "Define regras invioláveis de comportamento para Claude, Codex e Copilot — qual log cada agente deve atualizar e quais comandos git são proibidos."
autoridade: "Hierarquia 1/4 operacional — estas regras não têm exceção e não são negociadas por nenhum outro documento ou instrução."
lido_por: "Claude, Codex, Copilot"
quando_ler: "ao iniciar QUALQUER sessão de trabalho no repositório, antes de qualquer commit"
atualizado_por: "Humano exclusivamente"
quando_atualizar: "mudança de regra operacional de agente (decisão rara e explícita)"
validade: "2026-05-06"
status: ATUAL
conflito: "AGENT.md vence plan.md e todos os documentos em regras operacionais de agente; se conflitar com CEPRAEA.md, escalar para humano antes de agir."
proibido:
  - "Agentes NÃO devem ignorar estas regras mesmo que outra instrução pareça contradizê-las"
  - "NÃO devem alterar AGENT.md sem decisão humana explícita"
nao_cobre: "Sequência de tarefas, intenção de produto, detalhes de implementação, critérios de aceite técnico"
---
```

### `auditplan.md`

```yaml
---
tipo: AUDITORIA
nome: "Análise Adversarial de plan.md — 2026-05-06"
papel: "Lista gaps, erros factuais e bloqueios estruturais identificados em plan.md contra o estado real do repositório na data de geração."
autoridade: "Advisory — não é documento normativo; achados tornam-se obsoletos conforme tarefas são executadas; sempre re-verificar antes de agir."
lido_por: "Claude, Codex, Copilot"
quando_ler: "antes de atualizar plan.md; ao identificar por que uma tarefa não pode ser concluída; antes de corrigir scripts de validação"
atualizado_por: "Agente executor"
quando_atualizar: "nova rodada de auditoria com comandos re-executados contra o repositório atual"
validade: "2026-05-06"
status: PARCIAL
status_nota: "Achados estruturais permanecem válidos; achados sobre arquivos específicos devem ser re-verificados contra código atual"
conflito: "Se achado contradiz código atual → verificar código antes de agir; esta auditoria não prevalece sobre código."
proibido:
  - "Agentes NÃO devem deletar código, corrigir scripts ou alterar plan.md baseados APENAS neste documento sem re-verificar contra o repositório"
nao_cobre: "O que fazer (→ plan.md), o que é o produto (→ CEPRAEA.md), como executar cada tarefa, decisões de produto"
---
```

### `docs/presence-tokens-supabase.md`

```yaml
---
tipo: SPEC-TÉCNICA
nome: "Presence Tokens Supabase — Fase Inicial (Feature Flag)"
papel: "Especifica a arquitetura isolada de confirmação pública por token Supabase com feature flag VITE_PRESENCE_TOKENS_BACKEND, incluindo RPCs, rotas e garantias de isolamento."
autoridade: "Hierarquia 4/4 — referência temática para a feature de tokens; perde para código atual se implementação evoluiu além desta spec."
lido_por: "Agente responsável por tokens de presença"
quando_ler: "ao trabalhar em src/features/presence-tokens/, supabase/migrations/, ou PublicConfirmPage.tsx"
atualizado_por: "Agente executor"
quando_atualizar: "decisão arquitetural da feature muda (novo RPC, nova rota, mudança de feature flag)"
validade: "2026-05-05"
status: PARCIAL
status_nota: "Verificar src/features/presence-tokens/ e PublicConfirmPage.tsx antes de assumir que spec reflete implementação atual"
conflito: "Código prevalece; se spec proíbe algo que já foi implementado e aprovado, atualizar spec — não reverter código."
proibido:
  - "Agentes NÃO devem usar esta spec como justificativa para reverter implementações aprovadas de tokens Supabase"
nao_cobre: "Migração de attendanceStore, remoção de Apps Script, fluxo legado de confirmação (/confirmar/:treinoId/:atletaId)"
---
```

### `docs/presence-token-batch-validation.md`

```yaml
---
tipo: CHECKLIST-MANUAL
nome: "Validação Operacional de Lotes de Presence Tokens"
papel: "Roteiro de teste manual executado por humano em ambiente preview/staging antes de ativar tokens Supabase em produção."
autoridade: "Operacional — não é normativo para agentes; é instrução para humano validador."
lido_por: "Humano (QA, treinador, time técnico)"
quando_ler: "antes de alterar VITE_PRESENCE_TOKENS_BACKEND de legacy para supabase em produção"
atualizado_por: "Humano"
quando_atualizar: "fluxo de tokens muda e novos itens de validação precisam ser cobertos"
validade: "2026-05-04"
status: ATUAL
conflito: "Se checklist contradiz comportamento atual da aplicação → verificar código; não alterar o checklist para espelhar comportamento incorreto."
proibido:
  - "Agentes NÃO devem marcar itens deste checklist como aprovados sem execução real em ambiente com Supabase configurado"
nao_cobre: "Validação automatizada (→ docs/presence-token-batch-automated-validation.md), fluxo de auth do treinador ou atleta"
---
```

### `docs/presence-token-batch-automated-validation.md`

```yaml
---
tipo: CHECKLIST-CI
nome: "Validação Automatizada de Lotes de Presence Tokens — GitHub Actions"
papel: "Especifica o workflow de CI e o script validate-presence-token-batch.mjs para validação remota automatizada de tokens Supabase antes de merge."
autoridade: "Hierarquia 4/4 — referência para configuração de CI; perde para workflow e script reais se divergirem."
lido_por: "Agente responsável por CI/CD"
quando_ler: "ao configurar ou alterar o workflow de validação de tokens; ao depurar falha de CI"
atualizado_por: "Agente executor"
quando_atualizar: "workflow ou script mudam, ou novos secrets são necessários"
validade: "2026-05-04"
status: PARCIAL
status_nota: "Verificar .github/workflows/ e scripts/validate-presence-token-batch.mjs antes de usar"
conflito: "Código do script e workflow YAML prevalecem sobre esta spec se divergirem."
proibido:
  - "Agentes NÃO devem commitar secrets ou tokens reais"
  - "NÃO devem executar o script fora de ambiente com Supabase configurado"
nao_cobre: "Validação manual (→ docs/presence-token-batch-validation.md), outros fluxos de presença"
---
```

### `docs/supabase-coach-session.md`

```yaml
---
tipo: SPEC-TÉCNICA
nome: "Sessão Supabase do Treinador — Fase Intermediária"
papel: "Especifica o mecanismo de sessão Supabase do treinador como camada complementar ao login PIN legado, sem substituí-lo nesta fase."
autoridade: "Hierarquia 4/4 — spec de fase intermediária; pode estar superada se migração de auth do treinador foi concluída."
lido_por: "Agente responsável por auth do treinador"
quando_ler: "ao trabalhar em SupabaseAuthProvider, LoginPage do treinador ou /configuracoes/supabase"
atualizado_por: "Agente executor"
quando_atualizar: "decisão de migração completa do treinador para Supabase auth (T07 ou fase seguinte)"
validade: "2026-05-05"
status: PARCIAL
status_nota: "Verificar estado atual de LoginPage.tsx e SupabaseAuthProvider.tsx antes de assumir que PIN ainda é o guard principal"
conflito: "Código prevalece; se PIN foi removido e esta spec ainda diz PIN continua como guard principal, atualizar spec."
proibido:
  - "Agentes NÃO devem re-introduzir PIN como guard principal com base nesta spec sem verificar decisão atual em plan.md e CEPRAEA.md"
nao_cobre: "Migração de stores, geração de lotes de tokens, auth da atleta"
---
```

### `docs/supabase-foundation.md`

```yaml
---
tipo: SPEC-TÉCNICA
nome: "Fundação Supabase — Branch feat/supabase-foundation"
papel: "Define o escopo e os critérios de aceite da fase de fundação Supabase: schema, RLS, RPCs, grants, CI — sem migrar telas ou stores nesta etapa."
autoridade: "Hierarquia 4/4 — spec de branch já mergeada; mantida como referência histórica de decisões arquiteturais."
lido_por: "Agente responsável por migrations ou RLS"
quando_ler: "ao criar nova migration ou RPC; ao revisar política de RLS existente"
atualizado_por: "Não atualizar"
quando_atualizar: "N/A — esta spec documenta uma fase concluída; criar nova spec para fase seguinte"
validade: "2026-05-04"
status: HISTÓRICO
status_nota: "Branch mergeada; artefatos desta fase existem no repositório; spec descreve intenção original, não estado atual"
conflito: "Código e migrations existentes prevalecem; esta spec descreve intenção original da fase, não estado atual."
proibido:
  - "Agentes NÃO devem alterar esta spec para refletir fases posteriores"
  - "NÃO devem interpretar fora do escopo desta fase como proibição permanente"
nao_cobre: "Migração de stores (→ T03–T05 em plan.md), fase de auth da atleta, fase de tokens"
---
```

### `docs/pwa-cache-legado.md`

```yaml
---
tipo: POLÍTICA
nome: "PWA, Cache Local e Separação de Legado"
papel: "Define as regras de separação entre o caminho Supabase (novo) e o caminho IndexedDB/Apps Script (legado) durante a migração — o que pode coexistir e o que não pode."
autoridade: "Hierarquia 4/4 — política arquitetural para período de transição; pode ser revisada quando stores estiverem totalmente migradas."
lido_por: "Agente responsável por stores ou camada de dados"
quando_ler: "ao migrar qualquer store; ao verificar se um arquivo pode importar db/index.ts ou sync.ts"
atualizado_por: "Agente executor + decisão humana"
quando_atualizar: "store migrada para Supabase-first e critério de revisão desta política for atingido"
validade: "2026-05-04"
status: PARCIAL
status_nota: "athleteStore já migrada; verificar estado de trainingStore e attendanceStore antes de aplicar regras"
conflito: "plan.md prevalece para sequência de remoção de legado; esta política prevalece sobre decisão de agente de manter legado por compatibilidade."
proibido:
  - "Agentes NÃO devem importar db/index.ts ou sync.ts em stores já migradas"
  - "NÃO devem usar fallback local como caminho principal de dados em store migrada"
nao_cobre: "Sequência exata de migração (→ plan.md), intenção de produto (→ CEPRAEA.md)"
---
```

### `docs/presence-token-batch-validation-run-2026-05-04.md`

```yaml
---
tipo: RELATÓRIO
nome: "Execução do Checklist de Presence Tokens — 2026-05-04"
papel: "Registro imutável do resultado de uma rodada específica de validação manual do checklist de tokens em 2026-05-04."
autoridade: "Histórico — não normativo; descreve estado em uma data específica."
lido_por: "Humano ou agente investigando histórico de validação"
quando_ler: "ao entender por que tokens ainda estão em legacy em produção"
atualizado_por: "Não atualizar"
quando_atualizar: "N/A — este relatório é imutável; criar novo relatório para nova rodada de execução"
validade: "2026-05-04"
status: HISTÓRICO
status_nota: "Itens 6–10 estavam pendentes nesta data; verificar estado atual separadamente"
conflito: "Estado atual do sistema prevalece sobre este relatório; não inferir estado atual a partir de relatório histórico."
proibido:
  - "Agentes NÃO devem alterar este relatório"
  - "NÃO devem usar itens pendentes deste relatório como prova do estado atual sem re-executar o checklist"
nao_cobre: "Estado atual do sistema, execuções posteriores a 2026-05-04"
---
```

### `.claude/claude-CHANGELOG.md`

```yaml
---
tipo: LOG-CHANGELOG
nome: "Histórico de Mudanças — Agente Claude"
papel: "Registra O QUÊ foi alterado pelo agente Claude, quando, com qual evidência objetiva — rastreabilidade de releases por versão semântica e ID CEPR-NNNN."
autoridade: "Histórico append-only — não normativo; descreve o que aconteceu, não o que deve acontecer."
lido_por: "Claude"
quando_ler: "antes de iniciar trabalho que pode duplicar algo já feito; ao identificar a versão onde algo mudou"
atualizado_por: "Claude exclusivamente"
quando_atualizar: "ao concluir qualquer unidade de trabalho com evidência objetiva (commit, build, teste)"
validade: "Atual até último entry"
status: ATUAL
conflito: "Entradas passadas são imutáveis; se entry anterior descreve estado que foi revertido, registrar reversão como novo entry — nunca editar entry passado."
proibido:
  - "NÃO editar entries passados"
  - "NÃO registrar entry sem evidência objetiva (comando com exit code, commit hash, ou resultado de teste)"
nao_cobre: "O que fazer a seguir (→ plan.md), decisões de produto (→ CEPRAEA.md), logs de outros agentes"
---
```

### `.claude/claude-EXECUTION_LOG.md`

```yaml
---
tipo: LOG-EXECUÇÃO
nome: "Log de Execução — Agente Claude"
papel: "Registra COMO cada tarefa foi executada pelo agente Claude — passos, comandos, divergências encontradas, validação final por ID CEPR-NNNN."
autoridade: "Histórico append-only — não normativo; fonte de verdade sobre decisões tomadas em sessões anteriores."
lido_por: "Claude"
quando_ler: "ao investigar por que uma decisão foi tomada; antes de reverter algo que outro entry justificou; ao depurar comportamento inesperado"
atualizado_por: "Claude exclusivamente"
quando_atualizar: "ao concluir cada unidade de trabalho — registrar passos, comandos e validação final"
validade: "Atual até último entry"
status: ATUAL
conflito: "Entries passados descrevem contexto histórico; código atual prevalece se divergir."
proibido:
  - "NÃO editar entries passados"
  - "NÃO registrar entry sem checklist de validação (typecheck, build, teste relevante)"
nao_cobre: "Decisões de produto, sequência futura de tarefas, logs de Codex ou Copilot"
---
```

### `.codex/codex-CHANGELOG.md`

```yaml
---
tipo: LOG-CHANGELOG
nome: "Histórico de Mudanças — Agente Codex"
papel: "Registra O QUÊ foi alterado pelo agente Codex, quando, com qual evidência objetiva — rastreabilidade de releases por versão semântica e ID CEPR-NNNN."
autoridade: "Histórico append-only — não normativo; descreve o que aconteceu, não o que deve acontecer."
lido_por: "Codex"
quando_ler: "antes de iniciar trabalho que pode duplicar algo já feito; ao identificar a versão onde algo mudou"
atualizado_por: "Codex exclusivamente"
quando_atualizar: "ao concluir qualquer unidade de trabalho com evidência objetiva (commit, build, teste)"
validade: "Atual até último entry"
status: ATUAL
conflito: "Entradas passadas são imutáveis; se entry anterior descreve estado que foi revertido, registrar reversão como novo entry — nunca editar entry passado."
proibido:
  - "NÃO editar entries passados"
  - "NÃO registrar entry sem evidência objetiva (comando com exit code, commit hash, ou resultado de teste)"
nao_cobre: "O que fazer a seguir (→ plan.md), decisões de produto (→ CEPRAEA.md), logs de outros agentes"
---
```

### `.codex/codex-EXECUTION_LOG.md`

```yaml
---
tipo: LOG-EXECUÇÃO
nome: "Log de Execução — Agente Codex"
papel: "Registra COMO cada tarefa foi executada pelo agente Codex — passos, comandos, divergências encontradas, validação final por ID CEPR-NNNN."
autoridade: "Histórico append-only — não normativo; fonte de verdade sobre decisões tomadas em sessões anteriores."
lido_por: "Codex"
quando_ler: "ao investigar por que uma decisão foi tomada; antes de reverter algo que outro entry justificou; ao depurar comportamento inesperado"
atualizado_por: "Codex exclusivamente"
quando_atualizar: "ao concluir cada unidade de trabalho — registrar passos, comandos e validação final"
validade: "Atual até último entry"
status: ATUAL
conflito: "Entries passados descrevem contexto histórico; código atual prevalece se divergir."
proibido:
  - "NÃO editar entries passados"
  - "NÃO registrar entry sem checklist de validação (typecheck, build, teste relevante)"
nao_cobre: "Decisões de produto, sequência futura de tarefas, logs de Claude ou Copilot"
---
```

### `.copilot/copilot-CHANGELOG.md`

```yaml
---
tipo: LOG-CHANGELOG
nome: "Histórico de Mudanças — Agente Copilot"
papel: "Registra O QUÊ foi alterado pelo agente Copilot, quando, com qual evidência objetiva — rastreabilidade de releases por versão semântica e ID CEPR-NNNN."
autoridade: "Histórico append-only — não normativo; descreve o que aconteceu, não o que deve acontecer."
lido_por: "Copilot"
quando_ler: "antes de iniciar trabalho que pode duplicar algo já feito; ao identificar a versão onde algo mudou"
atualizado_por: "Copilot exclusivamente"
quando_atualizar: "ao concluir qualquer unidade de trabalho com evidência objetiva (commit, build, teste)"
validade: "Atual até último entry"
status: ATUAL
conflito: "Entradas passadas são imutáveis; se entry anterior descreve estado que foi revertido, registrar reversão como novo entry — nunca editar entry passado."
proibido:
  - "NÃO editar entries passados"
  - "NÃO registrar entry sem evidência objetiva (comando com exit code, commit hash, ou resultado de teste)"
nao_cobre: "O que fazer a seguir (→ plan.md), decisões de produto (→ CEPRAEA.md), logs de outros agentes"
---
```

### `.copilot/copilot-EXECUTION_LOG.md`

```yaml
---
tipo: LOG-EXECUÇÃO
nome: "Log de Execução — Agente Copilot"
papel: "Registra COMO cada tarefa foi executada pelo agente Copilot — passos, comandos, divergências encontradas, validação final por ID CEPR-NNNN."
autoridade: "Histórico append-only — não normativo; fonte de verdade sobre decisões tomadas em sessões anteriores."
lido_por: "Copilot"
quando_ler: "ao investigar por que uma decisão foi tomada; antes de reverter algo que outro entry justificou; ao depurar comportamento inesperado"
atualizado_por: "Copilot exclusivamente"
quando_atualizar: "ao concluir cada unidade de trabalho — registrar passos, comandos e validação final"
validade: "Atual até último entry"
status: ATUAL
conflito: "Entries passados descrevem contexto histórico; código atual prevalece se divergir."
proibido:
  - "NÃO editar entries passados"
  - "NÃO registrar entry sem checklist de validação (typecheck, build, teste relevante)"
nao_cobre: "Decisões de produto, sequência futura de tarefas, logs de Claude ou Codex"
---
```

---

## 6. Regras de Aplicação

### Para novos documentos

1. Identificar o tipo correto da tabela da Seção 4
2. Copiar o schema da Seção 3 e preencher todos os campos obrigatórios
3. Colocar o bloco `---` como linha 1 absoluta do arquivo
4. O primeiro `#` do documento vai após a linha de fechamento `---` + linha em branco

### Para logs (LOG-CHANGELOG e LOG-EXECUÇÃO)

- O YAML frontmatter é a única parte do arquivo que pode ser lida e verificada por agentes para metadados
- O corpo do log (entries históricos) é append-only e nunca editado
- Ao adicionar um entry, apenas adicionar ao final — nunca modificar entries anteriores
- O campo `validade` em logs sempre diz `"Atual até último entry"` — não colocar data fixa

### Para documentos HISTÓRICO

- O campo `atualizado_por` deve ser `"Não atualizar"`
- O campo `quando_atualizar` deve ser `"N/A"`
- Não corrigir conteúdo retroativamente — criar novo documento para estado atual

---

## 7. Verificação

```bash
# Verificar que todos os 17 documentos têm --- na linha 1
for f in CEPRAEA.md plan.md AGENT.md auditplan.md \
  docs/presence-tokens-supabase.md docs/presence-token-batch-validation.md \
  docs/presence-token-batch-automated-validation.md docs/supabase-coach-session.md \
  docs/supabase-foundation.md docs/pwa-cache-legado.md \
  docs/presence-token-batch-validation-run-2026-05-04.md \
  .claude/claude-CHANGELOG.md .claude/claude-EXECUTION_LOG.md \
  .codex/codex-CHANGELOG.md .codex/codex-EXECUTION_LOG.md \
  .copilot/copilot-CHANGELOG.md .copilot/copilot-EXECUTION_LOG.md; do
  head -1 "$f" | grep -q "^---$" && echo "OK: $f" || echo "FAIL: $f"
done

# Verificar que nenhum documento começa com blockquote residual
grep -rl "^>" CEPRAEA.md plan.md AGENT.md auditplan.md docs/*.md .claude/*.md .codex/*.md .copilot/*.md 2>/dev/null

# Verificar que headers_policy.md existe
test -f docs/headers_policy.md && echo "OK: headers_policy.md" || echo "MISSING"
```
