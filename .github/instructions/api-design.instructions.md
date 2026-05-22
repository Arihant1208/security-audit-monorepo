---
description: "Use when designing REST APIs, defining endpoint contracts, planning request/response schemas, implementing error handling, versioning, pagination, or reviewing API consistency."
---

# API Design Standards

## URL Conventions
- Plural nouns for resources: `/users`, `/reports`, `/audits`
- Nested resources for ownership: `/users/:id/reports`
- Actions as verbs only when CRUD doesn't fit: `/reports/:id/generate`
- Consistent casing: `kebab-case` for URLs, `camelCase` for JSON fields

## HTTP Methods
| Method | Purpose | Idempotent | Response |
|--------|---------|------------|----------|
| GET | Read resource(s) | Yes | 200 + body |
| POST | Create resource | No | 201 + body + Location header |
| PUT | Full replace | Yes | 200 + body |
| PATCH | Partial update | Yes | 200 + body |
| DELETE | Remove resource | Yes | 204 no body |

## Request Validation
- Zod schema for every endpoint (params + query + body)
- Fail fast with 400 + detailed error for invalid input
- Validate early in the middleware chain
- Strip unknown fields (don't pass through unvalidated data)

## Response Format

### Success
```json
{
  "data": { ... },
  "meta": { "page": 1, "total": 42 }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

## Status Codes
- `200` — success with body
- `201` — resource created
- `204` — success, no body (delete, update with no return)
- `400` — validation error (client's fault)
- `401` — not authenticated
- `403` — authenticated but not authorized
- `404` — resource not found
- `409` — conflict (duplicate, stale update)
- `422` — semantically invalid (valid JSON but business rule violation)
- `429` — rate limited
- `500` — unexpected server error (never expose internals)

## Pagination
- Cursor-based for real-time data: `?cursor=abc&limit=20`
- Offset-based for static/sorted data: `?page=1&pageSize=20`
- Always return: `{ data: [...], meta: { total, nextCursor?, hasMore } }`
- Default page size: 20, max: 100

## Versioning
- URL prefix when breaking changes: `/v1/users`, `/v2/users`
- Avoid versioning until actually needed
- Breaking change = removing field, changing type, changing behavior
- Non-breaking = adding optional field, adding endpoint

## Rate Limiting
- Return `429` with `Retry-After` header
- Different limits per endpoint class (read vs write vs expensive)
- Include rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
