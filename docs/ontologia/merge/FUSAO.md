# DIAGNÓSTICO DAS DUAS ONTOLOGIAS

| Critério | CEPRAEA | onthbpraia |
|---|---|---|
| Adequação ao PWA | Alta | Baixa/média, pois não conhece todo o runtime do CEPRAEA |
| Ontologia formal RDF/OWL | Fraca ou ausente | Forte |
| SHACL | Ausente no CEPRAEA atual | Presente |
| SPARQL / perguntas de competência | Ausente no CEPRAEA atual | Presente |
| Glossário controlado | Forte | Médio |
| Matriz de relações | Forte | Menor |
| Scout vivo | Forte no código do PWA | Parcial |
| Integração com Supabase | Forte | Ausente |
| Risco se prevalecer sozinha | Ficar “bonita” mas não executável | Quebrar contratos reais do PWA |

O CEPRAEA tem um manual explícito dizendo que Draw.io não é suficiente para ensinar a IA; a ontologia precisa virar lista de classes, atributos, relações, regras, exemplos, critérios, glossário, base de evidências e estrutura computável como JSON, RDF/OWL, banco ou grafo.  Isso valida o problema que você levantou: hoje há uma base conceitual forte, mas ainda falta formalização executável completa.

O `onthbpraia` já declara exatamente esse foco operacional: base documental, formalização RDF/OWL, validação SHACL, exemplos, consultas SPARQL, scripts e CI.  O `Makefile` executa parse TTL, SHACL em dataset válido, SHACL em dataset inválido esperado e consultas de competência.

# CORREÇÃO DO ANTERIOR

A auditoria anterior está correta, mas incompleta. O ajuste mais importante é este:

**não basta criar crosswalk + importar RDF/SHACL.**
Antes disso, o CEPRAEA precisa de uma **política formal de ontologia executável**, cobrindo namespace, identidade canônica, versionamento, breaking changes, consumo pela IA, dados históricos e performance.

Também há uma correção factual: existe workflow dedicado de ontologia no CEPRAEA e ele já executa a checagem documental/semântica e a validação formal RDF/SHACL/SPARQL quando o escopo formal é alterado. Logo, a lacuna não é “não existe workflow” nem “não existe validação formal no workflow”; a lacuna atual é “o gate formal completo ainda não está integrado ao `validate:mvp:v1` e o workflow ainda não executa o alinhamento runtime ↔ ontologia”.

# VEREDITO SOBRE A FUSÃO

A fusão **não deve ser feita por cópia direta** dos arquivos do `onthbpraia` para dentro do CEPRAEA.

A fusão correta é:

```text
CEPRAEA permanece como SSOT funcional do PWA.
onthbpraia fornece a camada formal executável.
```

Ou seja:

```text
CEPRAEA
├── contratos do PWA
├── Supabase
├── Scout runtime
├── codebooks
├── matriz de compatibilidade
├── testes de integração
└── + camada RDF/OWL/SHACL/SPARQL importada e adaptada do onthbpraia
```

A ontologia do CEPRAEA deve prevalecer nos nomes e códigos que já existem no produto, porque o PWA já usa `AT_POS`, `DEF_POS`, `TRANS_OF`, `TRANS_DEF`, tipos de finalização, resultados factuais, motivos de pontuação e codebooks. Esses tipos estão definidos no runtime do app.

Mas a disciplina de validação do `onthbpraia` deve prevalecer como padrão técnico, porque ele já tem RDF/OWL, SHACL, exemplos e SPARQL.

# IMPACTO PRINCIPAL DA FUSÃO

O impacto não é pequeno. A fusão mexe em quatro camadas:

1. Camada conceitual: glossário, matriz, fontes, manual.
2. Camada formal: RDF/OWL, SHACL, exemplos, SPARQL.
3. Camada runtime: TypeScript, matriz de compatibilidade, codebooks, Supabase.
4. Camada de governança: CI, validação local, regra de release e bloqueio de regressão.

O maior risco é criar uma ontologia formal que não corresponde ao comportamento real do Scout no CEPRAEA.

Hoje o PWA já tem uma matriz executável de Scout que define fases, categorias, ações, classificações, resultados permitidos/proibidos, campos condicionais e invariantes de persistência.

Também já existem testes que garantem que os fluxos de coleta ao vivo seguem a matriz semântica, têm ordem determinística, não duplicam campos, bloqueiam campos proibidos e preservam regras de persistência.

Portanto, se a fusão ignorar esses contratos, ela vai piorar o sistema.

# GAPS IDENTIFICADOS

1. **O CEPRAEA tem ontologia ampla, mas ainda não formalizada em RDF/OWL/SHACL.**

O manual do CEPRAEA já define camadas normativa, técnico-tática e desempenho, com conceitos como fases, sistemas, ações, carga, perfil, testes e desempenho.  Mas isso está em Markdown/matriz/Draw.io, não em OWL/SHACL executável.

2. **O `onthbpraia` tem formalização executável, mas é menor que a necessidade real do PWA.**

O core atual do `onthbpraia` cobre `PlayerParticipation`, `Goal`, `Throw`, `SpinShot`, `InFlightShot`, `SubstitutionEvent`, `MatchContext`, `DefensiveTransitionEvent`, `ShootOut`, `GoalkeeperAction`, sanções, posições ofensivas e papéis.  Isso é útil, mas não cobre toda a matriz real de Scout do CEPRAEA.

3. **Há divergência de nomenclatura que pode gerar quebra semântica.**

Exemplos críticos:

| CEPRAEA | onthbpraia | Risco |
|---|---|---|
| `SpinThrow` | `SpinShot` | duplicar giro como dois conceitos |
| `AerialThrow` | `InFlightShot` | duplicar aérea/in-flight |
| `GamePeriod` | `Period` | conflito em tempo de jogo |
| `ShootingAction` | `Throw` | misturar arremesso de finalização com tipo genérico |
| `ThrowType` | `Throw` | confundir reinício normativo com finalização |
| `AttackPhase` / `DefensePhase` | `DefensiveTransitionEvent` parcial | fases do PWA não mapeadas integralmente |
| `AT_POS`, `DEF_POS`, `TRANS_OF`, `TRANS_DEF` | classes OWL em inglês | risco de perder aderência ao código |

O próprio manual do CEPRAEA já alerta que nomes diferentes para o mesmo conceito não devem virar classes diferentes; devem ser resolvidos em conceito controlado.

4. **O CEPRAEA tem workflow dedicado de ontologia e validação formal, mas ainda não tem gate formal completo no MVP.**

O `package.json` tem `check:ontology:semantics`, `validate:ontology:formal` e `check:ontology:runtime-alignment`. O workflow `ontology-quality-gate` já executa a checagem documental/semântica e a validação formal RDF/SHACL/SPARQL quando o escopo exige.

A lacuna correta é dupla: o workflow ainda não executa `check:ontology:runtime-alignment`, e o gate final `validate-mvp-v1.sh` ainda não bloqueia regressão ontológica executável com os três comandos de ontologia.

5. **O script semântico do CEPRAEA valida consistência documental/visual, não executabilidade ontológica.**

O script confere manual, glossário, fontes, matriz e SVG; valida relações aceitas, fontes na matriz, conceitos no glossário, conceitos no SVG e arestas obrigatórias.   Isso é bom, mas não substitui SHACL, dataset inválido, SPARQL e validação de runtime.

6. **O PWA já tem regras de Scout mais específicas que a ontologia formal.**

O contrato de coleta ao vivo tem apenas três fluxos auditados no slice atual: `AT_POS.ARREMESSO.ARREMESSO`, `AT_POS.ARREMESSO.FINALIZACAO_6M_FAV` e `TRANS_OF.ARREMESSO.ARREMESSO`.  Ele também define campos principais, opcionais, derivados, proibidos, resultados permitidos e regras de pontuação.

O `onthbpraia` tem consultas de competência para equipe, shoot-out, especialista/playmaker, gols por zona e classificação técnica de arremesso, mas não cobre todos os fluxos vivos do CEPRAEA.

# DECISÃO DE PRECEDÊNCIA

A regra de prevalência deve ser esta:

| Camada | Deve prevalecer |
|---|---|
| Nome/código usado no PWA | CEPRAEA |
| Banco Supabase | CEPRAEA |
| Fluxo de Scout ao vivo | CEPRAEA |
| Matriz de compatibilidade runtime | CEPRAEA |
| Regra de validação formal RDF/OWL/SHACL | onthbpraia |
| Estrutura de CI ontológico | onthbpraia |
| Fonte normativa esportiva | IHF / fontes registradas |
| Fonte tático-científica | Registro de fontes do CEPRAEA + bibliografia validada |
| Decisões de domínio do treinador | CEPRAEA, desde que rastreadas e testadas |

Portanto: **não renomear o PWA para caber no `onthbpraia`; adaptar o formalismo do `onthbpraia` para validar o CEPRAEA.**

# AÇÕES NECESSÁRIAS PARA NÃO HAVER GAPS

**Ação 1 — Criar um mapa de equivalência antes de qualquer merge.**

Arquivo recomendado:

```text
docs/ontologia/merge/crosswalk-cepraea-onthbpraia.md
```

Formato mínimo:

```text
CEPRAEA canonical | onthbpraia term | decisão | ação
SpinThrow | SpinShot | mesmo conceito | CEPRAEA prevalece; onthbpraia vira alias/sameAs
AerialThrow | InFlightShot | mesmo conceito | CEPRAEA prevalece; onthbpraia vira alias/sameAs
GamePeriod | Period | equivalente parcial | mapear sem substituir
ShootingAction | Throw | não equivalente total | separar finalização vs reinício/tipo genérico
ThrowType | Throw | conflito | CEPRAEA ThrowType = reinício normativo; não fundir com finalização
```

Critério de aceite: nenhum termo duplicado entra em OWL sem decisão `ADOPT`, `ALIAS`, `DEPRECATE`, `SPLIT` ou `KEEP_SEPARATE`.

**Ação 2 — Criar camada formal dentro do CEPRAEA, não substituir a camada atual.**

Estrutura recomendada:

```text
ontology/
  core.ttl
  tactical.ttl
  scout.ttl
  performance.ttl
  mappings.ttl

shacl/
  core.shacl.ttl
  tactical.shacl.ttl
  scout.shacl.ttl
  runtime-alignment.shacl.ttl

examples/
  minimal-data.ttl
  invalid-data.ttl
  scout-live-valid.ttl
  scout-live-invalid.ttl

queries/competency/
  tests.json
  q*.rq
```

O `core.ttl` deve começar pelo que já é seguro do `onthbpraia`; `scout.ttl` deve ser derivado do runtime do CEPRAEA.

**Ação 3 — Separar “arremesso de finalização” de “tipo de reinício”.**

Este é um risco semântico alto. No CEPRAEA existem `ShootingAction`, `SpinThrow`, `AerialThrow`, `StandingThrow6m` e também `ThrowType`, `RefereeThrow`, `ThrowIn`, `GoalkeeperThrow`, `FreeThrow`, `SixMetreThrow`.

No `onthbpraia`, `Throw` está sendo usado como classe pai de `RegularThrow`, `SpinShot`, `InFlightShot`, `SpecialistShot` e `GoalkeeperShot`.

Isso precisa ser normalizado. Sugestão:

```text
bh:ShootingAction
  bh:RegularShot
  bh:SpinThrow
  bh:AerialThrow
  bh:StandingThrow6m

bh:RestartThrowType
  bh:RefereeThrow
  bh:ThrowIn
  bh:GoalkeeperThrow
  bh:FreeThrow
  bh:SixMetreThrow
```

**Ação 4 — Transformar a matriz de compatibilidade do PWA em SHACL.**

O CEPRAEA já tem uma matriz TypeScript que diz o que é permitido por fase, categoria, ação, classificação, resultado e campo.

Essa matriz deve gerar ou alimentar `shacl/scout.shacl.ttl`.

Critério de aceite: se o TypeScript proíbe `DEF_POS + PASSE`, o SHACL também deve reprovar um exemplo RDF com essa combinação.

**Ação 5 — Não deixar a ontologia contradizer os contratos vivos de Scout.**

O contrato vivo diz que o fluxo `AT_POS.ARREMESSO.ARREMESSO` não deve mostrar `estruturaTransicaoCode` nem `classificacaoAcaoCode`; aceita `SIMPLES`, `GIRO`, `AEREA`; permite `PASSIVO`; e não exige `tipoFinalizacaoCode` quando o resultado é `PASSIVO`.

Essas regras precisam virar SHACL e SPARQL, não apenas permanecer em testes TypeScript.

**Ação 6 — Criar gate de alinhamento Ontologia ↔ Runtime.**

Novo script recomendado:

```text
scripts/check-ontology-runtime-alignment.mjs
```

Ele deve comparar:

```text
src/types/index.ts
src/features/scout/domain/liveCollectionCompatibility.matrix.ts
src/features/scout/domain/liveCollectionFlow.contract.ts
ontology/*.ttl
shacl/*.ttl
examples/*.ttl
queries/competency/tests.json
```

Critérios mínimos:

```text
- Todo ScoutPhaseCode tem classe/mapeamento ontológico.
- Todo ScoutFinishTypeCode tem classe/mapeamento ontológico.
- Todo ScoutFactualResultCode tem indivíduo ou classe controlada.
- Toda ação permitida na matriz TypeScript existe no scout.ttl.
- Todo forbiddenResult no TypeScript tem exemplo inválido correspondente.
- Todo fluxo auditado tem uma pergunta de competência SPARQL.
```

**Ação 7 — Integrar ontologia ao gate final do MVP.**

O script `validate-mvp-v1.sh` precisa incluir:

```bash
npm run check:ontology:semantics
npm run validate:ontology:formal
npm run check:ontology:runtime-alignment
```

Hoje isso não acontece.

**Ação 8 — Criar validação formal inspirada no `onthbpraia`.**

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "validate:ontology:formal": "bash scripts/validate-ontology-formal.sh",
    "check:ontology:runtime-alignment": "node scripts/check-ontology-runtime-alignment.mjs"
  }
}
```

E criar:

```text
scripts/validate-ontology-formal.sh
```

Com lógica equivalente ao `Makefile` do `onthbpraia`: parse TTL, SHACL com dataset válido, SHACL com dataset inválido e SPARQL.

**Ação 9 — Não mexer em Supabase na primeira PR da fusão.**

A primeira PR deve ser documental/formal, sem migration. Motivo: o PWA já tem migrations de Scout e testes de integração sensíveis. A migration `0026_scout_matriz_semantica.sql` adiciona campos, checks, codebooks e mapas de campo para `scout_live_entries`.

Alterar isso junto com a ontologia aumenta risco de quebra.

**Ação 10 — Manter os testes Supabase como evidência de funcionamento real.**

O CEPRAEA já testa fluxo completo `COLETA_AO_VIVO → revisão vídeo → COLETA_SCOUT`, criação de participações, status de validação e relatório apenas com dados validados.  Isso deve permanecer como prova de que a ontologia não é só bonita: ela precisa proteger esse fluxo.

# PLANO V2 — AJUSTADO

**PR 1 — Política de fusão ontológica e crosswalk**

Escopo permitido:

```text
docs/ontologia/merge/AUDITORIA_FUSAO_ONTOLOGIAS.md
docs/ontologia/merge/crosswalk-cepraea-onthbpraia.md
docs/ontologia/merge/politica-namespace-versionamento.md
docs/ontologia/merge/politica-breaking-changes.md
docs/ontologia/merge/contrato-consumo-ia.md
```

Critérios obrigatórios:

```text
1. Definir namespace/IRI final.
2. Definir prefixo canônico: ex. cepr:, bh:, ou outro.
3. Definir política de versão da ontologia.
4. Separar ID canônico de label/sinônimo.
5. Definir regra de depreciação formal.
6. Definir diferença entre OWL/Open World e SHACL/Closed World.
7. Definir governança de breaking changes.
8. Definir contrato de consumo da IA.
9. Criar matriz de equivalência CEPRAEA ↔ onthbpraia.
10. Não alterar runtime, Supabase ou UI.
```

**PR 2 — Importar camada formal mínima**

Escopo:

```text
ontology/
shacl/
examples/
queries/competency/
scripts/validate-ontology-formal.sh
```

Mas com adaptação ao CEPRAEA, não cópia direta.

Critério de bloqueio:

```text
SpinShot não pode coexistir como conceito separado de SpinThrow.
InFlightShot não pode coexistir como conceito separado de AerialThrow.
Throw não pode misturar finalização ofensiva com reinício normativo.
```

**PR 3 — Gate de alinhamento runtime ↔ ontologia**

Criar:

```text
scripts/check-ontology-runtime-alignment.mjs
```

Esse script deve comparar:

```text
src/types/index.ts
src/features/scout/domain/liveCollectionCompatibility.matrix.ts
src/features/scout/domain/liveCollectionFlow.contract.ts
ontology/*.ttl
shacl/*.ttl
queries/competency/tests.json
```

Critério mínimo:

```text
Todo ScoutPhaseCode tem representação ontológica.
Todo ScoutFinishTypeCode tem representação ontológica.
Todo ScoutFactualResultCode tem representação ontológica.
Todo fluxo auditado tem SHACL + exemplo válido + exemplo inválido + SPARQL.
Nenhuma regra SHACL contradiz a matriz TypeScript.
```

**PR 4 — Golden dataset real do Scout**

Este item é crítico e faltou na auditoria anterior.

Não basta validar exemplos sintéticos. Criar:

```text
examples/golden/scout-live-real-valid.ttl
examples/golden/scout-live-real-invalid.ttl
```

Fonte: jogadas reais ou fixtures equivalentes já usadas nos testes Supabase.

Critério:

```text
1. O dataset válido representa o fluxo real COLETA_AO_VIVO → revisão vídeo → COLETA_SCOUT.
2. O dataset inválido representa erros reais que o PWA precisa bloquear.
3. O SHACL reprova o inválido.
4. SPARQL responde perguntas de competência ligadas ao runtime.
```

**PR 5 — Política de dados históricos**

Antes de endurecer SHACL, definir:

```text
docs/ontologia/merge/politica-migracao-historica.md
```

Perguntas obrigatórias:

```text
O que fazer com scout_live_entries antigas fora do novo SHACL?
Elas serão migradas, marcadas como legacy, ou aceitas por profile separado?
Qual profile valida dado novo?
Qual profile valida dado histórico?
O relatório usa apenas dados VALIDADO?
Como evitar quebrar produção?
```

**PR 6 — Gate final do MVP**

Atualizar `validate:mvp:v1` para incluir:

```bash
npm run check:ontology:semantics
npm run validate:ontology:formal
npm run check:ontology:runtime-alignment
```

# DECISÃO DE ARQUITETURA FINAL

A fusão deve seguir esta regra:

```text
CEPRAEA manda no produto.
onthbpraia manda no padrão de formalização executável.
IHF/artigos/fontes especialistas mandam na evidência.
SHACL manda na validação fechada.
OWL não deve ser tratado como validador fechado.
```

# PONTO MAIS IMPORTANTE

A ontologia do CEPRAEA só deixará de ser “bonita” quando existir esta cadeia completa:

```text
conceito canônico
→ fonte
→ decisão de domínio
→ IRI estável
→ OWL/RDF
→ SHACL
→ exemplo válido
→ exemplo inválido
→ SPARQL
→ teste CI
→ alinhamento com runtime
→ golden dataset real
→ política de dados históricos
```

# CRITÉRIOS DE BLOQUEIO

A fusão deve ser bloqueada se qualquer item abaixo ocorrer:

```text
1. Criar classe nova para conceito que já existe no CEPRAEA.
2. Renomear código usado no PWA sem migration e teste.
3. Trocar AT_POS/DEF_POS/TRANS_OF/TRANS_DEF por nomes abstratos sem mapping.
4. Misturar arremesso de finalização com reinício normativo.
5. Importar SpinShot e manter SpinThrow como conceito separado.
6. Importar InFlightShot e manter AerialThrow como conceito separado.
7. Criar SHACL que contradiz liveCollectionCompatibility.matrix.ts.
8. Criar ontologia que não valida dataset inválido.
9. Não incluir validação ontológica no MVP gate.
10. Alterar Supabase antes de estabilizar o crosswalk.
```

# O QUE PREVALECE

Para o funcionamento do PWA do CEPRAEA, deve prevalecer esta hierarquia:

```text
1. Contratos runtime do CEPRAEA
2. Supabase/migrations/testes do CEPRAEA
3. Matriz de compatibilidade do Scout
4. Glossário/matriz/fontes do CEPRAEA
5. Formalização RDF/OWL/SHACL importada/adaptada do onthbpraia
```

Não é porque o `onthbpraia` está mais formal que ele deve mandar nos códigos do PWA. Ele deve fornecer o método executável. O CEPRAEA deve fornecer o significado operacional do produto.

# PRÓXIMA AÇÃO SEGURA

A próxima ação segura do Plano V2 é fechar a **política de dados históricos** antes de endurecer SHACL adicional, expandir o gate de alinhamento runtime ↔ ontologia ou promover os gates para o MVP final.

Escopo recomendado:

```text
docs/ontologia/merge/politica-migracao-historica.md
```

Critério de aceite:

```text
- Definir o tratamento de scout_live_entries antigas fora do novo SHACL.
- Definir se dados históricos serão migrados, marcados como legacy ou aceitos por profile separado.
- Definir o profile para dado novo.
- Definir o profile para dado histórico.
- Confirmar que relatórios usam apenas dados VALIDADO quando aplicável.
- Documentar como evitar quebra de produção.
- Não alterar Supabase, runtime, UI ou migrations nessa PR.
```

# CONCLUSÃO

A fusão é necessária, mas deve ser feita como **fusão controlada por precedência**, não como merge de conteúdo.

O CEPRAEA tem a ontologia mais adequada às necessidades do PWA. O `onthbpraia` tem a engenharia mais adequada para tornar a ontologia executável. A fusão correta é transformar a ontologia do CEPRAEA em RDF/OWL/SHACL/SPARQL usando o padrão técnico do `onthbpraia`, sem quebrar os contratos reais do Scout, Supabase e UI já implementados.

O diagnóstico central permanece: **CEPRAEA deve prevalecer como SSOT funcional do PWA**, e `onthbpraia` deve entrar como **camada formal executável RDF/OWL/SHACL/SPARQL**, via crosswalk, sem substituir os contratos vivos do Scout.

---
