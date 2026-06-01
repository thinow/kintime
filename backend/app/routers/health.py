from datetime import datetime, timezone

from fastapi import APIRouter

from app.database import ping

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat(),
        "app": "kintime-api",
        "db": await ping(),
    }
