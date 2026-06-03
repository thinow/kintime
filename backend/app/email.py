import os

import resend

RESEND_API_KEY: str | None = os.getenv("RESEND_API_KEY")
FRONTEND_URL: str | None = os.getenv("FRONTEND_URL")

resend.api_key = RESEND_API_KEY


def send_magic_link_email(to: str, token: str) -> None:
    magic_link = f"{FRONTEND_URL}/auth/callback?token={token}"
    resend.Emails.send({
        "from": "Kintime <onboarding@resend.dev>",
        "to": to,
        "subject": "Your Kintime login link",
        "html": f'<p><a href="{magic_link}">Click here to log in to Kintime</a></p><p>This link expires in 1 hour.</p>',
    })
