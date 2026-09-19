import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.controllers.report_service import generate_feasibility_report
from src.controllers.business_report_persistence_service import save_business_analysis
from src.controllers.translator_service import (
    ReportTranslationError,
    translate_feasibility_report,
)
from src.middlewares.role import require_enterpreneur
from src.schema.business import Business, BusinessStatus
from src.schema.business_analysis import BusinessAnalysis
from src.schema.enterpreneur import Enterpreneur
from src.schema.report_translations import ReportLanguage, ReportTranslation
from src.models.report import ReportRequest, ReportResponse

from src.schema.business_report_chunk import BusinessReportChunk
from src.services.scheme_embedding import generate_embedding
from src.utils.report_utils import parse_report_sections, split_text_recursively

from src.utils.translator_utils import translate_entry

from src.utils.business_category_verifier import normalize_and_validate_category

router = APIRouter()

language_codes = {
    "english": "en",
    "en": "en",
    "eng": "en",
    "bengali": "bn",
    "beng": "bn",
    "bn": "bn",
    "hindi": "hi",
    "hind": "hi",
    "hi": "hi",
}

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


@router.post(
    "/generate",
    response_model=ReportResponse,
)
async def generate_report(
    request: ReportRequest,
    force: bool = False,
    entrepreneur: Enterpreneur = Depends(require_enterpreneur),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a pending business, generate its feasibility analysis,
    persist the analysis, chunk the report for vector storage, and return the result.
    """

    business_result = await db.execute(
        select(Business).where(
            Business.id == request.business_id,
            Business.owner_id == entrepreneur.user_id,
        )
    )
    business = business_result.scalar_one_or_none()

    req_lang = request.language.strip().lower()
    lang_code = language_codes[req_lang]

    if not business:
        # Determine the correct JSONB key based on the request language

        validated_category = await normalize_and_validate_category(
            business_name=request.business_name,
            provided_category=request.business_type,
            description=request.business_description,
        )

        business = Business(
            owner_id=entrepreneur.user_id,
            business_name={lang_code: request.business_name},
            category={lang_code: validated_category},
            margin_capital=request.margin_capital,
            description={lang_code: request.business_description}
            if request.business_description
            else {},
            village={lang_code: request.village} if request.village else {},
            district={lang_code: request.district},
            city={lang_code: request.city} if request.city else {},
            state={lang_code: request.state},
            country={lang_code: request.country},
            pincode=request.pincode,
            status=BusinessStatus.pending,
        )
        db.add(business)
        await db.flush()

        await ensure_business_language(
            business=business,
            target_language=lang_code,
            db=db,
        )

    request.business_id = business.id
    request.business_name = business.business_name.get("en", "")
    request.business_type = business.category.get("en", "")
    request.business_description = business.description.get("en", "")

    request.country = business.country.get("en", "")
    request.state = business.state.get("en", "")
    request.district = business.district.get("en", "")
    request.city = business.city.get("en", "")
    request.village = business.village.get("en", "")
    request.pincode = business.pincode
    request.margin_capital = business.margin_capital

    if force:
        analysis_ids_result = await db.execute(
            select(BusinessAnalysis.id).where(
                BusinessAnalysis.business_id == business.id
            )
        )
        analysis_ids = analysis_ids_result.scalars().all()

        if analysis_ids:
            # Delete analysis only translation and chunks has cascading
            await db.execute(
                delete(BusinessAnalysis).where(BusinessAnalysis.id.in_(analysis_ids))
            )

        await db.flush()

    latest_result = await db.execute(
        select(BusinessAnalysis)
        .where(BusinessAnalysis.business_id == business.id)
        .order_by(BusinessAnalysis.version.desc())
        .limit(1)
    )
    existing_analysis = latest_result.scalar_one_or_none()

    if existing_analysis:
        language = request.language.strip().lower()

        original_evidence = {
            "population": existing_analysis.population_payload,
            "competitors": existing_analysis.competitor_payload,
            "market_price": existing_analysis.market_price_payload,
            "supply_chain": existing_analysis.supply_chain_payload,
            "transportation": existing_analysis.transportation_payload,
            "seasonality": existing_analysis.seasonality_payload,
        }

        if language == "english":
            return ReportResponse(
                status="success",
                analysis_id=existing_analysis.id,
                version=existing_analysis.version,
                language="english",
                report_markdown=existing_analysis.report_markdown,
                raw_evidence=original_evidence,
            )

        translation_result = await db.execute(
            select(ReportTranslation).where(
                ReportTranslation.report_id == existing_analysis.id,
                ReportTranslation.language == request.language,
            )
        )
        existing_translation = translation_result.scalar_one_or_none()

        if existing_translation:
            translated_evidence = {
                "population": existing_translation.population_payload,
                "competitors": existing_translation.competitor_payload,
                "market_price": existing_translation.market_price_payload,
                "supply_chain": existing_translation.supply_chain_payload,
                "transportation": existing_translation.transportation_payload,
                "seasonality": existing_translation.seasonality_payload,
            }
            return ReportResponse(
                status="success",
                analysis_id=existing_analysis.id,
                version=existing_analysis.version,
                language=language,
                report_markdown=existing_translation.content or "",
                raw_evidence=translated_evidence,
            )

        try:
            translated_result = await translate_feasibility_report(
                report_markdown=existing_analysis.report_markdown,
                raw_evidence=original_evidence,
                target_language=language,
            )
        except ReportTranslationError as exc:
            raise HTTPException(status_code=500, detail=str(exc))

        translated_evidence = translated_result["raw_evidence"]
        translation = ReportTranslation(
            report_id=existing_analysis.id,
            language=request.language,
            content=translated_result["report_markdown"],
            population_payload=translated_evidence.get("population"),
            competitor_payload=translated_evidence.get("competitors"),
            market_price_payload=translated_evidence.get("market_price"),
            supply_chain_payload=translated_evidence.get("supply_chain"),
            transportation_payload=translated_evidence.get("transportation"),
            seasonality_payload=translated_evidence.get("seasonality"),
        )
        db.add(translation)
        await db.commit()

        return ReportResponse(
            status="success",
            analysis_id=existing_analysis.id,
            version=existing_analysis.version,
            language=language,
            report_markdown=translation.content,
            raw_evidence=translated_evidence,
        )

    # ========================================================
    # Generate report
    # ========================================================
    try:
        result = await generate_feasibility_report(
            business_name=request.business_name,
            business_type=request.business_type,
            business_description=request.business_description,
            country=request.country,
            state=request.state,
            district=request.district,
            city=request.city,
            village=request.village,
            pincode=request.pincode,
            latitude=business.latitude,
            longitude=business.longitude,
            margin_capital=request.margin_capital,
            radius_km=request.radius_km,
            language=request.language,
        )
        # result = []
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    # ========================================================
    # Get coordinates from generated population response
    # ========================================================
    latitude = result.get("analysis_latitude")
    longitude = result.get("analysis_longitude")

    if latitude is not None and longitude is not None:
        business.latitude = latitude
        business.longitude = longitude

    # ========================================================
    # Persist analysis
    # ========================================================
    try:
        analysis = await save_business_analysis(
            db=db,
            business_id=business.id,
            result=result,
            radius_km=request.radius_km,
            latitude=latitude,
            longitude=longitude,
        )
        await db.flush()  # Flush to get analysis.id before chunking

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save analysis: {str(e)}",
        )

    # ========================================================
    # Section Splitting, Chunking & Embeddings
    # ========================================================
    try:
        # Extract English markdown for embedding generation
        markdown_text = result["original_report_markdown"]
        sections = parse_report_sections(markdown_text)

        chunks_to_insert = []

        for section in sections:
            # Recursively split large sections
            text_chunks = split_text_recursively(
                section["content"], max_chars=1500, overlap=150
            )

            for chunk_idx, chunk_text in enumerate(text_chunks):
                # Prepend section context to improve vector retrieval semantic meaning
                embedding_text = (
                    f"Section {section['number']}: {section['title']}\n\n{chunk_text}"
                )

                # Execute embedding synchronously (or in threadpool if high concurrency is required)
                embedding_vector = generate_embedding(embedding_text)

                chunk_record = BusinessReportChunk(
                    business_id=business.id,
                    business_analysis_id=analysis.id,
                    version=analysis.version,
                    section_number=section["number"],
                    section_title=section["title"],
                    chunk_index=chunk_idx,
                    content=chunk_text,
                    embedding_text=embedding_text,
                    embedding=embedding_vector,
                )
                chunks_to_insert.append(chunk_record)

        if chunks_to_insert:
            db.add_all(chunks_to_insert)

        await db.commit()
        await db.refresh(analysis)

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process and store report chunks: {str(e)}",
        )

    # ========================================================
    # Response
    # ========================================================
    return ReportResponse(
        status="success",
        analysis_id=analysis.id,
        version=analysis.version,
        language=result["language"],
        report_markdown=result["report_markdown"],
        raw_evidence=result["raw_evidence"],
    )
