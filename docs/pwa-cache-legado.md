# Política PWA, cache e legado — CEPRAEA

Este documento faz parte da branch `feat/supabase-foundation`.

## Escopo

A fundação Supabase não migra stores operacionais nesta branch. Este documento define a fronteira entre o legado local e a futura fonte única de verdade.

## Regras aprovadas

1. IndexedDB atual é legado operacional.
2. Apps Script atual é legado operacional.
3. `DATA_MODE=supabase` é sinalização, não mecanismo de segurança.
4. A segurança real é remover o caminho de escrita legado das stores migradas.
5. Stores migradas para Supabase não podem importar módulos de escrita IndexedDB.
6. Stores migradas para Supabase não podem chamar Apps Script.
7. Fallback local silencioso é proibido.
8. Antes de limpar IndexedDB, deve existir export local.
9. Antes de lançamento com atletas, service worker antigo precisa ser invalidado.
10. A versão instalada da PWA deve ser visível em Configurações antes do lançamento.

## Critério futuro de revisão

Quando uma store for migrada para Supabase, deve passar por verificação de imports:

```text
trainingStore Supabase não importa src/db/index.ts
athleteStore Supabase não importa src/db/index.ts
attendanceStore Supabase não importa src/db/index.ts
scoutStore Supabase não importa src/db/index.ts
```

Também deve ser verificado que nenhuma dessas stores chama `src/lib/sync.ts` ou endpoints Apps Script.

## Fora do escopo desta branch

- Limpar IndexedDB real.
- Remover Apps Script definitivamente.
- Migrar `athleteStore`.
- Migrar `trainingStore`.
- Migrar `attendanceStore`.
- Migrar `scoutStore`.
- Alterar telas operacionais principais.
- Lançar para atletas.

## Linha vermelha

Nenhuma store operacional deve ser migrada antes de RLS, RPCs, grants e CI estarem passando.
