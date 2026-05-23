# AI Engine & LLM Integration

The AI engine (`packages/ai-engine`) is a Python FastAPI service that provides code analysis, architecture diagram generation, license scanning, and AI opportunity detection. It now supports direct LLM calls for deep code analysis.

---

## Architecture

```
Orchestrator (Node.js)
    │
    │ HTTP calls to AI_ENGINE_URL (default: http://localhost:8100)
    ▼
AI Engine (Python FastAPI)
    ├── /api/v1/business/infer     → LLM-enhanced business context
    ├── /api/v1/architecture/diagram → Mermaid diagram generation
    ├── /api/v1/licenses/analyze   → Dependency license detection
    ├── /api/v1/ai/opportunities   → AI/ML opportunity analysis
    ├── /api/v1/code/analyze       → LLM-powered vulnerability detection (NEW)
    ├── /api/v1/code/fix           → LLM-powered fix generation (NEW)
    └── /api/v1/health             → Readiness check
```

---

## LLM Integration

The AI engine supports two LLM providers via direct API calls (no LangChain/framework overhead):

| Provider | Env Variable | Default Model |
|----------|-------------|---------------|
| OpenAI | `OPENAI_API_KEY` | `gpt-4o` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` |

### Configuration

```bash
# OpenAI (recommended for code analysis)
export OPENAI_API_KEY="sk-..."
export LLM_PROVIDER="openai"      # optional, auto-detected from key
export LLM_MODEL="gpt-4o"         # optional, uses default

# Anthropic alternative
export ANTHROPIC_API_KEY="sk-ant-..."
export LLM_PROVIDER="anthropic"
export LLM_MODEL="claude-sonnet-4-20250514"
```

### Graceful Degradation

All endpoints work **without LLM keys** — they fall back to heuristic pattern matching. LLM integration enriches results but is never required.

---

## Code Analysis Endpoints

### POST /api/v1/code/analyze

Analyze code for security vulnerabilities using LLM reasoning.

```json
// Request
{
  "code": "const query = `SELECT * FROM users WHERE id = ${req.params.id}`",
  "language": "typescript",
  "context": "Express.js API endpoint handling user lookup"
}

// Response
{
  "vulnerabilities": [
    {
      "type": "SQL Injection",
      "severity": "critical",
      "line": 1,
      "description": "User input interpolated directly into SQL query",
      "cwe": "CWE-89",
      "owasp": "A03:2021",
      "fix_suggestion": "Use parameterized queries with $1 placeholders"
    }
  ],
  "risk_score": 9.2,
  "llm_enhanced": true
}
```

### POST /api/v1/code/fix

Generate a security fix for vulnerable code.

```json
// Request
{
  "code": "const query = `SELECT * FROM users WHERE id = ${req.params.id}`",
  "vulnerability": "SQL Injection",
  "language": "typescript"
}

// Response
{
  "fixed_code": "const query = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id])",
  "explanation": "Replaced string interpolation with parameterized query to prevent SQL injection",
  "confidence": 0.95
}
```

---

## Business Context Enhancement

When LLM is available, the `/api/v1/business/infer` endpoint enriches heuristic results:

1. **Heuristic pass** — pattern matching on package names, file structure, config files
2. **LLM enhancement** — sends heuristic results + project metadata to LLM for deeper industry classification, compliance requirement identification, and risk profiling

---

## Running Locally

```bash
cd packages/ai-engine

# Create virtual environment
python -m venv .venv
source .venv/bin/activate    # Linux/Mac
.venv\Scripts\activate       # Windows PowerShell

# Install with dev dependencies
pip install -e ".[dev]"

# Run with hot reload
uvicorn steve.main:app --host 0.0.0.0 --port 8100 --reload

# Run tests
pytest tests/ -v
```

---

## Adding a New Router

1. Create `packages/ai-engine/steve/routers/my_feature.py`
2. Define a FastAPI `APIRouter` with endpoints
3. Register in `packages/ai-engine/steve/main.py`:

```python
from steve.routers import my_feature
app.include_router(my_feature.router, prefix="/api/v1/my-feature")
```

4. Use the LLM client for AI-powered features:

```python
from steve.llm import complete, complete_json

# Text completion
result = await complete("Analyze this code for vulnerabilities: ...")

# Structured JSON response
findings = await complete_json(
    "Find security issues in this code",
    schema={"vulnerabilities": [{"type": "string", "severity": "string"}]}
)
```
