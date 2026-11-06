from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import (
    # population,
    # competitor,
    # market_price,
    # supply_chain,
    # logistics,
    # advisory,
    # report_translation,
    report,
    business_profile,
    finance_routes,
    getter_routes,
    assistant,
    chatbot,
)
from src.schema.knowledge_base_chunk import KnowledgeBaseChunk
from src.config.database import engine, Base, AsyncSessionLocal
from src.services.knowledge_base_service import sync_knowledge_base_pipeline
from sqlalchemy import select, func
from contextlib import asynccontextmanager

from src.config.langgraph import init_langgraph, close_langgraph


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Tables before create:", Base.metadata.tables.keys())

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Tables after create:", Base.metadata.tables.keys())
    
    # Auto-seed knowledge base if table is empty
    try:
        async with AsyncSessionLocal() as session:
            count = (await session.execute(select(func.count(KnowledgeBaseChunk.id)))).scalar() or 0
            if count == 0:
                print("[KnowledgeBase] knowledge_base_chunks table empty. Initializing sync...")
                # await sync_knowledge_base_pipeline(session)
                # cant be done here cause render deployment fails as startup time ram is not available much 
    except Exception as e:
        print(f"[KnowledgeBase] Warning during knowledge base check/sync: {e}")

    await init_langgraph()
    yield
    await close_langgraph()


app = FastAPI(
    title="Rural Business Intelligence API",
    description="FastAPI backend for hyper-local micro-enterprise feasibility analysis.",
    version="1.0.0",
    lifespan=lifespan,  # MUST be here
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Individual Module Routes
# app.include_router(
#     population.router, prefix="/api/v1/population", tags=["Population"]
# )
# app.include_router(
#     competitor.router, prefix="/api/v1/competitors", tags=["Competitors"]
# )
# app.include_router(
#     market_price.router, prefix="/api/v1/market-price", tags=["Market Price"]
# )
# app.include_router(
#     supply_chain.router, prefix="/api/v1/supply-chain", tags=["Supply Chain"]
# )
# app.include_router(
#     logistics.router, prefix="/api/v1/logistics", tags=["Logistics & Freight"]
# )
# app.include_router(
#     advisory.router, prefix="/api/v1/advisory", tags=["Seasonal Advisory & Risks"]
# )
# app.include_router(
#     report_translation.router,prefix="/api/v1/translation",tags=["Report Translation"]
# )


# The Master Orchestrator Route
app.include_router(
    report.router, prefix="/api/v1/report", tags=["Master Report Generation"]
)

# The Government Schemes route
app.include_router(
    business_profile.router,
    prefix="/api/v1/government-schemes",
    tags=["Government Schemes"],
)

# Fiantial planner route
app.include_router(
    finance_routes.router,
    prefix="/api/v1/finance",
    tags=["Finance planning"],
)

# Business chat agent
app.include_router(assistant.router, prefix="/api/v1/assistant", tags=["Assistant"])

# getter routes
app.include_router(
    getter_routes.router,
    prefix="/api/v1",
    tags=["Business Data Getters"],
)

# chatbot routes
app.include_router(chatbot.router, prefix="/api/v1/chat", tags=["Onboarding Assistant"])


# Server test route
@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Rural Business Intelligence API. Visit /docs for the Swagger UI."
    }
