# politica-namespace-versionamento

Status: DRAFT NORMATIVO (PR 1)
Escopo: identidade canonica, namespace, versionamento e deprecacao da ontologia executavel CEPRAEA.

## 1. Namespace Canonico

Regra obrigatoria:

- Namespace canonico final da ontologia executavel: `https://cepraea.app/ontology#`
- Prefixo canonico: `cepr:`
- Namespace legado de importacao (onthbpraia): `https://hbtrack.org/onthbpraia#`
- Prefixo legado: `bh:`

`cepr:` e o unico prefixo permitido para novos conceitos canonicos.

## 2. Identidade Canonica

1. Todo conceito MUST ter `canonical_id` estavel (ex.: `CEPR-ONT-SHOT-SPIN`).
2. `canonical_id` MUST NOT mudar por traducao, sinonimo ou ajuste de label.
3. Label (`rdfs:label`) e sinonimo (`skos:altLabel`) sao apresentacao, nao identidade.
4. Termo legado mapeado MUST referenciar `canonical_id` do conceito final.

## 3. Convencoes de Nome

1. Classes OWL: `PascalCase` (ex.: `SpinThrow`).
2. Propriedades: `camelCase` (ex.: `hasFinishType`).
3. Individuos controlados: `snake_case` ou codigo de dominio estavel.
4. Nomes de codigo runtime (`AT_POS`, `DEF_POS`, etc.) MUST ser preservados em mapeamentos, sem rename ad-hoc.

## 4. Versionamento da Ontologia

Modelo obrigatorio:

1. SemVer para ontologia executavel (`MAJOR.MINOR.PATCH`).
2. `MAJOR`: breaking semantic/shape change.
3. `MINOR`: novos conceitos/relacoes compativeis.
4. `PATCH`: correcoes nao breaking.

Campos obrigatorios nos artefatos formais:

- `owl:versionInfo`
- `dcterms:issued`
- `dcterms:modified`
- changelog da ontologia por versao

## 5. Deprecacao Formal

1. Conceito substituido MUST usar marcador formal de deprecacao.
2. Deprecacao MUST apontar substituto canonico.
3. Deprecacao MUST registrar data e justificativa.
4. Conceito deprecado MAY permanecer por janela de compatibilidade definida na politica de breaking changes.

## 6. OWL vs SHACL (Regra de Interpretacao)

1. OWL opera em Open World e nao valida completude fechada de registros.
2. SHACL opera em validacao fechada (Closed World operacional).
3. Regras de obrigatoriedade de dados do Scout MUST viver em SHACL e/ou contrato runtime.
4. E proibido tratar inferencia OWL como substituta de validacao de qualidade de dado.

## 7. Critico para Fase de Fusao

Bloquear importacao formal se:

1. Namespace canonico nao estiver aplicado.
2. Conceitos novos entrarem sem `canonical_id`.
3. Houver classe duplicada para mesmo conceito de dominio.

