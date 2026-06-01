from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.database import ping


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
