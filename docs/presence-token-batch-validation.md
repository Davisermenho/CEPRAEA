# Validação manual — lotes de Presence Tokens Supabase

## Objetivo

Validar o fluxo real de geração, exportação, confirmação pública e revogação de lotes de presence tokens usando Supabase, sem ativar o fluxo em produção.

## Decisão operacional

Produção deve permanecer em modo legado até aprovação explícita.

```text
VITE_PRESENCE_TOKENS_BACKEND=legacy
```

A validação deve ocorrer em preview/staging ou ambiente controlado com:

```text
VITE_PRESENCE_TOKENS_BACKEND=supabase
VITE_SUPABASE_URL=<configurado>
VITE_SUPABASE_ANON_KEY=<configurado>
VITE_SUPABASE_TEAM_ID=<uuid-valido>
```

Não registrar valores reais de ambiente neste documento ou no changelog.

## Pré-condições

- Supabase Foundation verde no GitHub Actions.
- Vercel verde no commit testado.
- Usuário Supabase de teste existente.
- Usuário pertence ao time configurado.
- Usuário possui papel `owner` ou `coach` no time configurado.
- Existem atletas ativas no ambiente testado.
- Existe ao menos um treino aberto para teste.
- Produção continua com backend `legacy`.

## Checklist de validação

### 1. Validar sessão e acesso

Abrir:

```text
/configuracoes/supabase
```

Resultado esperado:

- configuração Supabase presente;
- sessão Supabase ativa;
- `VITE_SUPABASE_TEAM_ID` válido;
- validação `owner/coach` aprovada.

Bloqueio se falhar:

- não prosseguir para geração de lote;
- corrigir ambiente, sessão ou vínculo do usuário ao time.

### 2. Validar visibilidade da seção no treino

Abrir um treino no painel.

Resultado esperado quando a flag está em `supabase`:

- seção `Tokens Supabase` aparece.

Resultado esperado quando a flag está em `legacy`:

- seção `Tokens Supabase` não aparece.

### 3. Gerar lote

Na seção `Tokens Supabase`, clicar em:

```text
Gerar lote de links
```

Resultado esperado:

- lote criado com links para atletas ativas;
- cada link usa a rota `/confirmar-presenca?token=<valor>`;
- token puro aparece apenas no retorno imediato e no texto copiado;
- nenhum token puro deve ser registrado em log ou persistido no frontend.

### 4. Copiar e marcar exportado

Copiar o lote pelo modal.

Resultado esperado:

- texto copiado para área de transferência;
- lote marcado como exportado via RPC;
- painel exibe mensagem de sucesso.

### 5. Confirmar presença por link público

Abrir um dos links em aba anônima ou outro dispositivo.

Resultado esperado:

- tela pública abre sem exigir login do painel;
- atleta consegue registrar `presente` ou `ausente`;
- resposta pública é genérica e segura;
- confirmação aparece no Supabase.

### 6. Revogar lote

No painel, revogar o lote atual.

Resultado esperado:

- RPC de revogação executa com sucesso;
- links do lote deixam de funcionar;
- nova tentativa de confirmação exibe erro genérico.

### 7. Validar bloqueios negativos

Testar, quando possível:

- usuário sem papel `owner/coach` não consegue gerar lote;
- usuário fora do time não consegue gerar lote;
- sessão ausente bloqueia geração;
- `VITE_SUPABASE_TEAM_ID` ausente ou inválido bloqueia geração;
- token inválido retorna erro genérico;
- token revogado retorna erro genérico.

## Critérios de aprovação

A fase só pode ser aprovada se todos forem verdadeiros:

- GitHub Actions verde.
- Vercel verde.
- validação `owner/coach` aprovada.
- lote gerado com sucesso.
- lote copiado e marcado como exportado.
- confirmação pública por token funcionando.
- revogação funcionando.
- links revogados deixam de funcionar.
- produção permaneceu em `legacy` durante os testes.
- nenhum secret ou token sensível foi registrado no repo.

## Critérios de reprovação

Reprovar e manter produção em `legacy` se ocorrer qualquer item abaixo:

- confirmação Supabase não é registrada corretamente;
- erro público vaza detalhe técnico sensível;
- usuário sem papel adequado consegue gerar lote;
- revogação não invalida links;
- produção for ativada em `supabase` antes da aprovação;
- fluxo legado deixar de funcionar.

## Próxima fase após aprovação

Depois da validação manual aprovada, a próxima fase técnica deve ser leitura mínima das confirmações Supabase no detalhe do treino, para evitar divergência entre confirmações feitas por token Supabase e o painel ainda baseado no fluxo legado.
