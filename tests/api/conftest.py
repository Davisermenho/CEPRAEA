"""
conftest.py — fixtures compartilhadas para os testes de API.

Carrega .env.test da raiz do projeto. Cria/destroi recursos com cleanup automático.
"""

import os
import time
import uuid
import pytest
import requests
from dotenv import load_dotenv

# Carrega variáveis do .env.test (2 níveis acima de tests/api/)
_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(_ROOT, ".env.test"))

ENDPOINT = os.getenv("CEPRAEA_ENDPOINT_URL", "")
SECRET = os.getenv("CEPRAEA_SECRET", "")


def _api(params: dict) -> dict:
    """Faz GET no endpoint e retorna JSON."""
    params.setdefault("secret", SECRET)
    resp = requests.get(ENDPOINT, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


# ─── Fixtures ─────────────────────────────────────────────────────────────────


@pytest.fixture(scope="session")
def endpoint():
    """URL do endpoint configurado em .env.test."""
    if not ENDPOINT:
        pytest.skip("CEPRAEA_ENDPOINT_URL não configurado em .env.test")
    return ENDPOINT


@pytest.fixture(scope="session")
def secret():
    """Secret configurado em .env.test."""
    if not SECRET:
        pytest.skip("CEPRAEA_SECRET não configurado em .env.test")
    return SECRET


@pytest.fixture
def athlete_fixture(endpoint, secret):
    """
    Cria um atleta temporário e faz cleanup ao final do teste.
    Retorna dict com os dados do atleta criado.
    """
    atleta_id = f"test-{uuid.uuid4().hex[:8]}"
    data = {
        "action": "upsertAthlete",
        "id": atleta_id,
        "nome": f"Atleta Teste {atleta_id}",
        "telefone": "11900000000",
        "nivel": "iniciante",
        "ativo": "true",
        "pin": "9999",
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    result = _api(data)
    assert result.get("ok"), f"Falha ao criar atleta fixture: {result}"

    yield {**data, "atletaId": atleta_id}

    # Cleanup — remove o atleta criado
    _api({"action": "deleteAthlete", "id": atleta_id})


@pytest.fixture
def training_fixture(endpoint, secret):
    """
    Cria um treino temporário e faz cleanup ao final do teste.
    Retorna dict com os dados do treino criado.
    """
    training_id = f"test-{uuid.uuid4().hex[:8]}"
    data = {
        "action": "upsertTraining",
        "id": training_id,
        "tipo": "recorrente",
        "status": "agendado",
        "data": "2099-12-31",
        "horaInicio": "20:00",
        "horaFim": "21:30",
        "criadoManualmente": "false",
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    result = _api(data)
    assert result.get("ok"), f"Falha ao criar treino fixture: {result}"

    yield {**data, "treinoId": training_id}

    # Cleanup
    _api({"action": "deleteTraining", "id": training_id})
