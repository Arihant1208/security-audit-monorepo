"""
Architecture analysis — static analysis + diagram generation.
"""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class DiagramRequest(BaseModel):
    diagram_type: str  # system-context, container, component, data-flow, deployment, threat-surface
    components: list[dict] = []
    connections: list[dict] = []
    trust_boundaries: list[dict] = []
    system_name: str = "System"


class DiagramResponse(BaseModel):
    diagram_type: str
    format: str = "mermaid"
    title: str
    source: str
    description: str


@router.post("/diagram")
async def generate_diagram(req: DiagramRequest) -> DiagramResponse:
    """Generate a Mermaid diagram from structured architecture data."""

    if req.diagram_type == "system-context":
        return _generate_system_context(req)
    elif req.diagram_type == "container":
        return _generate_container_diagram(req)
    elif req.diagram_type == "data-flow":
        return _generate_data_flow(req)
    elif req.diagram_type == "deployment":
        return _generate_deployment(req)
    else:
        return _generate_container_diagram(req)


def _generate_system_context(req: DiagramRequest) -> DiagramResponse:
    lines = ["graph TB"]
    lines.append(f'    SYSTEM["{req.system_name}"]')

    for comp in req.components:
        cid = comp.get("id", "unknown")
        name = comp.get("name", cid)
        ctype = comp.get("type", "service")

        if ctype in ("external-api", "auth-provider"):
            lines.append(f'    {cid}["{name}"]:::external')
        elif ctype in ("frontend", "mobile-app"):
            lines.append(f'    {cid}["{name}"]:::user')

    for conn in req.connections:
        frm = conn.get("from", "?")
        to = conn.get("to", "?")
        desc = conn.get("description", "")
        lines.append(f'    {frm} -->|"{desc}"| {to}')

    lines.append("    classDef external fill:#f96,stroke:#333")
    lines.append("    classDef user fill:#6f9,stroke:#333")

    source = "\n".join(lines)
    return DiagramResponse(
        diagram_type="system-context",
        title=f"{req.system_name} — System Context",
        source=source,
        description=f"C4 Level 1 system context diagram for {req.system_name}",
    )


def _generate_container_diagram(req: DiagramRequest) -> DiagramResponse:
    lines = ["graph TB"]

    # Group by trust boundaries
    boundary_components: dict[str, list[str]] = {}
    standalone: list[str] = []

    for tb in req.trust_boundaries:
        bid = tb.get("name", "boundary")
        boundary_components[bid] = tb.get("components", [])

    assigned = {c for comps in boundary_components.values() for c in comps}

    for comp in req.components:
        cid = comp.get("id", "unknown")
        name = comp.get("name", cid)
        ctype = comp.get("type", "service")

        shape = _get_shape(ctype, cid, name)
        if cid not in assigned:
            standalone.append(shape)

    for bname, bcomps in boundary_components.items():
        lines.append(f'    subgraph {bname.replace(" ", "_")}["{bname}"]')
        for cid in bcomps:
            comp = next((c for c in req.components if c.get("id") == cid), None)
            if comp:
                lines.append(f'        {_get_shape(comp.get("type", "service"), cid, comp.get("name", cid))}')
        lines.append("    end")

    for s in standalone:
        lines.append(f"    {s}")

    for conn in req.connections:
        frm = conn.get("from", "?")
        to = conn.get("to", "?")
        proto = conn.get("protocol", "")
        encrypted = conn.get("encrypted", False)
        style = "-->" if encrypted else "-.->|unencrypted|"
        label = f'|"{proto}"| ' if proto else ""
        lines.append(f"    {frm} {style}{label}{to}")

    source = "\n".join(lines)
    return DiagramResponse(
        diagram_type="container",
        title=f"{req.system_name} — Container Diagram",
        source=source,
        description=f"C4 Level 2 container diagram for {req.system_name}",
    )


def _generate_data_flow(req: DiagramRequest) -> DiagramResponse:
    lines = ["flowchart LR"]

    for tb in req.trust_boundaries:
        bname = tb.get("name", "boundary")
        lines.append(f'    subgraph {bname.replace(" ", "_")}["{bname}"]')
        for cid in tb.get("components", []):
            comp = next((c for c in req.components if c.get("id") == cid), None)
            if comp:
                lines.append(f'        {cid}["{comp.get("name", cid)}"]')
        lines.append("    end")

    for conn in req.connections:
        frm = conn.get("from", "?")
        to = conn.get("to", "?")
        data_flows = conn.get("dataFlows", conn.get("description", ""))
        if isinstance(data_flows, list):
            data_flows = ", ".join(data_flows)
        lines.append(f'    {frm} -->|"{data_flows}"| {to}')

    source = "\n".join(lines)
    return DiagramResponse(
        diagram_type="data-flow",
        title=f"{req.system_name} — Data Flow Diagram",
        source=source,
        description=f"Data flow diagram showing how data moves through trust boundaries in {req.system_name}",
    )


def _generate_deployment(req: DiagramRequest) -> DiagramResponse:
    lines = ["graph TB"]

    for comp in req.components:
        cid = comp.get("id", "unknown")
        name = comp.get("name", cid)
        ctype = comp.get("type", "service")
        lines.append(f"    {_get_shape(ctype, cid, name)}")

    for conn in req.connections:
        frm = conn.get("from", "?")
        to = conn.get("to", "?")
        proto = conn.get("protocol", "")
        lines.append(f'    {frm} -->|"{proto}"| {to}')

    source = "\n".join(lines)
    return DiagramResponse(
        diagram_type="deployment",
        title=f"{req.system_name} — Deployment Diagram",
        source=source,
        description=f"Deployment topology for {req.system_name}",
    )


def _get_shape(ctype: str, cid: str, name: str) -> str:
    if ctype in ("database", "cache", "storage"):
        return f'{cid}[("{name}")]'
    elif ctype in ("queue",):
        return f'{cid}[/"{name}"\\]'
    elif ctype in ("external-api", "auth-provider"):
        return f'{cid}(["{name}"])'
    else:
        return f'{cid}["{name}"]'
