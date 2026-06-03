import asyncpg as _asyncpg
import inspect
import logging
import os
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

# asyncpg 0.31.0 removed channel_binding from connect(); SQLAlchemy 2.0.x still passes it
if "channel_binding" not in inspect.signature(_asyncpg.connect).parameters:
    _orig_connect = _asyncpg.connect

    async def _connect_compat(*args, channel_binding=None, **kwargs):
        return await _orig_connect(*args, **kwargs)

    _asyncpg.connect = _connect_compat

logger = logging.getLogger(__name__)


def parse_database_url(raw: str) -> tuple[str, dict]:
    needs_ssl = "sslmode=require" in raw
    url = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
    parsed = urlparse(url)
    params = {k: v[0] for k, v in parse_qs(parsed.query).items() if k != "sslmode"}
    url = urlunparse(parsed._replace(query=urlencode(params)))
    connect_args = {"ssl": "require"} if needs_ssl else {}
    return url, connect_args


_url, _connect_args = parse_database_url(os.getenv("DATABASE_URL", ""))

engine: AsyncEngine | None = create_async_engine(_url, connect_args=_connect_args) if _url else None

_session_factory: async_sessionmaker | None = (
    async_sessionmaker(engine, expire_on_commit=False) if engine else None
)


async def get_db():
    if _session_factory is None:
        raise RuntimeError("DATABASE_URL not configured")
    async with _session_factory() as session:
        yield session


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
