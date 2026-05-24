---
role: ontology-artifact
artifact-type: relations-matrix
domain: beach-handball-ontology
authority: primary
applies-to: [agent, developer, coach]
version: 0.1-draft
status: draft
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Matriz de Relações — Handebol de Praia

Esta matriz registra **todas as relações diretas** entre conceitos da ontologia.
É a fonte de verdade para os arestos do grafo Draw.io.

---

## Regras de uso e manutenção

- **MUST**: toda aresta criada no Draw.io ter uma linha correspondente aqui.
- **MUST**: cada relação ter: conceito-origem, tipo, conceito-destino, camada e fonte.
- **MUST NOT**: adicionar relações inversas redundantes (escolher uma direção canônica).
- **MUST NOT**: usar tipos de relação fora da lista oficial abaixo.
- Quando um artigo novo suportar uma relação existente, **adicionar** o ID da fonte na coluna `Fontes`, não duplicar a linha.

---

## Tipos de relação aceitos

| Tipo | Significado | Direção |
|------|-------------|---------|
| `is-a` | Herança — subclasse de | origem é subclasse de destino |
| `part-of` | Composição — membro de um domínio | origem faz parte de destino |
| `influences` | Relação de influência indireta | origem afeta o comportamento de destino |
| `causes` | Causalidade direta | origem produz ou gera destino |
| `structures` | Organiza ou condiciona a forma de destino | |
| `enables` | Torna possível ou facilita destino | |
| `opposes` | Contradição ou antagonismo funcional | |
| `precedes` | Sequência temporal ou lógica | origem vem antes de destino |
| `requires` | Dependência — destino é pré-condição de origem | |
| `has-attribute` | Atributo intrínseco | origem possui atributo nomeado em destino |

---

## Matriz de relações

> **Legenda de camadas**: `N` = normativa | `T` = técnico-tática | `D` = desempenho

| # | Conceito Origem | Tipo de Relação | Conceito Destino | Camada | Fontes | Observação |
|---|-----------------|-----------------|------------------|--------|--------|------------|
| 1 | `SpecialistRole` | `causes` | `NumericalAsymmetry` | T | MORILLO-2017 | Ativação do especialista produz assimetria 4x3 |
| 2 | `SpecialistRole` | `influences` | `OffensiveSystem` | T | MORILLO-2017 | Especialista redefine os papéis e circulação ofensiva |
| 3 | `SpecialistRole` | `influences` | `DefensiveSystem` | T | MORILLO-2017 | Adversário precisa adaptar defesa ao especialista |
| 4 | `NumericalAsymmetry` | `structures` | `OffensiveDomain` | T | MORILLO-2017 | Formato 4x3 define o sub-domínio ofensivo |
| 5 | `NumericalAsymmetry` | `structures` | `DefensiveDomain` | T | MORILLO-2017 | Formato 3x4 define o sub-domínio defensivo |
| 6 | `Defense3_0` | `is-a` | `DefensiveSystem` | T | MORILLO-2017 | Defense3_0 é um tipo específico de sistema defensivo |
| 7 | `DefensiveSystem` | `is-a` | `DefensiveDomain` | T | MORILLO-2017 | Sistema defensivo pertence ao domínio defensivo |
| 8 | `OffensiveSystem` | `is-a` | `OffensiveDomain` | T | MORILLO-2017 | Sistema ofensivo pertence ao domínio ofensivo |
| 9 | `DefensiveTechnicalTacticalAction` | `part-of` | `DefensiveDomain` | T | MORILLO-2017 | Ações defensivas são componentes do domínio defensivo |
| 10 | `LoadMonitoringDomain` | `part-of` | `PlayerPerformanceDomain` | D | LEMOS-2023 | Monitoramento de carga é subdomínio de desempenho |
| 11 | `ShootingAction` | part-of | `OffensiveDomain` | T | LEMOS-2023 | Arremesso é ação fundamental do domínio ofensivo |
| 12 | `StandingThrow6m` | is-a | `ShootingAction` | T | LEMOS-2023 | Arremesso de 6m em apoio — técnica de 1 ponto |
| 13 | `SpinThrow` | is-a | `ShootingAction` | T | LEMOS-2023 | Arremesso em giro — técnica de 2 pontos |
| 14 | `AerialThrow` | is-a | `ShootingAction` | T | LEMOS-2023 | Arremesso aéreo — técnica de 2 pontos |
| 15 | `StandingThrow6m` | enables | `EliteLevel` | D | LEMOS-2023 | Discrimina elite vs sub-elite (Estudo 2, p<0,001) |
| 16 | `SpinThrow` | enables | `EliteLevel` | D | LEMOS-2023 | Discrimina elite vs sub-elite (Estudo 2, p<0,001) |
| 17 | `AerialThrow` | enables | `EliteLevel` | D | LEMOS-2023 | Discrimina elite vs sub-elite (Estudo 2, p<0,001) |
| 18 | `HorizontalJump` | enables | `EliteLevel` | D | LEMOS-2023 | Discrimina elite vs sub-elite e categorias etárias (Estudos 1 e 2) |
| 19 | `InternalLoad` | part-of | `LoadMonitoringDomain` | D | LEMOS-2023 | FC, %FCmax — resposta fisiológica durante partidas |
| 20 | `ExternalLoad` | part-of | `LoadMonitoringDomain` | D | LEMOS-2023 | 18 parâmetros via IMU/WIMU |
| 21 | `AnthropometricProfile` | part-of | `PlayerPerformanceDomain` | D | LEMOS-2023 | Perfil morfológico como parte do domínio de desempenho |
| 22 | `PhysicalTestBattery` | part-of | `PlayerPerformanceDomain` | D | LEMOS-2023 | Bateria de testes físicos específicos do HP |
| 23 | `TalentSelection` | part-of | `PlayerPerformanceDomain` | D | LEMOS-2023 | Processo de seleção de talentos |
| 24 | `PerformanceLevel` | part-of | `PlayerPerformanceDomain` | D | LEMOS-2023 | Nível de desempenho como dimensão do domínio |
| 25 | `EliteLevel` | is-a | `PerformanceLevel` | D | LEMOS-2023 | — |
| 26 | `SubEliteLevel` | is-a | `PerformanceLevel` | D | LEMOS-2023 | — |
| 27 | `HorizontalJump` | is-a | `PhysicalTestBattery` | D | LEMOS-2023 | — |
| 28 | `Sprint15m` | is-a | `PhysicalTestBattery` | D | LEMOS-2023 | Específico HP — 15m (quadra: 30m) |
| 29 | `Acceleration5m` | is-a | `PhysicalTestBattery` | D | LEMOS-2023 | — |
| 30 | `HandgripStrength` | is-a | `PhysicalTestBattery` | D | LEMOS-2023 | — |
| 31 | `CountermovementJump` | is-a | `PhysicalTestBattery` | D | LEMOS-2023 | Discrimina jovens femininas selecionadas |
| 32 | `TalentSelection` | requires | `AnthropometricProfile` | D | LEMOS-2023 | Perfil morfológico necessário para triagem de talentos |
| 33 | `TalentSelection` | requires | `PhysicalTestBattery` | D | LEMOS-2023 | Testes físicos necessários para triagem de talentos |
| 34 | `AgeCategory_U19` | precedes | `AgeCategory_U21` | N | LEMOS-2023 | Progressão etária na carreira do atleta |
| 35 | `AgeCategory_U21` | precedes | `AgeCategory_Senior` | N | LEMOS-2023 | — |
| 36 | `AgeCategory_U21` | enables | `EliteLevel` | D | LEMOS-2023 | Sub-21 supera sub-19 no salto horizontal e arremesso 6m |
| 37 | `SandSurface` | influences | `ExternalLoad` | N | LEMOS-2023 | Areia aumenta demanda energética e neuromuscular vs quadra |
| 38 | `SandSurface` | requires | `PhysicalTestBattery` | N | LEMOS-2023 | Testes devem ser aplicados na areia para validade ecológica |

---

| 39 | `GamePhase` | `structures` | `DefensePhase` | T | MORILLO-2017 | Fase defensiva como sub-fase do ciclo |
| 40 | `GamePhase` | `structures` | `AttackPhase` | T | MORILLO-2017 | Fase ofensiva como sub-fase do ciclo |
| 41 | `CounterAttack` | `is-a` | `GamePhase` | T | MORILLO-2017 | Contra-ataque é sub-fase do jogo |
| 42 | `DefensiveReturn` | `is-a` | `GamePhase` | T | MORILLO-2017 | Retorno defensivo é sub-fase do jogo |
| 43 | `Defense2_1` | `is-a` | `DefensiveSystem` | T | MORILLO-2017 | — |
| 44 | `Defense2Plus1` | `is-a` | `DefensiveSystem` | T | MORILLO-2017 | — |
| 45 | `Defense1_2` | `is-a` | `DefensiveSystem` | T | MORILLO-2017 | — |
| 46 | `Defense1_2Plus1` | `is-a` | `DefensiveSystem` | T | MORILLO-2017 | — |
| 47 | `IndividualDefense` | `is-a` | `DefensiveSystem` | T | MORILLO-2017 | — |
| 48 | `ControlFromDistance` | `is-a` | `DefensiveTechnicalTacticalAction` | T | MORILLO-2017 | — |
| 49 | `Siege` | `is-a` | `DefensiveTechnicalTacticalAction` | T | MORILLO-2017 | — |
| 50 | `Dissuasion` | `is-a` | `DefensiveTechnicalTacticalAction` | T | MORILLO-2017 | — |
| 51 | `Interception` | `is-a` | `DefensiveTechnicalTacticalAction` | T | MORILLO-2017 | — |
| 52 | `SecondDefender` | `is-a` | `DefensiveTechnicalTacticalAction` | T | MORILLO-2017 | — |
| 53 | `DefensiveDomain` | `structures` | `DefensiveSystem` | T | MORILLO-2017 | — |
| 54 | `DefensiveDomain` | `structures` | `DefensiveTechnicalTacticalAction` | T | MORILLO-2017 | — |
| 55 | `DefensiveDomain` | `structures` | `DefensiveCollaborationMean` | T | MORILLO-2017 | — |
| 56 | `DefensiveCollaborationMean` | `part-of` | `DefensiveDomain` | T | MORILLO-2017 | — |
| 57 | `ChangeOfOpponent` | `is-a` | `DefensiveCollaborationMean` | T | MORILLO-2017 | — |
| 58 | `Slipping` | `is-a` | `DefensiveCollaborationMean` | T | MORILLO-2017 | — |
| 59 | `OffensiveDomain` | `structures` | `OffensiveSystem` | T | MORILLO-2017 | — |
| 60 | `OffensiveDomain` | `structures` | `ShootingAction` | T | MORILLO-2017 | — |
| 61 | `OffensiveDomain` | `structures` | `OffensiveCollaborationMean` | T | MORILLO-2017 | — |
| 62 | `OffensiveDomain` | `structures` | `AttackModel` | T | MORILLO-2017 | — |
| 63 | `AttackModel` | `part-of` | `OffensiveDomain` | T | MORILLO-2017 | — |
| 64 | `OffensiveCollaborationMean` | `part-of` | `OffensiveDomain` | T | MORILLO-2017 | — |
| 65 | `PassAndGo` | `is-a` | `OffensiveCollaborationMean` | T | MORILLO-2017 | — |
| 66 | `SuccessiveEntrances` | `is-a` | `OffensiveCollaborationMean` | T | MORILLO-2017 | — |
| 67 | `Blockage` | `is-a` | `OffensiveCollaborationMean` | T | MORILLO-2017 | — |
| 68 | `Crossing` | `is-a` | `OffensiveCollaborationMean` | T | MORILLO-2017 | — |
| 69 | `Screen` | `is-a` | `OffensiveCollaborationMean` | T | MORILLO-2017 | — |
| 70 | `OffensiveSystem3_1` | `is-a` | `OffensiveSystem` | T | MORILLO-2017 | — |
| 71 | `OffensiveSystem4_0` | `is-a` | `OffensiveSystem` | T | MORILLO-2017 | — |
| 72 | `NumericalAsymmetry` | `enables` | `AttackModel` | T | MORILLO-2017 | Superioridade 4×3 condiciona o AttackModel |
| 73 | `NumericalAsymmetry` | `influences` | `DefensiveSystem` | T | MORILLO-2017 | Inferioridade defensiva condiciona a escolha do sistema |
| 74 | `GoalkeeperRole` | `enables` | `NumericalAsymmetry` | T | MORILLO-2017 | Goleiro sai → especialista entra → 4×3 |
| 75 | `SpecialistRole` | `enables` | `CounterAttack` | T | MORILLO-2017 | Especialista inicia a transição ofensiva |
| 76 | `CounterAttack` | `requires` | `DefensiveReturn` | T | MORILLO-2017 | Retorno defensivo é resposta ao contra-ataque |
| 77 | `AttackPhase` | `enables` | `ShootingAction` | T | MORILLO-2017 | Fase de ataque ativa os arremessos |
| 78 | `DefensePhase` | `requires` | `DefensiveSystem` | T | MORILLO-2017 | Fase defensiva exige sistema estruturado |
| 79 | `IndividualDefense` | `requires` | `DefensiveCollaborationMean` | T | MORILLO-2017 | Defesa individual depende dos meios coletivos |
| 80 | `Defense2Plus1` | `requires` | `SpecialistRole` | T | MORILLO-2017 | Sistema 2+1 pressupõe marcação individual do especialista |
| 81 | `GoalkeeperRole` | `opposes` | `SpecialistRole` | N | MORILLO-2017 | Papéis mutuamente exclusivos em campo — não coexistem no mesmo instante |
| 82 | `PivotRole` | `enables` | `ShootingAction` | T | MORILLO-2017 | Pivô finaliza com alta taxa de conversão |
| 83 | `WingRole` | `enables` | `ShootingAction` | T | MORILLO-2017 | Ala executa SpinThrow nos flancos |


---

| 84 | `GoldenGoal` | `part-of` | `GamePeriod` | N | IHF-2026 | Golden Goal é mecanismo de desempate do período |
| 85 | `GoldenGoal` | `precedes` | `ShootOut` | N | IHF-2026 | Se empate persiste após Golden Goal, segue o ShootOut |
| 86 | `ShootOut` | `requires` | `GoalkeeperRole` | N | IHF-2026 | Cada tentativa exige goleiro + jogador de campo |
| 87 | `ShootOut` | `causes` | `SixMetreThrow` | N | IHF-2026 | Infração do goleiro no ShootOut concede arremesso de 6m |
| 88 | `GamePeriod` | `enables` | `GoldenGoal` | N | IHF-2026 | Período empatado ativa o mecanismo Golden Goal |
| 89 | `GamePeriod` | `enables` | `TeamTimeout` | N | IHF-2026 | Cada meia-tempo de período permite 1 TeamTimeout |
| 90 | `PlayingCourt` | `part-of` | `SandSurface` | N | IHF-2026 | A quadra é delimitada sobre a superfície de areia |
| 91 | `GoalArea` | `part-of` | `PlayingCourt` | N | IHF-2026 | A área do goleiro (6m) é componente da quadra |
| 92 | `GoalArea` | `requires` | `GoalkeeperRole` | N | IHF-2026 | Apenas o goleiro pode estar dentro da GoalArea |
| 93 | `SixMetreThrow` | `causes` | `TwoPointGoal` | N | IHF-2026; SKOWRONEK-2023 | Arremesso de 6m convertido vale 2 pontos |
| 94 | `TwoPointGoal` | `enables` | `SpinThrow` | N | IHF-2026; SKOWRONEK-2023 | SpinThrow é uma das ações que gera gol de 2 pontos |
| 95 | `TwoPointGoal` | `enables` | `AerialThrow` | N | IHF-2026; SKOWRONEK-2023 | AerialThrow é uma das ações que gera gol de 2 pontos |
| 96 | `TwoPointGoal` | `enables` | `GoalkeeperRole` | N | IHF-2026; SKOWRONEK-2023 | Gol marcado pelo goleiro vale 2 pontos |
| 97 | `PassivePlay` | `influences` | `AttackPhase` | N | IHF-2026 | Regra dos 4 passes restringe o tempo de circulação no ataque |
| 98 | `PassivePlay` | `causes` | `FreeThrow` | N | IHF-2026 | Violação da regra do jogo passivo resulta em arremesso livre |
| 99 | `Punishment` | `structures` | `PlayerWarning` | N | IHF-2026 | Advertência verbal é a primeira categoria de punição |
| 100 | `Punishment` | `structures` | `PlayerSuspension` | N | IHF-2026 | Suspensão é a segunda categoria de punição progressiva |
| 101 | `Punishment` | `structures` | `PlayerDisqualification` | N | IHF-2026 | Desqualificação é a categoria máxima de punição |
| 102 | `PlayerWarning` | `precedes` | `PlayerSuspension` | N | IHF-2026 | Punição progressiva: advertência precede suspensão |
| 103 | `PlayerSuspension` | `precedes` | `PlayerDisqualification` | N | IHF-2026 | Segunda suspensão ao mesmo jogador leva a desqualificação (Rule 16:6h) |
| 104 | `ThrowType` | `structures` | `RefereeThrow` | N | IHF-2026 | RefereeThrow é um dos 5 tipos de reinício normativo |
| 105 | `ThrowType` | `structures` | `ThrowIn` | N | IHF-2026 | ThrowIn é um dos 5 tipos de reinício normativo |
| 106 | `ThrowType` | `structures` | `GoalkeeperThrow` | N | IHF-2026 | GoalkeeperThrow é um dos 5 tipos de reinício normativo |
| 107 | `ThrowType` | `structures` | `FreeThrow` | N | IHF-2026 | FreeThrow é um dos 5 tipos de reinício normativo |
| 108 | `ThrowType` | `structures` | `SixMetreThrow` | N | IHF-2026 | SixMetreThrow é penálti e tipo de reinício normativo |
| 109 | `AgeCategory_U19` | `is-a` | `AgeCategory` | N | LEMOS-2023 | Subcategoria etária de base do ciclo formativo |
| 110 | `AgeCategory_U21` | `is-a` | `AgeCategory` | N | LEMOS-2023 | Subcategoria etária intermediária |
| 111 | `AgeCategory_Senior` | `is-a` | `AgeCategory` | N | LEMOS-2023 | Categoria principal adulta |
| 112 | `Ball` | `requires` | `SandSurface` | N | IHF-2026 | Bola oficial depende da superfície normativa de areia |
| 113 | `RefereeRole` | `enables` | `RefereeThrow` | N | IHF-2026 | A arbitragem executa o reinício oficial no início de períodos e no Golden Goal |
| 114 | `Punishment` | `requires` | `RefereeRole` | N | IHF-2026 | A aplicação de punições progressivas depende de decisão da arbitragem |
| 115 | `TimekeeperScorekeeperRole` | `enables` | `TeamTimeout` | N | IHF-2026 | A mesa controla o relógio e formaliza o time-out de equipe |
| 116 | `TimekeeperScorekeeperRole` | `influences` | `SubstitutionArea` | N | IHF-2026 | A mesa apoia os árbitros no controle de entrada e saída de substitutas |
| 117 | `SubstitutionArea` | `requires` | `GoalkeeperRole` | N | IHF-2026 | Entrada/saída do goleiro ocorre pelo lado regulamentar da área de substituição |
| 118 | `GoalkeeperRole` | `requires` | `AthleteUniform` | N | IHF-2026; SKOWRONEK-2023 | Goleiro deve atuar com uniforme distinto dos jogadores de linha |
| 119 | `TwoPointGoal` | `enables` | `SpecialistRole` | N | SKOWRONEK-2023 | Gol marcado por especialista também vale 2 pontos |

## Relações pendentes de validação

> Hipóteses levantadas a partir do manual. Precisam de artigo de referência antes
> de serem promovidas à tabela oficial.

| Conceito Origem | Tipo Hipotético | Conceito Destino | Justificativa |
|-----------------|-----------------|------------------|---------------|
| *(vazio — hipóteses anteriores de GoldenGoal e ShootOut resolvidas por IHF-2026)* | — | — | — |
