---
description: "Python coding standards. Type hints, FastAPI patterns, async/await, Pydantic models, project structure, error handling."
applyTo: "**/*.py"
---

# Python Standards

## Type Hints
- All function signatures fully typed (params and return)
- Use `typing` module for complex types: `Optional`, `Union`, `Literal`
- Pydantic `BaseModel` for data shapes (not dataclasses for API models)
- `TypedDict` for dictionary shapes when Pydantic is overkill

## FastAPI Patterns
- Router per feature/domain: `routers/{feature}.py`
- Pydantic models for request/response schemas
- Dependency injection for shared services (DB, auth, config)
- Background tasks for async operations: `BackgroundTasks`
- HTTPException with meaningful detail messages

## Naming
- `snake_case` for functions, variables, modules
- `PascalCase` for classes and Pydantic models
- `UPPER_SNAKE_CASE` for constants
- Prefix private functions with `_`
- Descriptive names: `calculate_risk_score`, not `calc`

## Async
- Use `async def` for I/O-bound operations (DB, HTTP, file)
- Use regular `def` for CPU-bound or trivial operations
- `asyncio.gather` for concurrent independent I/O
- Never block the event loop with synchronous I/O in async functions

## Error Handling
- Custom exception classes with codes
- Catch specific exceptions, not bare `except`
- FastAPI exception handlers for consistent error responses
- Log errors with context (structured logging)

## Project Structure
```
feature/
├── router.py      # FastAPI routes
├── service.py     # Business logic
├── models.py      # Pydantic schemas
├── repository.py  # Data access
└── exceptions.py  # Domain exceptions
```

## Dependencies
- Pin versions in `pyproject.toml`
- Use `uv` or `pip-compile` for reproducible installs
- Minimal dependencies — stdlib when possible
- Virtual environments always (never global installs)

## Testing
- `pytest` with `httpx.AsyncClient` for API tests
- Fixtures for common test state
- `pytest.mark.parametrize` for input variations
- Test files mirror source structure: `tests/test_{module}.py`
