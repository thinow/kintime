import uuid

from fastapi import Header, HTTPException

from app.session import verify_session


def get_current_user_id(authorization: str | None = Header(default=None)) -> uuid.UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.removeprefix("Bearer ")
    try:
        return verify_session(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
