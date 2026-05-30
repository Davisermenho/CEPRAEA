# politica-migracao-historica

Status: DRAFT NORMATIVO
Objetivo: definir como dados historicos de Scout devem coexistir com a ontologia executavel sem quebrar runtime, relatorios ou producao.

## 1. Escopo

Esta politica se aplica a dados de Scout ja existentes ou importados antes da ativacao plena dos gates ontologicos, em especial registros de `scout_live_entries` que possam nao conformar com SHACL novo.

Esta politica nao altera banco, runtime, UI, migrations, codebooks ou contratos TypeScript. Qualquer alteracao material nesses itens exige PR propria.

## 2. Principios

1. Dado historico nao deve ser apagado ou sobrescrito para satisfazer SHACL novo.
2. SHACL novo pode bloquear dado novo, mas nao pode quebrar leitura de dado historico sem plano de compatibilidade.
3. A ontologia deve distinguir validacao de dado novo e diagnostico de dado historico.
4. Relatorio de desempenho deve usar somente dado operacionalmente validado quando o fluxo exigir status de validacao.
5. Toda migracao historica deve ser auditavel, reversivel por plano e precedida por contagem de impacto.

## 3. Definicoes

### 3.1 `profile_new_data`

Perfil rigoroso para registros criados apos a ativacao da regra ontologica aplicavel.

Regras:

1. Deve validar contra SHACL fechado aplicavel ao fluxo.
2. Deve falhar em CI quando violar regra obrigatoria.
3. Deve preservar os codigos runtime do CEPRAEA como fonte funcional.
4. Deve rejeitar combinacoes que o PWA ja bloqueia, como `PASSIVO` com tipo de finalizacao.
5. Deve ser usado para novos exemplos, golden datasets e gates de release.

### 3.2 `profile_historical_data`

Perfil de compatibilidade para registros anteriores a uma regra ontologica, registros importados ou registros produzidos antes da normalizacao semantica completa.

Regras:

1. Deve ser diagnostico por padrao, nao bloqueador de leitura.
2. Pode aceitar campos ausentes quando a ausencia refletir limite historico conhecido.
3. Deve registrar violacoes como achados de qualidade, nao como erro destrutivo imediato.
4. Nao deve promover dado para relatorio final sem validacao operacional aplicavel.
5. Deve indicar explicitamente quando um registro e `legacy`, `incompleto`, `inconsistente` ou `nao_classificado`.

### 3.3 Dado `legacy`

Dado `legacy` e dado preservado por rastreabilidade historica, mas que nao atende integralmente o perfil novo.

Um dado `legacy` pode ser consultado para auditoria, revisao, reconstrucao de contexto e analise de qualidade. Ele nao deve alimentar metricas finais de desempenho sem revisao ou migracao validada.

## 4. Politica para `scout_live_entries` antigas fora do SHACL novo

Quando uma `scout_live_entries` antiga falhar no SHACL novo:

1. O registro deve permanecer preservado.
2. O erro deve ser classificado em relatorio de impacto antes de qualquer migracao.
3. O registro deve ser avaliado pelo `profile_historical_data`.
4. O registro so pode ser promovido ao `profile_new_data` se houver migracao deterministica e validada.
5. Se a migracao exigir inferencia incerta, o registro deve permanecer como `legacy` ou seguir para revisao humana.

## 5. Decisao: migrar, marcar legacy ou aceitar por profile separado

| Caso | Decisao padrao | Condicao para promocao |
| --- | --- | --- |
| Historico ja conforma com SHACL novo | aceitar em `profile_new_data` | nenhuma acao adicional alem da validacao |
| Historico falha por campo ausente recuperavel de forma deterministica | migrar em PR propria | dry-run, contagem de impacto, rollback e teste |
| Historico falha por campo ausente nao inferivel | manter em `profile_historical_data` como `legacy` | revisao humana ou enriquecimento documentado |
| Historico contradiz matriz TypeScript atual | manter fora de metricas finais | decisao de dominio e plano de correcao |
| Historico corrompido ou sem contexto minimo | quarentenar logicamente | correcao manual auditada |

## 6. Relatorios e status `VALIDADO`

1. Relatorios de desempenho devem usar somente dados `VALIDADO` quando o fluxo de Scout possuir `status_validacao_code` aplicavel.
2. Dados `PENDENTE`, `REVISADO`, `CORRIGIDO`, `DUVIDA`, `legacy` ou `profile_historical_data` podem aparecer em auditoria, revisao e diagnostico, mas nao devem compor metricas finais sem regra explicita.
3. Se uma consulta misturar dado novo e historico, a resposta deve separar os perfis usados.
4. A IA deve informar `validation_profile` quando responder com base em dados historicos ou mistos.

## 7. Como evitar quebra de producao

Antes de endurecer SHACL ou promover gate ontologico para release:

1. Rodar validacao formal com dataset valido e invalido.
2. Rodar alinhamento runtime <-> ontologia.
3. Executar dry-run de impacto historico quando houver regra nova que afete `scout_live_entries`.
4. Registrar quantidade de registros afetados por tipo de violacao.
5. Definir se cada violacao sera migrada, aceita no profile historico ou mantida fora de relatorio.
6. Nao aplicar migration remota sem aprovacao humana explicita.
7. Nao alterar dados de producao em PR documental ou formal.
8. Manter rollback operacional para qualquer migracao de dados.

## 8. Requisitos para migracao historica futura

Toda PR de migracao historica deve conter:

1. Objetivo da migracao.
2. Recorte de dados afetados.
3. Consulta de dry-run com contagens antes/depois.
4. Regra deterministica de transformacao.
5. Evidencia de que dados nao inferiveis nao foram inventados.
6. Plano de rollback ou estrategia equivalente de recuperacao.
7. Teste local com base representativa.
8. Confirmacao de que relatorios continuam usando apenas dados validos para o perfil exigido.

## 9. Consumo pela IA

A IA deve tratar dados historicos com esta hierarquia:

1. Se o dado esta em `profile_new_data`, pode responder como dado plenamente validado.
2. Se o dado esta em `profile_historical_data`, deve sinalizar limite de qualidade.
3. Se o dado e `legacy`, deve evitar conclusoes de desempenho e preferir linguagem de auditoria.
4. Se o dado esta em quarentena logica, nao deve usa-lo para recomendacao tecnica.
5. Se houver conflito entre runtime e ontologia, runtime do CEPRAEA prevalece ate decisao formal.

## 10. Criterios de bloqueio

Bloquear merge ou ativacao de gate se qualquer item ocorrer:

1. SHACL novo reprova historico sem plano de perfil ou migracao.
2. Migracao historica inventa campo nao inferivel.
3. Dado `legacy` passa a alimentar relatorio final sem revisao.
4. `profile_historical_data` e usado para relaxar validacao de dado novo.
5. Mudanca altera Supabase, runtime, UI ou migrations sem PR propria.
6. IA consome dado historico sem declarar `validation_profile`.

## 11. Evidencias de repositorio usadas nesta politica

1. `ScoutValidationStatus` define `PENDENTE`, `REVISADO`, `CORRIGIDO`, `VALIDADO` e `DUVIDA` em `src/types/index.ts`.
2. As migrations de Scout criam entradas de `scout_live_entries` com `status_validacao_code` inicial `PENDENTE`.
3. O plano de fusao exige politica historica antes de endurecer SHACL adicional.
4. O contrato de consumo da IA ja exige `profile_new_data`, `profile_historical_data` e declaracao de `validation_profile`.
