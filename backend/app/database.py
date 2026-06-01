import logging
import os
import re

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

logger = logging.getLogger(__name__)

_url = os.getenv("DATABASE_URL", "")
if _url.startswith("postgresql://"):
    _url = _url.replace("postgresql://", "postgresql+asyncpg://", 1)
# asyncpg uses connect_args for SSL — strip the libpq-style sslmode param
_url = re.sub(r"[?&]sslmode=[^&]*", "", _url)

engine: AsyncEngine | None = create_async_engine(_url, connect_args={"ssl": "require"}) if _url else None


async def ping() -> str:
    if engine is None:
        return "not configured"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return "ok"
    except Exception as e:
        logger.error("DB ping failed: %s", e)
        return "error"
