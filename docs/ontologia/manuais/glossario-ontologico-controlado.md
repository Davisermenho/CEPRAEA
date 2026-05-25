---
role: ontology-artifact
artifact-type: glossary
domain: beach-handball-ontology
authority: primary
applies-to: [agent, developer, coach]
version: 0.1-draft
status: draft
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Glossário Ontológico Controlado — Handebol de Praia

Este é o **vocabulário oficial e controlado** da ontologia do Handebol de Praia.
Nenhum termo pode ser usado no Draw.io, em código, em análises ou em treinamento
de IA sem estar registrado aqui primeiro.

---

## Regras de uso e manutenção

- **MUST**: todo conceito novo aprovado na triagem (seção 9 do manual) entra aqui antes de entrar no Draw.io.
- **MUST**: cada entrada ter obrigatoriamente: nome, definição, camada, sinônimos, fonte e relações.
- **MUST NOT**: criar dois registros para o mesmo conceito com nomes diferentes.
- **MUST NOT**: alterar o nome de um conceito já registrado sem atualizar todos os artefatos.
- Se um sinônimo aparecer em artigo novo: **MUST** adicionar o sinônimo ao registro existente, não criar entrada nova.

---

## Estrutura de cada entrada

```
### NomeDoConceito

- **Definição**: descrição precisa e curta do que é o conceito.
- **Camada**: normativa | técnico-tática | desempenho
- **Tipo**: Classe | Subclasse de [Pai] | Atributo de [Classe]
- **Sinônimos**: termo1, termo2, termo3
- **Não confundir com**: conceito parecido mas diferente
- **Atributos**:
  - +atributo1 = valor ou descrição
  - +atributo2 = valor ou descrição
- **Relações**:
  - NomeDoConceito [tipo-de-relação] OutroConceito
- **Fonte**: identificador da fonte no Registro de Fontes
- **Exemplo de uso**: situação real de jogo onde o conceito aparece
```

Tipos de relação aceitos: `is-a` | `part-of` | `influences` | `causes` | `structures` | `enables` | `opposes` | `precedes` | `requires` | `has-attribute`

---

## Entradas

> **Status**: semente inicial extraída do manual. Expandir com cada novo artigo
> seguindo o protocolo da seção 9 do manual.

---

### SpecialistRole

- **Definição**: jogador que assume a função de goleiro-linha, atuando como quarto atacante no sistema ofensivo e criando assimetria numérica.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: goleiro-linha, quarto jogador ofensivo, specialist, expert player, especialista
- **Não confundir com**: goleiro (que permanece na área), `GoalkeeperRole`
- **Atributos**:
  - +position = field player acting as goalkeeper-line
  - +triggersNumericalAsymmetry = true
  - +decisionCentrality = influencia a circulacao da bola e a escolha da finalizacao no ataque posicionado
- **Relações**:
  - `SpecialistRole` causes `NumericalAsymmetry`
  - `SpecialistRole` influences `OffensiveSystem`
  - `SpecialistRole` influences `DefensiveSystem`
  - `SpecialistRole` influences `AttackModel`
- **Fonte**: MORILLO-2017; SILVA-MENEZES-2018
- **Exemplo de uso**: equipe retira o goleiro e coloca o especialista para criar superioridade 4x3 no ataque.

---

### NumericalAsymmetry

- **Definição**: diferença numérica entre atacantes e defensores provocada pela utilização do especialista; cria superioridade ofensiva 4x3 e inferioridade defensiva 3x4.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: assimetria numérica, desequilíbrio numérico, numerical imbalance
- **Não confundir com**: vantagem numérica por exclusão (punição), que é temporária e normativa
- **Atributos**:
  - +offensiveFormation = 4x3
  - +defensiveFormation = 3x4
  - +triggeredBy = SpecialistRole
- **Relações**:
  - `NumericalAsymmetry` structures `OffensiveDomain`
  - `NumericalAsymmetry` structures `DefensiveDomain`
  - `SpecialistRole` causes `NumericalAsymmetry`
- **Fonte**: MORILLO-2017; SILVA-MENEZES-2018
- **Exemplo de uso**: com o especialista em campo, o ataque opera com 4 jogadores contra 3 defensores.

---

### DefensiveSystem

- **Definição**: organização estrutural dos jogadores defensores que define posicionamento, responsabilidades de cobertura e reação ao ataque adversário.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: sistema defensivo, defensive formation
- **Não confundir com**: `DefensiveTechnicalTacticalAction` (ação individual dentro do sistema)
- **Atributos**:
  - +formation = string (ex: "3:0", "2:1")
  - +selectionProfile = {tall, fast, leader, catchingAbility, teamwork, experience}
  - +style = {reactive, proactive}
- **Relações**:
  - `DefensiveSystem` is-a `DefensiveDomain`
  - `NumericalAsymmetry` structures `DefensiveSystem`
- **Fonte**: MORILLO-2017; ANDERSEN-SD
- **Exemplo de uso**: a equipe adota o sistema 3:0 no início da fase defensiva para proteger a zona central.

---

### Defense3_0

- **Definição**: sistema defensivo com três jogadores alinhados horizontalmente, sem profundidade, protegendo a zona central e induzindo o arremesso lateral.
- **Camada**: técnico-tática
- **Tipo**: Subclasse de `DefensiveSystem`
- **Sinônimos**: defesa 3:0, flat defense, três-zero
- **Não confundir com**: `Defense2_1` (com um jogador avançado)
- **Atributos**:
  - +depth = low
  - +usageContext = beginning/end of defensive phase
  - +protectsCentralZone = true
  - +inducesSideShot = true
- **Relações**:
  - `Defense3_0` is-a `DefensiveSystem`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: defesa 3:0 usada no início da fase defensiva para organizar o bloco antes do adversário estabelecer o ataque posicionado.

---

### OffensiveSystem

- **Definição**: organização estrutural dos atacantes que define posicionamento, circulação, papéis e princípios de criação de situações de finalização.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: sistema ofensivo, offensive formation, sistema de ataque
- **Não confundir com**: `OffensiveTechnicalTacticalAction` (ação individual dentro do sistema)
- **Atributos**:
  - +formation = string (ex: "4x3 com especialista")
  - +commonArrangements = {3:1, 2:2, 4:0}
  - +equalNumberAlternatives = {3:0, 2:1}
- **Relações**:
  - `OffensiveSystem` is-a `OffensiveDomain`
  - `NumericalAsymmetry` structures `OffensiveSystem`
  - `SpecialistRole` influences `OffensiveSystem`
- **Fonte**: MORILLO-2017; SILVA-MENEZES-2018
- **Exemplo de uso**: sistema ofensivo 4x3 com especialista como quarto jogador.

---

### DefensiveTechnicalTacticalAction

- **Definição**: ação técnico-tática individual ou coletiva realizada dentro do sistema defensivo, como cobertura, bloqueio, intercepção e retorno defensivo.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: ação defensiva, defensive action, ação técnico-tática defensiva
- **Não confundir com**: `DefensiveSystem` (estrutura) vs. ação (execução dentro da estrutura)
- **Atributos**:
  - +spaceControlPriority = ocupacao de espaco e bloqueio pelo corredor central
  - +pressureBlockDecision = pressao externa ou bloqueio conforme contexto da jogada
  - +fairPlaySafetyConstraint = execucao defensiva deve preservar fair play e seguranca
- **Relações**:
  - `DefensiveTechnicalTacticalAction` part-of `DefensiveDomain`
- **Fonte**: MORILLO-2017; ANDERSEN-SD
- **Exemplo de uso**: cobertura lateral realizada pelo defensor esquerdo após o passe do especialista.

---

### LoadMonitoringDomain

- **Definição**: domínio que agrupa os conceitos relacionados à carga de treinamento e competição, incluindo carga interna, carga externa e indicadores de desempenho físico.
- **Camada**: desempenho
- **Tipo**: Classe (domínio)
- **Sinônimos**: domínio de carga, monitoramento de carga, load domain
- **Atributos**:
  - +internalLoad = medidas fisiológicas (FC, PSE)
  - +externalLoad = medidas externas (distância, acelerações, arremessos)
  - +longTermAthleticPlan = planejamento individual anual integrando beach e indoor
  - +surfaceTransitionPeriod = transição individual entre superfícies para adaptação de carga
  - +crossStaffCommunication = comunicação operacional beach/indoor para decisão de carga, pausa e convocação
- **Relações**:
  - `LoadMonitoringDomain` part-of `PlayerPerformanceDomain`
  - `InternalLoad` part-of `LoadMonitoringDomain`
  - `ExternalLoad` part-of `LoadMonitoringDomain`
- **Fonte**: LEMOS-2023; NOVAKOVIC-SD
- **Exemplo de uso**: monitoramento da carga interna durante um set via frequência cardíaca e PSE.

---

### PlayerPerformanceDomain

- **Definição**: domínio que agrupa os conceitos relacionados ao perfil, desempenho e seleção de atletas no handebol de praia.
- **Camada**: desempenho
- **Tipo**: Classe (domínio)
- **Sinônimos**: domínio de desempenho, performance domain
- **Atributos**: *(a preencher conforme artigos)*
- **Relações**:
  - `LoadMonitoringDomain` part-of `PlayerPerformanceDomain`
  - `AnthropometricProfile` part-of `PlayerPerformanceDomain`
  - `PhysicalTestBattery` part-of `PlayerPerformanceDomain`
  - `TalentSelection` part-of `PlayerPerformanceDomain`
  - `PerformanceLevel` part-of `PlayerPerformanceDomain`
- **Fonte**: LEMOS-2023
- **Exemplo de uso**: análise do perfil antropométrico e físico de atletas para seleção de talentos.

---

---

### ShootingAction

- **Definição**: ação ofensiva de finalização — lançamento da bola em direção ao gol com o objetivo de marcar ponto (1 ou 2 pontos, dependendo da técnica). Conceito-pai das três técnicas específicas do handebol de praia.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: arremesso, finalização, throw, shot
- **Não confundir com**: passe (sem intenção de finalizar)
- **Atributos**:
  - +ballVelocity = velocidade da bola em km/h
  - +pointValue = 1 (arremesso normal) | 2 (técnicas especiais)
- **Relações**:
  - `ShootingAction` part-of `OffensiveDomain`
  - `StandingThrow6m` is-a `ShootingAction`
  - `SpinThrow` is-a `ShootingAction`
  - `AerialThrow` is-a `ShootingAction`
- **Fonte**: LEMOS-2023; SILVA-MENEZES-2018
- **Exemplo de uso**: arremesso de 6m em apoio com velocidade de 80 km/h marcando 1 ponto.

---

### StandingThrow6m

- **Definição**: arremesso específico do handebol de praia realizado com apoio a partir dos 6 metros, sem rotação ou salto aéreo. Técnica base discriminante entre atletas de elite e sub-elite.
- **Camada**: técnico-tática
- **Tipo**: Subclasse de `ShootingAction`
- **Sinônimos**: arremesso em apoio nos 6m, 6m standing throw
- **Não confundir com**: arremesso de 7m do handebol de quadra (regra diferente)
- **Atributos**:
  - +distance = 6m
  - +executionType = standing/support
  - +pointValue = 1
- **Relações**:
  - `StandingThrow6m` is-a `ShootingAction`
  - `StandingThrow6m` enables `EliteLevel`
- **Fonte**: LEMOS-2023
- **Exemplo de uso**: arremesso de 6m em apoio avaliado nos estudos 1 e 2 de LEMOS-2023 (p<0,001 para elite vs sub-elite).

---

### SpinThrow

- **Definição**: arremesso específico do handebol de praia realizado com rotação do corpo, gerando maior velocidade de bola e dificultando a defesa do goleiro. Vale 2 pontos.
- **Camada**: técnico-tática
- **Tipo**: Subclasse de `ShootingAction`
- **Sinônimos**: arremesso em giro, arremesso em rotação, spin throw
- **Atributos**:
  - +executionType = spin/rotation
  - +pointValue = 2
  - +minimumRotation = 360 degrees (giro completo)
  - +takeOffFeetOrientation = towards goal (critério de completude)
- **Relações**:
  - `SpinThrow` is-a `ShootingAction`
  - `SpinThrow` enables `EliteLevel`
- **Fonte**: LEMOS-2023; SKOWRONEK-2023
- **Exemplo de uso**: arremesso em giro executado pelo especialista como técnica de 2 pontos.

---

### AerialThrow

- **Definição**: arremesso específico do handebol de praia realizado no ar após salto, sem apoio no solo no momento da finalização. Técnica espetacular e característica do esporte. Vale 2 pontos.
- **Camada**: técnico-tática
- **Tipo**: Subclasse de `ShootingAction`
- **Sinônimos**: arremesso aéreo, inflight throw, tiro aéreo, flying shot
- **Atributos**:
  - +executionType = aerial/inflight
  - +pointValue = 2
  - +ballControlInAir = required
  - +slapOrPushExecutionValue = 1 ponto (não configura 2 pontos)
- **Relações**:
  - `AerialThrow` is-a `ShootingAction`
  - `AerialThrow` enables `EliteLevel`
- **Fonte**: LEMOS-2023; SKOWRONEK-2023
- **Exemplo de uso**: arremesso aéreo após corrida de aproximação com goleiro avançando.

---

### AgeCategory

- **Definição**: classificação normativa dos atletas por faixa etária para fins competitivos e de treinamento.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: categoria etária, age group, categoria
- **Relações**:
  - `AgeCategory_U19` is-a `AgeCategory`
  - `AgeCategory_U21` is-a `AgeCategory`
  - `AgeCategory_Senior` is-a `AgeCategory`
  - `AgeCategory_U19` precedes `AgeCategory_U21`
  - `AgeCategory_U21` precedes `AgeCategory_Senior`
- **Fonte**: LEMOS-2023
- **Exemplo de uso**: atleta de 17 anos compete na categoria sub-19.

---

### AgeCategory_U19

- **Definição**: categoria etária para atletas com até 19 anos de idade.
- **Camada**: normativa
- **Tipo**: Subclasse de `AgeCategory`
- **Sinônimos**: sub-19, U19, juvenil
- **Atributos**:
  - +maxAge = 19
- **Relações**:
  - `AgeCategory_U19` is-a `AgeCategory`
  - `AgeCategory_U19` precedes `AgeCategory_U21`
- **Fonte**: LEMOS-2023

---

### AgeCategory_U21

- **Definição**: categoria etária para atletas com até 21 anos de idade.
- **Camada**: normativa
- **Tipo**: Subclasse de `AgeCategory`
- **Sinônimos**: sub-21, U21, júnior
- **Atributos**:
  - +maxAge = 21
  - +performanceNote = supera sub-19 no salto horizontal e arremesso de 6m em apoio
- **Relações**:
  - `AgeCategory_U21` is-a `AgeCategory`
  - `AgeCategory_U19` precedes `AgeCategory_U21`
  - `AgeCategory_U21` precedes `AgeCategory_Senior`
- **Fonte**: LEMOS-2023

---

### AgeCategory_Senior

- **Definição**: categoria adulta principal, sem limite superior de idade definido pela IHF.
- **Camada**: normativa
- **Tipo**: Subclasse de `AgeCategory`
- **Sinônimos**: sênior, senior, adulto
- **Atributos**:
  - +minAge = 18
- **Relações**:
  - `AgeCategory_Senior` is-a `AgeCategory`
  - `AgeCategory_U21` precedes `AgeCategory_Senior`
- **Fonte**: LEMOS-2023

---

### PerformanceLevel

- **Definição**: classificação do nível competitivo do atleta ou equipe em relação ao universo de praticantes.
- **Camada**: desempenho
- **Tipo**: Classe
- **Sinônimos**: nível de desempenho, nível esportivo, performance level
- **Relações**:
  - `PerformanceLevel` part-of `PlayerPerformanceDomain`
  - `EliteLevel` is-a `PerformanceLevel`
  - `SubEliteLevel` is-a `PerformanceLevel`
- **Fonte**: LEMOS-2023

---

### EliteLevel

- **Definição**: nível de desempenho correspondente aos atletas de alto rendimento — referenciado por campeões mundiais e selecionados nacionais.
- **Camada**: desempenho
- **Tipo**: Subclasse de `PerformanceLevel`
- **Sinônimos**: elite, alto rendimento, top-level
- **Atributos**:
  - +referenceGroup = world champions, national team
- **Relações**:
  - `EliteLevel` is-a `PerformanceLevel`
  - `HorizontalJump` enables `EliteLevel`
  - `StandingThrow6m` enables `EliteLevel`
  - `SpinThrow` enables `EliteLevel`
  - `AerialThrow` enables `EliteLevel`
- **Fonte**: LEMOS-2023

---

### SubEliteLevel

- **Definição**: nível de desempenho abaixo do elite — atletas competitivos regionais ou nacionais sem nível internacional.
- **Camada**: desempenho
- **Tipo**: Subclasse de `PerformanceLevel`
- **Sinônimos**: sub-elite, regional, non-elite
- **Relações**:
  - `SubEliteLevel` is-a `PerformanceLevel`
- **Fonte**: LEMOS-2023

---

### InternalLoad

- **Definição**: resposta fisiológica interna do atleta ao esforço, mensurada principalmente por frequência cardíaca (FC) e percentual da FCmáx.
- **Camada**: desempenho
- **Tipo**: Subclasse de `LoadMonitoringDomain`
- **Sinônimos**: carga interna, internal load, resposta fisiológica
- **Atributos**:
  - +heartRate = frequência cardíaca em bpm
  - +percentHRmax = percentual da FCmáx
  - +typicalRange = 71-80% FCmáx durante partidas oficiais
  - +sleepRecoveryTarget = ~9h de sono/noite como referência de regeneração
  - +dualSurfaceRecoveryPriority = maior prioridade de recuperação para atletas beach+indoor
- **Relações**:
  - `InternalLoad` part-of `LoadMonitoringDomain`
- **Fonte**: LEMOS-2023; NOVAKOVIC-SD
- **Exemplo de uso**: atletas percorrem 1000-1200m por partida com resposta fisiológica de 71-80% FCmáx (Estudo 4, LEMOS-2023).

---

### ExternalLoad

- **Definição**: demanda de carga mensurada por parâmetros externos ao atleta, coletados via dispositivo inercial (IMU/WIMU): distância total, velocidade máxima, acelerações, desacelerações, corrida em alta intensidade.
- **Camada**: desempenho
- **Tipo**: Subclasse de `LoadMonitoringDomain`
- **Sinônimos**: carga externa, external load, demanda física
- **Atributos**:
  - +totalDistance = 1000-1200m por partida
  - +maxSpeed = velocidade máxima atingida (km/h)
  - +acceleration = aceleração máxima (m/s²)
  - +deceleration = desaceleração máxima (m/s²)
  - +HSR = corrida em alta velocidade
  - +measurementTool = IMU / WIMU
  - +nParams = 18
  - +dualSurfaceOverlapRisk = sobrecarga ampliada em atletas com agenda simultânea beach/indoor
  - +surfaceSpecificLoadProgression = progressão específica entre areia e indoor (rotação, saltos e contato corporal)
- **Relações**:
  - `ExternalLoad` part-of `LoadMonitoringDomain`
  - `SandSurface` influences `ExternalLoad`
- **Fonte**: LEMOS-2023; NOVAKOVIC-SD
- **Exemplo de uso**: 18 parâmetros de carga externa avaliados em 124 atletas seniores em 21 partidas oficiais via WIMU (Estudo 4, LEMOS-2023).

---

### AnthropometricProfile

- **Definição**: conjunto de variáveis morfológicas e corporais do atleta usado para análise de desempenho e seleção de talentos.
- **Camada**: desempenho
- **Tipo**: Classe
- **Sinônimos**: perfil antropométrico, anthropometric profile, morfologia
- **Atributos**:
  - +height = altura em cm
  - +bodyMass = massa corporal em kg
  - +BMI = índice de massa corporal (kg/m²)
  - +fatFreeMass = massa isenta de gordura — discrimina jovens masculinos selecionados
  - +palmDiameter = diâmetro palmar (cm) — discrimina jovens femininas selecionadas
- **Relações**:
  - `AnthropometricProfile` part-of `PlayerPerformanceDomain`
  - `TalentSelection` requires `AnthropometricProfile`
- **Fonte**: LEMOS-2023
- **Exemplo de uso**: massa isenta de gordura diferencia atletas jovens masculinos selecionados para a Seleção Brasileira (Estudo 3, LEMOS-2023).

---

### PhysicalTestBattery

- **Definição**: conjunto de testes físicos padronizados para avaliação de capacidades físicas específicas do handebol de praia, aplicados na superfície de areia.
- **Camada**: desempenho
- **Tipo**: Classe
- **Sinônimos**: bateria de testes físicos, physical tests, testes de condicionamento
- **Não confundir com**: `AnthropometricProfile` (variáveis corporais estáticas)
- **Relações**:
  - `PhysicalTestBattery` part-of `PlayerPerformanceDomain`
  - `HorizontalJump` is-a `PhysicalTestBattery`
  - `Sprint15m` is-a `PhysicalTestBattery`
  - `Acceleration5m` is-a `PhysicalTestBattery`
  - `HandgripStrength` is-a `PhysicalTestBattery`
  - `CountermovementJump` is-a `PhysicalTestBattery`
  - `TalentSelection` requires `PhysicalTestBattery`
- **Fonte**: LEMOS-2023

---

### HorizontalJump

- **Definição**: teste de salto horizontal executado na areia — avalia potência de membros inferiores; discrimina categorias etárias (sub-19 < sub-21 < sênior) e elite vs sub-elite.
- **Camada**: desempenho
- **Tipo**: Subclasse de `PhysicalTestBattery`
- **Sinônimos**: salto horizontal, horizontal jump, broad jump, salto em distância
- **Atributos**:
  - +surface = areia
  - +discriminatesElite = true
  - +discriminatesAgeCategory = true
- **Relações**:
  - `HorizontalJump` is-a `PhysicalTestBattery`
  - `HorizontalJump` enables `EliteLevel`
- **Fonte**: LEMOS-2023

---

### Sprint15m

- **Definição**: teste de velocidade máxima em 15 metros na areia, específico do handebol de praia — distância equivalente à área entre os goleiros.
- **Camada**: desempenho
- **Tipo**: Subclasse de `PhysicalTestBattery`
- **Sinônimos**: sprint 15m, 15m sprint test, velocidade máxima 15m
- **Não confundir com**: sprint 10m ou sprint 30m (distâncias do handebol de quadra)
- **Atributos**:
  - +distance = 15m
  - +surface = areia
  - +specificityNote = distância máxima entre áreas do goleiro no HP
- **Relações**:
  - `Sprint15m` is-a `PhysicalTestBattery`
- **Fonte**: LEMOS-2023

---

### Acceleration5m

- **Definição**: teste de aceleração em 5 metros na areia, avalia capacidade de aceleração inicial específica para os deslocamentos explosivos do handebol de praia.
- **Camada**: desempenho
- **Tipo**: Subclasse de `PhysicalTestBattery`
- **Sinônimos**: aceleração 5m, 5m acceleration test, 5m sprint
- **Atributos**:
  - +distance = 5m
  - +surface = areia
- **Relações**:
  - `Acceleration5m` is-a `PhysicalTestBattery`
- **Fonte**: LEMOS-2023

---

### HandgripStrength

- **Definição**: teste de força de preensão manual (kgf) realizado com dinamômetro; correlaciona com desempenho no arremesso.
- **Camada**: desempenho
- **Tipo**: Subclasse de `PhysicalTestBattery`
- **Sinônimos**: força de preensão manual, handgrip strength, dinamometria manual
- **Atributos**:
  - +unit = kgf
- **Relações**:
  - `HandgripStrength` is-a `PhysicalTestBattery`
- **Fonte**: LEMOS-2023

---

### CountermovementJump

- **Definição**: teste de salto vertical com contramovimento (CMJ) — avalia potência explosiva de membros inferiores; discrimina jovens femininas selecionadas para a Seleção Brasileira.
- **Camada**: desempenho
- **Tipo**: Subclasse de `PhysicalTestBattery`
- **Sinônimos**: salto com contramovimento, CMJ, countermovement jump
- **Atributos**:
  - +surface = areia
  - +discriminatesTalentFemale = true
- **Relações**:
  - `CountermovementJump` is-a `PhysicalTestBattery`
- **Fonte**: LEMOS-2023

---

### TalentSelection

- **Definição**: processo de tomada de decisão para selecionar ou eliminar atletas jovens de um programa de alta performance; envolve variáveis antropométricas, físicas e técnicas, mas também análise não-linear (redes, sistemas complexos).
- **Camada**: desempenho
- **Tipo**: Classe
- **Sinônimos**: seleção de talentos, talent selection, talent identification, detecção de talentos
- **Atributos**:
  - +approachLinear = variáveis antropométricas, físicas e técnicas
  - +approachNonLinear = análise de rede, sistemas complexos — maior precisão para jovens
- **Relações**:
  - `TalentSelection` part-of `PlayerPerformanceDomain`
  - `TalentSelection` requires `AnthropometricProfile`
  - `TalentSelection` requires `PhysicalTestBattery`
- **Fonte**: LEMOS-2023
- **Exemplo de uso**: seleção de 64 atletas jovens para a Seleção Brasileira (Mundial 2017), avaliados com análise linear e não-linear (Estudo 3, LEMOS-2023).

---

### SandSurface

- **Definição**: superfície instável de areia onde o handebol de praia é disputado; impõe maior demanda energética e neuromuscular em comparação com a superfície do handebol de quadra.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: superfície de areia, areia, sand surface, sandy pitch
- **Não confundir com**: superfície do handebol de quadra (parquet, sintético)
- **Atributos**:
  - +stability = instável
  - +energyDemand = maior que superfície sólida
  - +neuromuscularDemand = maior que superfície sólida
- **Relações**:
  - `SandSurface` influences `ExternalLoad`
  - `SandSurface` requires `PhysicalTestBattery` (testes devem ser aplicados na areia)
- **Fonte**: LEMOS-2023
- **Exemplo de uso**: sprint máximo em 15m na areia vs 30m no parquet — demanda neuromuscular distinta exige bateria de testes específica.


---

### GamePhase

- **Definição**: meta-classe que organiza as quatro fases cíclicas do jogo no handebol de praia — defesa, ataque, contra-ataque e retorno defensivo.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: fase do jogo, game phase, fase de jogo HP
- **Atributos**:
  - +cycleType = {defesa, ataque, contra-ataque, retorno defensivo}
- **Relações**:
  - `GamePhase` structures `DefensePhase`
  - `GamePhase` structures `AttackPhase`
  - `CounterAttack` is-a `GamePhase`
  - `DefensiveReturn` is-a `GamePhase`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: O ciclo completo de jogo compreende as quatro fases; o contra-ataque é a transição entre defesa e ataque.

---

### DefensePhase

- **Definição**: fase de não-posse da bola; equipe defensora tem inferioridade numérica estrutural (3×4), exigindo organização sistêmica.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: fase defensiva, defense phase
- **Relações**:
  - `DefensePhase` is-a `GamePhase`
  - `DefensePhase` requires `DefensiveSystem`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: A DefensePhase ativa o sistema defensivo e as intenções táticas de marcação.

---

### AttackPhase

- **Definição**: fase de posse da bola; equipe atacante tem superioridade numérica estrutural (4×3), condicionando o modelo ofensivo.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: fase ofensiva, attack phase
- **Atributos**:
  - +numericalBalance = 4 atacantes × 3 defensores (mais goleiro)
- **Relações**:
  - `AttackPhase` is-a `GamePhase`
  - `AttackPhase` enables `ShootingAction`
  - `AttackPhase` enables `OffensiveCollaborationMean`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Na AttackPhase, a equipe aplica o AttackModel para converter a superioridade em gols de duplo valor.

---

### CounterAttack

- **Definição**: sub-fase de transição defesa→ataque; equipe explora momento de desequilíbrio defensivo adversário logo após recuperar a posse.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: contra-ataque, counter-attack, transição ofensiva
- **Não confundir com**: AttackPhase (fase estruturada); CounterAttack é a transição rápida
- **Atributos**:
  - +priority = finalizar rapido a transicao ofensiva
  - +commonTriggers = {Interception, ThrowIn, offensive foul}
  - +assistantSupport = goleiro e jogador de linha podem iniciar/assistir a transicao
- **Relações**:
  - `CounterAttack` is-a `GamePhase`
  - `SpecialistRole` enables `CounterAttack`
  - `CounterAttack` requires `DefensiveReturn`
  - `Interception` enables `CounterAttack`
- **Fonte**: MORILLO-2017; PARADZIK-SD
- **Exemplo de uso**: O especialista inicia o contra-ataque logo após a defesa do goleiro.

---

### DefensiveReturn

- **Definição**: sub-fase de retorno defensivo; resposta organizada ao contra-ataque adversário, reorganizando a estrutura defensiva antes que o oponente finalize.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: retorno defensivo, defensive recall, defensive balance
- **Relações**:
  - `DefensiveReturn` is-a `GamePhase`
  - `CounterAttack` requires `DefensiveReturn`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: O retorno defensivo é ativado imediatamente após a perda da posse para evitar que o adversário complete o contra-ataque.

---

### Defense2_1

- **Definição**: sistema defensivo com um central avançado posicionado na zona de finalização do especialista adversário, forçando a desviar das posições de maior perigo.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: defesa 2:1, sistema 2-1, defense 2:1
- **Atributos**:
  - +advancedDefenderChannel = {middle, side}
- **Relações**:
  - `Defense2_1` is-a `DefensiveSystem`
- **Fonte**: MORILLO-2017; ANDERSEN-SD
- **Exemplo de uso**: O sistema 2:1 é eficaz para pressionar o especialista que atua no centro; exige adaptação quando o especialista muda para as alas.

---

### Defense2Plus1

- **Definição**: sistema defensivo misto: dois defensores em zona mais um marcando individualmente o especialista adversário.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: defesa 2+1, sistema misto 2+1, defense 2+1
- **Atributos**:
  - +markingType = {zonal, individual no especialista}
- **Relações**:
  - `Defense2Plus1` is-a `DefensiveSystem`
  - `Defense2Plus1` requires `SpecialistRole`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: O 2+1 destaca um defensor para seguir o especialista adversário em todas as posições.

---

### Defense1_2

- **Definição**: sistema defensivo com profundidade central e dois defensores laterais mais abertos; prioriza cobrir as entradas em direção à baliza.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: defesa 1:2, sistema 1-2, defense 1:2
- **Relações**:
  - `Defense1_2` is-a `DefensiveSystem`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: O 1:2 oferece proteção central robusta mas pode ser vulnerável à fintas laterais.

---

### Defense1_2Plus1

- **Definição**: variação do sistema 1:2 com um quarto defensor adicionado para marcação individual, geralmente do especialista.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: defesa 1:2+1, sistema 1-2-1
- **Relações**:
  - `Defense1_2Plus1` is-a `DefensiveSystem`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: O 1:2+1 combina a profundidade do 1:2 com a pressão individual do especialista adversário.

---

### IndividualDefense

- **Definição**: sistema defensivo totalmente individual; cada defensor marca um atacante específico; usado nos últimos minutos quando equipe necessita recuperar a posse urgentemente.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: defesa individual, marcação homem a homem, man-to-man defense
- **Relações**:
  - `IndividualDefense` is-a `DefensiveSystem`
  - `IndividualDefense` requires `DefensiveCollaborationMean`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Uma equipe perdendo por um ponto nos últimos segundos pode adotar a defesa individual para tentar forçar um erro adversário.

---

### ControlFromDistance

- **Definição**: intenção tática defensiva de controlar o portador da bola à distância, sem oposição direta; prioridade quando o atacante é o especialista adversário.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: controle à distância, marcação à distância, control from distance
- **Relações**:
  - `ControlFromDistance` is-a `DefensiveTechnicalTacticalAction`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Defensor mantém distância do especialista para evitar penalidade mas limitar o ângulo de arremesso.

---

### Siege

- **Definição**: intenção tática defensiva de oposição direta corpo a corpo quando o atacante entra na zona de finalização.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: marcação próxima, marcação direta, siege, close marking
- **Não confundir com**: `ControlFromDistance` (marcação à distância)
- **Relações**:
  - `Siege` is-a `DefensiveTechnicalTacticalAction`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: O defensor usa o Siege quando o pivô adversário se posiciona próximo à baliza.

---

### Dissuasion

- **Definição**: intenção tática defensiva de dificultar ou atrasar a recepção da bola pelo adversário sem bola, sem contato direto.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: dissuasão, dissuasion, perturbação de recepção
- **Relações**:
  - `Dissuasion` is-a `DefensiveTechnicalTacticalAction`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Defensor posiciona-se entre o atacante sem bola e a trajetória esperada do passe.

---

### Interception

- **Definição**: intenção tática defensiva de interceptar o passe antes de atingir o receptor; especialmente eficaz nos passes em voo (arremesso em voo ao segundo tempo).
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: intercepção, interception, roubo de passe
- **Relações**:
  - `Interception` is-a `DefensiveTechnicalTacticalAction`
  - `Interception` enables `CounterAttack`
- **Fonte**: MORILLO-2017; PARADZIK-SD
- **Exemplo de uso**: Defensor antecipa trajetória do passe em voo para interceptar antes que o atacante o receba.

---

### SecondDefender

- **Definição**: recurso defensivo coletivo ("doblaje") em que um segundo defensor assume a marcação quando o primeiro é ultrapassado, servindo como segunda linha antes do goleiro.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: segundo defensor, doblaje, second defender, covering
- **Relações**:
  - `SecondDefender` is-a `DefensiveTechnicalTacticalAction`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Quando o especialista adversário ultrapassa o primeiro marcador, o segundo defensor posiciona-se para cobrir a linha de arremesso.

---

### DefensiveDomain

- **Definição**: domínio ontológico que agrupa todos os conceitos relacionados à defesa no handebol de praia: sistemas, ações técnico-táticas individuais e meios de colaboração coletiva.
- **Camada**: técnico-tática
- **Tipo**: Classe (domínio)
- **Sinônimos**: domínio defensivo, defensive domain
- **Relações**:
  - `DefensiveSystem` part-of `DefensiveDomain`
  - `DefensiveTechnicalTacticalAction` part-of `DefensiveDomain`
  - `DefensiveCollaborationMean` part-of `DefensiveDomain`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Todos os sistemas defensivos (3:0, 2:1, etc.) são parte do DefensiveDomain.

---

### DefensiveCollaborationMean

- **Definição**: meios coletivos de colaboração defensiva que permitem à equipe coordenar ações entre defensores para compensar a inferioridade numérica estrutural do HP (3×4).
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: meios de colaboração defensiva, defensive collaboration means
- **Atributos**:
  - +trigger = {cruzamento de atacantes, bloqueio ofensivo}
- **Relações**:
  - `DefensiveCollaborationMean` part-of `DefensiveDomain`
  - `ChangeOfOpponent` is-a `DefensiveCollaborationMean`
  - `Slipping` is-a `DefensiveCollaborationMean`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Quando dois atacantes se cruzam, a defesa pode usar ChangeOfOpponent ou Slipping.

---

### ChangeOfOpponent

- **Definição**: meio de colaboração defensiva em que dois defensores trocam de oponente quando os atacantes adversários se cruzam.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: mudança de marcação, troca de oponente, change of opponent
- **Relações**:
  - `ChangeOfOpponent` is-a `DefensiveCollaborationMean`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Usado quando o especialista e um ala realizam um cruzamento; defensores trocam marcações para não deixar espaço.

---

### Slipping

- **Definição**: meio de colaboração defensiva em que cada defensor continua marcando seu oponente direto mesmo durante cruzamentos ou bloqueios adversários; oposto ao ChangeOfOpponent.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: acompanhamento, passagem, slipping, follow-through marking
- **Não confundir com**: `ChangeOfOpponent` (troca de oponentes)
- **Relações**:
  - `Slipping` is-a `DefensiveCollaborationMean`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Na marcação individual do especialista, o defensor usa Slipping para não perdê-lo de vista mesmo com o cruzamento.

---

### OffensiveDomain

- **Definição**: domínio ontológico que agrupa todos os conceitos relacionados ao ataque no handebol de praia: sistemas, arremessos, meios de colaboração e modelo de ataque.
- **Camada**: técnico-tática
- **Tipo**: Classe (domínio)
- **Sinônimos**: domínio ofensivo, offensive domain
- **Relações**:
  - `OffensiveSystem` part-of `OffensiveDomain`
  - `ShootingAction` part-of `OffensiveDomain`
  - `OffensiveCollaborationMean` part-of `OffensiveDomain`
  - `AttackModel` part-of `OffensiveDomain`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: Todos os sistemas ofensivos (3:1, 4:0) e arremessos (giro, aéreo) são parte do OffensiveDomain.

---

### AttackModel

- **Definição**: modelo de ataque da equipe, definido pela forma prioritária de obter gols de duplo valor; determina o sistema ofensivo e as posições prioritárias do especialista.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: modelo de ataque, attack model
- **Atributos**:
  - +priorityGoalType = gol de duplo valor (especialista ou arremesso específico)
  - +specialistPosition = {central, pivô, ala direita, ala esquerda}
  - +fallbackPredeterminedActions = usadas quando a criatividade ofensiva falha
- **Relações**:
  - `AttackModel` part-of `OffensiveDomain`
  - `NumericalAsymmetry` enables `AttackModel`
  - `SpecialistRole` influences `AttackModel`
- **Fonte**: MORILLO-2017; PARADZIK-SD; SILVA-MENEZES-2018
- **Exemplo de uso**: Uma equipe com especialista de arremesso em giro usa AttackModel posicionando-o nas alas para maximizar os gols de 2 pontos.

---

### OffensiveCollaborationMean

- **Definição**: meios básicos de colaboração ofensiva que garantem continuidade, movimentação e criação de espaços aproveitando a superioridade numérica estrutural do HP (4×3).
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: meios de colaboração ofensiva, offensive collaboration means
- **Relações**:
  - `OffensiveCollaborationMean` part-of `OffensiveDomain`
  - `PassAndGo` is-a `OffensiveCollaborationMean`
  - `SuccessiveEntrances` is-a `OffensiveCollaborationMean`
  - `Blockage` is-a `OffensiveCollaborationMean`
  - `Crossing` is-a `OffensiveCollaborationMean`
  - `Screen` is-a `OffensiveCollaborationMean`
- **Fonte**: MORILLO-2017; SILVA-MENEZES-2018
- **Exemplo de uso**: O PassAndGo e o Crossing são os meios mais usados em situações 4×3 para criar linhas de passe após a movimentação.

---

### PassAndGo

- **Definição**: meio de colaboração ofensiva em que o atacante passa a bola e imediatamente se movimenta para explorar o espaço gerado; eficaz contra defesas abertas e individual.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: passa e vai, pass and go, pass and move
- **Relações**:
  - `PassAndGo` is-a `OffensiveCollaborationMean`
- **Fonte**: MORILLO-2017

---

### SuccessiveEntrances

- **Definição**: meio de colaboração ofensiva com entradas sucessivas ao espaço, aproveitando a superioridade numérica para criar linhas de finalização sequenciais.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: entradas sucessivas, successive entrances, engajamento, penetracoes sucessivas
- **Relações**:
  - `SuccessiveEntrances` is-a `OffensiveCollaborationMean`
- **Fonte**: MORILLO-2017; SILVA-MENEZES-2018

---

### Blockage

- **Definição**: meio de colaboração ofensiva em que um atacante realiza bloqueio (direto ou indireto) sobre um defensor para liberar um companheiro para finalização.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: bloqueio ofensivo, blockage, screen-roll
- **Atributos**:
  - +type = {direto, indireto}
- **Relações**:
  - `Blockage` is-a `OffensiveCollaborationMean`
- **Fonte**: MORILLO-2017

---

### Crossing

- **Definição**: meio de colaboração ofensiva em que dois atacantes se cruzam para explorar o erro na troca de marcação defensiva.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: cruzamento, crossing
- **Relações**:
  - `Crossing` is-a `OffensiveCollaborationMean`
- **Fonte**: MORILLO-2017; SILVA-MENEZES-2018

---

### Screen

- **Definição**: meio de colaboração ofensiva em que um atacante usa o corpo como "cortina" para bloquear a trajetória defensiva; frequente em situações de lançamento livre.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: cortina, screen, pick
- **Relações**:
  - `Screen` is-a `OffensiveCollaborationMean`
- **Fonte**: MORILLO-2017

---

### OffensiveSystem3_1

- **Definição**: sistema de ataque com duas linhas: três jogadores avançados mais o especialista em posição variável (central, pivô, alas); permite rotações táticas mantendo a referência ofensiva.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: sistema 3:1, attack 3+1, sistema ofensivo 3-1
- **Relações**:
  - `OffensiveSystem3_1` is-a `OffensiveSystem`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: A maioria das equipes de elite do HP usa o sistema 3:1 com o especialista central como referência principal.

---

### OffensiveSystem4_0

- **Definição**: sistema de ataque com uma linha única de quatro jogadores; pode migrar para o 3:1 dependendo do perfil do especialista e da defesa adversária.
- **Camada**: técnico-tática
- **Tipo**: Classe
- **Sinônimos**: sistema 4:0, attack 4+0, quatro avançados
- **Relações**:
  - `OffensiveSystem4_0` is-a `OffensiveSystem`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: O 4:0 é utilizado para criação de espaços antes de migrar para o 3:1 com o especialista posicionado.

---

### GoalkeeperRole

- **Definição**: posição especializada do handebol de praia; o goleiro defende a baliza mas sai para o ataque, sendo substituído pelo especialista que marca gols de duplo valor.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: goleiro, goalkeeper, arqueiro
- **Não confundir com**: GoalkeeperRole do handebol de quadra — no HP o goleiro faz parte da rotação ofensiva
- **Atributos**:
  - +doubleRole = {defende a baliza, joga no ataque como ala/pivô}
  - +substituição = sai quando a equipe está atacando (substituído pelo especialista)
  - +insideGoalAreaBallContact = permitido com qualquer parte do corpo
  - +outsideGoalAreaRule = regras de jogador de linha se aplicam
  - +cannotLeaveGoalAreaWithControlledBall = true
  - +contactResponsibilityWhenLeavingArea = goleiro responde por contato perigoso
- **Relações**:
  - `GoalkeeperRole` enables `NumericalAsymmetry`
- **Fonte**: MORILLO-2017; ROLLAND-DARE-FANACK-SD; MEIMARIDIS-GOMER-GOMER-SD; ANDERSEN-SD
- **Exemplo de uso**: O goleiro, ao sair para o ataque, gera a superioridade numérica 4×3 que é a base tática do HP.

---

### PivotRole

- **Definição**: posição ofensiva no centro da linha de ataque; tem alta probabilidade de finalização bem-sucedida por explorar o interior da defesa; é também uma das posições do especialista no HP.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: pivô, pivot, central avançado
- **Atributos**:
  - +position = central (interior da defesa)
  - +finalizationProbability = alta
- **Relações**:
  - `PivotRole` enables `ShootingAction`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: O especialista no PivotRole usa arremessos em giro e por cima do defensor para converter gols de 2 pontos.

---

### WingRole

- **Definição**: posição ofensiva nos flancos do ataque (ala direita ou ala esquerda); executa arremessos em giro como principal ameaça de duplo valor pelas laterais.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: ala, ala direita, ala esquerda, wing, right wing, left wing
- **Atributos**:
  - +position = {ala direita, ala esquerda}
  - +primaryShot = arremesso em giro (`SpinThrow`)
- **Relações**:
  - `WingRole` enables `ShootingAction`
- **Fonte**: MORILLO-2017
- **Exemplo de uso**: A ala executa o SpinThrow desde o flanco para converter o gol de 2 pontos que define o resultado do período.


---

### GoldenGoal

- **Definição**: regra de desempate de período em que o primeiro gol marcado após o tempo regular encerra imediatamente aquele período, concedendo a vitória do período à equipe que marcou.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: golden goal, gol de ouro, sudden death
- **Não confundir com**: `ShootOut` — o GoldenGoal é disputado em jogo corrido; o ShootOut é uma sequência de arremessos de 6m
- **Atributos**:
  - +trigger = empate no final do período
  - +outcome = primeiro a marcar vence o período
  - +scope = período específico (não necessariamente a partida)
- **Relações**:
  - `GoldenGoal` part-of `GamePeriod`
  - `GoldenGoal` precedes `ShootOut`
- **Fonte**: IHF-2026
- **Exemplo de uso**: Com placar empatado em 2-2 ao final do período, a equipe que marcar primeiro no Golden Goal vence aquele período; se o placar estiver 1-1 em períodos, vai para o ShootOut.

---

### ShootOut

- **Definição**: mecanismo de desempate final utilizado quando cada equipe venceu um período; consiste em cinco tentativas alternadas por equipe, cada uma com goleiro + um jogador de campo numa situação 1v1 a partir do centro da quadra.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: shoot-out, disputa de arremessos, penáltis do HP
- **Não confundir com**: `GoldenGoal` — o ShootOut é executado com arremessos formais, não em jogo corrido; `SixMetreThrow` — o arremesso de 6m é punição em jogo normal
- **Atributos**:
  - +trigger = empate 1-1 em períodos vencidos
  - +attempts = 5 por equipe (seguidos se necessário até desempate)
  - +format = goleiro + jogador de campo, saindo do centro
  - +timeLimit = 3 segundos para arremessar
  - +coinToss = determina quem começa
  - +goalkeeperLeavingAreaAvoidingContact = play on
  - +goalkeeperCollisionOutsideArea = sixMetreThrow + possible disqualification
  - +goalkeeperInterceptionAttemptNoCollision = permitido
- **Relações**:
  - `ShootOut` requires `GoalkeeperRole`
  - `ShootOut` causes `SixMetreThrow`
  - `GoldenGoal` precedes `ShootOut`
- **Fonte**: IHF-2026; ROLLAND-DARE-FANACK-SD; MEIMARIDIS-GOMER-GOMER-SD; ANDERSEN-SD
- **Exemplo de uso**: Partida terminou 1-1 em períodos; no ShootOut, cada equipe designa 5 jogadores que alternam tentativas até que uma equipe marque mais que a outra nas 5 tentativas.

---

### PlayingCourt

- **Definição**: área de jogo retangular de 27m × 12m coberta de areia, com zona de segurança mínima de 3m em todas as direções; inclui a área de gol, a linha de 6m, a linha de centro e as metas.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: quadra, court, playing area, campo de jogo
- **Não confundir com**: `SandSurface` — que descreve as propriedades físicas da areia, não as dimensões normativas da quadra
- **Atributos**:
  - +dimensions = 27m × 12m
  - +safetyZone = 3m (todos os lados)
  - +goals = 2m alto × 3m largo (interno)
  - +lighting_local = 400 lux
  - +lighting_international = 1000–1500 lux (noturno)
- **Relações**:
  - `PlayingCourt` part-of `SandSurface`
  - `GoalArea` part-of `PlayingCourt`
- **Fonte**: IHF-2026; MEIMARIDIS-GOMER-GOMER-SD
- **Exemplo de uso**: A quadra mede 27×12m com profundidade de areia de 40cm; a zona de segurança de 3m ao redor impede que jogadores sofram lesões ao sair dos limites.

---

### GoalArea

- **Definição**: área semicircular de 6m ao redor de cada meta; apenas o goleiro tem permissão de entrar nessa zona; defineções de jogo passivo e infrações têm origem nesta regra.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: área do goleiro, goal area, 6m zone, zona do goleiro
- **Não confundir com**: `SixMetreThrow` — a linha de 6m é usada como referência para o arremesso de penálti, mas é distinta da área de gol como conceito
- **Atributos**:
  - +radius = 6m
  - +accessRights = somente goleiro
  - +reference = linha de 6m (outer edge)
- **Relações**:
  - `GoalArea` part-of `PlayingCourt`
  - `GoalArea` requires `GoalkeeperRole`
- **Fonte**: IHF-2026
- **Exemplo de uso**: Um jogador de linha que pisa na área de gol durante ataque comete infração de invasão; a bola sai para o goleiro adversário.

---

### GamePeriod

- **Definição**: unidade temporal básica da partida de Handebol de Praia; cada partida tem dois períodos de 10 minutos com 5 minutos de intervalo; cada período é decidido de forma independente e pode incluir Golden Goal se empatado.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: período, set, half (informal), período de 10 minutos
- **Não confundir com**: período do handebol de quadra — no HP cada período é decidido independentemente; a pontuação reinicia
- **Atributos**:
  - +duration = 10 minutos
  - +count = 2 períodos por partida
  - +intermission = 5 minutos entre períodos
  - +scoring = pontuação independente por período
- **Relações**:
  - `GamePeriod` enables `GoldenGoal`
  - `GamePeriod` enables `TeamTimeout`
- **Fonte**: IHF-2026
- **Exemplo de uso**: No final do 1º período com placar 2-2, a disputa passa para o Golden Goal. A equipe que vencer dois períodos (ou o ShootOut) vence a partida.

---

### Ball

- **Definição**: bola oficial do Handebol de Praia; feita de borracha não derrapante (proibido uso de resina); tem especificações de peso e circunferência diferenciadas por gênero.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: bola, ball, bola de handebol de praia
- **Não confundir com**: bola do Handebol de Quadra — tamanho e peso são diferentes; proibição de resina é específica do HP
- **Atributos**:
  - +materialMasculino = borracha não derrapante (350–370g, 54–56cm circunferência)
  - +materialFeminino = borracha não derrapante (280–300g, 50–52cm circunferência)
  - +resinProhibited = true
  - +pressurePsi = conforme tabela IHF
- **Relações**:
  - `Ball` requires `SandSurface`
- **Fonte**: IHF-2026
- **Exemplo de uso**: A bola masculina pesa entre 350–370g e tem circunferência de 54–56cm; uso de resina adesiva é proibido no HP.

---

### TeamTimeout

- **Definição**: pausa de 1 minuto solicitada pela equipe; cada equipe tem direito a um time-out por meia-tempo de período; solicitado com cartão verde pelo responsável de equipe.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: tempo técnico, time-out de equipe, team time-out, cartão verde
- **Não confundir com**: time-out de jogo padrão solicitado pelos árbitros
- **Atributos**:
  - +duration = 1 minuto
  - +allowedPerHalf = 1
  - +signal = cartão verde
  - +requester = responsável de equipe
- **Relações**:
  - `TeamTimeout` part-of `GamePeriod`
- **Fonte**: IHF-2026
- **Exemplo de uso**: Com placar desfavorável nos 3 últimos minutos do período, o treinador solicita o time-out com o cartão verde para ajustar a estratégia.

---

### ThrowType

- **Definição**: classe-container que agrupa os cinco tipos normativos de reinício ou execução de jogo no Handebol de Praia: arremesso de árbitro, lateral, goleiro, livre e de 6m.
- **Camada**: normativa
- **Tipo**: Classe (container)
- **Sinônimos**: tipo de arremesso, throw type, restart type
- **Não confundir com**: `ShootingAction` — que descreve ações técnicas de finalização, não reinícios normativos de jogo
- **Relações**:
  - `ThrowType` structures `RefereeThrow`
  - `ThrowType` structures `ThrowIn`
  - `ThrowType` structures `GoalkeeperThrow`
  - `ThrowType` structures `FreeThrow`
  - `ThrowType` structures `SixMetreThrow`
- **Fonte**: IHF-2026
- **Exemplo de uso**: Ao sair da lateral, o árbitro indica o tipo de reinício (ThrowIn); cada tipo de reinício tem posição, executor e regras específicas.

---

### RefereeThrow

- **Definição**: arremesso executado pelos árbitros no centro da quadra para reiniciar o jogo no início de cada período e em situações de Golden Goal; cada equipe tem um jogador posicionado na lateral do centro.
- **Camada**: normativa
- **Tipo**: Subclasse de `ThrowType`
- **Sinônimos**: referee throw, arremesso de árbitro, lançamento central
- **Atributos**:
  - +executedBy = árbitros
  - +position = centro da quadra
  - +trigger = início de período ou Golden Goal
- **Relações**:
  - `RefereeThrow` is-a `ThrowType`
  - `RefereeThrow` part-of `GamePeriod`
- **Fonte**: IHF-2026
- **Exemplo de uso**: No início do 2º período, ambas as equipes estão posicionadas e os árbitros executam o RefereeThrow ao centro para reiniciar a partida.

---

### ThrowIn

- **Definição**: reinício de jogo executado quando a bola cruza a linha lateral; executado pela equipe que não tocou por último na bola antes de sair; no ponto da saída.
- **Camada**: normativa
- **Tipo**: Subclasse de `ThrowType`
- **Sinônimos**: lateral, throw-in, arremesso lateral, rimessa laterale
- **Atributos**:
  - +trigger = bola fora pela lateral
  - +executor = equipe que não tocou por último
  - +position = ponto de saída
- **Relações**:
  - `ThrowIn` is-a `ThrowType`
- **Fonte**: IHF-2026
- **Exemplo de uso**: A bola sai pela linha lateral após arremesso bloqueado; o árbitro indica o ThrowIn para a equipe adversária no ponto onde a bola saiu.

---

### GoalkeeperThrow

- **Definição**: reinício de jogo executado pelo goleiro a partir de qualquer ponto dentro da área de gol; ocorre após um gol ou quando a bola entra na área de gol.
- **Camada**: normativa
- **Tipo**: Subclasse de `ThrowType`
- **Sinônimos**: goalkeeper throw, arremesso do goleiro, remessa do goleiro
- **Atributos**:
  - +trigger = gol marcado ou bola na área de gol
  - +executor = goleiro
  - +position = qualquer ponto da área de gol
  - +ownGoalException = não é possível marcar gol contra em GoalkeeperThrow
  - +maxExecutionTime = 3 segundos
  - +wrongExecutionIfLeavingAreaWithControlledBall = true
- **Relações**:
  - `GoalkeeperThrow` is-a `ThrowType`
  - `GoalkeeperThrow` requires `GoalkeeperRole`
- **Fonte**: IHF-2026; ROLLAND-DARE-FANACK-SD
- **Exemplo de uso**: Após gol marcado pelo adversário, o goleiro pega a bola dentro da área e executa o GoalkeeperThrow para reiniciar o jogo rapidamente.

---

### FreeThrow

- **Definição**: reinício de jogo concedido ao time que sofreu a infração; executado na posição onde ocorreu a infração; é também a penalidade aplicada quando a equipe violou a regra do jogo passivo.
- **Camada**: normativa
- **Tipo**: Subclasse de `ThrowType`
- **Sinônimos**: free throw, arremesso livre, tiro livre
- **Não confundir com**: `SixMetreThrow` — concedido em situações mais graves (chance clara de gol negada)
- **Atributos**:
  - +trigger = infração ou jogo passivo
  - +executor = equipe lesada
  - +position = local da infração
- **Relações**:
  - `FreeThrow` is-a `ThrowType`
  - `PassivePlay` causes `FreeThrow`
- **Fonte**: IHF-2026
- **Exemplo de uso**: Após quarto passe consecutivo sem finalização, o árbitro sinaliza jogo passivo; o FreeThrow é concedido à equipe adversária.

---

### SixMetreThrow

- **Definição**: arremesso de penálti concedido quando uma chance clara de gol é negada ilegalmente; executado por um jogador de campo na linha de 6m contra o goleiro adversário; vale 2 pontos se convertido.
- **Camada**: normativa
- **Tipo**: Subclasse de `ThrowType`
- **Sinônimos**: 6m throw, penálti, arremesso de 6m, six-metre throw, penalty throw
- **Não confundir com**: `StandingThrow6m` — que é a técnica de execução; `SixMetreThrow` é a regra normativa que define quando e por que é concedido
- **Atributos**:
  - +trigger = chance clara de gol negada ilegalmente
  - +clearChanceCriteria = controle de bola e corpo para finalizar ao gol
  - +triggerCaseA = intervenção irregular de jogador/oficial adversário
  - +triggerCaseB = apito indevido durante chance clara de gol
  - +triggerCaseC = interferência externa de não participante
  - +position = linha de 6m
  - +value = 2 pontos se convertido
  - +executor = qualquer jogador de campo do time beneficiado
  - +executionTimeAfterWhistle = até 3 segundos
  - +throwerCannotTouchOrCross6mLine = true
  - +throwerCannotPlayBallAgainBeforeGoalOrOpponentTouch = true
  - +goalkeeperCannotBeChangedWhenThrowerReady = true
  - +opponentsMustKeepDistanceAndFairPlayDuringExecution = true
- **Relações**:
  - `SixMetreThrow` is-a `ThrowType`
  - `SixMetreThrow` causes `TwoPointGoal`
  - `SixMetreThrow` requires `GoalkeeperRole`
- **Fonte**: IHF-2026; SKOWRONEK-2023; CALDAS-MONICO-MARTINEZ-SD
- **Exemplo de uso**: Defensor segura atacante em situação de frente a frente com o goleiro; árbitro concede SixMetreThrow; se convertido, vale 2 pontos.

---

### PassivePlay

- **Definição**: regra que limita a circulação de bola a quatro passes consecutivos após o sinal de advertência do árbitro; se ultrapassado, resulta em arremesso livre para o adversário.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: jogo passivo, passive play, 4-pass rule
- **Não confundir com**: posse de bola — o tempo de posse não é cronometrado; o árbitro decide quando sinalizar
- **Atributos**:
  - +warningSignal = gesto manual do árbitro (mão levantada)
  - +passLimit = 4 passes após sinal
  - +penalty = FreeThrow para o adversário
- **Relações**:
  - `PassivePlay` influences `AttackPhase`
  - `PassivePlay` causes `FreeThrow`
- **Fonte**: IHF-2026; PARADZIK-SD
- **Exemplo de uso**: Com a equipe circulando a bola sem finalização, o árbitro levanta a mão sinalizando o jogo passivo; a equipe tem ainda 4 passes para finalizar ou perde a posse.

---

### TwoPointGoal

- **Definição**: gol que vale dois pontos no Handebol de Praia; ocorre quando marcado de maneira criativa/espetacular (em voo, giro, mergulho, bicicleta), quando marcado pelo goleiro, ou quando marcado após um arremesso de 6m.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: gol de 2 pontos, dois pontos, double, spectacular goal, creative goal
- **Não confundir com**: gol de 1 ponto — gol normal a partir de jogo corrido sem ação espetacular
- **Atributos**:
  - +value = 2 pontos
  - +triggerActions = {SpinThrow, AerialThrow, mergulho, bicicleta, GoalkeeperRole, SpecialistRole, SixMetreThrow}
  - +goalkeeperOrSpecialistScore = 2 pontos
- **Relações**:
  - `TwoPointGoal` enables `SpinThrow`
  - `TwoPointGoal` enables `AerialThrow`
  - `TwoPointGoal` enables `GoalkeeperRole`
  - `TwoPointGoal` enables `SpecialistRole`
  - `SixMetreThrow` causes `TwoPointGoal`
- **Fonte**: IHF-2026; SKOWRONEK-2023
- **Exemplo de uso**: A ala executa um SpinThrow em voo completo no flanco; o árbitro confirma o gol de 2 pontos, decisivo para vencer o período.

---

### Punishment

- **Definição**: classe-container que agrupa as três categorias progressivas de punição do Handebol de Praia: advertência verbal, suspensão temporária e desqualificação.
- **Camada**: normativa
- **Tipo**: Classe (container)
- **Sinônimos**: punição, punishment, disciplinary action
- **Não confundir com**: infração (foul) — a infração é o ato; a punição é a resposta normativa
- **Atributos**:
  - +applyWhenDefenderAttacksBodyNotBall = true
  - +noPunishmentWhenDefenderClearlyPlaysBall = true
  - +lineViolationMustPunishCorrectPlayer = true
  - +faultySubstitutionOrIllegalEntry = mayCausePlayerSuspension
  - +goalkeeperShootOutCollision = mayCausePlayerDisqualification
- **Relações**:
  - `Punishment` structures `PlayerWarning`
  - `Punishment` structures `PlayerSuspension`
  - `Punishment` structures `PlayerDisqualification`
- **Fonte**: IHF-2026; CALDAS-MONICO-MARTINEZ-SD; ROLLAND-DARE-FANACK-SD; MEIMARIDIS-GOMER-GOMER-SD
- **Exemplo de uso**: O árbitro aplica punições progressivas: primeira infração → PlayerWarning; reincidência → PlayerSuspension; conduta grave → PlayerDisqualification.

---

### PlayerWarning

- **Definição**: primeira punição progressiva no HP; advertência verbal dada pelo árbitro a um jogador ou oficial por conduta antidesportiva de menor grau; não reduz o número de jogadores em campo.
- **Camada**: normativa
- **Tipo**: Subclasse de `Punishment`
- **Sinônimos**: advertência verbal, verbal warning, admoestação
- **Não confundir com**: `PlayerSuspension` — que exclui o jogador temporariamente; `PlayerDisqualification` — que é permanente para a partida
- **Atributos**:
  - +effect = sem redução de equipe
  - +signal = Rule 16:1
- **Relações**:
  - `PlayerWarning` is-a `Punishment`
  - `PlayerWarning` precedes `PlayerSuspension`
- **Fonte**: IHF-2026
- **Exemplo de uso**: Jogador reclama de decisão arbitral; árbitro aplica advertência verbal (PlayerWarning); equipe continua com número completo.

---

### PlayerSuspension

- **Definição**: punição temporária que exclui o jogador do jogo até que ocorra uma troca de posse (turnover) entre as equipes; a equipe não pode substituir o jogador suspenso no período da suspensão.
- **Camada**: normativa
- **Tipo**: Subclasse de `Punishment`
- **Sinônimos**: suspensão, suspension, exclusão temporária
- **Não confundir com**: suspensão de 2 minutos do handebol de quadra — no HP a duração é até o próximo turnover, não cronometrada; `PlayerDisqualification` — que é permanente para o jogo
- **Atributos**:
  - +duration = até próximo turnover entre equipes
  - +effect = equipe joga com -1 jogador em campo
  - +substitutionAllowed = false (durante suspensão)
  - +signal = Rule 16:2
- **Relações**:
  - `PlayerSuspension` is-a `Punishment`
  - `PlayerSuspension` precedes `PlayerDisqualification`
- **Fonte**: IHF-2026
- **Exemplo de uso**: Jogador comete falta grave mas não violenta; árbitro aplica PlayerSuspension; equipe joga com 2 em campo até o adversário perder a posse da bola.

---

### PlayerDisqualification

- **Definição**: punição permanente que exclui o jogador ou oficial do jogo e da área de substituição pelo restante da partida; concedida por conduta grave, antideportiva grave ou segunda suspensão ao mesmo jogador; requer relatório escrito.
- **Camada**: normativa
- **Tipo**: Subclasse de `Punishment`
- **Sinônimos**: desqualificação, disqualification, cartão vermelho, red card
- **Não confundir com**: `PlayerSuspension` — que é temporária; banimento de partidas futuras — é consequência indireta se relatório for exigido
- **Atributos**:
  - +duration = restante da partida (inclusive Golden Goal e ShootOut)
  - +effect = jogador deve deixar quadra e área de substituição
  - +reportRequired = true (para maioria dos casos, Rule 16:9)
  - +signal = cartão vermelho (~9×12cm)
  - +secondSuspension = leva automaticamente a desqualificação (Rule 16:6h)
- **Relações**:
  - `PlayerDisqualification` is-a `Punishment`
- **Fonte**: IHF-2026
- **Exemplo de uso**: Após segundo ato de conduta antideportiva durante a partida, o árbitro levanta o cartão vermelho; jogador deixa imediatamente a quadra e não pode ter contato com a equipe.

---

### RefereeRole

- **Definição**: função normativa de arbitragem no Handebol de Praia; dois árbitros com igual autoridade conduzem o jogo, iniciam/reiniciam períodos e aplicam decisões disciplinares.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: árbitro, referee, dupla de arbitragem
- **Não confundir com**: `RefereeThrow` — que é um tipo de reinício executado pela arbitragem
- **Atributos**:
  - +authority = decisões finais sobre fatos de jogo
  - +countPerMatch = 2
  - +scope = controle técnico-disciplinar da partida
- **Relações**:
  - `RefereeRole` enables `RefereeThrow`
  - `Punishment` requires `RefereeRole`
- **Fonte**: IHF-2026
- **Exemplo de uso**: No início do período, a dupla de arbitragem autoriza o reinício com `RefereeThrow` e, durante o jogo, aplica punições progressivas.

---

### TimekeeperScorekeeperRole

- **Definição**: função normativa de mesa que controla cronômetro, súmula e suporte formal às substituições; atua em coordenação com os árbitros.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: mesa, cronometrista, apontador, timekeeper, scorekeeper
- **Não confundir com**: `RefereeRole` — a mesa apoia a arbitragem, mas não substitui sua autoridade de decisão
- **Atributos**:
  - +deskLocation = centro da lateral, mínimo de 3m fora da quadra
  - +coreTasks = {tempo de jogo, súmula, controle formal de substituições}
  - +coordination = apoio operacional aos árbitros
- **Relações**:
  - `TimekeeperScorekeeperRole` enables `TeamTimeout`
  - `TimekeeperScorekeeperRole` influences `SubstitutionArea`
- **Fonte**: IHF-2026
- **Exemplo de uso**: A mesa interrompe/retoma o relógio em `TeamTimeout` e auxilia os árbitros no controle de entradas e saídas de substituições.

---

### SubstitutionArea

- **Definição**: zona normativa de substituições de cada equipe, localizada ao longo da lateral, com regras específicas para entrada e saída de jogadores de linha e goleiro.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: área de substituição, substitution zone, bench-side lane
- **Não confundir com**: `PlayingCourt` — a área de substituição fica fora da área de jogo
- **Atributos**:
  - +length = 15m
  - +widthApprox = 3m
  - +entryRule = entradas pela própria linha de substituição
  - +goalkeeperEntrySide = lado da própria equipe
- **Relações**:
  - `SubstitutionArea` requires `GoalkeeperRole`
  - `TimekeeperScorekeeperRole` influences `SubstitutionArea`
  - `SubstitutionArea` causes `PlayerSuspension`
- **Fonte**: IHF-2026; ROLLAND-DARE-FANACK-SD
- **Exemplo de uso**: O goleiro suplente aguarda na área de substituição e entra pela lateral regulamentar da própria equipe.

---

### AthleteUniform

- **Definição**: conjunto normativo de vestimenta e acessórios dos atletas no handebol de praia, incluindo distinção visual obrigatória do goleiro e conformidade com o regulamento oficial de uniforme.
- **Camada**: normativa
- **Tipo**: Classe
- **Sinônimos**: uniforme do atleta, athlete kit, uniform regulation
- **Não confundir com**: equipamento de quadra (`PlayingCourt`) ou regra de bola (`Ball`)
- **Atributos**:
  - +teamConsistency = uniformidade visual dentro da equipe
  - +goalkeeperDifferentiation = cor distinta dos jogadores de linha
  - +compliance = conforme Athlete Uniform Regulations (IHF)
  - +improperGoalkeeperShirtAtEntry = mayCauseFaultySubstitution
- **Relações**:
  - `GoalkeeperRole` requires `AthleteUniform`
- **Fonte**: IHF-2026; SKOWRONEK-2023; ROLLAND-DARE-FANACK-SD
- **Exemplo de uso**: Ao entrar como goleiro, a atleta usa uniforme com mesma identificação da equipe, porém cor diferenciada para cumprir a regra.

## Termos pendentes de definição completa

> Extraídos da seção 4 do manual. Aguardam artigo de referência para definição formal.

| Termo | Camada | Tipo provável |
|-------|--------|---------------|
| `SpecificTechnicalSkill` | técnico-tática | Classe |
