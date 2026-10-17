from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import HTTPBearer

from src.config.database import get_db
from src.middlewares.auth import verify_token
from src.models.auth_model import SignupRequest, LoginRequest, UserUpdateRequest
from src.controllers.auth_controller import (
    signup_user,
    login_user,
    logout_user,
    get_my_profile,
    update_my_profile,
)

security = HTTPBearer()
router = APIRouter()


from src.controllers.otp_controller import send_email_otp, verify_email_otp


from pydantic import BaseModel, EmailStr

class SendOtpRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str
    
@router.post("/send-otp")
async def send_otp(data: SendOtpRequest):
    return await send_email_otp(data.email)


@router.post("/verify-otp")
async def verify_otp(data: VerifyOtpRequest):
    return await verify_email_otp(data.email, data.otp)


@router.post("/signup")
async def signup(
    data: SignupRequest, language: str = "english", db: AsyncSession = Depends(get_db)
):
    return await signup_user(data, language, db)


@router.post("/login")
async def login(
    data: LoginRequest, language: str = "english", db: AsyncSession = Depends(get_db)
):
    # Added the 'language' parameter here to match the updated controller
    return await login_user(data, language, db)


@router.post("/logout")
async def logout(user_id: str = Depends(verify_token), credentials=Depends(security)):
    token = credentials.credentials
    return await logout_user(token)


@router.get("/me")
async def get_profile(
    user_id: str = Depends(verify_token),
    language: str = "english",
    db: AsyncSession = Depends(get_db),
):
    return await get_my_profile(user_id, language, db)


@router.patch("/update-profile")
async def update_profile(
    data: UserUpdateRequest,
    language: str = Query("ennglish"),
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await update_my_profile(
        data=data,
        language=language,
        user_id=user_id,
        db=db,
    )

@router.patch("/me")
async def patch_my_profile(
    data: UserUpdateRequest,
    language: str = "english",
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await update_my_profile(
        data=data,
        language=language,
        user_id=user_id,
        db=db,
    )

@router.get("/profile")
async def get_user_profile(
    user_id:str,
    language: str = "english",
    auth: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await get_my_profile(user_id, language, db)
