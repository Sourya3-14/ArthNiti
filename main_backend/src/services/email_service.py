import os
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()

APPS_SCRIPT_URL = os.getenv("APPS_SCRIPT_URL")
APPS_SCRIPT_SECRET = os.getenv("APPS_SCRIPT_SECRET")


logger = logging.getLogger(__name__)


async def _send_email(email: str, subject: str, body: str):
    payload = {
        "token": APPS_SCRIPT_SECRET,
        "to": email,
        "subject": subject,
        "body": body,
    }

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=60) as client:
            response = await client.post(APPS_SCRIPT_URL, json=payload)

            logger.info("Apps Script status: %s", response.status_code)
            logger.info("Apps Script final URL: %s", response.url)
            logger.info("Apps Script response: %s", response.text[:1500])

            response.raise_for_status()

            result = response.json()

            if not result.get("success"):
                raise RuntimeError(result.get("error"))

            return result

    except Exception as exc:
        logger.exception("Google Apps Script email request failed " + str(exc))
        raise


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
