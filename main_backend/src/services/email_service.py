import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")


async def send_otp_email(email: str, otp: str):
    params: resend.Emails.SendParams = {
        "from": RESEND_FROM_EMAIL,
        "to": [email],
        "subject": "ArthNiti verification code",
        "text": f"""
Hello,

Your OTP for email verification is: {otp}

This code is valid for 5 minutes. Do not share it with anyone.
If you did not request this, you can safely ignore this email.

Best regards,
ArthNiti Team
        """,
    }

    return await resend.Emails.send_async(params)


async def send_invite_email(email: str, invite_url: str):
    params: resend.Emails.SendParams = {
        "from": RESEND_FROM_EMAIL,
        "to": [email],
        "subject": "Invitation to Join Business Advisory Platform",
        "text": f"""
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
        """,
    }

    return await resend.Emails.send_async(params)
