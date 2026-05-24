# CEPRAEA Design Decision Record

## 1. Objetivo e escopo

Este documento oficializa decisões de design/UX para o CEPRAEA com foco em governança e consistência operacional.

Ele define:
- fundamentos de design system;
- contratos de UX para operação real;
- taxonomia UX-facing do Scout ao vivo;
- critérios objetivos de aceite visual e operacional.

Ele **não** é plano de implementação imediata de tela, schema de banco ou contrato técnico final de Scout.

---

## 2. Relação com CEPRAEA.md e hierarquia documental

Este DDR complementa o `CEPRAEA.md` no eixo de design e UX.

Hierarquia aplicada:
1. `CEPRAEA.md` define produto e escopo MVP.
2. Este DDR define decisões de design/UX e governança visual.
3. `docs/scout/*` permanece fonte técnica do domínio Scout.
4. Código implementado e testes definem estado real de execução.

---

## 3. Decisões oficiais — DDR-001 a DDR-015

### DDR-001 — Design system híbrido

**Decisão:** o CEPRAEA adota design system híbrido.

**Diretriz:**
- CSS variables para tokens;
- Tailwind para composição;
- classes semânticas para padrões;
- componentes React para comportamento.

### DDR-002 — CSS variables como fonte de verdade visual

**Decisão:** variáveis CSS são a fonte de verdade dos tokens globais.

**Diretriz:** alterações de cor, espaçamento e superfície devem partir dos tokens oficiais.

### DDR-003 — Tailwind para layout e composição

**Decisão:** Tailwind é a camada padrão de layout/composição de UI.

**Diretriz:** usar utilitários para velocidade e consistência, evitando CSS ad hoc por tela.

### DDR-004 — Tokens semânticos separados de marca

**Decisão:** tokens de marca e tokens funcionais não devem ser misturados.

**Diretriz:**
- verde limão representa marca/ação primária;
- verde limão não representa “sucesso universal”.

### DDR-005 — Classes semânticas para padrões reutilizáveis

**Decisão:** padrões recorrentes de interface devem virar classes semânticas reutilizáveis.

**Diretriz:** evitar duplicação de composição utilitária em múltiplas telas para o mesmo padrão.

### DDR-006 — Componentes React como camada de comportamento e acessibilidade

**Decisão:** comportamento e acessibilidade ficam encapsulados em componentes React.

**Diretriz:** estados, foco, teclado, feedback e variações críticas devem ser resolvidos por componente.

### DDR-007 — Separação entre superfície institucional e superfície operacional

**Decisão:** telas institucionais e telas operacionais não compartilham a mesma densidade de interação.

**Diretriz:** Scout e fluxos de operação ao vivo seguem prioridade de velocidade/segurança operacional.

### DDR-008 — UX de Scout orientada a pressão real

**Decisão:** Scout ao vivo deve reduzir carga cognitiva e erro sob pressão.

**Diretriz:**
- poucas ações primárias por estado;
- progressão por etapas;
- confirmação clara e rápida.

### DDR-009 — Conectividade intermitente e estados de sincronização explícitos

**Decisão:** UX do CEPRAEA assume conectividade intermitente.

**Diretriz:** estado de persistência deve ser sempre visível com vocabulário oficial:
- `Salvo localmente`
- `Sincronizando`
- `Sincronizado`
- `Falha`

### DDR-010 — Leitura outdoor como requisito operacional

**Decisão:** legibilidade em ambiente externo é requisito de UX para Scout.

**Diretriz:** conteúdo crítico deve priorizar contraste elevado e leitura sob sol/reflexo.

### DDR-011 — Feedback háptico para confirmação operacional

**Decisão:** Scout ao vivo deve usar confirmação háptica como reforço não-visual.

**Diretriz:** em ambiente ruidoso, feedback auditivo não é confirmação primária.

### DDR-012 — Taxonomia do Scout é UX-facing e orienta interface

**Decisão:** a interface do Scout segue taxonomia UX-facing por natureza de ação.

**Diretriz:** separar explicitamente:
- tipo de arremesso;
- resultado da ação;
- evento de atleta;
- evento de equipe.

### DDR-013 — Fonte técnica do Scout permanece em docs/scout/*

**Decisão:** este DDR não substitui a documentação técnica do domínio Scout.

**Diretriz:** contratos técnicos, campos e regras de dados continuam em `docs/scout/*`.

### DDR-014 — Coexistência atual de tokens e convergência planejada

**Decisão:** estado atual reconhece coexistência entre `--color-cep-*` e `--auth-*`.

**Diretriz:**
- novos tokens globais convergem para família `--cep-*`;
- `--auth-*` pode permanecer como alias/camada de compatibilidade durante migração.

### DDR-015 — Taxonomia de dados não deve ser deformada pela pressa da interface

**Decisão:** velocidade de UI não pode quebrar a semântica de dados do Scout.

**Diretriz:** a interface não pode misturar no mesmo nível elementos de natureza distinta (ex.: tipo de arremesso e resultado factual).

---

## 4. Taxonomia oficial de ações do Scout (UX-facing)

### 4.1 Regra geral

A taxonomia neste documento é de interface (UX-facing). A fonte técnica do domínio continua em `docs/scout/*`.

### 4.2 Grupos de ação na interface

- **Tipo de arremesso:** regular, giro/spin, aérea/in-flight, especialista, goleiro.
- **Resultado da ação:** gol, defesa do goleiro, out, bloqueio de linha.
- **Evento de atleta:** exclusão temporária, cartões, faltas e outros eventos individuais.
- **Evento de equipe:** tempo técnico, passividade e outros eventos coletivos.

### 4.3 Sequência obrigatória de coleta (UX)

Fluxo base de finalização:
1. Selecionar atleta.
2. Selecionar tipo de arremesso.
3. Selecionar resultado.
4. Confirmar registro.

### 4.4 Regras de pontuação e contexto de jogo

Para evitar ambiguidade na UX:
- a interface deve deixar explícita distinção entre jogadas de 1 ponto e 2 pontos;
- transições de set/período devem ser legíveis no fluxo operacional;
- eventos especiais (ex.: especialista) devem manter semântica distinta e rastreável.

### 4.5 Mapeamento com documentação técnica

As seguintes famílias técnicas permanecem como referência de domínio:
- `TIPO_FINALIZACAO`
- `RESULTADO_FACTUAL`
- `PONTOS_JOGADA`
- `CAUSA_PRINCIPAL`
- contratos e blocos em `COLETA_SCOUT`, `COLETA_AO_VIVO`, `PARTICIPACOES`, `EVENTOS_MENTAIS`, `VALIDACAO`, `RELATORIO`, `FEEDBACK`.

---

## 5. Contratos de UX com métricas objetivas

### 5.1 Contrato objetivo (JSON)

```json
{
  "scout_live": {
    "primary_actions_max_per_state": 5,
    "tap_target_min_px": 44,
    "critical_content_min_contrast": "7:1",
    "status_vocabulary": ["Salvo localmente", "Sincronizando", "Sincronizado", "Falha"],
    "haptic_feedback_required": true,
    "one_hand_priority": true,
    "primary_actions_zone": "lower_60_percent"
  },
  "global": {
    "semantic_tokens_required": true,
    "brand_token_not_equal_success_token": true,
    "docs_scout_as_technical_source": true,
    "taxonomy_mix_forbidden": true
  }
}
```

### 5.2 Contrato narrativo

- Conteúdo crítico do Scout deve ser legível em uso outdoor.
- Fluxo de registro ao vivo deve minimizar escolha concorrente e reduzir erro de classificação.
- Estados de persistência/sincronização devem ser sempre visíveis e semanticamente consistentes.
- Feedback de confirmação deve combinar sinal visual e háptico quando suportado.

---

## 6. Decisões de densidade por usuário

### 6.1 Atleta

- Menor densidade informacional por tela.
- Foco em leitura, confirmação e acompanhamento pessoal.
- Prioridade de clareza e progressão simples.

### 6.2 Treinador

- Densidade moderada/alta quando necessário.
- Foco em operação, decisão e controle do fluxo.
- Prioridade de velocidade com segurança semântica.

---

## 7. Checklist obrigatório para qualquer nova tela

- A tela usa tokens e padrões do design system oficial.
- Não introduz cor/estilo sem token semântico.
- A hierarquia visual é consistente com o domínio.
- Estados de erro/vazio/loading foram definidos.
- Legibilidade mínima atende o contexto de uso esperado.
- Acessibilidade básica (foco, contraste, toque) foi coberta.
- Não há contradição com `CEPRAEA.md`.

---

## 8. Checklist específico para Scout ao vivo

- Fluxo respeita separação entre tipo de arremesso e resultado.
- Ações primárias estão em zona de alcance para uso com uma mão.
- Quantidade de ações primárias por estado é controlada.
- Distinção de 1pt/2pt está legível durante o registro.
- Estados de sincronização estão visíveis com vocabulário oficial.
- Confirmação háptica está definida quando suportada.
- Contraste e legibilidade suportam uso em ambiente externo.
- Taxonomia de UI está alinhada e não substitui `docs/scout/*`.

---

## 9. Critérios de aceite visual e operacional

Uma proposta de tela/fluxo passa quando:
- respeita DDR-001 a DDR-015;
- não cria nova semântica fora da taxonomia UX-facing definida;
- mantém consistência de tokens e padrões reutilizáveis;
- preserva clareza operacional em contexto de pressão;
- não compromete qualidade de dado por simplificação de interface.

---

## 10. O que este documento não decide

- Não define schema final do banco.
- Não altera o `CEPRAEA.md`.
- Não substitui `docs/scout`.
- Não define layout final de todas as telas.
- Não autoriza refatoração cosmética sem impacto de produto.
- Não obriga migração imediata de todas as telas legadas.

---

## 11. O que não pode acontecer

- Misturar no mesmo nível ações de natureza distinta no Scout.
- Tratar verde limão como “sucesso padrão” em toda a aplicação.
- Criar tokens paralelos sem governança e semântica clara.
- Esconder estado de sincronização em fluxo operacional crítico.
- Declarar “consistência visual” sem critérios objetivos de validação.
- Usar este DDR para sobrescrever contratos técnicos de `docs/scout/*`.

---

## 12. Estado atual de tokens em src/index.css

Estado atual confirmado:
- `--color-cep-*` e `--auth-*` coexistem.

Decisão:
- novos tokens globais convergem para família `--cep-*`;
- `--auth-*` permanece como camada de compatibilidade durante transição planejada.

Tokens `--color-cep-*` confirmados (origem: `@theme` do Tailwind):

Por estarem definidos no `@theme`, esses tokens aparecem no uso diário como classes utilitárias, por exemplo:
- `bg-cep-*`
- `text-cep-*`
- `border-cep-*`

Isso evita confusão entre variável CSS bruta (`--color-cep-*`) e classe utilitária gerada para composição de UI.

Regra de manutenção:
- antes de qualquer alteração de tokens, conferir a lista factual vigente em `src/index.css`.

---

## 13. Referências externas usadas como apoio

As referências abaixo são apoio para contexto e fundamentação, não substituem decisão de produto ou contrato técnico interno:
- IHF / EHF (regras e contexto de handebol de praia).
- WCAG (contraste e acessibilidade).
- MDN e web.dev (PWA, estados de rede e sincronização).
- Literatura de UX/HCI sobre decisão sob pressão, uso mobile e ergonomia de toque.

Regra editorial:
- afirmações sensíveis devem ser apresentadas em formato `Decisão` + `Evidência`;
- evitar linguagem de comprovação científica absoluta sem referência explícita no texto.
