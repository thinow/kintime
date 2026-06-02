import pytest
from sqlalchemy import text

from app.database import engine

pytestmark = pytest.mark.skipif(engine is None, reason="requires DATABASE_URL")


@pytest.mark.anyio
async def test_users_and_auth_tokens_tables_exist():
    assert engine is not None
    # when
    async with engine.connect() as conn:
        result = await conn.execute(
            text(
                "SELECT table_name FROM information_schema.tables"
                " WHERE table_schema = 'public'"
                " AND table_name IN ('users', 'auth_tokens')"
            )
        )
        tables = {row[0] for row in result}

    # then
    assert "users" in tables
    assert "auth_tokens" in tables
