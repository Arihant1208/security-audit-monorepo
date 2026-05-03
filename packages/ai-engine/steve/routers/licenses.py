"""
License compliance — dependency scanning and license analysis.
"""

from __future__ import annotations

import json
import re

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

LICENSE_CATEGORIES = {
    "MIT": "permissive",
    "ISC": "permissive",
    "BSD-2-Clause": "permissive",
    "BSD-3-Clause": "permissive",
    "Apache-2.0": "permissive",
    "Unlicense": "public-domain",
    "CC0-1.0": "public-domain",
    "0BSD": "public-domain",
    "LGPL-2.1": "weak-copyleft",
    "LGPL-3.0": "weak-copyleft",
    "MPL-2.0": "weak-copyleft",
    "EPL-2.0": "weak-copyleft",
    "GPL-2.0": "strong-copyleft",
    "GPL-3.0": "strong-copyleft",
    "AGPL-3.0": "strong-copyleft",
}

CATEGORY_RISK = {
    "permissive": "none",
    "public-domain": "none",
    "weak-copyleft": "medium",
    "strong-copyleft": "high",
    "proprietary": "medium",
    "unknown": "critical",
}


class ScanRequest(BaseModel):
    manifest_content: str
    manifest_type: str  # npm, cargo, pip, go, maven, gem
    project_license: str = "proprietary"
    lock_file_content: str | None = None


class DependencyInfo(BaseModel):
    name: str
    version: str
    license: str
    license_category: str
    risk: str
    is_direct: bool = True


class LicenseConflict(BaseModel):
    dependency: str
    dependency_license: str
    project_license: str
    conflict: str
    risk: str
    recommendation: str
    alternatives: list[dict] = []


class ScanResult(BaseModel):
    project_license: str
    total_dependencies: int = 0
    direct_dependencies: int = 0
    dependencies: list[DependencyInfo] = []
    conflicts: list[LicenseConflict] = []
    summary: dict = {}


@router.post("/scan")
async def scan_licenses(req: ScanRequest) -> ScanResult:
    """Scan a package manifest for license information."""
    deps: list[DependencyInfo] = []

    if req.manifest_type == "npm":
        deps = _parse_npm(req.manifest_content)
    elif req.manifest_type == "pip":
        deps = _parse_pip(req.manifest_content)
    elif req.manifest_type == "cargo":
        deps = _parse_cargo(req.manifest_content)
    else:
        deps = _parse_generic(req.manifest_content)

    # Detect conflicts
    conflicts: list[LicenseConflict] = []
    project_is_proprietary = req.project_license.lower() in ("proprietary", "unlicensed", "")

    for dep in deps:
        if dep.license_category == "strong-copyleft" and project_is_proprietary:
            conflicts.append(LicenseConflict(
                dependency=dep.name,
                dependency_license=dep.license,
                project_license=req.project_license,
                conflict=f"{dep.license} is strong copyleft — may require you to open-source your project",
                risk="high",
                recommendation=f"Replace {dep.name} with a permissively-licensed alternative, or isolate via subprocess/API boundary",
            ))
        elif dep.license_category == "unknown":
            conflicts.append(LicenseConflict(
                dependency=dep.name,
                dependency_license="UNKNOWN",
                project_license=req.project_license,
                conflict="No license detected — all rights reserved by default",
                risk="critical",
                recommendation=f"Investigate {dep.name}'s actual license, contact the author, or replace",
            ))

    # Summary
    by_category: dict[str, int] = {}
    by_risk: dict[str, int] = {}
    for dep in deps:
        by_category[dep.license_category] = by_category.get(dep.license_category, 0) + 1
        by_risk[dep.risk] = by_risk.get(dep.risk, 0) + 1

    return ScanResult(
        project_license=req.project_license,
        total_dependencies=len(deps),
        direct_dependencies=sum(1 for d in deps if d.is_direct),
        dependencies=deps,
        conflicts=conflicts,
        summary={
            "by_category": by_category,
            "by_risk": by_risk,
            "compliant": len(conflicts) == 0,
            "top_issues": [c.conflict for c in conflicts[:5]],
        },
    )


def _classify(license_str: str) -> tuple[str, str]:
    """Classify a license string into category and risk."""
    normalized = license_str.strip()
    # Try exact match
    category = LICENSE_CATEGORIES.get(normalized)
    if category:
        return category, CATEGORY_RISK.get(category, "medium")

    # Try partial match
    upper = normalized.upper()
    if "MIT" in upper:
        return "permissive", "none"
    if "APACHE" in upper:
        return "permissive", "none"
    if "BSD" in upper:
        return "permissive", "none"
    if "ISC" in upper:
        return "permissive", "none"
    if "AGPL" in upper:
        return "strong-copyleft", "high"
    if "GPL" in upper and "LGPL" not in upper:
        return "strong-copyleft", "high"
    if "LGPL" in upper:
        return "weak-copyleft", "medium"
    if "MPL" in upper:
        return "weak-copyleft", "medium"

    return "unknown", "critical"


def _parse_npm(content: str) -> list[DependencyInfo]:
    """Parse npm package.json for dependencies."""
    deps: list[DependencyInfo] = []
    try:
        pkg = json.loads(content)
    except json.JSONDecodeError:
        return deps

    for section in ("dependencies", "devDependencies"):
        for name, version in (pkg.get(section) or {}).items():
            # We can't determine license from package.json alone
            # In production, Steve would call the npm registry API
            cat, risk = "unknown", "medium"
            deps.append(DependencyInfo(
                name=name,
                version=str(version).lstrip("^~>=<"),
                license="UNKNOWN (requires registry lookup)",
                license_category=cat,
                risk=risk,
                is_direct=True,
            ))
    return deps


def _parse_pip(content: str) -> list[DependencyInfo]:
    """Parse requirements.txt."""
    deps: list[DependencyInfo] = []
    for line in content.strip().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("-"):
            continue
        match = re.match(r"^([a-zA-Z0-9_-]+)(?:[>=<~!]+(.+))?", line)
        if match:
            name = match.group(1)
            version = match.group(2) or "latest"
            cat, risk = "unknown", "medium"
            deps.append(DependencyInfo(
                name=name, version=version,
                license="UNKNOWN (requires PyPI lookup)",
                license_category=cat, risk=risk, is_direct=True,
            ))
    return deps


def _parse_cargo(content: str) -> list[DependencyInfo]:
    """Parse Cargo.toml dependencies section."""
    deps: list[DependencyInfo] = []
    in_deps = False
    for line in content.splitlines():
        stripped = line.strip()
        if stripped in ("[dependencies]", "[dev-dependencies]"):
            in_deps = True
            continue
        if stripped.startswith("[") and in_deps:
            in_deps = False
            continue
        if in_deps and "=" in stripped:
            parts = stripped.split("=", 1)
            name = parts[0].strip()
            version = parts[1].strip().strip('"').strip("'")
            cat, risk = "unknown", "medium"
            deps.append(DependencyInfo(
                name=name, version=version,
                license="UNKNOWN (requires crates.io lookup)",
                license_category=cat, risk=risk, is_direct=True,
            ))
    return deps


def _parse_generic(content: str) -> list[DependencyInfo]:
    """Fallback parser."""
    return []
