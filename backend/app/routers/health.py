from fastapi import APIRouter

from app.database import ping

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "app": "kintime-api",
        "db": await ping(),
    }
