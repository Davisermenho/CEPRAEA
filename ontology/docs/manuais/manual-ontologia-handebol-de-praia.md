---
role: knowledge-manual
domain: beach-handball-ontology
authority: primary
applies-to: [agent, developer, coach]
version: 0.1-draft
status: draft
---

# Manual de criação e manutenção da Ontologia do Handebol de Praia

Para utilizar artigos científicos e regras da IHF para construir a ontologia do
handebol de praia, o processo deve ser rigoroso e estruturado.

O fluxo correto é:

> Artigo científico ou regra da IHF → extração dos conceitos → comparação com a
> ontologia atual → decisão: criar novo conceito, enriquecer conceito existente
> ou apenas registrar evidência → atualização do Draw.io → manutenção de uma
> versão mestre da ontologia.

---

## 1. Atualização do Draw.io: Ontologia do Handebol de Praia

### Refazer o diagrama ou acrescentar?

**Acrescentar ao desenho já montado.**

Uma **nova versão completa** só deve ser feita em três situações:

1. quando a estrutura atual estiver muito confusa;
2. quando muitos conceitos tiverem sido colocados no lugar errado;
3. quando uma nova fonte obrigar a reorganizar a hierarquia principal.

Fora isso, o correto é atualizar por blocos. Por exemplo:

- Um artigo sobre ações defensivas: **MUST** atualizar o bloco `DefensiveTechnicalTacticalAction`.
- Um artigo sobre sistemas ofensivos: **MUST** atualizar `OffensiveSystem`.
- Uma regra da IHF sobre shoot-out: **MUST** atualizar a camada normativa, não a técnico-tática.
- Um artigo sobre carga física: **MUST** atualizar `LoadMonitoringDomain`.
- Um artigo sobre especialista: **MUST** atualizar `SpecialistRole`, `NumericalAsymmetry` e suas relações com ataque/defesa.

O que **MUST NOT** acontecer é criar, toda vez, uma nova classe com nome diferente para o mesmo conceito. Por exemplo:

- `Specialist`
- `SpecialistPlayer`
- `ExpertPlayer`
- `GoalkeeperLine`
- `FourthAttacker`

Esses nomes podem aparecer em artigos diferentes, mas na ontologia precisam ser resolvidos em um conceito controlado — por exemplo: `SpecialistRole` ou `GoalkeeperLineAttack`, dependendo do significado.

> Para a especificação técnica do formato do arquivo e o processo de geração programática, ver **§13**.
> Para a lista completa de conceitos e relações que o diagrama deve conter, ver **§14**.

---

## 2. Versionamento controlado

O método correto do projeto **MUST** ser: manter um documento principal da ontologia e ir criando versões controladas.

| Versão | Escopo |
|--------|--------|
| v0.1 | Estrutura normativa |
| v0.2 | Camada técnico-tática |
| v0.3 | Sistemas defensivos |
| v0.4 | Ações ofensivas |
| v0.5 | Desempenho e carga |
| v1.0 | Ontologia consolidada |

Mesmo quando for necessário criar uma nova versão no Draw.io, ela deve ser tratada como evolução da versão anterior, não como um recomeço.

---

## 3. O Draw.io é suficiente para ensinar a IA?

Não. O Draw.io é excelente para **visualizar** a estrutura conceitual. Ele ajuda treinadores, analistas e desenvolvedores a entenderem o modelo. Mas para usar isso em um sistema com IA, é necessário transformar a ontologia visual em uma estrutura mais operacional:

- lista de classes;
- atributos;
- relações;
- regras;
- exemplos;
- critérios de classificação;
- glossário controlado;
- base de evidências;
- estrutura computável: JSON, RDF/OWL, banco de dados ou grafo de conhecimento.

O Draw.io é a **fase de modelagem visual**. Depois, essa ontologia precisa virar uma **base computável**.

---

## 4. O que deve entrar na Ontologia do Handebol de Praia?

Deve entrar tudo que for um conceito **estável e reutilizável** para explicar, analisar ou ensinar o jogo.

### Camada normativa

- regras da IHF; quadra; bola; equipe; substituição; goleiro; área de gol;
- tempo de jogo; sets; golden goal; shoot-out; punições; tiros; pontuação;
- oficiais; uniformes; equipamentos.

### Camada técnico-tática

- ataque; defesa; transição; contra-ataque; retorno defensivo;
- assimetria numérica; especialista;
- superioridade ofensiva 4x3; inferioridade defensiva 3x4;
- sistemas ofensivos; sistemas defensivos;
- ações técnico-táticas; tomada de decisão;
- finalizações de 1 e 2 pontos.

### Camada de desempenho

- perfil do atleta; categoria; sexo; nível competitivo;
- velocidade de arremesso; arremesso de 6m; arremesso em giro; arremesso aéreo;
- aceleração; sprint; salto horizontal; força de preensão;
- carga interna; carga externa.

---

## 5. O que não deve entrar como classe nova?

Nem tudo que aparece em um artigo deve virar classe. Algumas coisas devem virar atributo, regra, evidência ou observação.

**Exemplo — relação, não classe:**

> "O especialista influencia a escolha do sistema ofensivo."

Isso **não** deve virar uma classe `InfluenceOfSpecialist`. O correto é uma relação:

```
SpecialistRole influences OffensiveSystem
```

**Exemplo — atributo, não classe:**

> "A defesa 3:0 é muito usada no início e no fim da fase defensiva."

Isso deve virar atributo ou nota em `Defense3_0`:

```
Defense3_0
  +usageContext = beginning/end of defensive phase
  +protectsCentralZone
  +inducesSideShot
```

A estrutura defensiva é hierárquica: assimetria numérica → sistemas defensivos → ações técnico-táticas. Esses três níveis **MUST** ser preservados, sem misturar tudo no mesmo bloco.

---

## 6. O maior risco do projeto

O maior risco é a ontologia virar uma coleção de palavras soltas.

Uma lista como: *ataque, defesa, especialista, cobertura, bloqueio, giro, aéreo, sistema 3:0* não é ontologia — é **glossário**.

Vira ontologia quando se define:

- o que é cada conceito;
- em que camada ele fica;
- quais atributos possui;
- com quais conceitos se relaciona;
- quais conceitos são subclasses;
- quais conceitos não podem ser confundidos;
- quais evidências científicas sustentam aquele conceito;
- como ele será usado pelo sistema.

---

## 7. Os quatro artefatos do projeto

Para o sistema de IA, **MUST** manter quatro artefatos em paralelo:

| Artefato | Arquivo | Finalidade |
|----------|---------|------------|
| **Draw.io** | `docs/design/navegacao.drawio.svg` | Visualização do grafo da ontologia |
| **Glossário ontológico controlado** | [`docs/ontologia/glossario-ontologico-controlado.md`](glossario-ontologico-controlado.md) | Vocabulário controlado: conceito, definição, camada, sinônimos, fonte, relações |
| **Matriz de relações** | [`docs/ontologia/matriz-relacoes.md`](matriz-relacoes.md) | Todas as arestas do grafo: origem → tipo → destino, com fonte e camada |
| **Registro de fontes** | [`docs/ontologia/registro-fontes.md`](registro-fontes.md) | Rastreabilidade: qual artigo ou regra sustenta cada conceito |

> Sem exemplos, a IA entende a teoria, mas pode errar ao aplicar no jogo real.

> **MUST**: os três arquivos acima devem ser atualizados **antes** de qualquer mudança no Draw.io.
> O Draw.io reflete o que está nos arquivos, não o contrário.

> Para os requisitos técnicos do arquivo `navegacao.drawio.svg` e sua validação, ver **§13**.
> Para a estrutura canônica completa do diagrama, ver **§14**.

---

## 8. Conclusão: o caminho correto

Este é o caminho correto para o objetivo: usar artigos científicos, regras da IHF e conhecimento técnico para construir uma ontologia do handebol de praia que depois servirá como base para ensinar uma IA.

O caminho correto **não** é apenas "desenhar diagramas". É:

> Construir uma ontologia versionada, sem duplicatas, com conceitos controlados,
> relações claras, fontes rastreáveis — e depois transformar isso em estrutura
> computável para o sistema.

---

## 9. Protocolo obrigatório para cada novo artigo

**Regra central:** nenhum conceito novo entra no Draw.io antes de passar por triagem ontológica.

### Passo 0 — Preparar o arquivo fonte (PDF)

Se a fonte for um arquivo PDF, convertê-lo para Markdown antes de prosseguir.
Arquivos PDF não são legíveis diretamente pelo protocolo de extração de conceitos.

**Pré-requisito:** ter o ambiente virtual ativado (`source .venv/bin/activate`).

```bash
# PDF com camada de texto (artigos digitais): conversão direta
python3 scripts/pdf2md.py "docs/ontologia/artigos/NOME_DO_ARQUIVO.pdf" \
    --out docs/ontologia/

# PDF de imagens (slides exportados, PDF escaneado): OCR automático
# O script detecta páginas sem texto e aplica OCR com easyocr automaticamente.
python3 scripts/pdf2md.py "docs/ontologia/artigos/NOME_DO_ARQUIVO.pdf" \
    --out docs/ontologia/ --lang en

# Para artigos bilíngues (inglês + português):
python3 scripts/pdf2md.py "docs/ontologia/artigos/NOME_DO_ARQUIVO.pdf" \
    --out docs/ontologia/ --lang en+pt

# O script gera:
#   docs/ontologia/NOME_DO_ARQUIVO.md   ← texto para leitura (com marcador [OCR] quando aplicado)
#   docs/ontologia/images/NOME/         ← imagens extraídas (se houver)
```

**Como o OCR funciona:** o script verifica cada página. Se a página não tiver
camada de texto (PDFs de apresentações, PDFs escaneados), renderiza a página
como imagem e executa OCR via `easyocr` (Python, sem dependências de sistema).
Na primeira execução os modelos são baixados (~500 MB) e armazenados em cache.
Execuções seguintes são rápidas.

**Idioma padrão:** `--lang en` (inglês). Use `--lang pt` para português,
`--lang en+pt` para bilíngue. O artigo *2-point goals* usa `--lang en`.

**Critério de qualidade:** verificar se o texto extraído é legível. Páginas
processadas por OCR são marcadas com `> *[OCR - en]*` no `.md` gerado.
Em PDFs com layouts muito complexos (setas, sobreposições, tabelas), o OCR
pode produzir ruído — revisar antes de prosseguir para o Passo 1.

**Bloqueio por OCR é exceção:** só registrar bloqueio no `registro-fontes.md`
se o PDF for de qualidade tão baixa que mesmo o OCR não produza texto legível.

**Saída esperada:** arquivo `.md` com o texto completo (extraído diretamente
ou via OCR), pronto para o Passo 1.

---

### Passo 1 — Identificar a fonte

Registrar obrigatoriamente:

- nome do arquivo;
- título do artigo;
- autores;
- ano;
- tema principal;
- tipo de conteúdo: `regra` | `tática-ofensiva` | `tática-defensiva` | `técnica` | `desempenho` | `carga` | `pedagogia` | `análise-de-jogo`.

**Exemplo:**

```
Fonte: artigo sobre fase defensiva
Tipo: tática-defensiva
Camada provável: técnico-tática
Bloco provável: DefensiveDomain
```

### Passo 2 — Extrair conceitos candidatos

Separar o que o artigo traz em quatro tipos:

| Tipo | O que significa | Exemplo |
|------|-----------------|---------|
| Classe | conceito estável | `DefensiveSystem` |
| Subclasse | tipo específico de conceito | `Defense3_0` |
| Atributo | característica de uma classe | `+depth = low` |
| Relação | ligação entre conceitos | `NumericalAsymmetry influences DefensiveSystem` |
| Evidência | informação que sustenta algo já existente | `"treinadores relatam que a assimetria numérica estrutura a defesa"` |

Isso impede que tudo vire classe e deixe o diagrama poluído.

### Passo 3 — Verificar se já existe

Perguntas obrigatórias antes de criar qualquer conceito:

- [ ] Esse conceito já existe com outro nome?
- [ ] Ele é realmente novo?
- [ ] Ele é uma subclasse de algo que já existe?
- [ ] Ele deveria ser apenas atributo?
- [ ] Ele deveria ser apenas uma relação?
- [ ] Ele pertence à camada normativa, técnico-tática ou desempenho?
- [ ] Ele contradiz algo que já está no modelo?
- [ ] Ele é específico do handebol de praia ou veio do handebol de quadra?

**Exemplo de resolução de duplicatas:**

Se um artigo falar em *goleiro-linha*, *especialista* e *quarto jogador de ataque*, **MUST NOT** criar três classes diferentes. Resolver assim:

```
SpecialistRole
  sinônimos: goleiro-linha, quarto jogador ofensivo, specialist, expert player
  relação: SpecialistRole causes NumericalAsymmetry
```

### Passo 4 — Classificar a entrada

Cada item **MUST** receber uma das seguintes decisões:

- `ADICIONAR_CLASSE` — conceito novo e estável
- `ADICIONAR_SUBCLASSE` — tipo específico de conceito existente
- `ADICIONAR_ATRIBUTO` — característica de classe existente
- `ADICIONAR_RELACAO` — ligação entre conceitos existentes
- `ADICIONAR_EVIDENCIA` — reforço de conceito já presente
- `REJEITAR_DUPLICATA` — nome diferente para conceito que já existe
- `REJEITAR_GENERICO` — muito amplo, não específico do jogo
- `REJEITAR_QUADRA` — pertence ao handebol de quadra, não de praia

### Passo 5 — Atualizar apenas o bloco necessário

Após a triagem, o Draw.io **MUST** ser atualizado por bloco:

| Tipo de artigo | Bloco a atualizar |
|---------------|-------------------|
| Defesa | `DefensiveDomain` |
| Ataque posicionado | `OffensiveDomain` |
| Regra da IHF | camada normativa |
| Arremesso | `ShootingAction`, `SpecificTechnicalSkill` |
| Carga | `LoadMonitoringDomain` |
| Seleção de talentos | `PlayerPerformanceDomain` |

**MUST NOT** redesenhar tudo sem necessidade.

> Para a geração e validação técnica do arquivo SVG, consultar obrigatoriamente **§13**.
> Para a lista canônica de conceitos que devem estar no diagrama, ver **§14**.

### Passo 6 — Registrar a fonte do conceito

Cada conceito importante **MUST** ter rastreabilidade. Exemplo:

```
NumericalAsymmetry
  definição: diferença numérica provocada pela utilização do especialista no ataque.
  fonte: artigo sobre ataque posicionado; artigo sobre fase defensiva.
  relações:
    NumericalAsymmetry structures OffensiveDomain
    NumericalAsymmetry structures DefensiveDomain
    SpecialistRole causes NumericalAsymmetry
```

---

## 10. Comando padrão de submissão de artigo

Use sempre este formato ao enviar um novo artigo ao agente:

```
Leia o artigo anexado e aplique o protocolo da Ontologia do Handebol de Praia.
Primeiro extraia os conceitos candidatos, depois classifique cada um como
classe, atributo, relação ou evidência. Verifique duplicidades com a ontologia
atual. Só depois atualize o Draw.io no bloco correto.
```

---

## 11. Tabela de triagem — entrega obrigatória antes do Draw.io

Antes de mexer no Draw.io, **MUST** entregar esta tabela:

| Conceito extraído | Fonte | Decisão | Onde entra | Justificativa |
|-------------------|-------|---------|------------|---------------|
| Assimetria numérica | artigo X | `ADICIONAR_EVIDENCIA` | `NumericalAsymmetry` | já existe, apenas reforça evidência |
| Defesa 0:3 | artigo X | `ADICIONAR_SUBCLASSE` | `DefensiveSystem` | sistema defensivo ainda não representado |
| Cobertura | artigo X | `ADICIONAR_ATRIBUTO` | `DefensiveTechnicalTacticalAction` | já existe, acrescentar atributo |
| Especialista | artigo X | `REJEITAR_DUPLICATA` | `SpecialistRole` | evitar duplicata |

Depois disso, a atualização no Draw.io fica segura e rastreável.

---

## 12. Regra principal do projeto

> **Nenhum conceito novo entra no Draw.io sem triagem ontológica documentada.**
>
> Toda atualização deve ser precedida pela tabela de triagem (seção 11).
> Toda classe deve ter definição, camada, fonte e relações registradas.
> Toda duplicata deve ser resolvida antes de virar entrada no diagrama.

---

## 13. Especificação técnica do arquivo `navegacao.drawio.svg`

### 13.1 Por que esta seção existe

A extensão **Draw.io Integration** do VS Code (`hediet.vscode-drawio`) exige um
formato específico de SVG que difere do SVG padrão. Um arquivo gerado com a
estrutura errada abre sem erro no navegador, mas **falha silenciosamente** na
extensão, exibindo:

- *"Não é um ficheiro de diagrama"*
- *"Cannot read properties of null (reading 'getAttribute')"*

Qualquer agente ou desenvolvedor que gere ou atualize o arquivo **MUST** seguir
as regras desta seção.

### 13.2 Formato obrigatório do arquivo

O arquivo `navegacao.drawio.svg` **MUST** ter a seguinte estrutura:

```xml
<svg host="app.diagrams.net"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     version="1.1"
     width="<largura>"
     height="<altura>"
     viewBox="0 0 <largura> <altura>"
     content="&lt;mxfile host=&quot;app.diagrams.net&quot; version=&quot;...&quot; type=&quot;embed&quot;&gt;
              &lt;diagram id=&quot;...&quot; name=&quot;Ontologia Handebol de Praia&quot;&gt;
              &lt;mxGraphModel ...&gt;...&lt;/mxGraphModel&gt;
              &lt;/diagram&gt;&lt;/mxfile&gt;">
  <defs/>
  <g>
    <!-- elementos visuais SVG renderizados -->
  </g>
</svg>
```

**Regras obrigatórias:**

| Regra | Requisito |
|-------|-----------|
| `host="app.diagrams.net"` | **MUST** estar presente no elemento `<svg>` — sem ele, a extensão rejeita o arquivo |
| `content="..."` | **MUST** conter o XML do `mxfile` (com `diagram` e `mxGraphModel`) com HTML encoding completo |
| Wrapper obrigatório | **MUST** usar `<mxfile><diagram name="...">` — sem ele o Draw.io cria duas abas "Página 1" |
| HTML encoding | Todos os `<` → `&lt;`, todos os `>` → `&gt;`, todas as `"` → `&quot;` |
| Comentário HTML | **MUST NOT** colocar o XML em `<!-- comentário -->` — a extensão ignora comentários HTML |
| Formato legado | **MUST NOT** usar o padrão `<!-- [draw.io] <mxGraphModel...> -->` — incompatível com VS Code |

### 13.3 Restrição de escrita no ambiente WSL

No ambiente WSL deste projeto, as ferramentas de escrita de arquivos dos
assistentes de IA (`create_file`, `replace_string_in_file`,
`multi_replace_string_in_file`) **não funcionam corretamente** — reportam
sucesso mas não alteram o filesystem real.

**Regra obrigatória:** toda geração ou atualização do arquivo
`navegacao.drawio.svg` **MUST** ser feita via script Python executado no
terminal:

```bash
python3 /tmp/gerar_drawio.py
```

**MUST NOT** usar `create_file` ou `replace_string_in_file` para este arquivo.

### 13.4 Script de geração — estrutura obrigatória

O arquivo **MUST** ser gerado com um script Python que use `html.escape()` para
codificar o XML no atributo `content=`. Estrutura mínima obrigatória:

```python
import xml.etree.ElementTree as ET
import html as html_module

# 1. Construir o mxGraphModel como string XML
xml_str = '<mxGraphModel><root>...</root></mxGraphModel>'

# 2. HTML-encode para uso no atributo content=
encoded_xml = html_module.escape(xml_str)

# 3. Envolver em mxfile→diagram (OBRIGATÓRIO — evita "duas abas Página 1")
mxfile_xml = (
    f'<mxfile host="app.diagrams.net" version="24.5.0" type="embed">'
    f'<diagram id="diagrama-1" name="Ontologia Handebol de Praia">'
    f'{xml_str}'
    f'</diagram></mxfile>'
)
encoded_xml = html_module.escape(mxfile_xml)

# 4. Montar o SVG com os atributos obrigatórios
svg = (
    f'<svg host="app.diagrams.net" xmlns="http://www.w3.org/2000/svg" '
    f'version="1.1" width="1600" height="900" viewBox="0 0 1600 900" '
    f'content="{encoded_xml}">'
    f'<defs/><g></g></svg>'
)

# 5. Escrever via terminal (obrigatório no ambiente WSL)
with open('/home/davis/cepraea-pwa/docs/design/navegacao.drawio.svg', 'w', encoding='utf-8') as f:
    f.write(svg)
```

### 13.5 Checklist de validação pós-geração

Após gerar o arquivo, **MUST** executar e confirmar todos os itens:

```bash
# 1. Verificar presença do atributo host=
grep -c 'host="app.diagrams.net"' docs/design/navegacao.drawio.svg
# Esperado: 1

# 2. Verificar presença do content= com wrapper mxfile
grep -c 'content="&lt;mxfile' docs/design/navegacao.drawio.svg
# Esperado: 1  (content começa com &lt;mxfile host=... &gt;&lt;diagram...&gt;&lt;mxGraphModel)

# 3. Confirmar ausência do formato legado (comentário HTML)
grep -c '\[draw\.io\]' docs/design/navegacao.drawio.svg
# Esperado: 0

# 4. Verificar tamanho mínimo do arquivo
wc -c docs/design/navegacao.drawio.svg
# Esperado: > 10000 bytes para diagrama completo

# 5. Contar vértices registrados
grep -o ' vertex=' docs/design/navegacao.drawio.svg | wc -l
# Esperado: >= 40 para diagrama completo (ver §14)
# Nota: encoding correto é vertex= (sem aspas) no SVG HTML-encoded
```

**Checklist resumido:**

- [ ] `host="app.diagrams.net"` presente no `<svg>`
- [ ] `content="&lt;mxfile` presente com wrapper `&lt;diagram&gt;&lt;mxGraphModel` (XML HTML-encoded)
- [ ] XML **não** está em comentário HTML `<!-- -->`
- [ ] Arquivo ≥ 10 KB
- [ ] Contagem de vértices ≥ 40
- [ ] Arquivo abre sem erro na extensão Draw.io Integration do VS Code

---

## 14. Estrutura canônica do diagrama da ontologia

Esta seção define o estado completo e esperado do diagrama, derivado diretamente
do `glossario-ontologico-controlado.md` e da `matriz-relacoes.md`. Um agente que
regenerar ou atualizar o arquivo **MUST** garantir que todos os elementos abaixo
estejam presentes. **Os nomes aqui listados são os nomes canônicos** — o
diagrama deve usar exatamente estes nomes.

### 14.1 Bandas obrigatórias

O diagrama **MUST** conter três bandas horizontais separadas visualmente:

| Banda | Cor sugerida | Conteúdo principal |
|-------|--------------|--------------------|
| `NORMATIVA` | azul `#dae8fc` | Regras IHF, categorias etárias, superfície, papéis especializados |
| `TÉCNICO-TÁTICA` | verde `#d5e8d4` | Domínios defensivo e ofensivo, fases do jogo, sistemas, ações, meios, arremessos |
| `DESEMPENHO` | laranja `#ffe6cc` | Perfil do atleta, carga, nível de desempenho, seleção de talentos, testes físicos |

### 14.2 Vértices obrigatórios por banda

#### Banda NORMATIVA

| Conceito | Tipo | Parent / Observação |
|---------|------|---------------------|
| `AgeCategory` | container | raiz das categorias etárias |
| `AgeCategory_U19` | subclasse | parent: `AgeCategory` |
| `AgeCategory_U21` | subclasse | parent: `AgeCategory` |
| `AgeCategory_Senior` | subclasse | parent: `AgeCategory` |
| `SandSurface` | classe | superfície de jogo |
| `SpecialistRole` | classe | papel do especialista no ataque |
| `NumericalAsymmetry` | classe | assimetria numérica causada pelo especialista |
| `GoalkeeperRole` | classe | papel do goleiro |
| `PivotRole` | classe | papel do pivô |
| `WingRole` | classe | papel do ala |
| `Ball` | classe | bola oficial (rubber, sem resina) |
| `TeamTimeout` | classe | tempo técnico (1/meia-tempo, cartão verde) |
| `PassivePlay` | classe | regra dos 4 passes |
| `TwoPointGoal` | classe | gol criativo / goleiro / 6m = 2 pontos |
| `RefereeRole` | classe | função normativa da dupla de arbitragem |
| `TimekeeperScorekeeperRole` | classe | função normativa da mesa (cronômetro e súmula) |
| `SubstitutionArea` | classe | zona oficial de substituições por equipe |
| `AthleteUniform` | classe | regulamento oficial de vestimenta do atleta |
| `PlayingCourt` | container | 27×12m + zona de segurança |
| `GoalArea` | subclasse | parent: `PlayingCourt` — semicírculo de 6m |
| `GamePeriod` | container | dois períodos de 10 min |
| `GoldenGoal` | subclasse | parent: `GamePeriod` — golden goal de desempate |
| `ShootOut` | subclasse | parent: `GamePeriod` — shoot-out final |
| `ThrowType` | container | 5 tipos de reinício normativo |
| `RefereeThrow` | subclasse | parent: `ThrowType` — início de período |
| `ThrowIn` | subclasse | parent: `ThrowType` — lateral |
| `GoalkeeperThrow` | subclasse | parent: `ThrowType` — reinício do goleiro |
| `FreeThrow` | subclasse | parent: `ThrowType` — arremesso livre |
| `SixMetreThrow` | subclasse | parent: `ThrowType` — penálti de 6m |
| `Punishment` | container | punições progressivas |
| `PlayerWarning` | subclasse | parent: `Punishment` — advertência verbal |
| `PlayerSuspension` | subclasse | parent: `Punishment` — suspensão até turnover |
| `PlayerDisqualification` | subclasse | parent: `Punishment` — cartão vermelho (match inteiro) |

#### Banda TÉCNICO-TÁTICA

**Fases do jogo (`GamePhase`)**

| Conceito | Tipo | Parent |
|---------|------|--------|
| `GamePhase` | container | raiz das fases |
| `DefensePhase` | classe | `GamePhase` |
| `AttackPhase` | classe | `GamePhase` |
| `CounterAttack` | classe | `GamePhase` |
| `DefensiveReturn` | classe | `GamePhase` |

**Domínio defensivo (`DefensiveDomain`)**

| Conceito | Tipo | Parent |
|---------|------|--------|
| `DefensiveDomain` | container | domínio defensivo raiz |
| `DefensiveSystem` | container | `DefensiveDomain` |
| `Defense3_0` | subclasse | `DefensiveSystem` |
| `Defense2_1` | subclasse | `DefensiveSystem` |
| `Defense2Plus1` | subclasse | `DefensiveSystem` — variante mista com marcação do especialista |
| `Defense1_2` | subclasse | `DefensiveSystem` |
| `Defense1_2Plus1` | subclasse | `DefensiveSystem` — variante do 1:2 com marcação individual |
| `IndividualDefense` | subclasse | `DefensiveSystem` — marcação homem a homem |
| `DefensiveTechnicalTacticalAction` | container | `DefensiveDomain` |
| `ControlFromDistance` | subclasse | `DefensiveTechnicalTacticalAction` |
| `Siege` | subclasse | `DefensiveTechnicalTacticalAction` |
| `Dissuasion` | subclasse | `DefensiveTechnicalTacticalAction` |
| `Interception` | subclasse | `DefensiveTechnicalTacticalAction` |
| `SecondDefender` | subclasse | `DefensiveTechnicalTacticalAction` |
| `DefensiveCollaborationMean` | container | `DefensiveDomain` |
| `ChangeOfOpponent` | subclasse | `DefensiveCollaborationMean` |
| `Slipping` | subclasse | `DefensiveCollaborationMean` |

**Domínio ofensivo (`OffensiveDomain`)**

| Conceito | Tipo | Parent |
|---------|------|--------|
| `OffensiveDomain` | container | domínio ofensivo raiz |
| `AttackModel` | classe | `OffensiveDomain` |
| `OffensiveSystem` | container | `OffensiveDomain` |
| `OffensiveSystem3_1` | subclasse | `OffensiveSystem` — sistema ofensivo 3:1 |
| `OffensiveSystem4_0` | subclasse | `OffensiveSystem` — sistema ofensivo 4:0 |
| `OffensiveCollaborationMean` | container | `OffensiveDomain` |
| `PassAndGo` | subclasse | `OffensiveCollaborationMean` |
| `SuccessiveEntrances` | subclasse | `OffensiveCollaborationMean` |
| `Blockage` | subclasse | `OffensiveCollaborationMean` — bloqueio ofensivo |
| `Crossing` | subclasse | `OffensiveCollaborationMean` — cruzamento |
| `Screen` | subclasse | `OffensiveCollaborationMean` — cortina |
| `ShootingAction` | container | `OffensiveDomain` |
| `StandingThrow6m` | subclasse | `ShootingAction` — arremesso parado de 6m |
| `SpinThrow` | subclasse | `ShootingAction` — arremesso em giro |
| `AerialThrow` | subclasse | `ShootingAction` — arremesso aéreo |

#### Banda DESEMPENHO

| Conceito | Tipo | Parent |
|---------|------|--------|
| `PlayerPerformanceDomain` | container | domínio de desempenho raiz |
| `LoadMonitoringDomain` | classe | `PlayerPerformanceDomain` |
| `InternalLoad` | subclasse | `LoadMonitoringDomain` — resposta fisiológica (FC, %FCmáx) |
| `ExternalLoad` | subclasse | `LoadMonitoringDomain` — distância percorrida, acelerações |
| `PerformanceLevel` | classe | `PlayerPerformanceDomain` |
| `EliteLevel` | subclasse | `PerformanceLevel` — atletas de alto rendimento |
| `SubEliteLevel` | subclasse | `PerformanceLevel` — atletas regionais/nacionais |
| `AnthropometricProfile` | classe | `PlayerPerformanceDomain` |
| `TalentSelection` | classe | `PlayerPerformanceDomain` |
| `PhysicalTestBattery` | classe | `PlayerPerformanceDomain` |
| `HorizontalJump` | subclasse | `PhysicalTestBattery` |
| `Sprint15m` | subclasse | `PhysicalTestBattery` |
| `Acceleration5m` | subclasse | `PhysicalTestBattery` |
| `HandgripStrength` | subclasse | `PhysicalTestBattery` |
| `CountermovementJump` | subclasse | `PhysicalTestBattery` |

### 14.3 Arestas obrigatórias

As arestas abaixo são uma seleção de alto valor estrutural das relações
confirmadas no `matriz-relacoes.md`. O diagrama **não precisa** refletir todas
as 118 relações da matriz — a matriz é a fonte de verdade e o diagrama é uma
visualização seletiva das relações mais representativas de cada camada.

| # | Origem | Tipo de relação | Destino | Fonte |
|---|--------|----------------|---------|-------|
| 1 | `SpecialistRole` | `causes` | `NumericalAsymmetry` | MORILLO-2017 |
| 2 | `AgeCategory_U19` | `precedes` | `AgeCategory_U21` | norma IHF |
| 3 | `AgeCategory_U21` | `precedes` | `AgeCategory_Senior` | norma IHF |
| 4 | `GoalkeeperRole` | `enables` | `NumericalAsymmetry` | MORILLO-2017 |
| 5 | `StandingThrow6m` | `enables` | `EliteLevel` | LEMOS-2023 |
| 6 | `TalentSelection` | `requires` | `AnthropometricProfile` | LEMOS-2023 |
| 7 | `SandSurface` | `influences` | `ExternalLoad` | LEMOS-2023 |
| 8 | `NumericalAsymmetry` | `influences` | `DefensiveSystem` | MORILLO-2017 |
| 9 | `NumericalAsymmetry` | `enables` | `AttackModel` | MORILLO-2017 |
| 10 | `GoldenGoal` | `precedes` | `ShootOut` | IHF-2026 |
| 11 | `PassivePlay` | `causes` | `FreeThrow` | IHF-2026 |
| 12 | `SixMetreThrow` | `causes` | `TwoPointGoal` | IHF-2026 |
| 13 | `TwoPointGoal` | `enables` | `SpinThrow` | IHF-2026 |
| 14 | `PassivePlay` | `influences` | `AttackPhase` | IHF-2026 |
| 15 | `RefereeRole` | `enables` | `RefereeThrow` | IHF-2026 |
| 16 | `Punishment` | `requires` | `RefereeRole` | IHF-2026 |
| 17 | `TimekeeperScorekeeperRole` | `enables` | `TeamTimeout` | IHF-2026 |
| 18 | `TimekeeperScorekeeperRole` | `influences` | `SubstitutionArea` | IHF-2026 |
| 19 | `SubstitutionArea` | `requires` | `GoalkeeperRole` | IHF-2026 |
| 20 | `GoalkeeperRole` | `requires` | `AthleteUniform` | IHF-2026 |

> Ao adicionar relações à `matriz-relacoes.md`, avaliar se a relação tem valor
> estrutural suficiente para ser incluída no diagrama. Relações muito
> específicas ou derivadas podem permanecer apenas na matriz.
> A matriz é a fonte de verdade; o Draw.io é a visualização seletiva.

### 14.4 Histórico de inconsistências — resolvido em 24/05/2026

As inconsistências abaixo foram identificadas em versões anteriores do
`navegacao.drawio.svg` e estão **resolvidas**. Esta seção é mantida como
registro histórico de auditoria.

#### 14.4.1 Divergências de nomenclatura (histórico geral)

**Divergências de nomes corrigidas (nome anterior → nome canônico):**

| Nome anterior | Nome canônico atual |
|---------------|---------------------|
| `U19` | `AgeCategory_U19` |
| `U21` | `AgeCategory_U21` |
| `Senior` | `AgeCategory_Senior` |
| `SpinShot` | `SpinThrow` |
| `AerialShot` | `AerialThrow` |
| `Pick` | `Blockage` |
| `Overlap` | `Crossing` |
| `ScreenAction` | `Screen` |

#### 14.4.2 Histórico IHF-2026 (base normativa e tático-estrutural)

**Conceitos ausentes adicionados na atualização IHF-2026:**

`Defense2Plus1`, `Defense1_2Plus1`, `IndividualDefense`,
`ControlFromDistance`, `Siege`, `Dissuasion`, `SecondDefender`,
`DefensiveDomain`, `OffensiveDomain`, `SuccessiveEntrances`,
`InternalLoad`, `ExternalLoad`, `EliteLevel`, `SubEliteLevel`,
`HorizontalJump`, `Sprint15m`, `Acceleration5m`, `HandgripStrength`,
`CountermovementJump`.

#### 14.4.3 Expansão normativa por arbitragem/mesa (auditoria complementar)

**Conceitos adicionados na expansão normativa complementar:**

`RefereeRole`, `TimekeeperScorekeeperRole`, `SubstitutionArea`,
`AthleteUniform`.

> **Verificação de cobertura atual:** todos os 85 conceitos do §14.2 estão
> presentes no SVG. Comando de auditoria:
> `python3 -c "import re; svg=open('docs/design/navegacao.drawio.svg').read(); print(len(re.findall(r'value=', svg)))"`

### 14.5 Checklist de completude do diagrama

Antes de considerar o diagrama válido após qualquer atualização, **MUST** verificar:

- [ ] As três bandas (NORMATIVA, TÉCNICO-TÁTICA, DESEMPENHO) estão presentes e visíveis
- [ ] Todos os vértices da §14.2 estão representados com os **nomes canônicos**
- [ ] Todas as arestas da §14.3 estão representadas com rótulos de tipo de relação
- [ ] Nenhuma classe com entrada completa no `glossario-ontologico-controlado.md` foi omitida
- [ ] Nenhuma relação confirmada na `matriz-relacoes.md` foi omitida
- [ ] O arquivo passou no checklist técnico da §13.5
- [ ] O arquivo abre sem erro na extensão Draw.io Integration do VS Code
