# politica-breaking-changes

Status: DRAFT NORMATIVO (PR 1)
Objetivo: controlar mudancas ontologicas que podem quebrar runtime, IA, validacao e dados historicos.

## 1. Definicao de Breaking Change

E breaking quando qualquer item ocorrer:

1. Remocao/rename de classe canonica usada em mapping de runtime.
2. Mudanca de semantica de propriedade que altera interpretacao de dado.
3. Endurecimento de SHACL que reprova dados antes aceitos em producao.
4. Alteracao de codigos Scout mapeados (`AT_POS`, `DEF_POS`, `TRANS_OF`, `TRANS_DEF`, etc.).
5. Mudanca que invalida consultas de competencia obrigatorias.

## 2. Processo Obrigatorio

1. Abrir decisao formal com impacto e plano de compatibilidade.
2. Classificar mudanca: `breaking` ou `non-breaking`.
3. Atualizar crosswalk e politicas relacionadas.
4. Apresentar plano de migracao ou profile de compatibilidade.
5. Aprovar no board de ontologia antes de merge.

## 3. Janela de Compatibilidade

1. Mudanca breaking MUST ter janela de transicao definida.
2. Conceito/propriedade deprecada MUST coexistir por periodo minimo definido na release.
3. Remocao definitiva so apos evidencias de migracao e impacto zero no runtime.

## 4. Gates Tecnicos Minimos

Toda mudanca breaking MUST provar:

1. SHACL valid/invalid com resultado esperado.
2. SPARQL de competencia sem regressao nao planejada.
3. Alinhamento runtime <-> ontologia aprovado por script dedicado.
4. Golden dataset real validado.
5. Politica de dados historicos aplicada.

## 5. Regras de Bloqueio

Bloquear merge se:

1. Mudanca MAJOR sem plano de migracao e rollback.
2. Divergencia entre matrix TypeScript e SHACL.
3. Sem atualizacao de crosswalk para termos afetados.
4. Sem aprovacao formal de impacto na IA.

## 6. Responsabilidades

1. Owner de Ontologia: valida consistencia semantica e formal.
2. Owner Scout Runtime: valida aderencia ao comportamento real do PWA.
3. Owner Dados: valida historico, migracao e risco operacional.
4. Owner IA: valida contrato de consumo e rastreabilidade das respostas.

