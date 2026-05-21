> Este AGENTS.md é a fonte operacional atual para agentes de IA no CEPRAEA a partir de 2026-05-19.
> O arquivo AGENT.md foi substituído por este documento.

# CEPRAEA — Agent Operating Manual

## 0. Regra central

Nenhuma tarefa termina apenas porque o código foi alterado.

Toda tarefa termina somente quando o agente entrega evidências:

1. Escopo entendido
2. Arquivos alterados
3. Ferramentas usadas
4. Comandos executados
5. Resultado dos comandos
6. Status do PR/Preview, quando aplicável
7. Riscos restantes ou pendências

Se algum comando não puder ser executado, o agente deve dizer explicitamente:
- qual comando não foi executado;
- por quê;
- qual validação alternativa foi feita.

## 1. Ambiente

O projeto possui deploy na Vercel com Preview Deployment antes do merge.

Agentes devem trabalhar em branch/PR e validar o preview antes do merge.

Agentes NÃO devem fazer alterações diretas em produção, aplicar migrations remotas
ou alterar variáveis de ambiente sem confirmação humana explícita.

Use caminhos Linux:

```txt
/home/...
```

Não use caminhos Windows:

```txt
C:\Users\...
```

No VS Code, abrir sempre com:

```bash
cd ~/caminho/para/CEPRAEA
code .
```

## 2. Regras migradas do AGENT.md legado

O arquivo AGENT.md foi substituído por este AGENTS.md em 2026-05-19.

Regras preservadas:

- MUST ler `CEPRAEA.md` antes de atuar no projeto.
- MUST verificar os últimos 3 PRs para entender o contexto recente.
- Claude Code MUST atualizar `.claude/claude-CHANGELOG.md`.
- Claude Code MUST atualizar `.claude/claude-EXECUTION_LOG.md`.
- Codex MUST atualizar `.codex/codex-CHANGELOG.md`.
- Codex MUST atualizar `.codex/codex-EXECUTION_LOG.md`.
- GitHub Copilot MUST atualizar `.copilot/copilot-CHANGELOG.md`.
- GitHub Copilot MUST atualizar `.copilot/copilot-EXECUTION_LOG.md`.
- MUST NOT usar `git stash`, `git reset` ou `git revert`.

## 3. Stack do projeto

O CEPRAEA usa:

- React
- Vite
- TypeScript strict
- Supabase
- Vitest
- Playwright
- PWA
- Zustand
- React Router
- Vercel com Preview Deployment antes do merge

## 4. Ferramentas disponíveis

O agente deve escolher ferramentas automaticamente conforme a tarefa.

### Ferramentas principais

- Terminal
- Git
- GitHub MCP
- Context7 MCP
- Playwright MCP
- Supabase MCP local
- Vercel MCP
- Vercel CLI

### Regra de roteamento

Tarefa define pipeline.
Pipeline define ferramenta.
Ferramenta gera evidência.
Evidência define se está pronto.

O usuário não precisa dizer manualmente qual ferramenta usar em toda tarefa.

## 5. Uso obrigatório de ferramentas por tipo de tarefa

### 5.1 Código local / bug / refatoração

Use:

- filesystem
- terminal
- git diff
- npm scripts

Validação mínima:

```bash
npm run typecheck
npm test
npm run build
```

### 5.2 UI / fluxo visual / responsividade / navegação

Use:

- Playwright MCP
- navegador
- console logs
- screenshots quando necessário

Exemplos:

- login
- tela de atleta
- tela de treinador
- cadastro
- presença
- fluxo mobile
- PWA
- responsividade
- formulários

Validação:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Se for validação contra preview da Vercel:

```bash
npm run test:smoke
```

### 5.3 Supabase / banco / Auth / RLS / RPC / migrations / seed

Use:

- Supabase local
- Supabase MCP local
- testes SQL
- migrations
- seed

Nunca use produção para desenvolvimento normal.

Validação:

```bash
supabase db reset
npm run test:supabase
npm run typecheck
npm run build
```

Se alterar schema ou RLS, verificar também:

- migrations relacionadas;
- seed;
- testes SQL;
- chamadas do frontend;
- types;
- impacto em Auth e RPCs.

### 5.4 API moderna ou biblioteca com versão recente

Use Context7 MCP antes de implementar quando mexer em:

- React
- React Router
- Supabase JS
- Playwright
- Vite
- Vitest
- Tailwind
- Zustand
- Vercel
- qualquer API cuja assinatura possa ter mudado

Não implementar API com base apenas em memória interna se houver dúvida.

### 5.5 GitHub / PR / branch / issue / histórico

Use:

- GitHub MCP
- git status
- git diff
- GitHub Pull Request
- GitHub Issues, se houver

Antes de declarar pronto:

```bash
git status
git diff
```

O agente deve conferir se não alterou arquivos fora do escopo.

### 5.6 Vercel Preview antes do merge

Este projeto usa Vercel Preview antes do merge.

Após abrir ou atualizar PR, o agente deve validar:

1. se o preview da Vercel foi gerado;
2. se o build do preview passou;
3. se o preview abre corretamente;
4. se o smoke test passa;
5. se os logs não mostram erro crítico.

Use:

- Vercel MCP
- Vercel CLI
- Preview Deployment URL
- logs do deployment
- Playwright MCP, se precisar validar fluxo visual

Comandos úteis:

```bash
vercel list
vercel logs <preview-url>
npm run test:smoke
```

Se houver erro no preview:

1. consultar logs da Vercel;
2. identificar se é erro de build, runtime, env, rota ou dependência;
3. corrigir localmente;
4. rodar validação local;
5. atualizar PR;
6. revalidar preview.

### 5.7 Release / merge final

Antes de considerar um PR pronto para merge:

```bash
npm run validate:mvp:v1
```

Também verificar:

- PR sem diff inesperado;
- preview Vercel funcionando;
- smoke test aprovado;
- logs sem erro crítico;
- nenhuma migration perigosa sem validação.

## 6. Pipelines obrigatórios

### Mudança simples sem UI e sem banco

```bash
npm run typecheck
npm test
npm run build
```

### Mudança de UI

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

### Mudança de Supabase

```bash
supabase db reset
npm run test:supabase
npm run typecheck
npm run build
```

### Mudança de PR com preview Vercel

```bash
npm run typecheck
npm test
npm run build
npm run test:smoke
```

### Gate final

```bash
npm run validate:mvp:v1
```

## 7. Regras de segurança

O agente não pode:

- remover testes para fazer build passar;
- reduzir validação sem justificar;
- alterar migrations sem validar Supabase;
- aplicar migration remota sem confirmação explícita;
- conectar MCP de escrita à produção sem confirmação explícita;
- declarar sucesso sem evidências;
- mexer fora do escopo sem explicar;
- instalar dependência nova sem justificar;
- ignorar falha de typecheck, build ou teste;
- usar caminho Windows neste repo;
- commitar segredos;
- exibir tokens, secrets ou keys.

## 8. Supabase access policy

O padrão para agentes é usar Supabase MCP, não Postgres direto.

### Supabase local

Usar por padrão:

```txt
supabase-local = http://127.0.0.1:54321/mcp
```

Finalidade:

- consultar schema local;
- validar migrations locais;
- inspecionar tabelas;
- investigar dados de teste;
- apoiar testes E2E e Supabase local.

### Supabase remoto

Usar somente em modo leitura:

```txt
supabase-remote-readonly = https://mcp.supabase.com/mcp?project_ref=fcnyjmrknqaomamdzabt&read_only=true&features=database,docs,debugging,development
```

Permitido:

- listar tabelas;
- ler schema;
- listar migrations;
- gerar tipos;
- consultar logs/advisors;
- comparar estrutura remota com local.

Proibido sem confirmação humana explícita:

- aplicar migration remota;
- executar SQL destrutivo;
- alterar dados;
- alterar policies/RLS;
- alterar secrets;
- alterar configurações do projeto.

### Postgres direto

Postgres direto é exceção.

Só pode ser usado quando:

- Supabase MCP não resolver;
- for necessária query SQL fina;
- o usuário autorizar explicitamente.

Nunca versionar connection strings com senha.

Usar somente via variável de ambiente local:

```bash
SUPABASE_LOCAL_DB_URL
SUPABASE_REMOTE_DB_URL
```

### Regra de preferência

1. Supabase MCP local
2. Supabase MCP remoto read-only
3. Postgres local direto
4. Postgres remoto direto, somente com autorização explícita

## 9. Vercel MCP

Use Vercel MCP para:

- consultar deploys;
- consultar preview;
- ler logs;
- investigar build failure;
- investigar runtime error;
- validar ambiente antes do merge.

Endpoint oficial:

```txt
https://mcp.vercel.com
```

## 10. Formato obrigatório da resposta final do agente

Ao terminar uma tarefa, responder neste formato:

```md
## Resumo
...

## Arquivos alterados
- ...

## Ferramentas usadas
- ...

## Validação executada
- `npm run typecheck`: passou/falhou/não executado
- `npm test`: passou/falhou/não executado
- `npm run build`: passou/falhou/não executado
- `npm run test:e2e`: passou/falhou/não executado
- `npm run test:smoke`: passou/falhou/não executado
- `npm run validate:mvp:v1`: passou/falhou/não executado

## Preview Vercel
- URL:
- Status:
- Logs críticos:
- Smoke test:

## Riscos / Pendências
- ...
```

## 11. Quando pedir confirmação humana

Pedir confirmação antes de:

- aplicar migration remota;
- mexer em produção;
- alterar variáveis de ambiente da Vercel;
- apagar dados;
- remover tabela/coluna;
- alterar política RLS crítica;
- fazer merge;
- promover preview para produção;
- instalar dependência estrutural nova.
