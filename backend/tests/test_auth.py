import hashlib
import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.models import AuthToken, User

client = TestClient(app)


def _db_override(existing_user=None):
    session = AsyncMock()
    # AsyncMock children are also AsyncMock; scalar_one_or_none() and add() are
    # synchronous in SQLAlchemy, so use plain MagicMocks for them.
    result = MagicMock()
    result.scalar_one_or_none.return_value = existing_user
    session.execute.return_value = result
    session.add = MagicMock()

    async def override():
        yield session

    return session, override


def test_request_token_rejects_invalid_email():
    # given
    _, override = _db_override()
    app.dependency_overrides[get_db] = override

    # when
    response = client.post("/auth/request-token", json={"email": "not-an-email"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 422


def test_request_token_rejects_missing_email():
    # given
    _, override = _db_override()
    app.dependency_overrides[get_db] = override

    # when
    response = client.post("/auth/request-token", json={})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 422


def test_request_token_returns_204():
    # given
    session, override = _db_override(existing_user=None)
    app.dependency_overrides[get_db] = override

    # when
    response = client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 204


def test_request_token_creates_user_and_token_for_new_email():
    # given
    session, override = _db_override(existing_user=None)
    app.dependency_overrides[get_db] = override

    # when
    client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    added = [c.args[0] for c in session.add.call_args_list]
    assert any(isinstance(obj, User) and obj.email == "pat@example.com" for obj in added)
    assert any(isinstance(obj, AuthToken) for obj in added)


def test_request_token_flushes_after_new_user_to_satisfy_fk():
    # given
    session, override = _db_override(existing_user=None)
    app.dependency_overrides[get_db] = override

    # when
    client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    session.flush.assert_called_once()


def test_request_token_reuses_existing_user():
    # given
    existing = User(id=uuid.uuid4(), email="pat@example.com")
    session, override = _db_override(existing_user=existing)
    app.dependency_overrides[get_db] = override

    # when
    client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    added = [c.args[0] for c in session.add.call_args_list]
    assert not any(isinstance(obj, User) for obj in added)
    assert any(isinstance(obj, AuthToken) for obj in added)


def test_request_token_skips_flush_when_user_already_exists():
    # given
    existing = User(id=uuid.uuid4(), email="pat@example.com")
    session, override = _db_override(existing_user=existing)
    app.dependency_overrides[get_db] = override

    # when
    client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    session.flush.assert_not_called()


def test_request_token_rolls_back_if_email_fails(mock_send_magic_link_email):
    # given
    session, override = _db_override(existing_user=None)
    app.dependency_overrides[get_db] = override
    mock_send_magic_link_email.side_effect = Exception("Resend error")

    # when
    with pytest.raises(Exception):
        client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    session.commit.assert_not_called()


def test_request_token_sends_magic_link_email(mock_send_magic_link_email):
    # given
    session, override = _db_override(existing_user=None)
    app.dependency_overrides[get_db] = override

    # when
    client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    mock_send_magic_link_email.assert_called_once()
    call_kwargs = mock_send_magic_link_email.call_args
    assert call_kwargs.kwargs["to"] == "pat@example.com"
    assert isinstance(call_kwargs.kwargs["token"], str) and len(call_kwargs.kwargs["token"]) > 0


def test_request_token_notifies_admin_for_new_user(mock_send_admin_new_user_notification):
    # given
    session, override = _db_override(existing_user=None)
    app.dependency_overrides[get_db] = override

    # when
    client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    mock_send_admin_new_user_notification.assert_called_once_with(new_user_email="pat@example.com")


def test_request_token_skips_admin_notification_for_existing_user(mock_send_admin_new_user_notification):
    # given
    existing = User(id=uuid.uuid4(), email="pat@example.com")
    session, override = _db_override(existing_user=existing)
    app.dependency_overrides[get_db] = override

    # when
    client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    mock_send_admin_new_user_notification.assert_not_called()


def test_request_token_does_not_fail_if_admin_notification_fails(mock_send_admin_new_user_notification):
    # given
    session, override = _db_override(existing_user=None)
    app.dependency_overrides[get_db] = override
    mock_send_admin_new_user_notification.side_effect = Exception("email error")

    # when
    response = client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    assert response.status_code == 204


def test_request_token_stores_sha256_hash():
    # given
    session, override = _db_override(existing_user=None)
    app.dependency_overrides[get_db] = override

    # when
    client.post("/auth/request-token", json={"email": "pat@example.com"})

    # then
    app.dependency_overrides.clear()
    added = [c.args[0] for c in session.add.call_args_list]
    token = next(obj for obj in added if isinstance(obj, AuthToken))
    assert len(token.token_hash) == 64  # SHA-256 hex digest is always 64 chars
    assert token.token_hash == token.token_hash.lower()  # hex digits only
