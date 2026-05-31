Baseado na `main` atual do repositório, o PWA tem **dois fluxos principais de login**: comissão técnica/treinador e atleta. Eles compartilham Supabase Auth, mas usam guards diferentes: `AppAccessGuard` para a área principal e `AtletaGuard` para a área da atleta. As rotas estão separadas em `App.tsx`: `/login`, `/atleta/login`, `/atleta/nova-senha`, `/aceitar-convite/:inviteId`, `/onboarding/equipe`, área da atleta e área principal. 

## 1. Mapa geral dos acessos

```mermaid
flowchart TD
    A["/welcome"] --> B["Entrar como treinador<br/>/login"]
    A --> C["Entrar como atleta<br/>/atleta/login"]

    B --> D["Supabase Auth<br/>email + senha"]
    C --> E["Supabase Auth<br/>login / primeiro acesso / reset"]

    D --> F["SupabaseAuthProvider<br/>sessão autenticada?"]
    E --> F

    F -->|não autenticado| B
    F -->|autenticado| G["AccessContext<br/>RPC get_my_access()"]

    G --> H{"Tipo de vínculo encontrado"}

    H -->|team_members role owner/coach/viewer<br/>no VITE_SUPABASE_TEAM_ID| I["Área principal<br/>Dashboard / Atletas / Treinos / Scout"]
    H -->|athlete_link| J["Área da atleta<br/>/atleta/treinos"]
    H -->|sem membership<br/>sem athlete_link| K["/onboarding/equipe"]
    H -->|membership de outro time| L["Sem acesso à equipe"]
```

O `AccessContext` chama `get_my_access()` e expõe `memberships`, `athleteLink`, `roleForTeam()` e `hasRole()`.  O `AppAccessGuard` libera a área principal apenas para `owner`, `coach` ou `viewer` vinculados ao `teamId` configurado. 

## 2. Fluxo de login do treinador / comissão técnica

```mermaid
flowchart TD
    A["Usuário acessa /login"] --> B["Digita email e senha"]
    B --> C["normalizeEmail(email)"]
    C -->|email inválido| C1["Exibe erro local<br/>Informe um email válido"]
    C -->|email válido| D{"Supabase configurado?"}

    D -->|não| D1["Erro AUTH-BOOT-001<br/>Supabase não configurado"]
    D -->|sim| E["signInWithPassword(email, senha)"]

    E -->|erro| F["mapSupabaseLoginError()<br/>Email ou senha incorretos"]
    E -->|sucesso| G["redirectGuard(returnUrl)"]

    G --> H["Navega para destino seguro"]
    H --> I["AppAccessGuard"]

    I --> J{"get_my_access()"}

    J -->|role owner/coach/viewer<br/>no team_id correto| K["Libera área principal"]
    J -->|sem vínculo| L["/onboarding/equipe"]
    J -->|atleta sem papel técnico| M["Área restrita"]
    J -->|membro de outro time| N["Sem acesso à equipe"]
```

A tela `/login` usa `normalizeEmail()`, `redirectGuard()`, `mapSupabaseLoginError()` e `signInWithPassword()`; após login bem-sucedido, navega para um destino validado.  A sessão em si fica no `SupabaseAuthProvider`, que resolve `session`, `user`, `authenticated`, `configured`, `signInWithPassword()` e `signOut()`. 

## 3. Fluxo de primeiro owner / usuário sem vínculo

```mermaid
flowchart TD
    A["Usuário autenticado"] --> B["AccessContext chama get_my_access()"]
    B --> C{"memberships vazio<br/>athleteLink null?"}

    C -->|sim| D["AppAccessGuard redireciona<br/>/onboarding/equipe"]
    D --> E["Usuário informa nome da equipe<br/>e slug"]
    E --> F["RPC bootstrap_owner(team_name, team_slug)"]

    F --> G["Cria Team"]
    G --> H["Insere team_members<br/>role = owner"]
    H --> I["AccessContext.reload()"]
    I --> J["AppAccessGuard libera /"]
```

Esse fluxo é para uma conta autenticada sem vínculo com equipe e sem vínculo de atleta. A RPC `bootstrap_owner()` cria o time e insere o usuário como `owner`.  O guard envia esse tipo de usuário para `/onboarding/equipe`. 

## 4. Fluxo de convite de coach/viewer

```mermaid
flowchart TD
    A["Owner logado"] --> B["/configuracoes/convites"]
    B --> C["Informa email do convidado<br/>e role coach/viewer"]
    C --> D["RPC invite_coach(team_id, email, role)"]

    D --> E{"Convite pendente já existe?"}
    E -->|sim| F["Renova expires_at"]
    E -->|não| G["Cria registro em coach_invites"]

    F --> H["Convidado acessa /aceitar-convite/:id"]
    G --> H

    H --> I["Supabase Auth confirma usuário logado"]
    I --> J["RPC accept_coach_invite(invite_id)"]

    J --> K{"email do JWT == invited_email<br/>convite válido e não expirado?"}
    K -->|não| L["Convite inválido/expirado"]
    K -->|sim| M["Insere team_members<br/>role = coach/viewer"]
    M --> N["Marca accepted_at"]
    N --> O["AppAccessGuard libera área principal"]
```

`invite_coach()` só permite owner, aceita `coach` ou `viewer`, reutiliza convite pendente por `team_id + email`, e renova expiração se necessário. `accept_coach_invite()` valida o email autenticado, insere `team_members` e marca o convite como aceito. 

## 5. Fluxo de login da atleta já vinculada

```mermaid
flowchart TD
    A["Atleta acessa /atleta/login"] --> B["Modo login"]
    B --> C["Digita email e senha"]
    C --> D["normalizeEmail(email)"]
    D --> E["supabase.auth.signInWithPassword()"]

    E -->|erro| F["Mensagem anti-enumeração<br/>Email ou senha incorretos"]
    E -->|sucesso| G["AtletaGuard"]

    G --> H["Busca athletes<br/>where user_id = auth.user.id<br/>status = ativo"]

    H -->|encontrou| I["Carrega stores<br/>athletes/trainings/attendance"]
    I --> J["Libera /atleta/treinos"]

    H -->|não encontrou| K["RPC ensure_athlete_link()"]
    K -->|vinculou| I
    K -->|não vinculou| L["Acesso não encontrado"]
```

O `AtletaGuard` primeiro tenta encontrar atleta ativa por `user_id`. Se não encontrar, chama `ensure_athlete_link()`; se o vínculo for feito, carrega os dados da área da atleta e libera a rota. 

## 6. Fluxo de primeiro acesso da atleta

```mermaid
flowchart TD
    A["Atleta acessa /atleta/login"] --> B["Clica em Criar conta"]
    B --> C["Modo PRIMEIRO ACESSO"]
    C --> D["Digita email e senha"]
    D --> E["normalizeEmail(email)"]
    E --> F["supabase.auth.signUp()<br/>metadata role = athlete<br/>emailRedirectTo = /atleta/treinos"]

    F --> G["Exibe mensagem padrão<br/>Verifique seu email"]
    G --> H["Atleta clica no link de confirmação"]

    H --> I["Link redireciona para<br/>/atleta/treinos"]
    I --> J["AtletaGuard"]
    J --> K["RPC ensure_athlete_link()"]
    K --> L["RPC chama link_athlete_user_id()"]

    L -->|email bate com athlete pré-cadastrada| M["Preenche athletes.user_id"]
    M --> N["Libera /atleta/treinos"]

    L -->|email não cadastrado como atleta| O["Acesso não encontrado"]
```

A tela da atleta usa modo `register` para primeiro acesso e envia `role: 'athlete'` no metadata do Supabase Auth. O `signUp()` inclui `emailRedirectTo: \`${window.location.origin}/atleta/treinos\`` para que o link de confirmação leve a atleta diretamente à sua área, evitando o redirecionamento para `/onboarding/equipe`. O vínculo real não depende desse metadata para liberar a área: depende de `athletes.user_id` via `ensure_athlete_link()`. 

## 7. Fluxo de redefinição de senha da atleta

```mermaid
flowchart TD
    A["Atleta acessa /atleta/login"] --> B["Clica em Esqueci minha senha"]
    B --> C["Modo REDEFINIR SENHA"]
    C --> D["Digita email"]
    D --> E["normalizeEmail(email)"]
    E --> F["supabase.auth.resetPasswordForEmail()"]

    F --> G["Sempre exibe mensagem anti-enumeração:<br/>Se o email existir, enviaremos o link"]
    G --> H["Email redireciona para<br/>/atleta/nova-senha"]
```

A redefinição de senha da atleta usa mensagem anti-enumeração: independentemente de sucesso ou falha, mostra a mesma resposta ao usuário. 

## 8. Fluxo de usuário sem vínculo

```mermaid
flowchart TD
    A["Usuário cria conta ou faz login"] --> B["Supabase Auth OK"]
    B --> C["AccessContext chama get_my_access()"]
    C --> D{"Tem team_members?"}
    D -->|não| E{"Tem athleteLink?"}
    E -->|não| F{"AppAccessGuard:<br/>user_metadata.role == athlete?"}
    F -->|sim| G["Redireciona para /atleta/treinos"]
    F -->|não| H["Redireciona para /onboarding/equipe"]
    E -->|sim| I["Se tentar área técnica:<br/>Área restrita"]
    D -->|sim, mas outro team_id| J["Sem acesso à equipe"]
```

Esse é o fluxo para contas sem vínculo de equipe e sem `athleteLink`. A partir do PR #69, o `AppAccessGuard` verifica `user_metadata.role === 'athlete'` (ou `app_metadata.role`) **antes** de redirecionar. Atletas com o metadata correto vão para `/atleta/treinos`, onde o `AtletaGuard` completa o vínculo via `ensure_athlete_link()`. Usuários sem esse metadata seguem para `/onboarding/equipe`. 
## 9. Backend resumido do login

```mermaid
flowchart LR
    A["auth.users"] --> B["trigger on_auth_user_created"]
    B --> C["public.profiles"]

    A --> D["get_my_access()"]
    C --> D
    E["public.team_members"] --> D
    F["public.athletes"] --> D

    D --> G["memberships[]"]
    D --> H["athlete_link"]

    G --> I["AppAccessGuard"]
    H --> J["AtletaGuard / AppAccessGuard"]
```

A migration `0040` cria o trigger `on_auth_user_created`, `get_my_access()` e `has_app_access()`.  A migration `0042` faz backfill protegido de `profiles` e `athletes.user_id`, com guardas contra duplicidade e vínculo ambíguo. 

## Pergunta que você não fez, mas precisa responder

Esses fluxos desenham a lógica do sistema. Para fechar o login como DONE, ainda falta validar cada fluxo com contas controladas de produção:

```text id="mad9gr"
1. owner teste
2. coach teste
3. atleta teste
4. usuário sem vínculo teste
```

Sem essas quatro contas, o desenho está correto no código, mas o fluxo real em produção ainda não fica comprovado.

> Itens pendentes para follow-up PR (CEPR-AUTH-02E fase 2):

* Captcha gate em LoginPage (treinador) — precisa VITE_TURNSTILE_SITE_KEY no Vercel

* Bloco [auth.captcha] + [auth] minimum_password_length/password_requirements em config.toml — precisa rotação de senhas existentes

* CHANGELOG.md v2.1 — será commitado via PR (branch protegida)