import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.session import create_session

client = TestClient(app)

PAT_ID = uuid.uuid4()
OTHER_ID = uuid.uuid4()
CASEY_ID = uuid.uuid4()


def _session() -> str:
    return create_session(PAT_ID, email="pat@example.com")


def _db_returning_kin(kin=None):
    db = AsyncMock()
    db.add = MagicMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = kin
    db.execute.return_value = result

    async def override():
        yield db

    return db, override


def _kin(owner_id=PAT_ID) -> SimpleNamespace:
    return SimpleNamespace(id=CASEY_ID, user_id=owner_id, name="Casey")


# --- POST /users/me/moments ---

def test_create_moment_returns_401_without_auth():
    # when
    response = client.post("/users/me/moments", json={"kin_id": str(CASEY_ID), "duration_minutes": 30})

    # then
    assert response.status_code == 401


def test_create_moment_returns_404_when_kin_not_found():
    # given
    _, override = _db_returning_kin(kin=None)
    app.dependency_overrides[get_db] = override

    # when
    response = client.post(
        "/users/me/moments",
        json={"kin_id": str(uuid.uuid4()), "duration_minutes": 30},
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 404


def test_create_moment_returns_403_when_kin_belongs_to_another_user():
    # given
    casey = _kin(owner_id=OTHER_ID)
    _, override = _db_returning_kin(kin=casey)
    app.dependency_overrides[get_db] = override

    # when
    response = client.post(
        "/users/me/moments",
        json={"kin_id": str(CASEY_ID), "duration_minutes": 30},
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 403


def test_create_moment_returns_201_with_moment():
    # given
    casey = _kin()
    db, override = _db_returning_kin(kin=casey)
    app.dependency_overrides[get_db] = override

    # when
    response = client.post(
        "/users/me/moments",
        json={"kin_id": str(CASEY_ID), "duration_minutes": 45},
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 201
    body = response.json()
    assert body["kin_id"] == str(CASEY_ID)
    assert body["duration_minutes"] == 45


def test_create_moment_persists_to_db():
    # given
    casey = _kin()
    db, override = _db_returning_kin(kin=casey)
    app.dependency_overrides[get_db] = override

    # when
    client.post(
        "/users/me/moments",
        json={"kin_id": str(CASEY_ID), "duration_minutes": 45},
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    db.add.assert_called_once()
    db.commit.assert_called_once()


def test_create_moment_accepts_explicit_logged_at():
    # given
    casey = _kin()
    _, override = _db_returning_kin(kin=casey)
    app.dependency_overrides[get_db] = override
    logged_at = "2026-06-01T14:00:00Z"

    # when
    response = client.post(
        "/users/me/moments",
        json={"kin_id": str(CASEY_ID), "duration_minutes": 60, "logged_at": logged_at},
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 201
    assert response.json()["logged_at"].startswith("2026-06-01")
