from unittest.mock import patch

from app.email import send_admin_new_user_notification


def test_send_admin_notification_skips_resend_when_admin_email_unset():
    with patch("app.email.ADMIN_EMAIL", None), patch("resend.Emails.send") as mock_send:
        # when
        send_admin_new_user_notification(new_user_email="pat@example.com")

        # then
        mock_send.assert_not_called()


def test_send_admin_notification_calls_resend_when_admin_email_set():
    with patch("app.email.ADMIN_EMAIL", "admin@example.com"), patch("resend.Emails.send") as mock_send:
        # when
        send_admin_new_user_notification(new_user_email="pat@example.com")

        # then
        mock_send.assert_called_once()
