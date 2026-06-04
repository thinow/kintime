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
