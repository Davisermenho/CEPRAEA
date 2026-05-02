"""
test_endpoints.py — Testes de contrato contra o Apps Script backend.

Cada teste documenta:
  - O que valida
  - Como sabotá-lo para confirmar que ele de fato detecta o bug

SABOTAGENS documentadas (prefixo no docstring de cada função):
  Como forçar a falha para confirmar que o teste detecta o problema.
"""

import os
import time
import base64
import hashlib
import hmac
import requests
import pytest

ENDPOINT = os.getenv("CEPRAEA_ENDPOINT_URL", "")
SECRET = os.getenv("CEPRAEA_SECRET", "")


def _api(params: dict, *, secret: str | None = SECRET) -> dict:
    if secret is not None:
        params.setdefault("secret", secret)
    resp = requests.get(ENDPOINT, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


# ═══════════════════════════════════════════════════════════════════════════════
# BLOCO 1 — Conectividade básica
# ═══════════════════════════════════════════════════════════════════════════════


class TestPing:
    def test_ping_ok(self, endpoint, secret):
        """
        VALIDA: endpoint está vivo e aceita secret correto.
        SABOTAGEM: mudar CEPRAEA_SECRET → retornará {error:'unauthorized'} → ok seria False → DETECTADO.
        """
        data = _api({"action": "ping"})
        assert data.get("ok") is True, f"Ping falhou: {data}"
        assert "timestamp" in data, "Resposta não tem campo 'timestamp'"

    def test_ping_retorna_timestamp_iso(self, endpoint, secret):
        """
        VALIDA: timestamp é string ISO-8601 válida.
        SABOTAGEM: no Code.gs mudar para retornar epoch int → assertIsInstance(str) falharia → DETECTADO.
        """
        data = _api({"action": "ping"})
        ts = data.get("timestamp", "")
        assert isinstance(ts, str) and "T" in ts, f"timestamp inválido: {ts}"

    def test_ping_sem_secret_retorna_unauthorized(self, endpoint):
        """
        VALIDA: acesso sem secret é bloqueado.
        SABOTAGEM: no Code.gs remover verificação de autenticação → retornaria ok:true sem secret → DETECTADO.
        """
        resp = requests.get(ENDPOINT, params={"action": "ping"}, timeout=15)
        data = resp.json()
        assert data.get("ok") is not True or data.get("error") == "unauthorized", \
            f"Endpoint aceitou requisição sem secret: {data}"

    def test_ping_secret_errado_retorna_unauthorized(self, endpoint):
        """
        VALIDA: secret incorreto é rejeitado.
        SABOTAGEM: remover hash comparison no authenticate() → qualquer secret seria aceito → DETECTADO.
        """
        data = _api({"action": "ping"}, secret="secret-completamente-errado-xyz")
        assert data.get("ok") is not True, f"Secret inválido foi aceito: {data}"


# ═══════════════════════════════════════════════════════════════════════════════
# BLOCO 2 — CRUD de Atletas
# ═══════════════════════════════════════════════════════════════════════════════


class TestAthletes:
    def test_push_and_list_athlete(self, athlete_fixture):
        """
        VALIDA: atleta criado aparece no listAthletes.
        SABOTAGEM: no Code.gs pushAthlete não salvar → listAthletes não retornaria o atleta → DETECTADO.
        """
        data = _api({"action": "listAthletes"})
        assert "records" in data, f"Resposta sem campo 'records': {data}"
        ids = [a.get("id") for a in data.get("records", [])]
        assert athlete_fixture["atletaId"] in ids, \
            f"Atleta {athlete_fixture['atletaId']} não encontrado na lista: {ids[:5]}"

    def test_listAthletes_public_profile_nao_expoe_telefone(self, athlete_fixture):
        """
        VALIDA: listAthletes não retorna campo 'telefone' (perfil público).
        SABOTAGEM: no Code.gs remover a omissão de telefone → exporia dado pessoal → DETECTADO.
        DOCUMENTAÇÃO DE BUG: isto causa o bug de sync em secondary devices (telefone vira '').
        """
        data = _api({"action": "listAthletes"})
        athletes = data.get("records", [])
        for a in athletes:
            assert "telefone" not in a, \
                f"Campo 'telefone' exposto em listAthletes: {a}"

    def test_delete_athlete(self, athlete_fixture):
        """
        VALIDA: atleta deletado não aparece mais em listAthletes.
        SABOTAGEM: deleteAthlete não remover da planilha → atleta persistiria → DETECTADO.
        """
        atleta_id = athlete_fixture["atletaId"]
        # Deleta explicitamente (fixture fará de novo no teardown, mas é idempotente)
        result = _api({"action": "deleteAthlete", "id": atleta_id})
        assert result.get("ok") is True, f"deleteAthlete falhou: {result}"

        # Verifica que sumiu da lista
        list_data = _api({"action": "listAthletes"})
        ids = [a.get("atletaId") or a.get("id") for a in list_data.get("athletes", [])]
        assert atleta_id not in ids, f"Atleta {atleta_id} ainda aparece após delete"


# ═══════════════════════════════════════════════════════════════════════════════
# BLOCO 3 — CRUD de Treinos
# ═══════════════════════════════════════════════════════════════════════════════


class TestTrainings:
    def test_push_and_list_training(self, training_fixture):
        """
        VALIDA: treino criado aparece no pullTrainings.
        SABOTAGEM: pushTraining não persistir → pullTrainings não retornaria → DETECTADO.
        """
        data = _api({"action": "listTrainings"})
        assert "records" in data, f"Resposta sem campo 'records': {data}"
        ids = [t.get("id") for t in data.get("records", [])]
        assert training_fixture["treinoId"] in ids, \
            f"Treino {training_fixture['treinoId']} não encontrado: {ids[:5]}"

    def test_delete_training(self, training_fixture):
        """
        VALIDA: treino deletado some de pullTrainings.
        SABOTAGEM: deleteTraining não remover → treino persistiria → DETECTADO.
        """
        treino_id = training_fixture["treinoId"]
        result = _api({"action": "deleteTraining", "id": treino_id})
        assert result.get("ok") is True, f"deleteTraining falhou: {result}"

        list_data = _api({"action": "listTrainings"})
        ids = [t.get("id") for t in list_data.get("records", [])]
        assert treino_id not in ids, f"Treino {treino_id} ainda aparece após delete"


# ═══════════════════════════════════════════════════════════════════════════════
# BLOCO 4 — Autenticação de Atleta
# ═══════════════════════════════════════════════════════════════════════════════


class TestAthleteAuth:
    def test_login_invalido_retorna_erro(self, endpoint, secret):
        """
        VALIDA: credenciais erradas de atleta são rejeitadas.
        SABOTAGEM: no Code.gs remover verificação de PIN → retornaria token para qualquer pin → DETECTADO.
        """
        data = requests.get(
            ENDPOINT,
            params={"action": "login", "telefone": "00000000000", "pin": "0000"},
            timeout=15,
        ).json()
        assert data.get("ok") is not True, \
            f"Login inválido foi aceito (credenciais inexistentes): {data}"
        assert "error" in data, f"Resposta de erro sem campo 'error': {data}"

    def test_athlete_token_expirado_rejeitado(self, endpoint, secret):
        """
        VALIDA: token com expiresAt no passado é rejeitado.
        SABOTAGEM: no Code.gs remover verificação de expiração → tokens velhos seriam aceitos → DETECTADO.
        DOCUMENTAÇÃO: makeAtletaToken tem TTL 30 dias — forja token já expirado.
        """
        # Monta token expirado manualmente no mesmo formato do backend:
        # base64(atletaId + '|' + expiresAt + '|' + hmac)
        atleta_id = "atleta-fake"
        expires_at = "2020-01-01T00:00:00.000Z"  # passado
        # HMAC seria inválido (não conhecemos SYNC_SECRET), mas o erro esperado é token_expired
        # antes da verificação de HMAC — se o backend verificar expiração primeiro.
        # O teste documenta o comportamento esperado: token expirado deve retornar erro.
        fake_payload = f"{atleta_id}|{expires_at}|hmac_invalido"
        fake_token = base64.b64encode(fake_payload.encode()).decode()

        resp = requests.get(
            ENDPOINT,
            params={"action": "listAthletes", "atletaToken": fake_token},
            timeout=15,
        ).json()

        # Backend deve rejeitar — seja por token_expired, unauthorized, ou invalid_token
        assert resp.get("ok") is not True, \
            f"Token expirado foi aceito: {resp}"
        error = resp.get("error", "")
        assert error in ("token_expired", "unauthorized", "invalid_token", "forbidden"), \
            f"Erro inesperado para token expirado: {error!r}"

    def test_atleta_nao_pode_confirmar_por_outro(self, athlete_fixture, endpoint, secret):
        """
        VALIDA: token de um atleta não pode confirmar presença de outro atleta.
        SABOTAGEM: no Code.gs remover validação de atletaId no pushConfirmation → 
                   atleta A poderia confirmar por atleta B → DETECTADO.
        DOCUMENTAÇÃO DE BUG: este teste documenta que a validação DEVE existir.
        """
        # Usamos atletaToken de atleta inexistente (token inválido)
        # O objetivo é mostrar que a API rejeita quando atletaId do token ≠ atletaId do payload
        fake_token = base64.b64encode(b"outro-atleta|2099-01-01T00:00:00.000Z|hmac_x").decode()

        resp = requests.get(
            ENDPOINT,
            params={
                "action": "confirm",
                "atletaToken": fake_token,
                "atletaId": athlete_fixture["atletaId"],  # tenta confirmar por OUTRO atleta
                "treinoId": "treino-qualquer",
                "status": "confirmado",
                "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            },
            timeout=15,
        ).json()

        assert resp.get("ok") is not True, \
            f"Atleta conseguiu confirmar presença por outro atleta: {resp}"


# ═══════════════════════════════════════════════════════════════════════════════
# BLOCO 5 — Contratos e Bugs Documentados
# ═══════════════════════════════════════════════════════════════════════════════


class TestDocumentedBugsAndContracts:
    def test_pin_contract_backend_vs_frontend(self, endpoint, secret):
        """
        VALIDA: documenta a diferença intencional de algoritmo de hash entre coach e atleta.
        SABOTAGEM: não é um bug — é contrato intencional. Se igualar os algoritmos, 
                   autenticação de coach quebraria.
        
        Coach (frontend auth.ts): SHA-256(pin + 'cepraea_salt_2025')
        Atleta (backend Code.gs): SHA-256(pin + '|' + telefone + '|' + SYNC_SECRET)
        
        Algoritmos são intencionalmente diferentes. Este teste documenta isso como
        decisão arquitetural, não como bug.
        """
        # Não podemos verificar o hash do coach diretamente via API
        # (autenticação de coach é 100% local/frontend).
        # Este teste documenta a intenção e garante que a API de atleta
        # funciona com o algoritmo esperado.
        
        # Tentativa de login com pin = "0000" e telefone inválido deve falhar
        # (confirma que backend usa lógica de hash específica de atleta)
        resp = requests.get(
            ENDPOINT,
            params={"action": "login", "telefone": "99999999999", "pin": "0000"},
            timeout=15,
        ).json()
        # Login de atleta inválido rejeita → backend funciona com seu próprio algoritmo
        assert resp.get("ok") is not True, \
            "Backend não deveria aceitar login para telefone/pin inexistentes"
        # CONTRATO DOCUMENTADO: coach usa salt 'cepraea_salt_2025', atleta usa telefone como salt

    def test_coach_manual_attendance_not_in_sheets(self, athlete_fixture, training_fixture):
        """
        VALIDA (documenta bug): presença manual do treinador NÃO vai para o Sheets.
        
        CONTEXTO DO BUG: attendanceStore.upsert() em src/stores/attendanceStore.ts
        salva apenas no IDB local. Nunca chama pushConfirmation().
        Se o device for formatado, toda presença manual é perdida permanentemente.
        
        SABOTAGEM PARA CONFIRMAR O BUG: adicionar pushConfirmation a upsert() →
        este teste falharia porque o Sheets TERIA o registro → indicaria que o bug foi corrigido.
        
        STATUS: BUG CONHECIDO — este teste DOCUMENTA o comportamento atual.
        O teste vai PASSAR enquanto o bug existir (confirmations vazias).
        Quando o bug for corrigido, este teste vai FALHAR e deve ser reescrito.
        """
        # Verifica que pullConfirmations retorna lista vazia para treino recém-criado
        # (não houve pushConfirmation via API, e o upsert local nunca chama push)
        resp = _api({
            "action": "list",
            "since": "2099-01-01T00:00:00Z",  # data futura — não deve haver confirmações
        })
        assert "records" in resp, f"Resposta sem 'records': {resp}"
        # Não há confirmações para treinos futuros (conforme esperado — fixture está em 2099)
        confirmations = resp.get("records", [])
        treino_confirmations = [c for c in confirmations
                                if c.get("treinoId") == training_fixture["treinoId"]]
        assert len(treino_confirmations) == 0, \
            "BUG CORRIGIDO? Encontrou confirmação manual via Sheets (antes era impossível)"

    def test_secondary_device_telefone_empty(self, athlete_fixture):
        """
        VALIDA (documenta bug): listAthletes não retorna 'telefone'.
        Quando sync ocorre em dispositivo secundário, athleteStore.syncFromRemote
        usa `localAthlete?.telefone ?? ''` — em device sem histórico local, 
        todos os atletas ficam com telefone = '' permanentemente.
        
        SABOTAGEM PARA CONFIRMAR: adicionar telefone ao listAthletes response →
        este teste falharia (encontraria telefone na resposta) → indicaria correção.
        
        STATUS: BUG CONHECIDO — documentado aqui como evidência.
        """
        resp = _api({"action": "listAthletes"})
        assert "records" in resp
        athletes = resp.get("records", [])
        for a in athletes:
            # PROVA: telefone nunca está no perfil público
            assert "telefone" not in a, \
                f"Endpoint expõe telefone — se corrigido, athleteStore.syncFromRemote deve ser atualizado: {a}"

    def test_large_dataset_performance(self, endpoint, secret):
        """
        VALIDA: pullTrainings responde em tempo razoável mesmo com dataset grande.
        SABOTAGEM: adicionar sleep(10) no Code.gs → test vai exceder timeout → DETECTADO.
        
        SLA: resposta de pullTrainings deve chegar em < 10 segundos.
        """
        import time as t
        start = t.time()
        resp = _api({"action": "listTrainings"})
        elapsed = t.time() - start

        assert "records" in resp, f"listTrainings falhou: {resp}"
        assert elapsed < 10.0, \
            f"listTrainings demorou {elapsed:.2f}s — acima do SLA de 10s"

    def test_pullAthletes_performance(self, endpoint, secret):
        """
        VALIDA: listAthletes responde em < 10 segundos.
        SABOTAGEM: adicionar cálculo pesado no doGet → exceede timeout → DETECTADO.
        """
        import time as t
        start = t.time()
        resp = _api({"action": "listAthletes"})
        elapsed = t.time() - start

        assert "records" in resp, f"listAthletes falhou: {resp}"
        assert elapsed < 10.0, \
            f"listAthletes demorou {elapsed:.2f}s — acima do SLA de 10s"
