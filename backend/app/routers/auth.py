import hashlib
import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.email import send_admin_new_user_notification, send_magic_link_email
from app.models import AuthToken, User
from app.session import create_session

logger = logging.getLogger(__name__)
router = APIRouter()


class TokenRequest(BaseModel):
    email: EmailStr


@router.post("/auth/request-token", status_code=204)
async def request_token(body: TokenRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    is_new_user = user is None

    if is_new_user:
        user = User(id=uuid.uuid4(), email=body.email)
        db.add(user)
        await db.flush()

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

    db.add(AuthToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    ))

    send_magic_link_email(to=body.email, token=raw_token)
    await db.commit()

    if is_new_user:
        try:
            send_admin_new_user_notification(new_user_email=body.email)
        except Exception:
            logger.exception("admin notification failed for new user %s", body.email)


@router.get("/auth/verify")
async def verify_token(token: str, db: AsyncSession = Depends(get_db)):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    result = await db.execute(select(AuthToken).where(AuthToken.token_hash == token_hash))
    auth_token = result.scalar_one_or_none()

    if auth_token is None:
        raise HTTPException(status_code=404, detail="Token not found")

    now = datetime.now(timezone.utc)

    if auth_token.expires_at < now:
        raise HTTPException(status_code=401, detail="Token expired")

    if auth_token.used_at is not None:
        raise HTTPException(status_code=401, detail="Token already used")

    auth_token.used_at = now
    await db.commit()

    return {"session": create_session(auth_token.user_id)}
