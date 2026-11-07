import os
import httpx
from dotenv import load_dotenv

load_dotenv()

APPS_SCRIPT_URL = os.getenv("APPS_SCRIPT_URL")
APPS_SCRIPT_SECRET = os.getenv("APPS_SCRIPT_SECRET")


async def _send_email(email: str, subject: str, body: str):
    if not APPS_SCRIPT_URL or not APPS_SCRIPT_SECRET:
        raise ValueError("Google Apps Script email configuration is missing")

    payload = {
        "token": APPS_SCRIPT_SECRET,
        "to": email,
        "subject": subject,
        "body": body,
    }

    async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
        response = await client.post(APPS_SCRIPT_URL, json=payload)
        response.raise_for_status()

        result = response.json()

        if not result.get("success"):
            raise RuntimeError(result.get("error", "Email sending failed"))

        return result


async def send_otp_email(email: str, otp: str):
    body = f"""
Hello,

Your OTP for email verification is: {otp}

This code is valid for 5 minutes. Do not share it with anyone.
If you did not request this, you can safely ignore this email.

Best regards,
ArthNiti Team
"""

    return await _send_email(email, "ArthNiti verification code", body)


async def send_invite_email(email: str, invite_url: str):
    body = f"""
Hello,

You have been invited to join our Business Advisory Platform as a member of the Channelizing agencies.

To complete your registration and gain access to the platform, please use the secure invitation link below:

{invite_url}

What happens next?
- Create your account
- Complete your profile information
- Access loan application management services

Important:
- This invitation link is valid for 24 hours.
- For security reasons, do not share this link with anyone else.

If you were not expecting this invitation, you may safely ignore this email.

We look forward to welcoming you to the platform.

Best regards,
Business Advisory Platform Team
"""

    return await _send_email(
        email, "Invitation to Join Business Advisory Platform", body
    )
