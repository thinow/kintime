from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    # given
    with patch("app.routers.health.ping", AsyncMock(return_value="not configured")):
        # when
        response = client.get("/health")

    # then
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "time" in body
    assert body["db"] == "not configured"
