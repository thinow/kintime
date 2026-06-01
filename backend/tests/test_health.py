from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    # when
    response = client.get("/health")

    # then
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "time" in body
    assert body["db"] in {"ok", "not configured"}
