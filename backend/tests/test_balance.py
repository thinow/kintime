import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.session import create_session

client = TestClient(app)

PAT_ID = uuid.uuid4()
CASEY_ID = uuid.uuid4()
JAMIE_ID = uuid.uuid4()


def _session() -> str:
    return create_session(PAT_ID, email="pat@example.com")


def _db_returning_balance(rows):
    db = AsyncMock()
    result = MagicMock()
    result.all.return_value = rows
    db.execute.return_value = result

    async def override():
        yield db

    return override


# --- GET /users/me/balance ---

def test_get_balance_returns_401_without_auth():
    # when
    response = client.get("/users/me/balance")

    # then
    assert response.status_code == 401


def test_get_balance_returns_totals_per_kin():
    # given
    rows = [
        SimpleNamespace(kin_id=CASEY_ID, name="Casey", total_minutes=90),
        SimpleNamespace(kin_id=JAMIE_ID, name="Jamie", total_minutes=45),
    ]
    app.dependency_overrides[get_db] = _db_returning_balance(rows)

    # when
    response = client.get("/users/me/balance", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert body[0] == {"kin_id": str(CASEY_ID), "name": "Casey", "total_minutes": 90}
    assert body[1] == {"kin_id": str(JAMIE_ID), "name": "Jamie", "total_minutes": 45}


def test_get_balance_returns_zero_for_kin_with_no_moments():
    # given
    rows = [
        SimpleNamespace(kin_id=CASEY_ID, name="Casey", total_minutes=0),
    ]
    app.dependency_overrides[get_db] = _db_returning_balance(rows)

    # when
    response = client.get("/users/me/balance", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()[0]["total_minutes"] == 0


def test_get_balance_returns_empty_list_when_no_kin():
    # given
    app.dependency_overrides[get_db] = _db_returning_balance([])

    # when
    response = client.get("/users/me/balance", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json() == []
