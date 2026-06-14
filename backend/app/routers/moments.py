import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, outerjoin, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Kin, Moment
from app.routers.users import get_current_user_id

router = APIRouter()


class CreateMomentRequest(BaseModel):
    kin_id: uuid.UUID
    duration_minutes: int = Field(gt=0)
    logged_at: datetime | None = None


class MomentResponse(BaseModel):
    id: uuid.UUID
    kin_id: uuid.UUID
    duration_minutes: int
    logged_at: datetime

    model_config = {"from_attributes": True}


class KinBalanceResponse(BaseModel):
    kin_id: uuid.UUID
    name: str
    deficit_minutes: int


@router.get("/users/me/balance", response_model=list[KinBalanceResponse])
async def get_balance(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            Kin.id.label("kin_id"),
            Kin.name,
            func.coalesce(func.sum(Moment.duration_minutes), 0).label("total_minutes"),
        )
        .select_from(outerjoin(Kin, Moment, Kin.id == Moment.kin_id))
        .where(Kin.user_id == user_id)
        .group_by(Kin.id, Kin.name)
    )
    rows = (await db.execute(stmt)).all()
    max_total = max((r.total_minutes for r in rows), default=0)
    return sorted(
        [KinBalanceResponse(kin_id=r.kin_id, name=r.name, deficit_minutes=max_total - r.total_minutes) for r in rows],
        key=lambda r: r.deficit_minutes,
    )


@router.post("/users/me/moments", response_model=MomentResponse, status_code=201)
async def create_moment(
    body: CreateMomentRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Kin).where(Kin.id == body.kin_id))
    kin = result.scalar_one_or_none()
    if kin is None:
        raise HTTPException(status_code=404, detail="Kin not found")
    if kin.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    moment = Moment(
        id=uuid.uuid4(),
        user_id=user_id,
        kin_id=body.kin_id,
        duration_minutes=body.duration_minutes,
        logged_at=body.logged_at or datetime.now(timezone.utc),
    )
    db.add(moment)
    await db.commit()
    return moment
