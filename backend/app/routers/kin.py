import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, outerjoin, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Kin, Moment
from app.routers.deps import get_current_user_id

router = APIRouter()


class KinResponse(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CreateKinRequest(BaseModel):
    name: str


class RenameKinRequest(BaseModel):
    name: str


@router.get("/users/me/kin", response_model=list[KinResponse])
async def list_kin(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Kin).where(Kin.user_id == user_id).order_by(Kin.name))
    return result.scalars().all()


@router.post("/users/me/kin", response_model=KinResponse, status_code=201)
async def create_kin(
    body: CreateKinRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(func.coalesce(func.sum(Moment.duration_minutes), 0).label("total_minutes"))
        .select_from(outerjoin(Kin, Moment, Kin.id == Moment.kin_id))
        .where(Kin.user_id == user_id)
        .group_by(Kin.id)
    )
    rows = (await db.execute(stmt)).all()
    baseline = max((r.total_minutes for r in rows), default=0)

    kin = Kin(id=uuid.uuid4(), user_id=user_id, name=body.name, baseline_minutes=baseline, created_at=datetime.now(timezone.utc))
    db.add(kin)
    await db.commit()
    return kin


@router.patch("/users/me/kin/{kin_id}", status_code=204)
async def rename_kin(
    kin_id: uuid.UUID,
    body: RenameKinRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Kin).where(Kin.id == kin_id))
    kin = result.scalar_one_or_none()
    if kin is None:
        raise HTTPException(status_code=404, detail="Kin not found")
    if kin.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    kin.name = body.name
    await db.commit()


@router.delete("/users/me/kin/{kin_id}", status_code=204)
async def delete_kin(
    kin_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Kin).where(Kin.id == kin_id))
    kin = result.scalar_one_or_none()
    if kin is None:
        raise HTTPException(status_code=404, detail="Kin not found")
    if kin.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.delete(kin)
    await db.commit()
