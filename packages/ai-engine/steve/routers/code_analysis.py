"""
Code Analysis — LLM-powered security code review.

Provides deep code analysis capabilities:
- Vulnerability detection in code snippets
- Security pattern analysis
- Fix recommendations with code examples
"""

from __future__ import annotations

import logging
from fastapi import APIRouter
from pydantic import BaseModel

from ..llm import is_llm_available, complete_json, complete

logger = logging.getLogger(__name__)
router = APIRouter()


class AnalyzeCodeRequest(BaseModel):
    code: str
    language: str
    context: str | None = None  # e.g., "authentication handler", "API endpoint"
    filename: str | None = None


class Vulnerability(BaseModel):
    id: str
    title: str
    severity: str  # critical, high, medium, low, informational
    line_range: str | None = None
    description: str
    impact: str
    fix: str
    cwe: str | None = None


class AnalyzeCodeResponse(BaseModel):
    vulnerabilities: list[Vulnerability] = []
    summary: str = ""
    risk_level: str = "unknown"
    llm_powered: bool = False


class FixRequest(BaseModel):
    code: str
    language: str
    vulnerability: str  # Description of the vulnerability to fix
    context: str | None = None


class FixResponse(BaseModel):
    fixed_code: str
    explanation: str
    changes_made: list[str] = []
    llm_powered: bool = False


@router.post("/analyze", response_model=AnalyzeCodeResponse)
async def analyze_code(req: AnalyzeCodeRequest) -> AnalyzeCodeResponse:
    """
    Analyze a code snippet for security vulnerabilities.
    Uses LLM when available, falls back to pattern matching.
    """
    if not is_llm_available():
        return AnalyzeCodeResponse(
            summary="LLM not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY for AI-powered analysis.",
            risk_level="unknown",
            llm_powered=False,
        )

    system_prompt = """You are an expert security code reviewer. Analyze the provided code for security vulnerabilities.

For each vulnerability found, provide:
- id: Sequential ID like "V-001"
- title: Brief vulnerability title
- severity: One of "critical", "high", "medium", "low", "informational"
- line_range: Approximate line numbers (e.g., "5-10") or null
- description: What the vulnerability is
- impact: What an attacker could do
- fix: Specific code-level fix recommendation
- cwe: CWE ID if applicable (e.g., "CWE-89")

Return JSON with:
- vulnerabilities: Array of findings
- summary: One-sentence summary of overall security posture
- risk_level: One of "critical", "high", "medium", "low", "minimal"

Be precise. Only report real vulnerabilities with clear evidence in the code.
Do NOT report theoretical issues that don't apply to this specific code."""

    context_info = ""
    if req.context:
        context_info = f"\nContext: {req.context}"
    if req.filename:
        context_info += f"\nFilename: {req.filename}"

    user_prompt = f"Language: {req.language}{context_info}\n\nCode:\n```{req.language}\n{req.code}\n```"

    try:
        result = await complete_json(system_prompt, user_prompt)
        return AnalyzeCodeResponse(
            vulnerabilities=[Vulnerability(**v) for v in result.get("vulnerabilities", [])],
            summary=result.get("summary", ""),
            risk_level=result.get("risk_level", "unknown"),
            llm_powered=True,
        )
    except Exception as e:
        logger.error(f"Code analysis failed: {e}")
        return AnalyzeCodeResponse(
            summary=f"Analysis error: {str(e)}",
            risk_level="unknown",
            llm_powered=False,
        )


@router.post("/fix", response_model=FixResponse)
async def suggest_fix(req: FixRequest) -> FixResponse:
    """
    Generate a security fix for vulnerable code.
    """
    if not is_llm_available():
        return FixResponse(
            fixed_code=req.code,
            explanation="LLM not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.",
            llm_powered=False,
        )

    system_prompt = """You are a security engineer fixing vulnerable code. Given the original code and vulnerability description:

1. Produce the FIXED version of the code (complete, not just the diff)
2. Explain what you changed and why
3. List all specific changes made

The fix should:
- Be minimal (change only what's needed for security)
- Preserve existing functionality
- Follow the language's best practices
- Include necessary imports if new ones are needed

Return JSON with:
- fixed_code: The complete fixed code
- explanation: Why these changes fix the vulnerability
- changes_made: Array of strings describing each change"""

    user_prompt = f"""Language: {req.language}
Vulnerability: {req.vulnerability}
{f"Context: {req.context}" if req.context else ""}

Original code:
```{req.language}
{req.code}
```"""

    try:
        result = await complete_json(system_prompt, user_prompt)
        return FixResponse(
            fixed_code=result.get("fixed_code", req.code),
            explanation=result.get("explanation", ""),
            changes_made=result.get("changes_made", []),
            llm_powered=True,
        )
    except Exception as e:
        logger.error(f"Fix generation failed: {e}")
        return FixResponse(
            fixed_code=req.code,
            explanation=f"Fix generation error: {str(e)}",
            llm_powered=False,
        )
