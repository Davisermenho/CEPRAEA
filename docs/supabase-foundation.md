# Fundação Supabase — CEPRAEA

Branch: `feat/supabase-foundation`

## Tese aprovada

A fundação Supabase prepara o CEPRAEA para usar Supabase como infraestrutura central, sem migrar telas nem stores operacionais nesta etapa.

## Escopo positivo

Esta branch deve entregar:

- migrations versionadas;
- schema inicial;
- RLS em tabelas sensíveis;
- revogação de grants padrão;
- grants explícitos por função;
- RPCs críticas;
- testes de RLS, grants e RPCs;
- CI executando testes e build;
- `src/lib/supabase.ts` sem service role;
- AuthProvider mínimo;
- documentação de PWA/cache/legado.

## Fora do escopo

Esta branch não pode:

- migrar `athleteStore`;
- migrar `trainingStore`;
- migrar `attendanceStore`;
- migrar `scoutStore`;
- alterar telas operacionais principais;
- limpar IndexedDB real;
- remover Apps Script em definitivo;
- lançar fluxo para atletas.

## Linha vermelha

Nenhuma store operacional deve ser migrada antes de RLS, RPCs, grants e CI estarem passando.

## Critérios de aceite

A branch só é concluída quando:

1. Banco local/staging é recriável do zero via migrations + seed.
2. RLS está ativa em todas as tabelas sensíveis.
3. Grants padrão foram revogados.
4. Grants explícitos foram aplicados função por função.
5. Testes de RLS passam.
6. Testes de grants passam.
7. Testes de RPC passam.
8. Teste concorrente de `generate_trainings` passa.
9. CI roda migrations, seed, testes e build.
10. `src/lib/supabase.ts` existe sem service role.
11. AuthProvider mínimo existe sem migrar telas operacionais.
12. Documento PWA/cache/legado existe.
13. Nenhuma store operacional foi migrada.
14. Nenhuma tela operacional principal foi alterada.
15. Apps Script não foi removido definitivamente.
16. IndexedDB real não foi limpo.

## Operações críticas por RPC

As operações abaixo devem ser transacionais e validadas internamente:

- `generate_trainings`;
- `create_presence_token_batch`;
- `mark_presence_token_batch_exported`;
- `revoke_presence_token_batch`;
- `confirm_presence_by_token`.

## Segurança

- Token puro nunca é salvo.
- `generation_key` é calculado no banco.
- `starts_at` e `presence_lock_at` são calculados no banco.
- RPCs críticas usam nomes qualificados (`public.*`).
- Funções `security definer` precisam validar `auth.uid()`, role e `team_id` internamente.
- `service_role` é proibida no frontend.
