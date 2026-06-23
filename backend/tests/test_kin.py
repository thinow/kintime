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


def _session() -> str:
    return create_session(PAT_ID, email="pat@example.com")


def _db_returning_one(kin=None):
    db = AsyncMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = kin
    db.execute.return_value = result

    async def override():
        yield db

    return db, override


def _db_returning_list(items: list):
    db = AsyncMock()
    db.add = MagicMock()
    result = MagicMock()
    result.all.return_value = []  # for baseline query in create_kin
    result.scalars.return_value.all.return_value = items
    db.execute.return_value = result

    async def override():
        yield db

    return db, override


def _kin(owner_id=PAT_ID, name="Casey", baseline_minutes=0) -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        user_id=owner_id,
        name=name,
        baseline_minutes=baseline_minutes,
        created_at=datetime.now(timezone.utc),
    )


# --- GET /kin ---

def test_list_kin_returns_401_without_auth():
    # when
    response = client.get("/users/me/kin")

    # then
    assert response.status_code == 401


def test_list_kin_returns_empty_list():
    # given
    _, override = _db_returning_list([])
    app.dependency_overrides[get_db] = override

    # when
    response = client.get("/users/me/kin", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json() == []


def test_list_kin_returns_users_kin():
    # given
    casey = _kin(name="Casey")
    jamie = _kin(name="Jamie")
    _, override = _db_returning_list([casey, jamie])
    app.dependency_overrides[get_db] = override

    # when
    response = client.get("/users/me/kin", headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 200
    names = [k["name"] for k in response.json()]
    assert names == ["Casey", "Jamie"]


# --- POST /kin ---

def test_create_kin_returns_401_without_auth():
    # when
    response = client.post("/users/me/kin", json={"name": "Casey"})

    # then
    assert response.status_code == 401


def test_create_kin_returns_201_with_created_kin():
    # given
    db, override = _db_returning_list([])
    app.dependency_overrides[get_db] = override

    # when
    response = client.post("/users/me/kin", json={"name": "Casey"}, headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 201
    assert response.json()["name"] == "Casey"


def test_create_kin_persists_to_db():
    # given
    db, override = _db_returning_list([])
    app.dependency_overrides[get_db] = override

    # when
    client.post("/users/me/kin", json={"name": "Casey"}, headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    db.add.assert_called_once()
    db.commit.assert_called_once()


# --- PATCH /kin/{id} ---

def test_rename_kin_returns_401_without_auth():
    # when
    response = client.patch(f"/users/me/kin/{uuid.uuid4()}", json={"name": "Casey R."})

    # then
    assert response.status_code == 401


def test_rename_kin_returns_404_when_not_found():
    # given
    _, override = _db_returning_one(kin=None)
    app.dependency_overrides[get_db] = override

    # when
    response = client.patch(
        f"/users/me/kin/{uuid.uuid4()}",
        json={"name": "Casey R."},
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 404


def test_rename_kin_returns_403_when_owned_by_another_user():
    # given
    casey = _kin(owner_id=OTHER_ID, name="Casey")
    _, override = _db_returning_one(kin=casey)
    app.dependency_overrides[get_db] = override

    # when
    response = client.patch(
        f"/users/me/kin/{casey.id}",
        json={"name": "Casey R."},
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 403


def test_rename_kin_returns_204_and_saves_new_name():
    # given
    casey = _kin(name="Casey")
    db, override = _db_returning_one(kin=casey)
    app.dependency_overrides[get_db] = override

    # when
    response = client.patch(
        f"/users/me/kin/{casey.id}",
        json={"name": "Casey R."},
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 204
    assert casey.name == "Casey R."
    db.commit.assert_called_once()


# --- DELETE /kin/{id} ---

def test_delete_kin_returns_401_without_auth():
    # when
    response = client.delete(f"/users/me/kin/{uuid.uuid4()}")

    # then
    assert response.status_code == 401


def test_delete_kin_returns_404_when_not_found():
    # given
    _, override = _db_returning_one(kin=None)
    app.dependency_overrides[get_db] = override

    # when
    response = client.delete(
        f"/users/me/kin/{uuid.uuid4()}",
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 404


def test_delete_kin_returns_403_when_owned_by_another_user():
    # given
    casey = _kin(owner_id=OTHER_ID)
    _, override = _db_returning_one(kin=casey)
    app.dependency_overrides[get_db] = override

    # when
    response = client.delete(
        f"/users/me/kin/{casey.id}",
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 403


def test_delete_kin_returns_204_and_removes_from_db():
    # given
    casey = _kin()
    db, override = _db_returning_one(kin=casey)
    app.dependency_overrides[get_db] = override

    # when
    response = client.delete(
        f"/users/me/kin/{casey.id}",
        headers={"Authorization": f"Bearer {_session()}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 204
    db.delete.assert_called_once_with(casey)
    db.commit.assert_called_once()


# --- baseline_minutes ---

def test_create_kin_sets_baseline_to_current_leader_total():
    # given — Casey has 90 minutes logged (the leader)
    db = AsyncMock()
    db.add = MagicMock()
    result = MagicMock()
    result.all.return_value = [
        SimpleNamespace(total_minutes=90),  # Casey
        SimpleNamespace(total_minutes=60),  # Jamie
    ]
    db.execute.return_value = result

    async def override():
        yield db

    app.dependency_overrides[get_db] = override

    # when
    client.post("/users/me/kin", json={"name": "Morgan"}, headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    created_kin = db.add.call_args[0][0]
    assert created_kin.baseline_minutes == 90


def test_create_kin_sets_baseline_to_zero_when_no_existing_kin():
    # given — Pat's first kin, no existing moments
    db, override = _db_returning_list([])
    app.dependency_overrides[get_db] = override

    # when
    client.post("/users/me/kin", json={"name": "Casey"}, headers={"Authorization": f"Bearer {_session()}"})

    # then
    app.dependency_overrides.clear()
    created_kin = db.add.call_args[0][0]
    assert created_kin.baseline_minutes == 0
