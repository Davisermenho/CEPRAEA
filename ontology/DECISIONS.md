# Ontology Unification Decisions

## CEPR-ONTOLOGY-UNIFICATION-PHASE2
Date: 2026-06-01
Status: Approved

### Decision 1: Single canonical direction
The ontology must converge to a single canonical root: `ontology/`.

### Decision 2: Runtime precedence
For executable behavior, precedence is:
1. CEPRAEA runtime contracts and codebooks.
2. Formal ontology constraints (TTL/SHACL/SPARQL).
3. Historical/reference materials.

### Decision 3: No ad-hoc imports
No direct copy from `onthbpraia/` to runtime ontology paths is allowed without a crosswalk entry (`ADOPT`, `ALIAS`, `SPLIT`, `DEPRECATE`).

### Decision 4: Path regression guard
New ontology-related files must not be introduced outside approved roots during migration.

### Decision 5: Transitional structure
Phase 2 completed the physical migration of executable ontology assets and canonical docs into `ontology/`.
Current canonical paths are now:
- `ontology/core.ttl`
- `ontology/shacl/`
- `ontology/examples/`
- `ontology/queries/competency/`
- `ontology/docs/manuais/`
- `ontology/docs/merge/`

`onthbpraia/`, `docs/ontologia/artigos/` and `docs/ontologia/triagens/` remain transitional and must not receive new canonical assets.

### Decision 6: Crosswalk gate for formal assets
Any new ontology formal asset (`*.ttl`, `*.shacl*`, `*.rq`) requires an approved line in:
- `ontology/migration/crosswalk-cepr-bh.md`

Merge must be blocked when the crosswalk is missing, not approved, or does not cover the new asset with decision in `ADOPT|ALIAS|SPLIT|DEPRECATE`.

## Operational Rules

1. Any PR touching ontology must run:
- `npm run check:ontology:paths`
- `npm run check:ontology:semantics`
- `npm run validate:ontology:formal`
- `npm run check:ontology:runtime-alignment`

2. Any new namespace/entity affecting Scout runtime must prove alignment with:
- `src/types/index.ts`
- `src/features/scout/domain/liveCollectionCompatibility.matrix.ts`
- `src/features/scout/domain/liveCollectionFlow.contract.ts`

3. Merge is blocked if ontology guard detects out-of-scope path additions.
