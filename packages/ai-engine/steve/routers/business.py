"""
Business Discovery — auto-infer business context from project artifacts.
"""

from __future__ import annotations

import logging
from fastapi import APIRouter
from pydantic import BaseModel

from ..llm import is_llm_available, complete_json

logger = logging.getLogger(__name__)
router = APIRouter()


class InferRequest(BaseModel):
    project_name: str
    readme: str | None = None
    manifest: str | None = None
    config_files: dict[str, str] | None = None
    file_tree: list[str] | None = None


class BusinessContext(BaseModel):
    description: str = ""
    industry: str = "other"
    user_types: list[str] = []
    revenue_model: str | None = None
    data_types: list[str] = []
    data_sensitivity: str = "internal"
    compliance_requirements: list[str] = []
    risk_tolerance: str = "moderate"
    scale: str | None = None
    critical_functions: list[str] = []
    confidence: dict[str, float] = {}


@router.post("/infer")
async def infer_business_context(req: InferRequest) -> BusinessContext:
    """
    Analyze project artifacts and infer business context.
    Uses heuristic rules + optional LLM enhancement.
    """
    ctx = BusinessContext()
    ctx.description = f"Analysis of {req.project_name}"

    # ── Heuristic: detect industry signals from dependencies & config ─────
    signals: list[str] = []
    if req.readme:
        signals.append(req.readme.lower())
    if req.manifest:
        signals.append(req.manifest.lower())

    combined = " ".join(signals)

    # Industry detection
    if any(w in combined for w in ["hipaa", "health", "patient", "ehr", "medical"]):
        ctx.industry = "healthcare"
        ctx.compliance_requirements.append("hipaa")
        ctx.data_sensitivity = "restricted"
        ctx.confidence["industry"] = 0.8
    elif any(w in combined for w in ["pci", "payment", "stripe", "financial", "banking", "fintech"]):
        ctx.industry = "finance"
        ctx.compliance_requirements.append("pci-dss")
        ctx.data_sensitivity = "confidential"
        ctx.confidence["industry"] = 0.7
    elif any(w in combined for w in ["gdpr", "eu", "european", "cookie", "consent"]):
        ctx.compliance_requirements.append("gdpr")
        ctx.confidence["complianceRequirements"] = 0.7
    elif any(w in combined for w in ["saas", "subscription", "tenant", "multi-tenant"]):
        ctx.industry = "saas"
        ctx.confidence["industry"] = 0.6

    # Data types
    if any(w in combined for w in ["email", "user", "profile", "name", "address"]):
        ctx.data_types.append("PII")
    if any(w in combined for w in ["password", "secret", "token", "api_key", "credential"]):
        ctx.data_types.append("credentials")
    if any(w in combined for w in ["credit card", "payment", "billing", "invoice"]):
        ctx.data_types.append("financial")

    # Scale hints
    if any(w in combined for w in ["kubernetes", "k8s", "autoscal", "load balanc"]):
        ctx.scale = "large (container orchestration detected)"
    elif any(w in combined for w in ["serverless", "lambda", "cloud function"]):
        ctx.scale = "variable (serverless architecture)"

    # Tech stack detection for risk assessment
    if any(w in combined for w in ["react", "next", "angular", "vue", "frontend"]):
        ctx.critical_functions.append("frontend application")
    if any(w in combined for w in ["auth", "login", "jwt", "oauth", "session"]):
        ctx.critical_functions.append("user authentication")
    if any(w in combined for w in ["database", "postgres", "mysql", "mongo", "redis"]):
        ctx.critical_functions.append("data persistence")

    # ── LLM Enhancement: if available, use AI for deeper analysis ─────────
    if is_llm_available() and (req.readme or req.manifest):
        try:
            ctx = await _llm_enhance_context(req, ctx)
        except Exception as e:
            logger.warning(f"LLM enhancement failed, using heuristic results: {e}")

    return ctx


async def _llm_enhance_context(req: InferRequest, heuristic_ctx: BusinessContext) -> BusinessContext:
    """Use LLM to enhance heuristic business context inference."""
    artifacts = []
    if req.readme:
        artifacts.append(f"README:\n{req.readme[:3000]}")
    if req.manifest:
        artifacts.append(f"MANIFEST:\n{req.manifest[:2000]}")
    if req.config_files:
        for name, content in list(req.config_files.items())[:5]:
            artifacts.append(f"CONFIG ({name}):\n{content[:500]}")

    system_prompt = """You are a security auditor analyzing a software project. 
Based on the project artifacts, infer the business context. Return a JSON object with:
- description: Brief description of what this project does (1-2 sentences)
- industry: One of: healthcare, finance, saas, ecommerce, education, government, media, gaming, iot, other
- user_types: List of user types (e.g., "end-users", "admins", "api-consumers")
- revenue_model: How it makes money (e.g., "subscription", "transaction-fees", "advertising", null)
- data_types: List of data types handled (e.g., "PII", "credentials", "financial", "health-records", "public")
- data_sensitivity: One of: public, internal, confidential, restricted
- compliance_requirements: List of applicable frameworks (e.g., "hipaa", "pci-dss", "gdpr", "soc2", "ccpa")
- risk_tolerance: One of: low, moderate, high
- scale: Description of expected scale
- critical_functions: List of business-critical functions

Return ONLY valid JSON, no explanation."""

    user_prompt = f"Project: {req.project_name}\n\n" + "\n\n".join(artifacts)

    result = await complete_json(system_prompt, user_prompt)

    # Merge LLM results with heuristic (LLM wins on conflicts, but keep high-confidence heuristics)
    return BusinessContext(
        description=result.get("description", heuristic_ctx.description),
        industry=result.get("industry", heuristic_ctx.industry),
        user_types=result.get("user_types", heuristic_ctx.user_types),
        revenue_model=result.get("revenue_model", heuristic_ctx.revenue_model),
        data_types=list(set(result.get("data_types", []) + heuristic_ctx.data_types)),
        data_sensitivity=result.get("data_sensitivity", heuristic_ctx.data_sensitivity),
        compliance_requirements=list(
            set(result.get("compliance_requirements", []) + heuristic_ctx.compliance_requirements)
        ),
        risk_tolerance=result.get("risk_tolerance", heuristic_ctx.risk_tolerance),
        scale=result.get("scale", heuristic_ctx.scale),
        critical_functions=list(
            set(result.get("critical_functions", []) + heuristic_ctx.critical_functions)
        ),
        confidence={k: 0.9 for k in result.keys()},  # LLM results get higher confidence
    )
