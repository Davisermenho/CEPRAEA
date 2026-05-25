---
role: ontology-artifact
artifact-type: source-registry
domain: beach-handball-ontology
authority: primary
applies-to: [agent, developer, coach]
version: 0.1-draft
status: draft
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Registro de Fontes — Handebol de Praia

Este registro documenta **todas as fontes** que sustentam os conceitos da ontologia.
Nenhum conceito entra no glossário ou na matriz de relações sem uma fonte registrada aqui.

---

## Regras de uso e manutenção

- **MUST**: todo conceito aprovado ter pelo menos uma fonte registrada neste arquivo.
- **MUST**: toda fonte ter ID único, tipo, título, ano e tema.
- **MUST NOT**: usar a mesma fonte com dois IDs diferentes.
- **MUST NOT**: colocar fonte sem preencher `conceitos-sustentados`.
- Se uma fonte for retratada ou obsoleta: **marcar como `status: obsoleto`** e documentar o motivo; não excluir a linha.

---

## Tipos de fonte aceitos

| Tipo | Descrição |
|------|-----------|
| `artigo` | Artigo científico revisado por pares |
| `regra-ihf` | Documento oficial de regras do jogo (IHF) |
| `tese` | Dissertação ou tese acadêmica |
| `manual` | Manual técnico ou guia de treinamento |
| `livro` | Livro técnico ou didático |
| `norma` | Documento normativo oficial (federação) |

---

## Tipos de conteúdo de fonte

Usar os códigos definidos no manual (tabela de triagem, seção 11):

| Código | Significado |
|--------|-------------|
| `ADICIONAR_CLASSE` | Fonte suporta nova classe ontológica |
| `ADICIONAR_SUBCLASSE` | Fonte suporta nova subclasse de classe existente |
| `ADICIONAR_ATRIBUTO` | Fonte suporta novo atributo em classe existente |
| `ADICIONAR_RELACAO` | Fonte suporta nova relação entre classes |
| `ADICIONAR_EVIDENCIA` | Fonte é evidência adicional de conceito já registrado |

---

## Estrutura de cada entrada

```
### [ID-FONTE]

- **Tipo**: artigo | regra-ihf | tese | manual | livro | norma
- **Título**: título completo
- **Autores**: Sobrenome, Nome; Sobrenome2, Nome2
- **Ano**: AAAA
- **Publicação**: nome do periódico, evento ou editora
- **DOI / URL**: https://...
- **Tema principal**: resumo de 1-2 linhas do foco da fonte
- **Conteúdo ontológico**: ADICIONAR_CLASSE | ADICIONAR_RELACAO | etc.
- **Conceitos sustentados**: ConceptoA, ConceptoB, ConceptoC
- **Observação**: notas livres sobre limitações, escopo geográfico, etc.
- **Status**: ativo | obsoleto
```

---

## Fontes registradas

### LEMOS-2023

- **Tipo**: tese
- **Título**: Handebol de Praia: Subsídios Científicos para a Compreensão do Esporte
- **Autores**: Lemos, Luís Filipe G.B.P.
- **Ano**: 2023
- **Publicação**: Programa Associado de Pós-graduação em Educação Física UPE/UFPB, João Pessoa
- **DOI / URL**: *(não informado)*
- **Tema principal**: Diferenciação de parâmetros físicos, antropométricos, morfológicos e técnicos de atletas de HP por categoria etária, nível de desempenho e resultado de jogo; seleção de talentos; carga interna e externa.
- **Conteúdo ontológico**: ADICIONAR_CLASSE, ADICIONAR_SUBCLASSE, ADICIONAR_ATRIBUTO, ADICIONAR_RELACAO
- **Conceitos sustentados**: `ShootingAction`, `StandingThrow6m`, `SpinThrow`, `AerialThrow`, `AgeCategory`, `AgeCategory_U19`, `AgeCategory_U21`, `AgeCategory_Senior`, `PerformanceLevel`, `EliteLevel`, `SubEliteLevel`, `InternalLoad`, `ExternalLoad`, `AnthropometricProfile`, `PhysicalTestBattery`, `HorizontalJump`, `Sprint15m`, `Acceleration5m`, `HandgripStrength`, `CountermovementJump`, `TalentSelection`, `SandSurface`, `BallVelocity`
- **Observação**: 4 estudos transversais. Estudo 1 (70 atletas): perfil físico por categoria. Estudo 2 (91 seniores, 19 campeões mundiais): elite vs sub-elite. Estudo 3 (64 jovens, Seleção Brasileira 2017): seleção de talentos com análise linear e não-linear. Estudo 4 (124 seniores, 21 partidas): carga interna/externa via WIMU — vencedores e perdedores têm carga similar mas padrões de inter-relação diferentes (auto-organização, sistemas complexos).
- **Status**: ativo

---

### SKOWRONEK-2023

- **Tipo**: artigo
- **Título**: 2-point Goals, Spin and In-flight
- **Autores**: Skowronek, Agnieszka; Bartkowiak, Sylwia; Lakomy, Weronika
- **Ano**: 2023
- **Publicação**: IHF Online Education Weeks 2023
- **DOI / URL**: *(não informado)*
- **Tema principal**: Critérios práticos de arbitragem e execução técnico-tática para gols de 2 pontos no HP (spin, in-flight, 6m e gols de goleiro/especialista), com exemplos em vídeo.
- **Conteúdo ontológico**: ADICIONAR_ATRIBUTO, ADICIONAR_RELACAO, ADICIONAR_EVIDENCIA
- **Conceitos sustentados**: `TwoPointGoal`, `SpinThrow`, `AerialThrow`, `SixMetreThrow`, `GoalkeeperRole`, `SpecialistRole`, `AthleteUniform`
- **Observação**: Material educacional aplicado (slides + vídeo) usado para refinar critérios operacionais: giro completo no spin (360°), controle da bola no in-flight para 2 pontos, e distinção entre finalização válida de 2 pontos e ação que vale apenas 1 ponto.
- **Status**: ativo

---

### CALDAS-MONICO-MARTINEZ-SD

- **Tipo**: artigo
- **Título**: 6-Metre Throw + Punishments
- **Autores**: Caldas, Luiz Filipe; Monico, Luis; Martinez, Pablo
- **Ano**: não informado
- **Publicação**: material técnico de arbitragem (slides)
- **DOI / URL**: *(não informado)*
- **Tema principal**: critérios de decisão, execução e punição associados ao arremesso de 6 metros no Handebol de Praia.
- **Conteúdo ontológico**: ADICIONAR_ATRIBUTO, ADICIONAR_RELACAO, ADICIONAR_EVIDENCIA
- **Conceitos sustentados**: `SixMetreThrow`, `Punishment`, `GoalkeeperRole`
- **Observação**: Fonte aplicada com foco operacional (situações de jogo e execução prática), usada para refinar atributos de execução do 6m e critério de punição/não punição.
- **Status**: ativo

---

## Fontes em triagem

> Fontes identificadas mas ainda não processadas formalmente.

| ID provisório | Tipo | Referência parcial | Prioridade |
|---------------|------|-------------------|------------|
| *(vazio)* | — | — | — |

**Observação:**

- Sem fontes bloqueadas no momento.

---

## Histórico de fontes obsoletas

> Fontes que eram ativas e foram marcadas obsoletas, com justificativa.

| ID | Motivo | Data |
|----|--------|------|
| *(vazio)* | — | — |


### MORILLO-2017

- **Tipo**: manual
- **Título**: Specific Tactics in Beach Handball
- **Autores**: Morillo Baro, Juan Pablo (coord.); Lara Cobos, Daniel; Sánchez Sáez, Juan Antonio; Sánchez Malia, José Miguel
- **Ano**: 2017
- **Publicação**: Beach Handball Commission, Education Department (EHF/IHF), ISBN 978-84-87351-01-3
- **DOI / URL**: *(não informado)*
- **Tema principal**: Sistemas defensivos e ofensivos específicos do HP, intenções táticas individuais e coletivas, meios de colaboração ofensiva e defensiva, fases e sub-fases do jogo.
- **Conteúdo ontológico**: ADICIONAR_CLASSE, ADICIONAR_SUBCLASSE
- **Conceitos sustentados**: `SpecialistRole`, `NumericalAsymmetry`, `GamePhase`, `DefensePhase`, `AttackPhase`, `CounterAttack`, `DefensiveReturn`, `Defense2_1`, `Defense2Plus1`, `Defense1_2`, `Defense1_2Plus1`, `IndividualDefense`, `ControlFromDistance`, `Siege`, `Dissuasion`, `Interception`, `SecondDefender`, `DefensiveDomain`, `DefensiveSystem`, `Defense3_0`, `DefensiveTechnicalTacticalAction`, `DefensiveCollaborationMean`, `ChangeOfOpponent`, `Slipping`, `OffensiveDomain`, `AttackModel`, `OffensiveSystem`, `OffensiveCollaborationMean`, `PassAndGo`, `SuccessiveEntrances`, `Blockage`, `Crossing`, `Screen`, `OffensiveSystem3_1`, `OffensiveSystem4_0`, `GoalkeeperRole`, `PivotRole`, `WingRole`
- **Observação**: Manual técnico-tático oficial da EHF/IHF. Detalha os 6 sistemas defensivos do HP (3:0, 2:1, 2+1, 1:2, 1:2+1, individual), as intenções táticas individuais (controle à distância, siege, dissuasão, intercepção, second defender), os meios coletivos defensivos e ofensivos, e os sistemas ofensivos 3:1 e 4:0 com as 4 posições possíveis do especialista. Contexto: inferioridade numérica defensiva (3×4) condiciona toda a tática do HP.
- **Status**: ativo


### IHF-2026

- **Tipo**: regra-ihf
- **Título**: Rules of the Game — Beach Handball
- **Autores**: International Handball Federation (IHF)
- **Ano**: 2026
- **Publicação**: International Handball Federation (IHF), Basel — vigência a partir de 1 março 2026
- **DOI / URL**: https://www.ihf.info/
- **Tema principal**: Regulamento oficial completo do Handebol de Praia: dimensões de quadra, tempo de jogo, bola, equipes, goleiro, área de gol, regras de jogo, pontuação, tipos de arremesso, punições, árbitros, regulamentos de uniforme, qualidade da areia e glossário oficial.
- **Conteúdo ontológico**: ADICIONAR_CLASSE, ADICIONAR_EVIDENCIA
- **Conceitos sustentados**: `PlayingCourt`, `GoalArea`, `GamePeriod`, `GoldenGoal`, `ShootOut`, `Ball`, `TeamTimeout`, `ThrowType`, `RefereeThrow`, `ThrowIn`, `GoalkeeperThrow`, `FreeThrow`, `SixMetreThrow`, `PassivePlay`, `TwoPointGoal`, `Punishment`, `PlayerWarning`, `PlayerSuspension`, `PlayerDisqualification`, `SandSurface`, `SpinThrow`, `AerialThrow`, `CounterAttack`, `GoalkeeperRole`, `Interception`, `RefereeRole`, `TimekeeperScorekeeperRole`, `SubstitutionArea`, `AthleteUniform`
- **Observação**: Documento normativo primário do HP. Define as 18 regras do jogo, 16 clarificações, regulamento da área de substituição, regulamento de uniformes de atletas, regulamento de qualidade de areia e iluminação, e glossário oficial. Substituiu a edição anterior (vigência anterior: 2022). Específica para Beach Handball — não se confundir com o regulamento do Handebol de Quadra.
- **Status**: ativo
