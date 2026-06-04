import pytest
from unittest.mock import patch


@pytest.fixture(autouse=True)
def required_env_vars():
    with patch.dict("os.environ", {"RESEND_API_KEY": "test-key", "FRONTEND_URL": "http://localhost:3000", "SESSION_SECRET": "test-secret"}):
        yield


@pytest.fixture(autouse=True)
def mock_send_magic_link_email():
    with patch("app.routers.auth.send_magic_link_email") as mock:
        yield mock


@pytest.fixture(autouse=True)
def mock_send_admin_new_user_notification():
    with patch("app.routers.auth.send_admin_new_user_notification") as mock:
        yield mock
