import uuid
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.models import User
from app.session import create_session

client = TestClient(app)


def _make_session(user_id: uuid.UUID) -> str:
    return create_session(user_id, email="pat@example.com")


def _db_override(existing_user=None):
    session = AsyncMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = existing_user
    session.execute.return_value = result

    async def override():
        yield session

    return session, override


def test_update_me_returns_401_when_no_auth_header():
    # given
    _, override = _db_override()
    app.dependency_overrides[get_db] = override

    # when
    response = client.patch("/users/me", json={"display_name": "Pat"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 401


def test_update_me_returns_401_for_invalid_session():
    # when
    response = client.patch(
        "/users/me",
        json={"display_name": "Pat"},
        headers={"Authorization": "Bearer not-a-valid-token"},
    )

    # then
    assert response.status_code == 401


def test_update_me_returns_401_for_tampered_session():
    # given
    session_token = _make_session(uuid.uuid4())
    tampered = session_token[:-4] + "aaaa"

    # when
    response = client.patch(
        "/users/me",
        json={"display_name": "Pat"},
        headers={"Authorization": f"Bearer {tampered}"},
    )

    # then
    assert response.status_code == 401


def test_update_me_returns_204_for_valid_session():
    # given
    user_id = uuid.uuid4()
    existing = User(id=user_id, email="pat@example.com", display_name=None)
    session, override = _db_override(existing_user=existing)
    app.dependency_overrides[get_db] = override

    # when
    response = client.patch(
        "/users/me",
        json={"display_name": "Pat"},
        headers={"Authorization": f"Bearer {_make_session(user_id)}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 204


def test_update_me_saves_display_name():
    # given
    user_id = uuid.uuid4()
    existing = User(id=user_id, email="pat@example.com", display_name=None)
    session, override = _db_override(existing_user=existing)
    app.dependency_overrides[get_db] = override

    # when
    client.patch(
        "/users/me",
        json={"display_name": "Pat"},
        headers={"Authorization": f"Bearer {_make_session(user_id)}"},
    )

    # then
    app.dependency_overrides.clear()
    assert existing.display_name == "Pat"
    session.commit.assert_called_once()


def test_update_me_returns_404_when_user_not_found():
    # given
    _, override = _db_override(existing_user=None)
    app.dependency_overrides[get_db] = override

    # when
    response = client.patch(
        "/users/me",
        json={"display_name": "Pat"},
        headers={"Authorization": f"Bearer {_make_session(uuid.uuid4())}"},
    )

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 404
