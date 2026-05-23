"""
LLM Integration — Direct SDK calls to OpenAI and Anthropic.

No LangChain. Just clean, straightforward API calls with structured output.
Supports graceful fallback to heuristic-only mode when no API key is configured.
"""

from __future__ import annotations

import os
import json
import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

# ── Configuration ──────────────────────────────────────────────────────────────

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # "openai" or "anthropic"
LLM_MODEL = os.getenv("LLM_MODEL")  # e.g. "gpt-4o", "claude-sonnet-4-20250514"

# Defaults per provider
DEFAULT_MODELS = {
    "openai": "gpt-4o",
    "anthropic": "claude-sonnet-4-20250514",
}


def is_llm_available() -> bool:
    """Check if an LLM provider is configured."""
    if LLM_PROVIDER == "openai" and OPENAI_API_KEY:
        return True
    if LLM_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        return True
    return False


def get_model() -> str:
    """Get the configured model name."""
    return LLM_MODEL or DEFAULT_MODELS.get(LLM_PROVIDER, "gpt-4o")


# ── OpenAI ─────────────────────────────────────────────────────────────────────

async def call_openai(
    system_prompt: str,
    user_prompt: str,
    *,
    temperature: float = 0.2,
    max_tokens: int = 4096,
    json_mode: bool = False,
) -> str:
    """Call OpenAI Chat Completions API directly."""
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY not configured")

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload: dict[str, Any] = {
        "model": get_model(),
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


# ── Anthropic ──────────────────────────────────────────────────────────────────

async def call_anthropic(
    system_prompt: str,
    user_prompt: str,
    *,
    temperature: float = 0.2,
    max_tokens: int = 4096,
) -> str:
    """Call Anthropic Messages API directly."""
    if not ANTHROPIC_API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
    }

    payload = {
        "model": get_model(),
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        return data["content"][0]["text"]


# ── Unified Interface ──────────────────────────────────────────────────────────

async def complete(
    system_prompt: str,
    user_prompt: str,
    *,
    temperature: float = 0.2,
    max_tokens: int = 4096,
    json_mode: bool = False,
) -> str:
    """
    Call the configured LLM provider.
    Raises RuntimeError if no provider is configured.
    """
    if LLM_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        return await call_anthropic(
            system_prompt, user_prompt,
            temperature=temperature, max_tokens=max_tokens,
        )
    elif OPENAI_API_KEY:
        return await call_openai(
            system_prompt, user_prompt,
            temperature=temperature, max_tokens=max_tokens,
            json_mode=json_mode,
        )
    else:
        raise RuntimeError("No LLM provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.")


async def complete_json(
    system_prompt: str,
    user_prompt: str,
    *,
    temperature: float = 0.1,
) -> dict[str, Any]:
    """
    Call LLM and parse the response as JSON.
    Falls back to extracting JSON from markdown code blocks if needed.
    """
    raw = await complete(
        system_prompt, user_prompt,
        temperature=temperature,
        json_mode=(LLM_PROVIDER == "openai"),
    )

    # Try direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Try extracting from ```json ... ``` code block
    if "```json" in raw:
        start = raw.index("```json") + 7
        end = raw.index("```", start)
        return json.loads(raw[start:end].strip())

    # Try extracting from ``` ... ```
    if "```" in raw:
        start = raw.index("```") + 3
        end = raw.index("```", start)
        return json.loads(raw[start:end].strip())

    raise ValueError(f"Could not parse LLM response as JSON: {raw[:200]}")
