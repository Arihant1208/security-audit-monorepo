"""
AI/ML Opportunity Analysis — identify where AI can improve the target system.
"""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class AnalyzeRequest(BaseModel):
    architecture: dict
    business_context: dict
    tech_stack: list[str] = []
    code_patterns: list[str] = []


class AIOpportunity(BaseModel):
    id: str
    title: str
    category: str
    component: str
    description: str
    benefits: list[str]
    implementation_approach: str
    complexity: str
    estimated_impact: str
    privacy_implications: list[str] = []
    ai_security_risks: list[str] = []
    prerequisites: list[str] = []


class RiskAssessment(BaseModel):
    opportunity_id: str
    data_privacy_risk: str
    model_security_risk: str
    ethical_concerns: list[str] = []
    cost_estimate: str
    recommendation: str
    rationale: str


class AnalyzeResponse(BaseModel):
    security_opportunities: list[AIOpportunity] = []
    general_opportunities: list[AIOpportunity] = []
    risk_assessments: list[RiskAssessment] = []
    summary: str = ""


@router.post("/analyze")
async def analyze_ai_opportunities(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyze system for AI/ML improvement opportunities.
    Uses heuristic pattern matching + optional LLM enhancement.
    """
    security_opps: list[AIOpportunity] = []
    general_opps: list[AIOpportunity] = []
    risks: list[RiskAssessment] = []

    components = req.architecture.get("components", [])
    data_sensitivity = req.business_context.get("data_sensitivity", "internal")
    industry = req.business_context.get("industry", "other")

    # ── Security AI opportunities based on architecture patterns ──────────

    # Check for auth components
    has_auth = any(
        c.get("type") in ("auth-provider",) or "auth" in c.get("name", "").lower()
        for c in components
    )
    if has_auth:
        opp = AIOpportunity(
            id="AI-SEC-001",
            title="Authentication Anomaly Detection",
            category="anomaly-detection",
            component="authentication",
            description="Deploy ML-based anomaly detection on login patterns to identify credential stuffing, brute force, and account takeover attempts in real-time.",
            benefits=[
                "Detect sophisticated attacks that bypass rate limiting",
                "Reduce false positives compared to static rules",
                "Adapt to evolving attack patterns automatically",
            ],
            implementation_approach="Collect login telemetry (IP, user agent, timing, geo), train anomaly model, deploy as scoring service before auth decision.",
            complexity="medium",
            estimated_impact="high",
            privacy_implications=["Requires storing login metadata", "IP geolocation involves personal data"],
            ai_security_risks=["Model evasion by sophisticated attackers", "Training data poisoning"],
            prerequisites=["Login telemetry pipeline", "Baseline normal behavior data (2-4 weeks)"],
        )
        security_opps.append(opp)
        risks.append(RiskAssessment(
            opportunity_id="AI-SEC-001",
            data_privacy_risk="medium" if data_sensitivity in ("confidential", "restricted") else "low",
            model_security_risk="medium",
            ethical_concerns=["Potential for biased blocking based on geography"],
            cost_estimate="medium",
            recommendation="proceed-with-caution",
            rationale="High security value but requires careful privacy controls for login metadata.",
        ))

    # Check for API components
    has_api = any(
        c.get("type") in ("api-gateway", "web-server") or "api" in c.get("name", "").lower()
        for c in components
    )
    if has_api:
        opp = AIOpportunity(
            id="AI-SEC-002",
            title="Intelligent API Threat Detection",
            category="threat-detection",
            component="api-gateway",
            description="AI-powered WAF/rate limiting that learns normal API usage patterns and detects abuse, injection attempts, and data exfiltration.",
            benefits=[
                "Context-aware threat detection beyond pattern matching",
                "Dynamic rate limiting based on behavior, not just IP",
                "Detect low-and-slow attacks that evade static rules",
            ],
            implementation_approach="Instrument API gateway with request telemetry, train behavior model per endpoint, deploy as middleware.",
            complexity="high",
            estimated_impact="high",
            prerequisites=["API request logging", "Traffic baseline data"],
        )
        security_opps.append(opp)

    # Check for logging/monitoring
    has_logs = any(
        "log" in c.get("name", "").lower() or "monitor" in c.get("name", "").lower()
        for c in components
    )
    if has_logs or len(components) > 3:
        security_opps.append(AIOpportunity(
            id="AI-SEC-003",
            title="AI-Powered Log Analysis & Alerting",
            category="security-monitoring",
            component="monitoring",
            description="Use NLP and anomaly detection to analyze application logs for security events, reducing alert fatigue and surfacing real threats.",
            benefits=["Reduce false positive alerts by 60-80%", "Detect novel attack patterns", "Correlate events across services"],
            implementation_approach="Stream logs to analysis pipeline, use LLM for classification and NLP for pattern extraction.",
            complexity="medium",
            estimated_impact="medium",
            prerequisites=["Centralized logging", "Structured log format"],
        ))

    # ── General AI opportunities ─────────────────────────────────────────

    # Check for data-heavy components
    has_database = any(c.get("type") in ("database", "storage") for c in components)
    if has_database:
        general_opps.append(AIOpportunity(
            id="AI-GEN-001",
            title="Predictive Analytics Pipeline",
            category="predictive",
            component="database",
            description="Leverage stored data for predictive analytics: user behavior forecasting, resource demand prediction, and proactive capacity planning.",
            benefits=["Proactive scaling reduces downtime", "Data-driven business decisions", "Improved resource utilization"],
            implementation_approach="Extract features from database, train prediction models, expose via API.",
            complexity="high",
            estimated_impact="medium",
            prerequisites=["Sufficient historical data", "Data pipeline infrastructure"],
        ))

    # Check tech stack for automation opportunities
    stack_lower = [t.lower() for t in req.tech_stack]
    if any(t in stack_lower for t in ["typescript", "javascript", "python", "java"]):
        general_opps.append(AIOpportunity(
            id="AI-GEN-002",
            title="Automated Code Review & Test Generation",
            category="automation",
            component="development-workflow",
            description="Integrate AI-powered code review for security-sensitive changes and auto-generate test cases for critical paths.",
            benefits=["Catch security issues before merge", "Increase test coverage for edge cases", "Accelerate development velocity"],
            implementation_approach="Integrate LLM-based review in CI/CD pipeline, generate tests from code analysis.",
            complexity="medium",
            estimated_impact="medium",
            prerequisites=["CI/CD pipeline", "Code repository access"],
        ))

    summary_parts = [
        f"Identified {len(security_opps)} security AI opportunities and {len(general_opps)} general AI opportunities.",
    ]
    if security_opps:
        summary_parts.append(f"Top security opportunity: {security_opps[0].title}.")
    if general_opps:
        summary_parts.append(f"Top general opportunity: {general_opps[0].title}.")

    return AnalyzeResponse(
        security_opportunities=security_opps,
        general_opportunities=general_opps,
        risk_assessments=risks,
        summary=" ".join(summary_parts),
    )
