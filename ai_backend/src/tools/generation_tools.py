from langchain_core.tools import tool
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.schema.business import Business, BusinessStatus
from src.schema.financial_analysis import FinancialAnalysis
from src.schema.business_analysis import BusinessAnalysis
from src.schema.report_translations import ReportTranslation
from src.schema.business_report_chunk import BusinessReportChunk
from src.schema.finance_translation import FinancialAnalysisTranslation
from src.schema.business_profile import BusinessProfile
from src.schema.business_profile_translation import BusinessProfileTranslation

from src.controllers.report_service import generate_feasibility_report
from src.controllers.business_report_persistence_service import save_business_analysis
from src.controllers.finance_service import (
    generate_financial_plan,
    generate_ai_analysis,
    create_financial_translation,
    normalize_language,
)
from src.controllers.business_profile_service import process_profile_and_recommendations

from src.services.scheme_embedding import generate_embedding
from src.utils.report_utils import parse_report_sections, split_text_recursively

import asyncio

from src.controllers.translator_service import (
    ReportTranslationError,
    translate_feasibility_report,
)
from src.utils.translator_utils import translate_entry
from src.utils.business_category_verifier import normalize_and_validate_category

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
    available_languages = set()

    for field in MULTILINGUAL_BUSINESS_FIELDS:
        value = getattr(business, field, None) or {}
        if isinstance(value, dict):
            available_languages.update(value.keys())

    for lang in sorted(available_languages):
        if lang != target_language:
            return lang

    if target_language in available_languages:
        return target_language

    return None


async def ensure_business_language(
    business: Business,
    target_language: str,
) -> None:
    all_translated = all(
        isinstance(getattr(business, field, None), dict)
        and bool(getattr(business, field).get(target_language))
        for field in MULTILINGUAL_BUSINESS_FIELDS
    )

    if all_translated:
        return

    source_language = get_available_source_language(
        business,
        target_language,
    )

    if not source_language:
        raise ValueError("No source language is available for business translation.")

    source_entry = {}

    for field in MULTILINGUAL_BUSINESS_FIELDS:
        value = getattr(business, field, None) or {}
        if isinstance(value, dict) and value.get(source_language) is not None:
            source_entry[field] = value[source_language]

    if not source_entry:
        raise ValueError("No translatable business data is available.")

    translated_entry = await asyncio.to_thread(
        translate_entry,
        entry=source_entry,
        target_language=target_language,
        source_language=source_language,
    )

    for field in MULTILINGUAL_BUSINESS_FIELDS:
        translated_value = translated_entry.get(field)

        if translated_value is None:
            continue

        current_value = getattr(business, field, None) or {}
        updated_value = dict(current_value)
        updated_value[target_language] = translated_value

        setattr(business, field, updated_value)

def get_generation_tools(db: AsyncSession, business_id: str, user_id: str) -> list:
    """
    Constructs and returns LangChain action tools for generating analytical reports.
    These tools execute the heavy AI orchestration and persist the results to the database.
    """

    @tool
    async def generate_feasibility_report_tool(
        business_name: str,
        business_type: str,
        country: str,
        state: str,
        district: str,
        margin_capital: float,
        business_description: str = None,
        city: str = None,
        village: str = None,
        pincode: str = None,
        radius_km: float = 10.0,
        language: str = "english",
        force: bool = False,
    ) -> dict:
        """
        Generates the foundational Feasibility Report for the business.

        Reuses existing reports and cached translations whenever possible.
        Generates a new version only when no existing analysis is available
        or force=True.

        Args:
            business_name: Name of the proposed business.
            business_type: Business category.
            country: Operating country.
            state: Operating state.
            district: Operating district.
            margin_capital: Available startup capital.
            business_description: Business description.
            city: Operating city.
            village: Operating village.
            pincode: Postal code.
            radius_km: Market analysis radius.
            language: Requested report language.
            force: Whether to delete existing analyses and regenerate.
        """

        try:
            # --------------------------------------------------
            # 1. Normalize requested language
            # --------------------------------------------------

            req_lang = language.strip().lower()
            lang_code = language_codes.get(req_lang)

            if not lang_code:
                return {
                    "error": f"Unsupported language: {language}. Supported languages: English, Bengali and Hindi."
                }

            # --------------------------------------------------
            # 2. Fetch business and verify ownership
            # --------------------------------------------------

            result = await db.execute(
                select(Business).where(
                    Business.id == business_id,
                    Business.owner_id == user_id,
                )
            )

            business = result.scalar_one_or_none()

            # --------------------------------------------------
            # 3. Create business if it does not exist
            # --------------------------------------------------

            if not business:
                validated_category = await normalize_and_validate_category(
                    business_name=business_name,
                    provided_category=business_type,
                    description=business_description,
                )

                business = Business(
                    id=business_id,
                    owner_id=user_id,
                    business_name={lang_code: business_name},
                    category={lang_code: validated_category},
                    margin_capital=margin_capital,
                    description={lang_code: business_description}
                    if business_description else {},
                    village={lang_code: village} if village else {},
                    district={lang_code: district},
                    city={lang_code: city} if city else {},
                    state={lang_code: state},
                    country={lang_code: country},
                    pincode=pincode,
                    status=BusinessStatus.pending,
                )

                db.add(business)
                await db.flush()

            # --------------------------------------------------
            # 4. Ensure canonical English and requested language
            # --------------------------------------------------

            await ensure_business_language(
                business=business,
                target_language="en",
            )

            if lang_code != "en":
                await ensure_business_language(
                    business=business,
                    target_language=lang_code,
                )

            # --------------------------------------------------
            # 5. Get canonical English business data
            # --------------------------------------------------

            def get_en(field):
                if isinstance(field, dict):
                    return field.get("en", "")
                return str(field or "")

            business_name = get_en(business.business_name)
            business_type = get_en(business.category)
            business_description = get_en(business.description)

            country = get_en(business.country)
            state = get_en(business.state)
            district = get_en(business.district)
            city = get_en(business.city)
            village = get_en(business.village)

            pincode = business.pincode
            margin_capital = business.margin_capital

            # --------------------------------------------------
            # 6. Delete previous analyses if force=True
            # --------------------------------------------------

            if force:
                analysis_ids_result = await db.execute(
                    select(BusinessAnalysis.id).where(
                        BusinessAnalysis.business_id == business.id
                    )
                )

                analysis_ids = analysis_ids_result.scalars().all()

                if analysis_ids:
                    await db.execute(
                        delete(ReportTranslation).where(
                            ReportTranslation.report_id.in_(analysis_ids)
                        )
                    )

                    await db.execute(
                        delete(BusinessReportChunk).where(
                            BusinessReportChunk.business_analysis_id.in_(
                                analysis_ids
                            )
                        )
                    )

                    await db.execute(
                        delete(BusinessAnalysis).where(
                            BusinessAnalysis.id.in_(analysis_ids)
                        )
                    )

                await db.flush()

            # --------------------------------------------------
            # 7. Check existing feasibility analysis
            # --------------------------------------------------

            latest_result = await db.execute(
                select(BusinessAnalysis)
                .where(
                    BusinessAnalysis.business_id == business.id
                )
                .order_by(BusinessAnalysis.version.desc())
                .limit(1)
            )

            existing_analysis = latest_result.scalar_one_or_none()

            if existing_analysis:
                original_evidence = {
                    "population": existing_analysis.population_payload,
                    "competitors": existing_analysis.competitor_payload,
                    "market_price": existing_analysis.market_price_payload,
                    "supply_chain": existing_analysis.supply_chain_payload,
                    "transportation": existing_analysis.transportation_payload,
                    "seasonality": existing_analysis.seasonality_payload,
                }

                # Return canonical English report
                if lang_code == "en":
                    return {
                        "status": "success",
                        "message": "Existing feasibility report retrieved successfully.",
                        "analysis_id": existing_analysis.id,
                        "version": existing_analysis.version,
                        "language": "english",
                        "report_markdown": existing_analysis.report_markdown,
                        "raw_evidence": original_evidence,
                        "reused_existing": True,
                    }

                # --------------------------------------------------
                # 8. Check cached translation
                # --------------------------------------------------

                translation_result = await db.execute(
                    select(ReportTranslation).where(
                        ReportTranslation.report_id == existing_analysis.id,
                        ReportTranslation.language == req_lang,
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

                    return {
                        "status": "success",
                        "message": "Existing translated feasibility report retrieved successfully.",
                        "analysis_id": existing_analysis.id,
                        "version": existing_analysis.version,
                        "language": req_lang,
                        "report_markdown": existing_translation.content or "",
                        "raw_evidence": translated_evidence,
                        "reused_existing": True,
                    }

                # --------------------------------------------------
                # 9. Generate missing translation
                # --------------------------------------------------

                try:
                    translated_result = await translate_feasibility_report(
                        report_markdown=existing_analysis.report_markdown,
                        raw_evidence=original_evidence,
                        target_language=req_lang,
                    )

                except ReportTranslationError as exc:
                    raise ValueError(
                        f"Failed to translate feasibility report: {str(exc)}"
                    )

                translated_evidence = translated_result["raw_evidence"]

                translation = ReportTranslation(
                    report_id=existing_analysis.id,
                    language=req_lang,
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

                return {
                    "status": "success",
                    "message": "Feasibility report translated and cached successfully.",
                    "analysis_id": existing_analysis.id,
                    "version": existing_analysis.version,
                    "language": req_lang,
                    "report_markdown": translation.content,
                    "raw_evidence": translated_evidence,
                    "reused_existing": True,
                }

            # --------------------------------------------------
            # 10. Generate a new feasibility report
            # --------------------------------------------------

            report_result = await generate_feasibility_report(
                business_name=business_name,
                business_type=business_type,
                business_description=business_description,
                country=country,
                state=state,
                district=district,
                city=city,
                village=village,
                pincode=pincode,
                latitude=business.latitude,
                longitude=business.longitude,
                margin_capital=margin_capital,
                radius_km=radius_km,
                language=req_lang,
            )

            # --------------------------------------------------
            # 11. Update business coordinates
            # --------------------------------------------------

            latitude = report_result.get("analysis_latitude")
            longitude = report_result.get("analysis_longitude")

            if latitude is not None and longitude is not None:
                business.latitude = latitude
                business.longitude = longitude

            # --------------------------------------------------
            # 12. Persist analysis
            # --------------------------------------------------

            analysis = await save_business_analysis(
                db=db,
                business_id=business.id,
                result=report_result,
                radius_km=radius_km,
                latitude=latitude,
                longitude=longitude,
            )

            await db.flush()

            # --------------------------------------------------
            # 13. Chunk and generate embeddings
            # --------------------------------------------------

            markdown_text = report_result["original_report_markdown"]

            sections = parse_report_sections(markdown_text)

            chunks_to_insert = []

            for section in sections:
                text_chunks = split_text_recursively(
                    section["content"],
                    max_chars=1500,
                    overlap=150,
                )

                for chunk_idx, chunk_text in enumerate(text_chunks):
                    embedding_text = (
                        f"Section {section['number']}: "
                        f"{section['title']}\n\n{chunk_text}"
                    )

                    embedding_vector = await asyncio.to_thread(
                        generate_embedding,
                        embedding_text,
                    )

                    chunks_to_insert.append(
                        BusinessReportChunk(
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
                    )

            if chunks_to_insert:
                db.add_all(chunks_to_insert)

            # --------------------------------------------------
            # 14. Commit everything
            # --------------------------------------------------

            await db.commit()
            await db.refresh(analysis)

            return {
                "status": "success",
                "message": f"Feasibility report generated ({req_lang}) and indexed successfully.",
                "analysis_id": analysis.id,
                "version": analysis.version,
                "language": req_lang,
                "report_markdown": report_result["report_markdown"],
                "raw_evidence": report_result["raw_evidence"],
                "reused_existing": False,
            }

        except Exception as e:
            await db.rollback()
            return {
                "error": f"Failed to generate feasibility report: {str(e)}"
            }

    @tool
    async def generate_financial_plan_tool(
        margin: float,
        monthly_revenue: float,
        monthly_direct_costs: float,
        monthly_fixed_costs: float,
        language: str = "en",
        force: bool = False,
    ) -> dict:
        """
        Generates the Financial Plan and AI Financial Advisory for the business.
        Call this tool ONLY AFTER the Feasibility Report exists.

        Args:
            margin: The initial margin/own capital invested (must be > 0).
            monthly_revenue: Expected monthly sales revenue.
            monthly_direct_costs: Expected monthly direct/variable costs.
            monthly_fixed_costs: Expected monthly fixed costs (rent, salaries).
            language: Target language code for translation (e.g. en, hi, bn).
            force: If True, deletes existing financial plans and generates a fresh one.
        """
        try:
            target_language = normalize_language(language)

            if force:
                analysis_ids_result = await db.execute(
                    select(FinancialAnalysis.id).where(
                        FinancialAnalysis.business_id == business_id
                    )
                )
                analysis_ids = analysis_ids_result.scalars().all()

                if analysis_ids:
                    await db.execute(
                        delete(FinancialAnalysisTranslation).where(
                            FinancialAnalysisTranslation.financial_analysis_id.in_(
                                analysis_ids
                            )
                        )
                    )
                    await db.execute(
                        delete(FinancialAnalysis).where(
                            FinancialAnalysis.id.in_(analysis_ids)
                        )
                    )
                await db.flush()

            plan_result = await generate_financial_plan(
                db=db,
                business_id=business_id,
                margin=margin,
                monthly_revenue=monthly_revenue,
                monthly_direct_costs=monthly_direct_costs,
                monthly_fixed_costs=monthly_fixed_costs,
            )

            ai_commentary = await generate_ai_analysis(plan_result)

            result = await db.execute(
                select(func.max(FinancialAnalysis.version)).where(
                    FinancialAnalysis.business_id == business_id
                )
            )
            latest_version = result.scalar() or 0
            next_version = latest_version + 1

            estimation_payload = {
                "input_validation": plan_result.get("input_validation"),
                "financial_estimation": plan_result.get("financial_estimation"),
                "used_values": plan_result.get("used_values"),
            }

            financial_analysis = FinancialAnalysis(
                business_id=business_id,
                business_analysis_id=plan_result.get("business_analysis_id"),
                version=next_version,
                input_payload={
                    "margin_capital": margin,
                    "monthly_revenue": monthly_revenue,
                    "monthly_direct_costs": monthly_direct_costs,
                    "monthly_fixed_costs": monthly_fixed_costs,
                },
                estimation_payload=estimation_payload,
                financial_plan_payload=plan_result,
                ai_analysis=ai_commentary,
            )

            db.add(financial_analysis)
            await db.flush()

            # Handle Translation immediately if required
            if target_language != "en":
                translation = await create_financial_translation(
                    db=db,
                    financial_analysis=financial_analysis,
                    language=target_language,
                )
                await db.commit()
                return {
                    "status": "success",
                    "message": f"Financial Plan and Advisory generated successfully (Translated to {target_language}).",
                    "financial_analysis_id": financial_analysis.id,
                    "translation_id": translation.id,
                    "version": financial_analysis.version,
                }

            await db.commit()
            return {
                "status": "success",
                "message": "Financial Plan and Advisory generated and saved successfully.",
                "financial_analysis_id": financial_analysis.id,
                "version": financial_analysis.version,
            }

        except Exception as e:
            await db.rollback()
            return {"error": f"Failed to generate financial plan: {str(e)}"}

    @tool
    async def generate_government_schemes_profile_tool(
        age: int = None,
        gender: str = None,
        social_category: str = None,
        ownership_type: str = None,
        annual_income: float = None,
        annual_turnover: float = None,
        investment_amount: float = None,
        business_registration: bool = None,
        farmer_status: bool = None,
        land_ownership: bool = None,
        language: str = "en",
        force: bool = False,
        limit: int = 10,
    ) -> dict:
        """
        Generates the Business Profile and recommends matched Government Schemes based on eligibility.
        Call this tool ONLY AFTER the Feasibility Report exists. Use this when the user wants
        to find out what subsidies or schemes they are eligible for.

        Args:
            age: Entrepreneur's age (18 to 100).
            gender: 'male', 'female', 'other'.
            social_category: e.g., 'general', 'obc', 'sc', 'st'.
            ownership_type: e.g., 'sole proprietorship', 'partnership'.
            annual_income: Expected/current annual income.
            annual_turnover: Expected/current annual turnover.
            investment_amount: Total project investment amount.
            business_registration: True if formally registered, False otherwise.
            farmer_status: True if the user holds farmer status.
            land_ownership: True if the user owns the business land.
            language: Target language code for translation.
            force: If True, deletes existing business profile and regenerates.
            limit: Number of top recommended schemes to retrieve.
        """
        try:
            if force:
                profile_result = await db.execute(
                    select(BusinessProfile.id).where(
                        BusinessProfile.business_id == business_id
                    )
                )
                profile_ids = profile_result.scalars().all()

                if profile_ids:
                    await db.execute(
                        delete(BusinessProfileTranslation).where(
                            BusinessProfileTranslation.business_profile_id.in_(
                                profile_ids
                            )
                        )
                    )
                    await db.execute(
                        delete(BusinessProfile).where(
                            BusinessProfile.id.in_(profile_ids)
                        )
                    )
                await db.flush()

            eligibility_data = {
                "age": age,
                "gender": gender,
                "social_category": social_category,
                "ownership_type": ownership_type,
                "annual_income": annual_income,
                "annual_turnover": annual_turnover,
                "investment_amount": investment_amount,
                "business_registration": business_registration,
                "farmer_status": farmer_status,
                "land_ownership": land_ownership,
            }
            # Remove None values
            eligibility_data = {
                k: v for k, v in eligibility_data.items() if v is not None
            }

            result = await process_profile_and_recommendations(
                db=db,
                business_id=business_id,
                eligibility_data=eligibility_data,
                target_language=language,
                limit=limit,
            )

            return {
                "status": "success",
                "message": "Business profile generated and schemes recommended successfully.",
                "analysis_id": result["analysis_id"],
                "recommended_schemes_count": len(result["original_english_schemes"]),
                "recommended_schemes": [
                    {"name": s["name"], "similarity": s.get("similarity_score")}
                    for s in result["original_english_schemes"]
                ],
            }

        except ValueError as exc:
            return {
                "error": f"Prerequisite missing: {str(exc)}. Please ensure the Feasibility Report is generated first."
            }
        except Exception as exc:
            await db.rollback()
            return {
                "error": f"Failed to generate profile and recommendations: {str(exc)}"
            }

    @tool
    async def get_analysis_pipeline_status() -> dict:
        """
        Checks the analysis progression and pipeline milestones for the current business.
        Returns whether 'feasibility_analysis', 'financial_analysis', and
        'government_schemes' stages are 'done' or 'not done'.
        """
        # 1. Check Feasibility Analysis
        stmt_feasibility = (
            select(BusinessAnalysis.id)
            .where(BusinessAnalysis.business_id == business_id)
            .limit(1)
        )
        res_feasibility = await db.execute(stmt_feasibility)
        feasibility_done = res_feasibility.scalar_one_or_none() is not None

        # 2. Check Financial Analysis
        stmt_financial = (
            select(FinancialAnalysis.id)
            .where(FinancialAnalysis.business_id == business_id)
            .limit(1)
        )
        res_financial = await db.execute(stmt_financial)
        financial_done = res_financial.scalar_one_or_none() is not None

        # 3. Check Government Schemes (checks recommended_schemes in BusinessProfile)
        stmt_profile = (
            select(BusinessProfile.recommended_schemes)
            .where(BusinessProfile.business_id == business_id)
            .limit(1)
        )
        res_profile = await db.execute(stmt_profile)
        schemes_data = res_profile.scalar_one_or_none()
        schemes_done = bool(schemes_data)

        stages = {
            "feasibility_analysis": "done" if feasibility_done else "not done",
            "financial_analysis": "done" if financial_done else "not done",
            "government_schemes": "done" if schemes_done else "not done",
        }

        # Determine highest completed pipeline stage for quick agent reasoning
        if schemes_done:
            last_completed = "government_schemes"
        elif financial_done:
            last_completed = "financial_analysis"
        elif feasibility_done:
            last_completed = "feasibility_analysis"
        else:
            last_completed = "none"

        return {
            "business_id": business_id,
            "stages": stages,
            "last_completed_stage": last_completed,
            "is_fully_completed": all(status == "done" for status in stages.values()),
        }

    return [
        generate_feasibility_report_tool,
        generate_financial_plan_tool,
        generate_government_schemes_profile_tool,
        get_analysis_pipeline_status,
    ]
