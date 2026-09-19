from fastapi import APIRouter, Depends, status, Query, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.controllers.business_controller import (
    create_business,
    get_business,
    get_my_business_ids,
    mark_business_state,
    update_business,
    search_businesses,
    search_other_businesses,
    get_active_businesses,
    get_business_owner_contact,
    get_business_images,
    update_business_images,
    clear_business_images,
)
from src.middlewares.auth import verify_token
from src.models.business_request import (
    BusinessCreateRequest,
    BusinessResponse,
    BusinessOwnerContactResponse,
    BusinessImagesResponse,
    BusinessImagesUpdateRequest,
    BusinessUpdateRequest,
)
from src.schema.business import BusinessStatus

router = APIRouter()


# =========================================================
# CREATE
# =========================================================


@router.post(
    "/create",
    response_model=BusinessResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_business_route(
    data: BusinessCreateRequest,
    language: str = "english",
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await create_business(
        data=data,
        owner_id=user_id,
        language=language,
        db=db,
    )


# =========================================================
# MY BUSINESSES
# =========================================================


@router.get(
    "/my",
    response_model=list[str],
    status_code=status.HTTP_200_OK,
)
async def get_my_business_ids_route(
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await get_my_business_ids(
        user_id=user_id,
        db=db,
    )


# =========================================================
# SEARCH
# =========================================================


@router.get(
    "/search",
    response_model=list[BusinessResponse],
    status_code=status.HTTP_200_OK,
)
async def search_businesses_route(
    language: str = "english",
    name: str | None = None,
    category: str | None = None,
    status: BusinessStatus | None = None,
    village: str | None = None,
    district: str | None = None,
    city: str | None = None,
    state: str | None = None,
    country: str | None = None,
    pincode: str | None = None,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await search_businesses(
        db=db,
        language=language,
        user_id=user_id,
        name=name,
        category=category,
        status=status,
        village=village,
        district=district,
        city=city,
        state=state,
        country=country,
        pincode=pincode,
    )


# =========================================================
# OTHER BUSINESSES
# =========================================================
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# Optional token resolver helper:
async def get_optional_user_id(
    credentials: HTTPAuthorizationCredentials | None = None,
) -> str | None:
    if not credentials:
        return None
    try:
        # If your verify_token accepts the raw header string:
        return await verify_token(credentials)
    except HTTPException:
        # Invalid/expired token falls back to anonymous
        return None


@router.get(
    "/search/others",
    response_model=list[BusinessResponse],
    status_code=status.HTTP_200_OK,
)
async def search_other_businesses_route(
    language: str = "english",
    name: str | None = None,
    category: str | None = None,
    status: BusinessStatus | None = None,
    village: str | None = None,
    district: str | None = None,
    city: str | None = None,
    state: str | None = None,
    country: str | None = None,
    pincode: str | None = None,
    user_id: str | None = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await search_other_businesses(
        db=db,
        language=language,
        name=name,
        category=category,
        status=status,
        village=village,
        district=district,
        city=city,
        state=state,
        country=country,
        pincode=pincode,
        user_id=None,
    )


@router.get(
    "/public/active",
    response_model=list[BusinessResponse],
    summary="Get active businesses for public directory",
)
async def list_active_businesses(
    user_id: str | None = None,
    language: str = Query("en", description="Target language code (e.g., en, hi, bn)"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to fetch"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db),
):
    return await get_active_businesses(
        language=language, db=db, limit=limit, offset=offset, user_id=user_id
    )


# =========================================================
# UPDATE BUSINESS STATUS
# =========================================================


@router.patch(
    "/{business_id}/status",
    response_model=BusinessResponse,
    status_code=status.HTTP_200_OK,
)
async def mark_business_state_route(
    business_id: str,
    state: BusinessStatus,
    language: str = Query(
        "english", description="Response language (e.g., english, en, hindi, hi)"
    ),
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await mark_business_state(
        user_id=user_id,
        business_id=business_id,
        state=state,
        language=language,
        db=db,
    )


# =========================================================
# GET BUSINESS OWNER CONTACT DETAILS
# =========================================================


@router.get(
    "/{business_id}/contact",
    response_model=BusinessOwnerContactResponse,
    status_code=status.HTTP_200_OK,
    summary="Get business owner contact details",
)
async def get_business_owner_contact_route(
    business_id: str,
    db: AsyncSession = Depends(get_db),
    # Uncomment the next line if authentication is required to view contacts:
    user_id: str = Depends(verify_token),
):
    return await get_business_owner_contact(
        business_id=business_id,
        db=db,
    )


# =========================================================
# GET SINGLE BUSINESS
# =========================================================


@router.get(
    "/{business_id}/images",
    response_model=BusinessImagesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get business image URLs",
)
async def get_business_images_route(
    business_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await get_business_images(business_id=business_id, db=db)


@router.put(
    "/{business_id}/images",
    response_model=BusinessImagesResponse,
    status_code=status.HTTP_200_OK,
    summary="Replace business image URLs",
)
async def replace_business_images_route(
    business_id: str,
    data: BusinessImagesUpdateRequest,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await update_business_images(
        business_id=business_id,
        owner_id=user_id,
        data=data,
        db=db,
    )


@router.post(
    "/{business_id}/images",
    response_model=BusinessImagesResponse,
    status_code=status.HTTP_200_OK,
    summary="Append business image URLs",
)
async def append_business_images_route(
    business_id: str,
    data: BusinessImagesUpdateRequest,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await update_business_images(
        business_id=business_id,
        owner_id=user_id,
        data=data,
        db=db,
        append=True,
    )


@router.delete(
    "/{business_id}/images",
    response_model=BusinessImagesResponse,
    status_code=status.HTTP_200_OK,
    summary="Clear business image URLs",
)
async def clear_business_images_route(
    business_id: str,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await clear_business_images(
        business_id=business_id,
        owner_id=user_id,
        db=db,
    )


@router.patch("/{business_id}/update", response_model=BusinessResponse)
async def patch_business(
    business_id: str,
    data: BusinessUpdateRequest,
    accept_language: str = Header(default="en"),
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await update_business(
        business_id=business_id,
        owner_id=user_id,
        data=data,
        language=accept_language,
        db=db,
    )


@router.get(
    "/{business_id}",
    response_model=BusinessResponse,
    status_code=status.HTTP_200_OK,
)
async def get_business_route(
    business_id: str,
    language: str = "english",
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    return await get_business(
        business_id=business_id,
        language=language,
        owner_id=user_id,
        db=db,
    )
