import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

logging.getLogger().setLevel(logging.INFO)

from app.routers import auth, health, kin, users

_REQUIRED_ENV_VARS = ["RESEND_API_KEY", "FRONTEND_URL", "SESSION_SECRET"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    missing = [name for name in _REQUIRED_ENV_VARS if not os.getenv(name)]
    if missing:
        raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(kin.router)
