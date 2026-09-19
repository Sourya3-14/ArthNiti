import logging

logger = logging.getLogger(__name__)

import asyncio
from fastapi import HTTPException, status

from sqlalchemy import select, or_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.schema.user import User
from src.schema.business import Business, BusinessStatus
from src.models.business_request import (
    BusinessCreateRequest,
    BusinessImagesResponse,
    BusinessImagesUpdateRequest,
    BusinessResponse,
    BusinessOwnerContactResponse,
    BusinessUpdateRequest,
)

from src.utils.translator_utils import translate_entry
from src.utils.geo_utils import get_coordinates
from src.utils.business_category_verifier import normalize_and_validate_category

from src.services.distance_service import (
    ensure_user_coordinates,
    calculate_haversine_distance,
)


MULTILINGUAL_BUSINESS_FIELDS = [
    "business_name",
    "category",
    "description",
    "village",
    "district",
    "city",
    "state",
    "country",
]

LANG_NORMALIZER = {
    "english": "en",
    "English": "en",
    "en": "en",
    "eng": "en",
    "bengali": "bn",
    "Bengali": "bn",
    "bng": "bn",
    "bn": "bn",
    "hindi": "hi",
    "Hindi": "hi",
    "hin": "hi",
    "hi": "hi",
}


def normalize_language(language: str) -> str:
    language = language.lower().strip()

    lang_code = LANG_NORMALIZER.get(language)

    if not lang_code:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {language}",
        )

    return lang_code


def get_available_source_language(
    business: Business,
    target_language: str,
) -> str | None:
    """
    Find a language that already exists in the database.

    We prefer:
    1. A language different from target_language
    2. Otherwise target_language itself

    This avoids hardcoding English as the source language.
    """

    available_languages = set()

    for field in MULTILINGUAL_BUSINESS_FIELDS:
        value = getattr(business, field, None) or {}

        if isinstance(value, dict):
            available_languages.update(value.keys())

    # Prefer another language as the translation source
    for lang in available_languages:
        if lang != target_language:
            return lang

    # If only target language exists, return it
    if target_language in available_languages:
        return target_language

    return None


async def ensure_business_language(
    business: Business,
    target_language: str,
    db: AsyncSession,
):
    """
    Make sure every multilingual business field has the requested language.

    If even one field is missing the requested language, translate ALL
    multilingual fields using a language already available in the DB.
    """

    # Check whether all fields already contain the requested language
    all_translated = True

    for field in MULTILINGUAL_BUSINESS_FIELDS:
        value = getattr(business, field, None) or {}

        if not value or target_language not in value:
            all_translated = False
            break

    if all_translated:
        return

    # Find a source language that actually exists in the DB
    source_language = get_available_source_language(
        business,
        target_language,
    )

    if not source_language:
        raise HTTPException(
            status_code=400,
            detail="No source language is available for business translation.",
        )

    # Build the source entry using ONLY the selected source language
    source_entry = {}

    for field in MULTILINGUAL_BUSINESS_FIELDS:
        value = getattr(business, field, None) or {}

        source_entry[field] = value.get(source_language)

    # Remove fields that don't have a value in the source language
    source_entry = {
        key: value for key, value in source_entry.items() if value is not None
    }

    if not source_entry:
        raise HTTPException(
            status_code=400,
            detail="No translatable business data is available.",
        )

    # Translate all fields in one Gemini call
    translated_entry = await asyncio.to_thread(
        translate_entry,
        entry=source_entry,
        target_language=target_language,
        source_language=source_language,
    )

    # Store the translated values in JSONB
    for field in MULTILINGUAL_BUSINESS_FIELDS:
        translated_value = translated_entry.get(field)

        if translated_value is None:
            continue

        current_value = getattr(business, field, None) or {}

        # Create a new dict so SQLAlchemy/JSONB detects the change
        updated_value = dict(current_value)
        updated_value[target_language] = translated_value

        setattr(
            business,
            field,
            updated_value,
        )

    await db.flush()


async def create_business(
    data: BusinessCreateRequest,
    owner_id: str,
    language: str,
    db: AsyncSession,
) -> Business:

    lang_code = normalize_language(language)

    # ---------------------------------------------------------
    # Get coordinates if not provided
    # ---------------------------------------------------------

    latitude = data.latitude
    longitude = data.longitude

    if latitude is None or longitude is None:
        location_parts = [
            data.city,
            data.district,
            data.state,
            data.country,
        ]

        location = ", ".join(
            part.strip() for part in location_parts if part and part.strip()
        )

        if not location:
            raise HTTPException(
                status_code=400,
                detail="Unable to determine location for geocoding",
            )

        try:
            latitude, longitude = await asyncio.to_thread(
                get_coordinates,
                location,
            )

        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

        except Exception as exc:
            raise HTTPException(
                status_code=502,
                detail="Unable to geocode business location",
            ) from exc

    # ---------------------------------------------------------
    # Create business
    # ---------------------------------------------------------
    validated_category = await normalize_and_validate_category(
        business_name=data.business_name,
        provided_category=data.category,
        description=data.description,
    )

    business = Business(
        owner_id=owner_id,
        business_name={lang_code: data.business_name},
        category={lang_code: validated_category},
        description=({lang_code: data.description} if data.description else {}),
        village=({lang_code: data.village} if data.village else {}),
        district={lang_code: data.district},
        city=({lang_code: data.city} if data.city else {}),
        state={lang_code: data.state},
        country={lang_code: data.country},
        margin_capital=data.margin_capital,
        pincode=data.pincode,
        latitude=latitude,
        longitude=longitude,
        status=BusinessStatus.pending,
    )

    db.add(business)

    try:
        all_target_languages = {"en", "bn", "hi"} - {lang_code}

        for target_lang in all_target_languages:
            await ensure_business_language(
                business=business,
                target_language=target_lang,
                db=db,
            )

        await db.commit()
        await db.refresh(business)

    except IntegrityError:
        await db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Unable to create business",
        )

    return BusinessResponse(
        id=business.id,
        owner_id=business.owner_id,
        business_name=(business.business_name or {}).get(lang_code, ""),
        category=(business.category or {}).get(lang_code, ""),
        description=(business.description or {}).get(lang_code),
        village=(business.village or {}).get(lang_code),
        district=(business.district or {}).get(lang_code, ""),
        city=(business.city or {}).get(lang_code),
        state=(business.state or {}).get(lang_code, ""),
        country=(business.country or {}).get(lang_code, ""),
        margin_capital=business.margin_capital,
        pincode=business.pincode,
        latitude=business.latitude,
        longitude=business.longitude,
        status=business.status,
        created_at=business.created_at,
        updated_at=business.updated_at,
    )


def get_business_source_language(
    business: Business,
    target_language: str,
) -> str | None:
    """
    Find any language already available in the business data.

    English is NOT assumed to exist.
    """

    available_languages = set()

    for field in MULTILINGUAL_BUSINESS_FIELDS:
        value = getattr(business, field, None) or {}

        if isinstance(value, dict):
            available_languages.update(value.keys())

    # Prefer a language different from the requested language
    for language in available_languages:
        if language != target_language:
            return language

    # Fallback if only the requested language exists
    if target_language in available_languages:
        return target_language

    return None


async def get_business(
    business_id: str,
    language: str,
    owner_id: str,
    db: AsyncSession,
) -> BusinessResponse:

    lang_code = normalize_language(language)

    result = await db.execute(
        select(Business).where(
            Business.id == business_id,
            Business.owner_id == owner_id,
        )
    )

    business = result.scalar_one_or_none()

    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )

    # ---------------------------------------------------------
    # Check whether ALL fields already have the requested language
    # ---------------------------------------------------------

    translation_missing = False

    for field in MULTILINGUAL_BUSINESS_FIELDS:
        value = getattr(business, field, None) or {}

        if lang_code not in value:
            translation_missing = True
            break

    # ---------------------------------------------------------
    # Translate if ANY field is missing
    # ---------------------------------------------------------

    if translation_missing:
        source_language = get_business_source_language(
            business=business,
            target_language=lang_code,
        )

        if not source_language:
            raise HTTPException(
                status_code=400,
                detail="No source language available for business translation.",
            )

        source_entry = {}

        for field in MULTILINGUAL_BUSINESS_FIELDS:
            value = getattr(business, field, None) or {}

            source_value = value.get(source_language)

            if source_value is not None:
                source_entry[field] = source_value

        if not source_entry:
            raise HTTPException(
                status_code=400,
                detail="No business data available for translation.",
            )

        translated_entry = await asyncio.to_thread(
            translate_entry,
            entry=source_entry,
            target_language=lang_code,
            source_language=source_language,
        )

        # -----------------------------------------------------
        # Store translated values
        # -----------------------------------------------------

        for field in MULTILINGUAL_BUSINESS_FIELDS:
            translated_value = translated_entry.get(field)

            if translated_value is None:
                continue

            current_value = getattr(business, field, None) or {}

            updated_value = dict(current_value)

            updated_value[lang_code] = translated_value

            setattr(
                business,
                field,
                updated_value,
            )

        await db.commit()
        await db.refresh(business)

    # ---------------------------------------------------------
    # Build response using requested language
    # ---------------------------------------------------------

    return BusinessResponse(
        id=business.id,
        owner_id=business.owner_id,
        business_name=(business.business_name or {}).get(lang_code, ""),
        category=(business.category or {}).get(lang_code, ""),
        description=(business.description or {}).get(lang_code),
        village=(business.village or {}).get(lang_code),
        district=(business.district or {}).get(lang_code, ""),
        city=(business.city or {}).get(lang_code),
        state=(business.state or {}).get(lang_code, ""),
        country=(business.country or {}).get(lang_code, ""),
        margin_capital=business.margin_capital,
        pincode=business.pincode,
        latitude=business.latitude,
        longitude=business.longitude,
        status=business.status,
        created_at=business.created_at,
        updated_at=business.updated_at,
    )


async def get_my_business_ids(
    user_id: str,
    db: AsyncSession,
) -> list[str]:

    print("USER ID FROM TOKEN:", user_id)

    result = await db.execute(select(Business).where(Business.owner_id == user_id))

    businesses = result.scalars().all()

    print("BUSINESSES FOUND:", businesses)

    return [str(business.id) for business in businesses]


async def mark_business_state(
    user_id: str,
    business_id: str,
    state: BusinessStatus,
    language: str,
    db: AsyncSession,
) -> BusinessResponse:
    lang_code = normalize_language(language)

    result = await db.execute(
        select(Business).where(
            Business.id == business_id,
            Business.owner_id == user_id,
        )
    )

    business = result.scalar_one_or_none()

    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )

    business.status = state

    try:
        # Flush status changes before running translation checks
        await db.flush()

        # Ensure all multilingual fields are translated to the target language
        await ensure_business_language(
            business=business,
            target_language=lang_code,
            db=db,
        )

        await db.commit()
        await db.refresh(business)

    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Unable to update business status",
        )

    return BusinessResponse(
        id=business.id,
        owner_id=business.owner_id,
        business_name=(business.business_name or {}).get(lang_code, ""),
        category=(business.category or {}).get(lang_code, ""),
        description=(business.description or {}).get(lang_code),
        village=(business.village or {}).get(lang_code),
        district=(business.district or {}).get(lang_code, ""),
        city=(business.city or {}).get(lang_code),
        state=(business.state or {}).get(lang_code, ""),
        country=(business.country or {}).get(lang_code, ""),
        margin_capital=business.margin_capital,
        pincode=business.pincode,
        latitude=business.latitude,
        longitude=business.longitude,
        status=business.status,
        created_at=business.created_at,
        updated_at=business.updated_at,
    )


async def update_business(
    business_id: str,
    owner_id: str,
    data: BusinessUpdateRequest,
    language: str,
    db: AsyncSession,
) -> BusinessResponse:
    lang_code = normalize_language(language)

    # 1. Fetch the business belonging to the caller
    result = await db.execute(
        select(Business).where(
            Business.id == business_id,
            Business.owner_id == owner_id,
        )
    )
    business = result.scalar_one_or_none()

    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )

    has_changes = False

    # 2. Check and isolate genuinely modified multilingual fields
    multilingual_inputs = {
        "business_name": data.name,
        "description": data.description,
        "village": data.village,
        "district": data.district,
        "city": data.city,
        "state": data.state,
        "country": data.country,
    }

    updated_multilingual_fields = {}
    for field, val in multilingual_inputs.items():
        if val is not None and val.strip() != "":
            stripped_val = val.strip()
            current_field_dict = getattr(business, field, None) or {}
            existing_val = current_field_dict.get(lang_code, "")

            # Only mark as updated if value actually differs from DB
            if existing_val != stripped_val:
                updated_multilingual_fields[field] = stripped_val

    if updated_multilingual_fields:
        has_changes = True

        # Purge old translations ONLY for the fields being modified
        for field, new_val in updated_multilingual_fields.items():
            setattr(business, field, {lang_code: new_val})

        await db.flush()

        # Re-translate ONLY the modified fields to all other supported languages
        all_other_languages = {"en", "bn", "hi"} - {lang_code}
        source_entry = {k: v for k, v in updated_multilingual_fields.items()}

        for target_lang in all_other_languages:
            try:
                translated_entry = await asyncio.to_thread(
                    translate_entry,
                    entry=source_entry,
                    target_language=target_lang,
                    source_language=lang_code,
                )

                for field, trans_val in (translated_entry or {}).items():
                    if trans_val is not None:
                        current_dict = dict(getattr(business, field, None) or {})
                        current_dict[target_lang] = trans_val
                        setattr(business, field, current_dict)

            except Exception as exc:
                print(f"Translation warning for {target_lang}: {exc}")

        await db.flush()

    # 3. Handle Coordinates & Location Updates
    location_fields_touched = any(
        k in updated_multilingual_fields
        for k in ["city", "district", "state", "country"]
    )

    explicit_coords_passed = data.latitude is not None and data.longitude is not None
    coords_changed = explicit_coords_passed and (
        business.latitude != data.latitude or business.longitude != data.longitude
    )

    if coords_changed:
        business.latitude = data.latitude
        business.longitude = data.longitude
        has_changes = True
    elif (not explicit_coords_passed) and (
        location_fields_touched
        or (business.latitude is None and business.longitude is None)
    ):
        city = (business.city or {}).get(lang_code) or ""
        district = (business.district or {}).get(lang_code) or ""
        state = (business.state or {}).get(lang_code) or ""
        country = (business.country or {}).get(lang_code) or ""

        location_parts = [city, district, state, country]
        location = ", ".join(
            part.strip() for part in location_parts if part and part.strip()
        )

        if location:
            try:
                lat, lon = await asyncio.to_thread(get_coordinates, location)
                if business.latitude != lat or business.longitude != lon:
                    business.latitude = lat
                    business.longitude = lon
                    has_changes = True
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
            except Exception as exc:
                raise HTTPException(
                    status_code=502,
                    detail="Unable to geocode business location",
                ) from exc

    # 4. Handle Non-multilingual Scalars
    if (
        data.margin_capital is not None
        and business.margin_capital != data.margin_capital
    ):
        business.margin_capital = data.margin_capital
        has_changes = True

    if data.pincode is not None:
        new_pincode = data.pincode.strip() if data.pincode else None
        if business.pincode != new_pincode:
            business.pincode = new_pincode
            has_changes = True

    # 5. Commit changes to DB only if something actually changed
    if has_changes:
        try:
            await db.commit()
            await db.refresh(business)
        except IntegrityError:
            await db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Unable to update business details",
            )

    return _build_business_response(business, lang_code)


async def get_business_images(
    business_id: str,
    db: AsyncSession,
) -> BusinessImagesResponse:
    result = await db.execute(select(Business).where(Business.id == business_id))
    business = result.scalar_one_or_none()

    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    return BusinessImagesResponse(
        business_id=business.id,
        image_urls=business.image_urls or [],
    )


async def update_business_images(
    business_id: str,
    owner_id: str,
    data: BusinessImagesUpdateRequest,
    db: AsyncSession,
    append: bool = False,
) -> BusinessImagesResponse:
    result = await db.execute(
        select(Business).where(
            Business.id == business_id,
            Business.owner_id == owner_id,
        )
    )
    business = result.scalar_one_or_none()

    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    incoming_urls = [str(url) for url in data.image_urls]
    existing_urls = business.image_urls or []
    image_urls = existing_urls + incoming_urls if append else incoming_urls

    # Preserve upload order while avoiding duplicate URLs.
    business.image_urls = list(dict.fromkeys(image_urls)) or None

    await db.commit()
    await db.refresh(business)

    return BusinessImagesResponse(
        business_id=business.id,
        image_urls=business.image_urls or [],
    )


async def clear_business_images(
    business_id: str,
    owner_id: str,
    db: AsyncSession,
) -> BusinessImagesResponse:
    result = await db.execute(
        select(Business).where(
            Business.id == business_id,
            Business.owner_id == owner_id,
        )
    )
    business = result.scalar_one_or_none()

    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    business.image_urls = None
    await db.commit()

    return BusinessImagesResponse(business_id=business.id, image_urls=[])


def _build_business_response(business: Business, lang_code: str) -> BusinessResponse:
    return BusinessResponse(
        id=business.id,
        owner_id=business.owner_id,
        business_name=(business.business_name or {}).get(lang_code, ""),
        category=(business.category or {}).get(lang_code, ""),
        description=(business.description or {}).get(lang_code),
        village=(business.village or {}).get(lang_code),
        district=(business.district or {}).get(lang_code, ""),
        city=(business.city or {}).get(lang_code),
        state=(business.state or {}).get(lang_code, ""),
        country=(business.country or {}).get(lang_code, ""),
        margin_capital=business.margin_capital,
        pincode=business.pincode,
        latitude=business.latitude,
        longitude=business.longitude,
        status=business.status,
        created_at=business.created_at,
        updated_at=business.updated_at,
    )


# ===========================================================================
# HELPER: FUZZY + MULTILINGUAL JSONB FILTER BUILDER
# ===========================================================================


def _build_multilingual_fuzzy_filter(
    jsonb_column,
    primary_term: str,
    primary_lang: str,
    fallback_term: str | None = None,
    fallback_lang: str = "en",
    threshold: float = 0.7,
):
    """
    Builds a fuzzy filter against the requested language.
    If a translated fallback term is provided (e.g. English translation of Bengali search),
    it checks that against the fallback language key as well.
    """
    conditions = []

    # 1. Primary language search (e.g., Bengali term -> ["bn"])
    clean_primary = primary_term.strip()
    primary_text = func.coalesce(jsonb_column[primary_lang].astext, "")
    conditions.append(
        or_(
            func.similarity(func.lower(primary_text), clean_primary.lower())
            > threshold,
            primary_text.ilike(f"%{clean_primary}%"),
        )
    )

    # 2. Fallback language search (e.g., Translated English term -> ["en"])
    if fallback_term and fallback_lang != primary_lang:
        clean_fallback = fallback_term.strip()
        fallback_text = func.coalesce(jsonb_column[fallback_lang].astext, "")
        conditions.append(
            or_(
                func.similarity(func.lower(fallback_text), clean_fallback.lower())
                > threshold,
                fallback_text.ilike(f"%{clean_fallback}%"),
            )
        )

    return or_(*conditions)


async def _resolve_search_translations(
    lang_code: str,
    search_terms: dict[str, str | None],
) -> dict[str, str]:
    """
    Translates non-English search terms to English in a single Gemini call
    to allow cross-language matching against untranslated database records.
    """
    if lang_code == "en":
        return {}

    terms_to_translate = {
        k: v.strip() for k, v in search_terms.items() if v and v.strip()
    }
    if not terms_to_translate:
        return {}

    try:
        translated = await asyncio.to_thread(
            translate_entry,
            entry=terms_to_translate,
            target_language="en",
            source_language=lang_code,
        )
        return translated or {}
    except Exception:
        # If translation service fails, proceed with primary terms only
        return {}


# ===========================================================================
# 1. SEARCH BUSINESSES (USER'S OWN BUSINESSES)
# ===========================================================================
async def search_businesses(
    db: AsyncSession,
    user_id: str,
    language: str,
    name: str | None = None,
    category: str | None = None,
    status: BusinessStatus | None = None,
    village: str | None = None,
    district: str | None = None,
    city: str | None = None,
    state: str | None = None,
    country: str | None = None,
    pincode: str | None = None,
) -> list[BusinessResponse]:
    lang_code = normalize_language(language)
    user_lat, user_lon = await ensure_user_coordinates(user_id=user_id, db=db)

    # Resolve fallback English translations if user searches in Bengali/Hindi
    term_dict = {
        "name": name,
        "category": category,
        "village": village,
        "district": district,
        "city": city,
        "state": state,
        "country": country,
    }
    en_terms = await _resolve_search_translations(
        lang_code=lang_code, search_terms=term_dict
    )

    filters = [Business.owner_id == user_id]

    if name:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.business_name, name, lang_code, en_terms.get("name")
            )
        )
    if category:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.category, category, lang_code, en_terms.get("category")
            )
        )
    if status:
        filters.append(Business.status == status)
    if village:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.village, village, lang_code, en_terms.get("village")
            )
        )
    if district:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.district, district, lang_code, en_terms.get("district")
            )
        )
    if city:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.city, city, lang_code, en_terms.get("city")
            )
        )
    if state:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.state, state, lang_code, en_terms.get("state")
            )
        )
    if country:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.country, country, lang_code, en_terms.get("country")
            )
        )
    if pincode:
        filters.append(Business.pincode.ilike(f"%{pincode.strip()}%"))

    if len(filters) <= 1:
        raise HTTPException(
            status_code=400,
            detail="At least one search filter is required",
        )

    result = await db.execute(select(Business).where(*filters))
    businesses = result.scalars().all()

    sorted_entries: list[tuple[float, BusinessResponse]] = []

    for business in businesses:
        await ensure_business_language(
            business=business,
            target_language=lang_code,
            db=db,
        )

        distance = (
            calculate_haversine_distance(
                user_lat, user_lon, business.latitude, business.longitude
            )
            if business.latitude is not None and business.longitude is not None
            else float("inf")
        )

        sorted_entries.append((distance, _build_business_response(business, lang_code)))

    await db.commit()
    sorted_entries.sort(key=lambda item: item[0])
    return [item[1] for item in sorted_entries]


# ===========================================================================
# 2. SEARCH OTHER BUSINESSES (PUBLIC / EXPLORE SEARCH)
# ===========================================================================
async def search_other_businesses(
    db: AsyncSession,
    language: str,
    user_id: str | None = None,
    name: str | None = None,
    category: str | None = None,
    status: BusinessStatus | None = None,
    village: str | None = None,
    district: str | None = None,
    city: str | None = None,
    state: str | None = None,
    country: str | None = None,
    pincode: str | None = None,
) -> list[BusinessResponse]:
    lang_code = normalize_language(language)

    # 1. Resolve user coordinates if user_id is provided
    user_lat: float | None = None
    user_lon: float | None = None

    if user_id:
        try:
            user_lat, user_lon = await ensure_user_coordinates(user_id=user_id, db=db)
        except HTTPException:
            user_lat, user_lon = None, None

    # 2. Resolve fallback English translations if user searches in Bengali/Hindi
    term_dict = {
        "name": name,
        "category": category,
        "village": village,
        "district": district,
        "city": city,
        "state": state,
        "country": country,
    }
    en_terms = await _resolve_search_translations(
        lang_code=lang_code, search_terms=term_dict
    )

    # 3. Build query filters
    filters = []

    if user_id:
        filters.append(Business.owner_id != user_id)

    if name:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.business_name, name, lang_code, en_terms.get("name")
            )
        )

    if category:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.category, category, lang_code, en_terms.get("category")
            )
        )
    if status:
        filters.append(Business.status == status)

    if village:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.village, village, lang_code, en_terms.get("village")
            )
        )

    if district:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.district, district, lang_code, en_terms.get("district")
            )
        )

    if city:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.city, city, lang_code, en_terms.get("city")
            )
        )

    if state:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.state, state, lang_code, en_terms.get("state")
            )
        )

    if country:
        filters.append(
            _build_multilingual_fuzzy_filter(
                Business.country, country, lang_code, en_terms.get("country")
            )
        )

    if pincode:
        filters.append(Business.pincode.ilike(f"%{pincode.strip()}%"))

    # If no functional filter was provided
    if not filters or (len(filters) == 1 and user_id):
        raise HTTPException(
            status_code=400,
            detail="At least one search filter is required",
        )

    # 4. Query records
    query = select(Business).where(*filters)

    if user_lat is None or user_lon is None:
        query = query.order_by(Business.created_at.desc())

    print(query)
    logger.warning("QUERY: %s", query)

    result = await db.execute(query)
    businesses = result.scalars().all()

    # 5. Translation and response building
    if user_lat is not None and user_lon is not None:
        sorted_entries: list[tuple[float, BusinessResponse]] = []

        for business in businesses:
            await ensure_business_language(
                business=business,
                target_language=lang_code,
                db=db,
            )

            distance = (
                calculate_haversine_distance(
                    user_lat, user_lon, business.latitude, business.longitude
                )
                if business.latitude is not None and business.longitude is not None
                else float("inf")
            )

            sorted_entries.append(
                (distance, _build_business_response(business, lang_code))
            )

        await db.commit()
        sorted_entries.sort(key=lambda item: item[0])
        return [item[1] for item in sorted_entries]

    # Fallback for unauthenticated or non-geolocated users
    responses = []
    for business in businesses:
        await ensure_business_language(
            business=business,
            target_language=lang_code,
            db=db,
        )
        responses.append(_build_business_response(business, lang_code))

    await db.commit()
    return responses


async def get_active_businesses(
    language: str,
    db: AsyncSession,
    user_id: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[BusinessResponse]:
    """
    Fetches active businesses and ensures translations.

    - If user_id is provided and coordinates are resolved:
      returns businesses sorted by proximity to the user.
    - If user_id is None, user is not found, or coordinates cannot be resolved:
      returns businesses ordered normally by creation date (newest first).
    """
    lang_code = normalize_language(language)

    # 1. Try to get user coordinates if user_id is supplied
    user_lat: float | None = None
    user_lon: float | None = None

    if user_id:
        try:
            user_lat, user_lon = await ensure_user_coordinates(user_id=user_id, db=db)
        except HTTPException:
            # User profile not found, address invalid, or geocoding failed: fallback gracefully
            user_lat, user_lon = None, None

    # 2. Case A: Location is available -> Fetch all active, compute distance, sort & paginate
    if user_lat is not None and user_lon is not None:
        query = select(Business).where(Business.status == BusinessStatus.active)
        result = await db.execute(query)
        businesses = result.scalars().all()

        sorted_entries: list[tuple[float, BusinessResponse]] = []

        for business in businesses:
            await ensure_business_language(
                business=business,
                target_language=lang_code,
                db=db,
            )

            distance = (
                calculate_haversine_distance(
                    user_lat, user_lon, business.latitude, business.longitude
                )
                if business.latitude is not None and business.longitude is not None
                else float("inf")
            )

            sorted_entries.append(
                (distance, _build_business_response(business, lang_code))
            )

        await db.commit()

        # Sort globally by proximity and slice
        sorted_entries.sort(key=lambda item: item[0])
        paginated_entries = sorted_entries[offset : offset + limit]

        return [item[1] for item in paginated_entries]

    # 3. Case B: Fallback (no user_id or coordinates) -> Standard DB pagination ordered by created_at
    query = (
        select(Business)
        .where(Business.status == BusinessStatus.active)
        .order_by(Business.created_at.desc())
        .limit(limit)
        .offset(offset)
    )

    result = await db.execute(query)
    businesses = result.scalars().all()

    responses = []
    for business in businesses:
        await ensure_business_language(
            business=business,
            target_language=lang_code,
            db=db,
        )
        responses.append(_build_business_response(business, lang_code))

    await db.commit()

    return responses


async def get_business_owner_contact(
    business_id: str,
    db: AsyncSession,
) -> BusinessOwnerContactResponse:
    # Query Business and join User by owner_id
    query = (
        select(Business, User)
        .join(User, Business.owner_id == User.user_id)
        .where(Business.id == business_id)
    )

    result = await db.execute(query)
    record = result.first()

    if not record:
        # Check if the business exists without a user, or doesn't exist at all
        business_check = await db.scalar(
            select(Business.id).where(Business.id == business_id)
        )
        if not business_check:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found",
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner contact details not found",
        )

    business, owner = record

    return BusinessOwnerContactResponse(
        business_id=str(business.id),
        owner_id=str(owner.user_id),
        owner_name=getattr(owner, "full_name", getattr(owner, "name", None)),
        email=getattr(owner, "email", None),
        phone_number=getattr(owner, "phone_number", getattr(owner, "phone", None)),
    )
