# MVP Cutover — CEPRAEA

Procedimento para transferir dados operacionais legados para o Supabase antes do desligamento do sistema legado.

## Pré-condições

- Supabase configurado e acessível
- `SUPABASE_DB_URL` (ou `E2E_SUPABASE_DB_URL` em dev) aponta para a instância alvo
- `VITE_SUPABASE_TEAM_ID` definido com o UUID correto do time
- Arquivo de backup legado exportado pelo app (`cepraea-backup-YYYY-MM-DD.json`)

## Etapas

### 1. Exportar dados legados

No app legado, acesse **Configurações → Exportar → JSON** e baixe `cepraea-backup-YYYY-MM-DD.json`.

### 2. Dry-run (inspecionar sem gravar)

```bash
node scripts/import-legacy-json-to-supabase.mjs ./cepraea-backup-YYYY-MM-DD.json --dry-run
```

Revise o SQL gerado e confirme que:
- IDs dos atletas, treinos e presenças estão corretos
- O `team_id` corresponde ao time certo
- Nenhum registro inesperado aparece

### 3. Importar

```bash
node scripts/import-legacy-json-to-supabase.mjs ./cepraea-backup-YYYY-MM-DD.json --apply
```

O script usa `ON CONFLICT DO NOTHING` para atletas e treinos, e `ON CONFLICT DO UPDATE` para presenças. É idempotente — pode ser executado mais de uma vez sem duplicar dados.

### 4. Reconciliar

```bash
node scripts/reconcile-legacy-json-to-supabase.mjs ./cepraea-backup-YYYY-MM-DD.json
echo $?
```

O comando deve retornar exit code `0` e imprimir `Reconciliation PASSED`.

Se retornar `1`, verifique os erros reportados e reexecute o import se necessário.

### 5. Validar visualmente

- Acesse o app em produção como treinador
- Confirme que os atletas importados aparecem na lista
- Confirme que os treinos históricos aparecem no calendário
- Confirme que as presenças aparecem no detalhe de cada treino e nos relatórios

### 6. Desligar o legado

Após confirmar a reconciliação e a validação visual:

1. Arquivar o JSON de backup em local seguro
2. Remover o acesso ao sistema legado (ou redirecioná-lo para o novo app)
3. Executar T09 para remover o código legado do runtime

## Rollback

O import é aditivo — não apaga dados existentes. Para desfazer:

```sql
DELETE FROM public.athletes    WHERE id IN ('<id1>', '<id2>', ...);
DELETE FROM public.trainings   WHERE generation_key LIKE 'legacy:%';
DELETE FROM public.attendance_records
  WHERE team_id = '<TEAM_ID>'
    AND training_id IN (SELECT id FROM public.trainings WHERE generation_key LIKE 'legacy:%');
```

## Notas

- `athletes.user_id` é `NULL` após o import; os atletas só se vinculam após o primeiro login (via `AtletaGuard` → `link_athlete_user_id`)
- Presenças são importadas com os IDs de treino e atleta do legado — esses IDs devem ser os mesmos UUIDs usados no Supabase
- O timezone de `starts_at` dos treinos é calculado como `HH:MM-03:00` (horário de Brasília no inverno)
