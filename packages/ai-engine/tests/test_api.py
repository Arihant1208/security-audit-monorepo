"""Tests for the AI engine API endpoints."""

import pytest
from fastapi.testclient import TestClient

from steve.main import app

client = TestClient(app)


class TestHealth:
    def test_health_check(self):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "version" in data


class TestBusinessInference:
    def test_infer_basic_context(self):
        response = client.post(
            "/api/v1/business/infer",
            json={
                "project_name": "my-api",
                "readme": "A payment processing API that handles credit card transactions",
                "manifest": '{"dependencies": {"stripe": "^14.0.0"}}',
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["industry"] == "finance"
        assert "pci-dss" in data["compliance_requirements"] or "pci" in str(data).lower()

    def test_infer_healthcare_context(self):
        response = client.post(
            "/api/v1/business/infer",
            json={
                "project_name": "patient-portal",
                "readme": "HIPAA-compliant patient health record management system",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["industry"] == "healthcare"
        assert data["data_sensitivity"] == "restricted"

    def test_infer_empty_input(self):
        response = client.post(
            "/api/v1/business/infer",
            json={"project_name": "unknown-project"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["industry"] == "other"

    def test_infer_invalid_request(self):
        response = client.post("/api/v1/business/infer", json={})
        assert response.status_code == 422  # Pydantic validation error


class TestArchitecture:
    def test_generate_system_context_diagram(self):
        response = client.post(
            "/api/v1/architecture/diagram",
            json={
                "diagram_type": "system-context",
                "system_name": "MyApp",
                "components": [
                    {"name": "Web App", "type": "frontend", "technology": "React"},
                    {"name": "API", "type": "backend", "technology": "Node.js"},
                    {"name": "Database", "type": "datastore", "technology": "PostgreSQL"},
                ],
                "connections": [
                    {"from": "Web App", "to": "API", "label": "REST"},
                    {"from": "API", "to": "Database", "label": "SQL"},
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "mermaid" in data or "diagram" in data


class TestLicenses:
    def test_analyze_npm_manifest(self):
        response = client.post(
            "/api/v1/licenses/analyze",
            json={
                "project_license": "MIT",
                "manifests": [
                    {
                        "type": "npm",
                        "content": '{"dependencies": {"express": "^4.18.0", "lodash": "^4.17.21"}}',
                    }
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "dependencies" in data or "licenses" in data
