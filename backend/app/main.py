import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import InterfaceError

logging.getLogger().setLevel(logging.INFO)

logger = logging.getLogger(__name__)

from app.routers import auth, health, kin, moments, users

_REQUIRED_ENV_VARS = ["RESEND_API_KEY", "FRONTEND_URL", "SESSION_SECRET"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    missing = [name for name in _REQUIRED_ENV_VARS if not os.getenv(name)]
    if missing:
        raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")
    yield


app = FastAPI(lifespan=lifespan)


@app.exception_handler(InterfaceError)
async def db_interface_error_handler(request: Request, exc: InterfaceError) -> JSONResponse:
    logger.error("DB connection error: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"detail": "Service temporarily unavailable"},
        headers={"Retry-After": "2"},
    )


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(kin.router)
app.include_router(moments.router)
