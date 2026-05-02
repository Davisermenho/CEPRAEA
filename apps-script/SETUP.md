# Setup do Apps Script — CEPRAEA V2

Este backend é um Google Apps Script que escreve numa planilha do Google Sheets. Zero custo, sem servidor.

## 1. Crie a planilha

1. Acesse [sheets.new](https://sheets.new) e crie uma nova planilha vazia. [✅] FEITO 
2. Renomeie para algo como **CEPRAEA — Sync**. [✅] FEITO
3. Anote o link da planilha (não precisa compartilhar — só você terá acesso). [✅] FEITO
Link: [https://docs.google.com/spreadsheets/d/11wUk3E1E_Age4NhtMD4QjtYdg-Z0U0iOZI0OG9Hy9kw/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/11wUk3E1E_Age4NhtMD4QjtYdg-Z0U0iOZI0OG9Hy9kw/edit?gid=0#gid=0)

> As 4 abas (`confirmacoes`, `athletes`, `trainings`, `recurrenceConfig`) são criadas automaticamente na primeira vez que cada uma é usada.

## 2. Crie o script

1. Na planilha, vá em **Extensões → Apps Script**. [✅] FEITO
2. Apague o código padrão `function myFunction() {}`. [✅] FEITO
3. Cole **todo o conteúdo** de [`Code.gs`](Code.gs). [✅] FEITO
4. Salve (`Ctrl+S`). [✅] FEITO

## 3. Configure o secret [✅] FEITO

1. No app CEPRAEA, abra **Configurações → Sincronização** e clique em **Gerar secret** (ou cole um existente). [✅] FEITO
2. No Apps Script, edite a linha:
   ```js
   var SYNC_SECRET = 'COLE_SEU_SECRET_AQUI';
   ```
   Substitua pelo secret gerado. [✅] FEITO
3. Salve (`Ctrl+S`). [✅] FEITO

## 4. Faça o deploy como Web App [✅] FEITO

1. Clique em **Implantar → Nova implantação**. [✅] FEITO
2. Em **Tipo**, selecione **Aplicativo da Web**. [✅] FEITO
3. Configure: [✅] FEITO
   - **Descrição:** `CEPRAEA Sync v2`
   - **Executar como:** *Eu (seu email)*
   - **Quem tem acesso:** **Qualquer pessoa** (necessário para que atletas acessem)
4. Clique em **Implantar** e autorize quando solicitado. [✅] FEITO
5. Copie a **URL do aplicativo da Web**. [✅] FEITO

Código de implantação: `AKfycbxPSDYQfOuThwsjBqihUHuSLXwhwroN01RoF1F7k8sohgyA9zmFQy3Fqz6sn-ug14Qg`

URL do App da Web: [https://script.google.com/macros/s/AKfycbxPSDYQfOuThwsjBqihUHuSLXwhwroN01RoF1F7k8sohgyA9zmFQy3Fqz6sn-ug14Qg/exec](https://script.google.com/macros/s/AKfycbxPSDYQfOuThwsjBqihUHuSLXwhwroN01RoF1F7k8sohgyA9zmFQy3Fqz6sn-ug14Qg/exec)

## 5. Conecte o app [✅] FEITO

1. No app CEPRAEA → **Configurações → Sincronização**. [✅] FEITO
2. Cole a URL no campo **URL do endpoint**. [✅] FEITO — `https://script.google.com/macros/s/AKfycbxPSDYQfOuThwsjBqihUHuSLXwhwroN01RoF1F7k8sohgyA9zmFQy3Fqz6sn-ug14Qg/exec`
3. Clique em **Testar conexão** — deve aparecer ✅. [✅] FEITO — retornou `{"ok":true,"role":"coach"}`
4. Clique em **Salvar**. [✅] FEITO

## 6. Sincronize os dados existentes

Se você já tem atletas e treinos no app:

1. **Configurações → Sincronização → Sincronizar tudo agora** (botão a ser adicionado na Fase 5).
2. Os dados locais sobem para o Sheet automaticamente.

## Atualizações futuras

Sempre que `Code.gs` for atualizado:

1. Cole o novo conteúdo no editor.
2. **Implantar → Gerenciar implantações** → ícone de lápis na implantação atual → **Versão: Nova versão** → **Implantar**.
3. A URL do endpoint **não muda**, então não precisa atualizar nada no app.

## Endpoints disponíveis (referência rápida)

Todos via `GET ?secret=<SECRET>&action=<ACTION>&...`

### Públicos (sem auth)
- `login` — `telefone`, `pin` → `{ atletaId, nome, token }`

### Atleta ou treinador (precisam de `secret` ou `atletaToken`)
- `ping` — testa conexão
- `confirm` — `treinoId`, `atletaId`, `status`, `nomeAtleta`
- `list` — confirmações (filtros: `treinoId`, `since`)
- `listAthletes`
- `listTrainings` — (filtros: `since`, `until`)
- `getRecurrenceConfig`

### Apenas treinador (precisam de `secret`)
- `upsertAthlete` — `id`, `nome`, `telefone`, opcional `pin`
- `deleteAthlete` — `id`
- `setPin` — `atletaId`, `pin`
- `upsertTraining` — `id`, `data`, `horaInicio`, ...
- `deleteTraining` — `id`
- `setRecurrenceConfig` — `config` (JSON string)

## Solução de problemas

| Sintoma | Causa | Solução |
|---|---|---|
| `TypeError: Cannot read properties of undefined (reading 'parameter')` ao executar no editor | `doGet` executado diretamente pelo botão ▶ do Apps Script — sem o objeto `e` | Normal. Teste sempre via URL: `...exec?action=ping&secret=<SECRET>` |
| `unauthorized` | Secret incorreto | Confirme que `SYNC_SECRET` no Apps Script == secret no app |
| `forbidden` | Atleta tentando ação de treinador | Esperado — atletas só leem e confirmam |
| `invalid_credentials` no login | PIN errado, telefone errado, ou atleta inativa | Treinador pode resetar PIN no perfil da atleta |
| Atleta vê dados antigos | Cache PWA | Recarregar (`Ctrl+R`) ou aguardar próximo `pullAll` |
| 401/403 inesperado | Token expirado (30 dias) | Atleta precisa fazer login novamente |
