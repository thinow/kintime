import hashlib
import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.email import send_magic_link_email
from app.models import AuthToken, User

logger = logging.getLogger(__name__)
router = APIRouter()


class TokenRequest(BaseModel):
    email: EmailStr


@router.post("/auth/request-token", status_code=204)
async def request_token(body: TokenRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user is None:
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
