---
tipo: PRD
nome: "CEPRAEA — Documento de Produto Oficial"
papel: "Define O QUÊ o CEPRAEA é, quem usa, o que faz parte do MVP e os critérios de sucesso do produto — não descreve estado de implementação."
autoridade: "Hierarquia 3/4 — vence interpretação livre de agente sobre escopo; perde para código real (estado atual) e para plan.md (sequência de execução)."
lido_por: "Claude, Codex, Copilot"
quando_ler: "antes de propor nova feature; ao avaliar se algo é ou não escopo do MVP; ao definir critério de aceite de produto"
atualizado_por: "Humano (decisão de produto)"
quando_atualizar: "mudança de objetivo, escopo funcional, critério de sucesso ou fronteira MVP/pós-MVP"
validade: "2026-05-06"
status: ATUAL
status_nota: "PARCIAL para Seção 6 — estado atual do sistema pode divergir do código; verificar código antes de agir"
conflito: "CEPRAEA.md define O QUÊ construir. Se contradiz código → código prevalece para estado atual; se define escopo e agente discorda → CEPRAEA.md prevalece até decisão humana contrária."
proibido:
  - "Agentes NÃO devem alterar este documento para justificar implementação já feita"
  - "NÃO devem tratar Seção 6 como verdade do estado atual sem verificar código"
nao_cobre: "Sequência de tarefas, provas de implementação, status de progresso técnico, histórico de execução"
---

# CEPRAEA — PRD Oficial do Produto

**Versão:** 2.0.0  
**Data:** 6 de maio de 2026  
**Status:** Ativo  
**Escopo:** Produto, MVP v1.0, direção arquitetural e critérios de produto

---

## 1. Finalidade deste documento

Este documento é o **PRD oficial** do CEPRAEA.

Ele define:

- o problema do produto;
- os usuários do sistema;
- o escopo do MVP v1.0;
- os fluxos obrigatórios;
- os requisitos funcionais;
- os requisitos não funcionais;
- a direção arquitetural do produto;
- os critérios de sucesso do MVP;
- os limites do produto nesta fase.

Este documento **não** é:

- contrato de execução por tarefa;
- checklist de implementação;
- changelog técnico;
- inventário completo de todo arquivo existente no repositório.

### 1.1 Hierarquia oficial de documentos

O CEPRAEA usa esta separação:

- `CEPRAEA.md`: PRD oficial do produto.
- `plan.md`: contrato oficial de execução técnica até o MVP.
- `docs/*.md`: documentação técnica temática.
- código fonte: comportamento real implementado.

Se houver conflito:

1. o comportamento real do código prevalece sobre descrição abstrata;
2. `plan.md` prevalece para execução;
3. `CEPRAEA.md` prevalece para intenção de produto e escopo.

### 1.2 Regra de atualização

`CEPRAEA.md` deve ser atualizado quando houver mudança em pelo menos um dos itens abaixo:

- objetivo do MVP;
- escopo funcional do produto;
- regra de acesso de usuários;
- integração oficial do sistema;
- definição de sucesso do MVP;
- fronteira entre MVP e pós-MVP;
- direção arquitetural oficial.

Mudança local de implementação sem impacto no produto não exige alteração deste PRD.

---

## 2. Resumo executivo

CEPRAEA é um sistema PWA para gestão de atletas, treinos, presença e scout tático para handebol de praia.

O produto deve permitir que treinador e atletas operem os fluxos principais de treino e presença com autenticação segura, baixa fricção operacional e base de dados centralizada.

O produto existe para substituir um processo manual que consome tempo demais do treinador, gera erro operacional e empurra a equipe para uma rotina improvisada de planilhas, mensagens soltas e retrabalho.

O **MVP v1.0** existe quando o sistema:

1. autentica treinador e atleta com segurança;
2. centraliza os dados operacionais do MVP no Supabase;
3. registra presença manual e por confirmação da atleta no mesmo modelo de dados;
4. permite uso real por atletas e treinador sem dependência do legado;
5. pode ser validado por testes reais e critérios objetivos.

---

## 3. Problema do produto

Equipes e centros de treino pequenos precisam controlar:

- atletas ativas e inativas;
- agenda recorrente de treinos;
- presença e ausência;
- comunicação operacional com atletas;
- histórico de frequência;
- observação tática básica.

### 3.1 Dor operacional real do treinador

Antes do CEPRAEA, o processo operacional do treinador dependia de:

- criação manual de planilhas para cada período de treino;
- atualização recorrente de planilhas para marcar presença;
- manutenção de histórico em Google Sheets por longos períodos;
- mensagens no grupo de WhatsApp pedindo confirmação;
- leitura manual das respostas das atletas em meio à conversa do grupo;
- consolidação manual da informação para saber quem vai ao treino;
- revisão manual de horários e datas dos treinos;
- correção manual de treino marcado errado em feriado.

Esse processo gerava um custo recorrente e improdutivo:

- o treinador gastava tempo atualizando planilhas há anos;
- a conversa no WhatsApp enterrava a informação conforme novas mensagens apareciam;
- a confirmação de presença perdia rastreabilidade;
- os treinos exigiam atenção manual constante para não haver erro de agenda;
- o treinador gastava energia com operação em vez de planejar treino, estudar e organizar melhor a equipe.

### 3.2 Problemas que o produto precisa resolver

Os problemas atuais desse contexto são:

- processo manual e fragmentado;
- baixa rastreabilidade;
- alto risco de inconsistência entre presença informada e presença registrada;
- dificuldade para operar com segurança sem uma base central;
- dependência de soluções improvisadas para login, sync e confirmação.

### 3.3 Exemplo concreto de erro recorrente

Treinos em feriado devem acontecer pela manhã.

Sem apoio do sistema, o treinador pode marcar por engano um treino à noite, porque a agenda é montada manualmente. Quando isso acontece:

- as atletas já começam a se programar com base no horário errado;
- o treinador precisa corrigir a informação depois;
- em alguns casos precisa mudar o treino ou cancelar;
- a confiança operacional da equipe cai;
- tempo adicional é gasto apenas para reparar um erro evitável.

O CEPRAEA existe para resolver esse problema com um produto simples de operar, seguro o bastante para uso real e preparado para evolução.

### 3.4 Valor gerado pelo produto

O CEPRAEA deve gerar valor direto nestes pontos:

- ganhar tempo operacional do treinador;
- reduzir erro humano de agenda e presença;
- preservar informação importante sem perdê-la no fluxo do WhatsApp;
- organizar a equipe com mais clareza;
- melhorar a comunicação de presença;
- liberar tempo do treinador para atividades mais produtivas para a equipe.

---

## 4. Usuários e perfis

### 4.1 Treinador

Responsabilidades:

- entrar no painel administrativo;
- cadastrar e manter atletas;
- gerar e manter treinos;
- registrar presença manual;
- acompanhar frequência;
- disparar fluxos de confirmação;
- operar scout tático.

### 4.2 Atleta

Responsabilidades:

- entrar no portal da atleta;
- acessar seus treinos;
- confirmar presença;
- informar ausência quando permitido;
- redefinir senha;
- consultar seu próprio contexto.

### 4.3 Administrador técnico do sistema

Responsabilidades:

- configurar ambiente;
- manter credenciais;
- operar Supabase;
- acompanhar rollout;
- validar migração;
- garantir integridade técnica do sistema.

Esse perfil não precisa existir como papel separado dentro do produto no MVP. Ele pode ser exercido pelo próprio time técnico.

---

## 5. Princípios do produto

O CEPRAEA deve seguir estes princípios:

1. **Fonte de verdade única:** dados operacionais do MVP não podem depender de múltiplas verdades concorrentes.
2. **Segurança pragmática:** autenticação real, escopo de dados por usuário e ausência de segredos no frontend.
3. **Fluxo real antes de conveniência:** o produto não pode simular comportamento para “parecer pronto”.
4. **Baixa fricção para atleta:** login, primeiro acesso e confirmação de presença devem ser simples.
5. **Operação clara para treinador:** o treinador deve entender quem está vinculada, quem confirmou e o estado real de cada treino.
6. **Evolução segura:** o MVP deve permitir expansão sem reabrir a base de auth e presença.
7. **Economia real de tempo:** o sistema só cumpre seu papel se reduzir trabalho manual recorrente do treinador.
8. **Informação encontrável:** presença e agenda não podem depender de memória de grupo de WhatsApp.

---

## 6. Estado atual do produto em maio de 2026

Esta seção existe para impedir documentação mentirosa.

### 6.1 O que já está estabelecido

- autenticação do treinador por email e senha via Supabase;
- autenticação da atleta por email e senha via Supabase;
- redefinição de senha da atleta via fluxo padrão do Supabase;
- `AtletaGuard` com vínculo por `user_id` e fallback de primeiro login por email;
- rotas dedicadas para portal da atleta;
- camada Supabase com schema, RLS e RPCs já existente;
- fluxo público de confirmação por token Supabase já presente no produto;
- exportação local de dados;
- módulo de scout tático no frontend.

### 6.2 O que ainda não está concluído

- migração de `athletes`, `trainings` e `attendance` para Supabase como fonte principal de operação;
- remoção completa do caminho legado de sync;
- cutover final de dados legados;
- endurecimento final dos E2E do MVP;
- limpeza final de runtime legado.

### 6.3 O que não faz parte do contrato oficial do produto

As implementações legadas abaixo podem ainda existir no repositório durante a migração, mas **não fazem parte do contrato oficial do produto final**:

- Google Apps Script como dependência operacional oficial;
- Google Sheets como base oficial de dados;
- login por PIN;
- `sessionStorage` como mecanismo oficial de autenticação;
- IndexedDB como fonte principal de verdade do MVP.

---

## 7. Objetivo do MVP v1.0

O objetivo do MVP v1.0 é colocar o CEPRAEA em uso real para atletas e treinador com um núcleo confiável de operação.

No ponto de vista do treinador, o MVP precisa trocar um processo de:

- planilha manual;
- mensagens dispersas;
- conferência humana de resposta;
- correção manual de agenda;

por um processo de:

- cadastro único da atleta;
- agenda organizada;
- confirmação rastreável;
- presença consolidada;
- consulta rápida do estado real do treino.

### 7.1 Resultado esperado

Ao final do MVP v1.0:

- o treinador acessa o painel por Supabase Auth;
- a atleta acessa seu portal por Supabase Auth;
- o cadastro de atleta comporta vínculo de conta;
- treinos do MVP têm persistência central;
- presença manual e confirmação da atleta convergem no mesmo registro;
- o painel reflete presença real sem divergência silenciosa;
- o sistema pode ser validado por testes e scripts objetivos;
- o legado não fica no caminho crítico.

### 7.2 Definição de pronto do produto

O MVP v1.0 só existe quando todas as condições abaixo forem verdadeiras:

1. o sistema executa sem erro;
2. o sistema aplica autenticação real para treinador e atleta;
3. o sistema aplica isolamento de acesso coerente com o escopo do usuário;
4. os dados operacionais do MVP usam Supabase como fonte principal;
5. a presença por treinador, atleta e token converge no mesmo modelo;
6. não há dependência operacional obrigatória de Apps Script ou Google Sheets;
7. não há comportamento falso no lugar de persistência real;
8. o sistema está validado por testes e gate final verificável;
9. a documentação mínima de operação está atualizada;
10. o produto está apto a uso real e evolução segura.

---

## 8. Escopo do MVP v1.0

### 8.1 Incluído no MVP

#### 8.1.1 Acesso e identidade

- login do treinador por email e senha;
- login da atleta por email e senha;
- primeiro acesso da atleta;
- redefinição de senha da atleta;
- vínculo de atleta com conta autenticada;
- bloqueio de acesso quando a usuária autenticada não corresponde a uma atleta válida.

#### 8.1.2 Gestão de atletas

- cadastro de atleta;
- edição de atleta;
- ativação e inativação;
- armazenamento de nome, email, telefone, categoria, nível e observações;
- visualização do estado de vínculo da conta da atleta.

#### 8.1.3 Gestão de treinos

- criação de treino;
- edição de treino;
- visualização de agenda;
- geração recorrente de treinos;
- detecção de conflito com feriados;
- detalhamento do treino.

#### 8.1.4 Presença

- marcação manual pelo treinador;
- confirmação pela atleta no portal;
- confirmação pública por token;
- justificativa de ausência quando suportada pelo fluxo;
- visualização consolidada de presença no detalhe do treino;
- leitura de frequência e resumo em cima do mesmo conjunto final de dados.

#### 8.1.5 Relatórios

- resumo por treino;
- frequência por atleta;
- leitura de participação para o período.

#### 8.1.6 Exportação e contingência

- exportação CSV;
- exportação XLSX;
- backup local em JSON;
- restauração local de backup quando suportada pelo fluxo do produto.

#### 8.1.7 Scout tático

- cadastro de jogo;
- registro de eventos ao vivo;
- resumo do jogo;
- persistência do módulo de scout no escopo do MVP.

### 8.2 Fora do escopo do MVP

- múltiplas organizações no mesmo painel com governança completa;
- permissões complexas por papel dentro da equipe;
- pagamentos;
- folha;
- análise preditiva;
- integração WhatsApp via API oficial;
- notificações push;
- BI avançado;
- app nativo;
- OAuth corporativo;
- GraphQL;
- painel administrativo de superusuário;
- refatoração cosmética sem impacto de produto.

---

## 9. Fluxos principais do produto

### 9.1 Fluxo A — Login do treinador

1. treinador acessa `/login`;
2. informa email e senha;
3. sessão Supabase é validada;
4. `AuthGuard` libera o painel;
5. treinador entra em dashboard, atletas, treinos e demais áreas protegidas.

### 9.2 Fluxo B — Primeiro acesso da atleta

1. treinador cadastra atleta com email;
2. atleta cria conta com esse mesmo email;
3. atleta faz login;
4. o sistema vincula `auth.user` ao registro da atleta;
5. `AtletaGuard` libera o portal.

### 9.3 Fluxo C — Redefinição de senha da atleta

1. atleta acessa a tela de login da atleta;
2. solicita redefinição;
3. recebe link por email;
4. abre a rota de nova senha;
5. salva a nova senha;
6. entra no portal da atleta.

### 9.4 Fluxo D — Cadastro e manutenção de atleta

1. treinador acessa a lista de atletas;
2. cria ou edita atleta;
3. atleta aparece imediatamente no painel;
4. o sistema deve refletir o estado real de persistência do cadastro.

### 9.5 Fluxo E — Criação de treino

1. treinador cria treino único ou recorrente;
2. o sistema grava o treino;
3. o treino aparece na agenda;
4. a atleta pode vê-lo no seu escopo quando aplicável.

### 9.6 Fluxo F — Presença manual do treinador

1. treinador abre o detalhe do treino;
2. marca presença, ausência ou justificativa;
3. o sistema grava o resultado;
4. o resumo do treino e os relatórios passam a refletir esse mesmo dado.

### 9.7 Fluxo G — Confirmação pública por token

1. treinador gera lote de links;
2. atleta acessa o link;
3. confirma presença ou ausência;
4. o sistema grava no modelo oficial de presença;
5. painel e portal da atleta mostram o mesmo resultado.

### 9.8 Fluxo H — Consulta da atleta

1. atleta entra no portal;
2. vê seus treinos;
3. abre o detalhe do treino;
4. enxerga o status de presença;
5. interage conforme o fluxo permitido.

---

## 10. Requisitos funcionais

### 10.1 Requisitos de autenticação

O sistema deve:

- autenticar treinador com Supabase Auth;
- autenticar atleta com Supabase Auth;
- manter sessão de forma compatível com o cliente web;
- permitir logout explícito;
- suportar redefinição de senha da atleta;
- impedir acesso ao portal da atleta quando não houver atleta válida vinculada.

O sistema não deve:

- exigir PIN como login oficial;
- usar segredo privilegiado no frontend;
- depender de autenticação local simulada para rotas protegidas.

### 10.2 Requisitos de atletas

O sistema deve:

- permitir criar, editar, inativar e consultar atletas;
- armazenar email para suporte ao vínculo de conta;
- identificar se a atleta já está vinculada a uma conta;
- manter dados suficientes para presença, relatórios e contato operacional.

### 10.3 Requisitos de treinos

O sistema deve:

- permitir criar treinos unitários;
- permitir gerar treinos recorrentes;
- permitir definir horário, data, local, tipo, observações e status;
- suportar leitura por treinador e por atleta dentro do escopo permitido.

### 10.4 Requisitos de presença

O sistema deve:

- permitir marcação manual pelo treinador;
- permitir confirmação pela atleta;
- permitir confirmação pública por token;
- usar um modelo central de presença para os três fluxos;
- refletir o mesmo estado em resumo, relatório e detalhe do treino.

### 10.5 Requisitos de portal da atleta

O sistema deve:

- ter login específico da atleta;
- ter rotas próprias da atleta;
- exibir apenas o que pertence à atleta autenticada;
- impedir leitura de dados de outras atletas;
- permitir saída da sessão.

### 10.6 Requisitos de presença por token

O sistema deve:

- suportar criação de lote;
- suportar exportação/cópia de links;
- suportar revogação de lote quando aplicável;
- impedir uso indevido por escopo inválido;
- gravar presença no banco final.

### 10.7 Requisitos de relatórios

O sistema deve:

- calcular frequência por atleta;
- calcular resumo por treino;
- operar a partir do mesmo dado final usado no painel;
- evitar divergência entre leitura agregada e detalhe operacional.

### 10.8 Requisitos de exportação

O sistema deve:

- exportar atletas, treinos e presenças;
- gerar CSV;
- gerar XLSX;
- permitir backup JSON local.

### 10.9 Requisitos de scout

O sistema deve:

- permitir criação de jogos;
- registrar eventos em tempo real;
- manter resumo dos eventos;
- preservar esse módulo sem quebrar o MVP de presença.

---

## 11. Requisitos não funcionais

### 11.1 Segurança

O sistema deve:

- usar Supabase Auth para o MVP;
- usar RLS para limitar acesso por escopo;
- evitar exposição de segredos sensíveis no frontend;
- impedir que a atleta leia dados de outra atleta;
- impedir que o usuário sem equipe leia dados protegidos;
- manter separação entre chaves públicas e credenciais privilegiadas.

### 11.2 Robustez

O sistema deve:

- se comportar corretamente em reload;
- evitar divergência entre telas que leem a mesma presença;
- lidar com estados de sessão inválida;
- não depender de múltiplas fontes principais de verdade;
- ter rollback operacional claro para migrações de dados.

### 11.3 Observabilidade mínima

O sistema deve:

- permitir auditoria de mudanças importantes no banco quando aplicável;
- ter testes automatizados para regras críticas;
- ter critérios objetivos de validação antes do release.

### 11.4 Performance

O sistema deve:

- carregar de forma aceitável em ambiente móvel comum;
- evitar dependência de processamento pesado no cliente para fluxos básicos;
- manter UX responsiva nos fluxos de login, agenda e presença.

### 11.5 Compatibilidade

O sistema deve funcionar no navegador moderno usado pelo público do projeto, com foco principal em ambiente móvel e desktop comuns.

### 11.6 Offline

O produto pode manter recursos locais de cache e contingência, mas o MVP **não** será descrito como “totalmente offline”.

O contrato oficial é:

- auth depende de Supabase;
- persistência oficial do MVP depende de Supabase;
- cache local é acessório, não fonte principal.

---

## 12. Requisitos de segurança e privacidade

### 12.1 Dados tratados

O sistema trata:

- nome;
- email;
- telefone;
- status esportivo;
- histórico de presença;
- observações funcionais do contexto esportivo;
- eventos de scout.

### 12.2 Regras obrigatórias

- o frontend usa apenas credenciais públicas apropriadas ao cliente;
- `service_role` é proibido no frontend;
- o vínculo da atleta deve ser rastreável por usuário autenticado;
- dados devem respeitar escopo por time e por atleta;
- a documentação não deve instruir uso de legado como se fosse arquitetura oficial.

### 12.3 Ameaças prioritárias do MVP

- acesso indevido ao portal da atleta;
- leitura cruzada de dados entre atletas;
- escrita de presença fora do escopo;
- divergência entre confirmação pública e painel;
- release com dependência silenciosa do legado.

---

## 13. Direção arquitetural oficial

### 13.1 Arquitetura-alvo do MVP

O produto deve convergir para esta estrutura:

1. frontend React + rotas protegidas;
2. Supabase Auth para sessão;
3. Supabase PostgreSQL como fonte principal do MVP;
4. RLS e RPCs para regras de acesso e escrita sensível;
5. IndexedDB apenas como cache local explícito, quando mantido;
6. exportação local como ferramenta operacional auxiliar.

### 13.2 Integrações oficiais do produto

Integrações oficiais:

- Supabase;
- URLs de WhatsApp como mecanismo de abertura de mensagem;
- exportação local de arquivos.

Integrações não oficiais do produto final:

- Google Apps Script;
- Google Sheets como armazenamento central.

### 13.3 Caminho legado

Se componentes legados ainda estiverem no repositório durante a migração, eles devem ser tratados apenas como:

- contexto de transição;
- material de rollback temporário;
- fonte de importação de dados;
- dívida a remover.

Eles não devem aparecer como arquitetura oficial futura.

---

## 14. Requisitos de dados

### 14.1 Entidades centrais do MVP

- `athletes`
- `trainings`
- `attendance_records`
- `presence_tokens`
- `team_memberships`
- `audit_logs`

### 14.2 Regras de consistência

- uma atleta autenticada deve poder ser vinculada ao seu registro oficial;
- o treinador deve operar dentro do escopo do time;
- o mesmo treino deve alimentar painel, portal e relatórios;
- a presença deve existir em formato único no banco final;
- token público deve resultar em escrita observável no mesmo modelo final.

---

## 15. Escopo técnico oficial do produto

Esta seção não substitui o `plan.md`, mas define a fronteira técnica esperada do MVP.

### 15.1 Obrigatório no MVP

- Supabase Auth ativo para treinador e atleta;
- RLS compatível com escopo do produto;
- stores do MVP convergindo para Supabase-first;
- fluxo de confirmação pública integrado ao banco final;
- testes relevantes para auth, guard, presença e acesso.

### 15.2 Proibido no MVP final

- PIN como login oficial;
- Apps Script como caminho crítico;
- Google Sheets como banco oficial;
- presença apenas local;
- comportamento que pareça persistência sem persistir de verdade;
- documentação contraditória sobre fonte de verdade.

---

## 16. Critérios de sucesso do MVP

O MVP v1.0 será considerado bem-sucedido quando:

1. treinador entra no sistema sem mecanismo legado de auth;
2. atleta entra no sistema sem mecanismo legado de auth;
3. atleta vê seus treinos e seu estado real;
4. treinador marca presença e o resultado aparece de forma consistente;
5. token público confirma presença no mesmo modelo oficial;
6. o runtime não depende do legado para operar o fluxo principal;
7. a validação técnica final retorna sucesso;
8. o produto pode ser usado por atletas reais sem intervenção manual do time técnico a cada operação.

### 16.1 Critérios de sucesso percebidos pelo treinador

O MVP também deve ser considerado bem-sucedido quando o treinador perceber, no uso real, que:

- não precisa mais manter planilhas recorrentes para presença;
- não precisa procurar respostas antigas no WhatsApp para consolidar presença;
- consegue saber rapidamente quem confirmou e quem não confirmou;
- reduz erros de agendamento em feriados;
- gasta menos tempo com operação e mais tempo com preparação da equipe.

---

## 17. Critérios de release do produto

Antes do release do MVP:

- build deve passar;
- typecheck deve passar;
- testes automatizados críticos devem passar;
- validação SQL crítica deve passar;
- fluxos reais prioritários devem ter cobertura objetiva;
- a migração de dados do recorte do MVP deve estar reconciliada;
- documentação mínima operacional deve estar coerente;
- não deve existir dependência escondida de legado no caminho crítico.

---

## 18. Métricas de produto

### 18.1 Métricas de adoção

- número de treinadores ativos;
- número de atletas com conta vinculada;
- número de confirmações feitas pelo portal ou por token;
- taxa de treinos com presença registrada.

### 18.1.1 Metas iniciais de adoção do MVP

Estas metas servem para validar se o produto começou a substituir o processo manual:

- pelo menos `1` equipe operando o fluxo principal no produto;
- pelo menos `80%` das atletas ativas com conta vinculada;
- pelo menos `80%` dos treinos novos criados dentro do sistema, e não fora dele;
- pelo menos `70%` das confirmações de presença feitas pelo portal da atleta ou por token, e não por leitura manual do WhatsApp.

### 18.2 Métricas de qualidade

- falhas de login por sessão;
- divergência entre painel e confirmação pública;
- taxa de atletas não vinculadas após cadastro;
- erros por fluxo de presença;
- incidentes de acesso indevido.

### 18.2.1 Metas iniciais de qualidade do MVP

- `0` incidentes conhecidos de acesso cruzado entre atletas;
- `0` dependências obrigatórias de PIN no fluxo oficial;
- `0` dependências operacionais obrigatórias de Apps Script no fluxo principal;
- menos de `5%` dos treinos com necessidade de correção manual por erro operacional do sistema;
- `0` divergências aceitas entre presença exibida no painel e presença registrada no banco final.

### 18.3 Métricas de ganho operacional

Estas métricas existem para provar que o produto realmente reduz o trabalho do treinador:

- tempo médio para registrar ou consolidar presença por treino;
- número de passos manuais para abrir um treino e saber quem confirmou;
- número de correções manuais de agenda por mês;
- número de mensagens manuais necessárias no WhatsApp para cobrar presença;
- quantidade de planilhas operacionais ainda mantidas em paralelo.

### 18.3.1 Metas iniciais de ganho operacional

- reduzir para `0` a criação de novas planilhas operacionais para presença;
- reduzir para `0` a necessidade de atualizar planilhas de presença para treinos do fluxo principal;
- reduzir para no máximo `1` consulta operacional principal para saber o estado de presença de um treino;
- reduzir de forma perceptível o uso do grupo de WhatsApp como fonte de verdade;
- reduzir o retrabalho causado por informação perdida na conversa.

### 18.4 Métricas de entrega do MVP

- porcentagem dos fluxos críticos validados por teste real;
- tempo de execução do gate final;
- quantidade de dependências legadas ainda ativas no runtime;
- quantidade de contradições documentais abertas.

### 18.4.1 Metas iniciais de entrega do MVP

- `100%` dos fluxos críticos do MVP cobertos por validação objetiva definida no `plan.md`;
- `0` contradições abertas entre PRD, plano oficial e comportamento real conhecidas no release;
- `0` tarefas críticas marcadas como prontas sem prova objetiva;
- `0` dependências legadas no caminho crítico do runtime do MVP.

---

## 19. Riscos e decisões abertas

### 19.1 Riscos

- stores operacionais ainda híbridas durante a transição;
- divergência temporária entre cache local e banco central;
- cutover de dados mal reconciliado;
- docs antigas induzirem agentes a reabrir legado;
- E2E insuficientes esconderem falso positivo.

### 19.2 Decisões que precisam continuar explícitas

- política final de uso de IndexedDB após o MVP;
- estratégia definitiva de onboarding da atleta;
- nível de permanência do módulo scout na trilha principal de release;
- política de exportação/importação após a migração completa.

---

## 20. Pós-MVP

Ficam para pós-MVP, salvo decisão explícita em contrário:

- multi-time completo;
- notificações automatizadas mais sofisticadas;
- permissões avançadas;
- painéis analíticos mais profundos;
- consolidação completa de todos os módulos não essenciais no Supabase;
- integrações externas adicionais.

---

## 21. Mapa oficial de documentos

### 21.1 Documento de produto

- `CEPRAEA.md`

### 21.2 Documento de execução

- `plan.md`

### 21.3 Documentação técnica temática

- auth;
- Supabase;
- presence tokens;
- cutover;
- limpeza de legado;
- testes e validação.

---

## 22. Regra final de interpretação

Se um agente precisar decidir entre:

- descrever o produto;
- executar a migração;
- validar o comportamento atual;

deve usar:

- `CEPRAEA.md` para **produto**;
- `plan.md` para **execução**;
- o código e os testes para **verdade implementada**.

Este PRD só está correto se continuar:

- útil para decisão de produto;
- compatível com o MVP real;
- livre de legado tratado como contrato oficial;
- livre de promessas de implementação que ainda não aconteceram.
