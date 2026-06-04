import os

import resend

RESEND_API_KEY: str | None = os.getenv("RESEND_API_KEY")
FRONTEND_URL: str | None = os.getenv("FRONTEND_URL")
ADMIN_EMAIL: str | None = os.getenv("ADMIN_EMAIL")

resend.api_key = RESEND_API_KEY


def send_magic_link_email(to: str, token: str) -> None:
    magic_link = f"{FRONTEND_URL}/auth/callback?token={token}"
    resend.Emails.send({
        "from": "Kintime <noreply@mail.kintime.thinow.dev>",
        "to": to,
        "subject": "Your Kintime login link",
        "html": f'<p><a href="{magic_link}">Click here to log in to Kintime</a></p><p>This link expires in 1 hour.</p>',
    })


def send_admin_new_user_notification(new_user_email: str) -> None:
    if not ADMIN_EMAIL:
        return
    resend.Emails.send({
        "from": "Kintime <noreply@mail.kintime.thinow.dev>",
        "to": ADMIN_EMAIL,
        "subject": "New user on Kintime",
        "html": f"<p>{new_user_email} just signed up.</p>",
    })
