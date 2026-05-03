"""
Business Discovery — auto-infer business context from project artifacts.
"""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

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

    return ctx
