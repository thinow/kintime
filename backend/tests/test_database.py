import asyncpg
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import app.database
from app.database import parse_database_url, ping


@pytest.mark.anyio
async def test_asyncpg_connect_compat_shim_drops_channel_binding():
    if not hasattr(app.database, "_orig_connect"):
        pytest.skip("shim not applied: asyncpg natively supports channel_binding")

    # given
    with patch("app.database._orig_connect", AsyncMock()) as mock_orig:
        # when — simulate SQLAlchemy 2.0.x passing channel_binding to asyncpg.connect
        await asyncpg.connect("postgresql://localhost/test", channel_binding="require")

    # then — channel_binding was silently dropped; real connect received only the dsn
    mock_orig.assert_called_once_with("postgresql://localhost/test")


def test_parse_database_url_converts_scheme_and_enables_ssl():
    # when
    url, connect_args = parse_database_url("postgresql://user:pass@host/neondb?sslmode=require")

    # then
    assert url == "postgresql+asyncpg://user:pass@host/neondb"
    assert connect_args == {"ssl": "require"}


def test_parse_database_url_preserves_extra_params_when_stripping_sslmode():
    # given — Neon URLs sometimes carry additional query params alongside sslmode
    raw = "postgresql://user:pass@host/neondb?sslmode=require&options=endpoint%3Dep-xxx"

    # when
    url, connect_args = parse_database_url(raw)

    # then
    assert "sslmode" not in url
    assert "options=" in url
    assert "neondb?" in url  # extra params stay as query string, not corrupting the db name
    assert connect_args == {"ssl": "require"}


def test_parse_database_url_no_ssl_without_sslmode():
    # when
    url, connect_args = parse_database_url("postgresql://user:pass@localhost/kintime_test")

    # then
    assert url == "postgresql+asyncpg://user:pass@localhost/kintime_test"
    assert connect_args == {}


@pytest.mark.anyio
async def test_ping_returns_not_configured_when_no_engine():
    # given
    with patch("app.database.engine", None):
        # when
        result = await ping()

    # then
    assert result == "not configured"


@pytest.mark.anyio
async def test_ping_returns_ok_when_db_reachable():
    # given
    mock_engine = MagicMock()
    mock_engine.connect.return_value = AsyncMock()

    with patch("app.database.engine", mock_engine):
        # when
        result = await ping()

    # then
    assert result == "ok"


@pytest.mark.anyio
async def test_ping_returns_error_when_db_unreachable():
    # given
    mock_cm = AsyncMock()
    mock_cm.__aenter__.side_effect = Exception("connection refused")
    mock_engine = MagicMock()
    mock_engine.connect.return_value = mock_cm

    with patch("app.database.engine", mock_engine):
        # when
        result = await ping()

    # then
    assert result == "error"
