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
MORGAN_ID = uuid.uuid4()


def _session() -> str:
    return create_session(PAT_ID, email="pat@example.com")


def _db_returning_totals(rows):
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


def test_get_balance_returns_deficit_per_kin():
    # given
    rows = [
        SimpleNamespace(kin_id=CASEY_ID, name="Casey", total_minutes=90, baseline_minutes=0),
        SimpleNamespace(kin_id=JAMIE_ID, name="Jamie", total_minutes=45, baseline_minutes=0),
    ]
    app.dependency_overrides[get_db] = _db_returning_totals(rows)

    # when
    response = client.get("/users/me/balance", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert body[0] == {"kin_id": str(CASEY_ID), "name": "Casey", "deficit_minutes": 0}
    assert body[1] == {"kin_id": str(JAMIE_ID), "name": "Jamie", "deficit_minutes": 45}


def test_get_balance_returns_zero_deficit_for_kin_with_no_moments():
    # given — single kin with no logged time is the leader by default
    rows = [SimpleNamespace(kin_id=CASEY_ID, name="Casey", total_minutes=0, baseline_minutes=0)]
    app.dependency_overrides[get_db] = _db_returning_totals(rows)

    # when
    response = client.get("/users/me/balance", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()[0]["deficit_minutes"] == 0


def test_get_balance_returns_results_sorted_by_name():
    # given — Morgan leads (most time), but Casey sorts first alphabetically
    rows = [
        SimpleNamespace(kin_id=MORGAN_ID, name="Morgan", total_minutes=90, baseline_minutes=0),
        SimpleNamespace(kin_id=CASEY_ID,  name="Casey",  total_minutes=30, baseline_minutes=0),
    ]
    app.dependency_overrides[get_db] = _db_returning_totals(rows)

    # when
    response = client.get("/users/me/balance", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    body = response.json()
    assert body[0]["name"] == "Casey"   # alphabetically first, despite higher deficit
    assert body[1]["name"] == "Morgan"


def test_get_balance_returns_correct_deficits_for_three_kin():
    # given
    rows = [
        SimpleNamespace(kin_id=CASEY_ID,  name="Casey",  total_minutes=120, baseline_minutes=0),
        SimpleNamespace(kin_id=JAMIE_ID,  name="Jamie",  total_minutes=90,  baseline_minutes=0),
        SimpleNamespace(kin_id=MORGAN_ID, name="Morgan", total_minutes=60,  baseline_minutes=0),
    ]
    app.dependency_overrides[get_db] = _db_returning_totals(rows)

    # when
    response = client.get("/users/me/balance", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 3
    assert body[0] == {"kin_id": str(CASEY_ID),  "name": "Casey",  "deficit_minutes": 0}
    assert body[1] == {"kin_id": str(JAMIE_ID),  "name": "Jamie",  "deficit_minutes": 30}
    assert body[2] == {"kin_id": str(MORGAN_ID), "name": "Morgan", "deficit_minutes": 60}


def test_get_balance_new_kin_starts_with_zero_deficit():
    # given — Morgan was just added with baseline matching Casey's lead (120 min)
    rows = [
        SimpleNamespace(kin_id=CASEY_ID,  name="Casey",  total_minutes=120, baseline_minutes=0),
        SimpleNamespace(kin_id=MORGAN_ID, name="Morgan", total_minutes=0,   baseline_minutes=120),
    ]
    app.dependency_overrides[get_db] = _db_returning_totals(rows)

    # when
    response = client.get("/users/me/balance", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    body = response.json()
    casey  = next(r for r in body if r["name"] == "Casey")
    morgan = next(r for r in body if r["name"] == "Morgan")
    assert casey["deficit_minutes"]  == 0
    assert morgan["deficit_minutes"] == 0


def test_get_balance_returns_empty_list_when_no_kin():
    # given
    app.dependency_overrides[get_db] = _db_returning_totals([])

    # when
    response = client.get("/users/me/balance", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json() == []
