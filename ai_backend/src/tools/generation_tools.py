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
        Call this tool when the user provides the required business and location details
        and explicitly wants to create or regenerate their Feasibility Analysis.

        Args:
            business_name: The name of the proposed business.
            business_type: The category or industry (e.g., 'Poultry Farm').
            country: The operating country.
            state: The operating state.
            district: The operating district.
            margin_capital: The available startup capital in local currency (must be > 0).
            business_description: Optional detailed description of the business.
            city: Optional operating city.
            village: Optional operating village.
            pincode: Optional postal code.
            radius_km: The market analysis radius (defaults to 10.0).
            language: Target language for the report generation (default 'english').
            force: If True, deletes existing report and generates a fresh one.
        """
        try:
            req_lang = language.strip().lower()
            lang_code = language_codes.get(req_lang, "en")

            # 1. Fetch or Create the Business Record
            result = await db.execute(
                select(Business).where(
                    Business.id == business_id,
                    Business.owner_id == user_id,
                )
            )
            business = result.scalar_one_or_none()

            if not business:
                # Store multilingual data using the correct JSONB key structure based on target lang code
                business = Business(
                    id=business_id,
                    owner_id=user_id,
                    business_name={lang_code: business_name},
                    category={lang_code: business_type},
                    margin_capital=margin_capital,
                    description={lang_code: business_description}
                    if business_description
                    else {},
                    village={lang_code: village} if village else {},
                    district={lang_code: district},
                    city={lang_code: city} if city else {},
                    state={lang_code: state},
                    country={lang_code: country},
                    pincode=pincode,
                    latitude=0.0,
                    longitude=0.0,
                    status=BusinessStatus.pending,
                )
                db.add(business)
                await db.flush()

            if force:
                analysis_ids_result = await db.execute(
                    select(BusinessAnalysis.id).where(
                        BusinessAnalysis.business_id == business_id
                    )
                )
                analysis_ids = analysis_ids_result.scalars().all()

                if analysis_ids:
                    # Cascade delete translations, chunks, then analyses
                    await db.execute(
                        delete(ReportTranslation).where(
                            ReportTranslation.report_id.in_(analysis_ids)
                        )
                    )
                    await db.execute(
                        delete(BusinessReportChunk).where(
                            BusinessReportChunk.business_analysis_id.in_(analysis_ids)
                        )
                    )
                    await db.execute(
                        delete(BusinessAnalysis).where(
                            BusinessAnalysis.id.in_(analysis_ids)
                        )
                    )
                await db.flush()

            # 2. Run the Orchestrator Pipeline
            report_result = generate_feasibility_report(
                business_name=business_name,
                business_type=business_type,
                business_description=business_description,
                country=country,
                state=state,
                district=district,
                city=city,
                village=village,
                pincode=pincode,
                margin_capital=margin_capital,
                radius_km=radius_km,
                language=req_lang,
            )

            # 3. Update Coordinates based on Demographic Resolution
            latitude = report_result.get("analysis_latitude")
            longitude = report_result.get("analysis_longitude")

            if latitude is not None and longitude is not None:
                business.latitude = latitude
                business.longitude = longitude

            # 4. Save Analysis to Database
            analysis = await save_business_analysis(
                db=db,
                business_id=business.id,
                result=report_result,
                radius_km=radius_km,
                latitude=latitude,
                longitude=longitude,
            )
            await db.flush()

            # 5. Chunk and Vectorize the Report for RAG
            # Always embed the canonical English text for consistency in vector searching
            markdown_text = report_result.get(
                "original_report_markdown", report_result.get("report_markdown")
            )
            sections = parse_report_sections(markdown_text)

            chunks_to_insert = []
            for section in sections:
                text_chunks = split_text_recursively(
                    section["content"], max_chars=1500, overlap=150
                )
                for chunk_idx, chunk_text in enumerate(text_chunks):
                    embedding_text = f"Section {section['number']}: {section['title']}\n\n{chunk_text}"
                    embedding_vector = generate_embedding(embedding_text)

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

            await db.commit()

            return {
                "status": "success",
                "message": f"Feasibility Report generated ({language}) and indexed successfully.",
                "analysis_id": analysis.id,
                "version": analysis.version,
            }

        except Exception as e:
            await db.rollback()
            return {"error": f"Failed to generate feasibility report: {str(e)}"}

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
