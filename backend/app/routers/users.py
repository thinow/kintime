import uuid

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.session import verify_session

router = APIRouter()


def get_current_user_id(authorization: str | None = Header(default=None)) -> uuid.UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.removeprefix("Bearer ")
    try:
        return verify_session(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired session")


class UpdateUserRequest(BaseModel):
    display_name: str


@router.patch("/users/me", status_code=204)
async def update_me(
    body: UpdateUserRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.display_name = body.display_name
    await db.commit()
