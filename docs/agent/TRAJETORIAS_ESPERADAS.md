# Trajetórias Esperadas do Agente

## Código local

`contexto -> arquivos -> edição -> git diff -> typecheck -> test -> build -> log -> resposta final`

## UI/fluxo visual

`contexto -> edição -> typecheck -> test -> build -> e2e/playwright -> evidência visual/log -> log -> resposta final`

## Supabase

`contexto/schema -> migration local -> supabase db reset -> test:supabase -> typecheck -> build -> log -> resposta final`

## PR com preview

`git diff -> template PR -> checks -> preview vercel -> smoke -> logs preview -> log -> resposta final`
