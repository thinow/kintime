import base64
import hashlib
import hmac
import json
import os
import uuid
from datetime import datetime, timedelta, timezone

_SESSION_DURATION_DAYS = 30


def create_session(user_id: uuid.UUID) -> str:
    secret = os.getenv("SESSION_SECRET", "")
    payload = json.dumps({
        "user_id": str(user_id),
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=_SESSION_DURATION_DAYS)).isoformat(),
    }).encode()
    payload_b64 = base64.urlsafe_b64encode(payload).decode()
    signature = hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"


def verify_session(token: str) -> uuid.UUID:
    """Verify a session token and return the user_id, or raise ValueError."""
    try:
        payload_b64, signature = token.rsplit(".", 1)
    except ValueError:
        raise ValueError("Malformed session token")

    secret = os.getenv("SESSION_SECRET", "")
    expected = hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise ValueError("Invalid session signature")

    payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode())
    expires_at = datetime.fromisoformat(payload["expires_at"])
    if expires_at < datetime.now(timezone.utc):
        raise ValueError("Session expired")

    return uuid.UUID(payload["user_id"])
