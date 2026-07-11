import base64
import hashlib
import hmac
import json
import os
import uuid
from datetime import datetime, timedelta, timezone

import pytest

from app.session import create_session, verify_session


def _make_expired_token(user_id: uuid.UUID, email: str) -> str:
    secret = os.getenv("SESSION_SECRET", "")
    payload = json.dumps({
        "user_id": str(user_id),
        "email": email,
        "expires_at": (datetime.now(timezone.utc) - timedelta(seconds=1)).isoformat(),
    }).encode()
    payload_b64 = base64.urlsafe_b64encode(payload).decode()
    signature = hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"


def test_verify_session_returns_user_id_for_valid_token():
    # given
    user_id = uuid.uuid4()
    token = create_session(user_id, "pat@example.com")

    # when
    result = verify_session(token)

    # then
    assert result == user_id


def test_verify_session_raises_for_malformed_token():
    # when / then
    with pytest.raises(ValueError, match="Malformed"):
        verify_session("no-dot-here")


def test_verify_session_raises_for_bad_signature():
    # given
    user_id = uuid.uuid4()
    token = create_session(user_id, "pat@example.com")
    payload_b64 = token.rsplit(".", 1)[0]
    tampered = f"{payload_b64}.badsignature"

    # when / then
    with pytest.raises(ValueError, match="Invalid session signature"):
        verify_session(tampered)


def test_verify_session_raises_for_expired_session():
    # given
    user_id = uuid.uuid4()
    token = _make_expired_token(user_id, "pat@example.com")

    # when / then
    with pytest.raises(ValueError, match="Session expired"):
        verify_session(token)
