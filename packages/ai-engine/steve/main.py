"""
Steve AI Engine — FastAPI service for code intelligence, LLM integration,
architecture analysis, license scanning, and AI opportunity identification.

Communicates with the TypeScript orchestrator via HTTP.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import business, architecture, licenses, ai_opportunities, health

app = FastAPI(
    title="Steve AI Engine",
    version="2.0.0",
    description="Python backend for code analysis, LLM integration, and diagram generation",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(business.router, prefix="/api/v1/business", tags=["Business Discovery"])
app.include_router(architecture.router, prefix="/api/v1/architecture", tags=["Architecture"])
app.include_router(licenses.router, prefix="/api/v1/licenses", tags=["License Compliance"])
app.include_router(ai_opportunities.router, prefix="/api/v1/ai", tags=["AI Opportunities"])
