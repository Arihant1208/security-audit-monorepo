# 04 — API Security Checklist

## Authentication

- [ ] All API endpoints require authentication (except explicitly public ones)
- [ ] API keys are not the sole authentication mechanism for sensitive operations
- [ ] JWT tokens validated completely (signature, issuer, audience, expiration)
- [ ] Token refresh mechanism is secure (refresh token rotation)
- [ ] API keys transmitted in headers (not URL parameters)

## Authorization

- [ ] Endpoint-level authorization enforced
- [ ] Object-level authorization — users can only access their own resources
- [ ] Function-level authorization — admin endpoints restricted to admin roles
- [ ] Property-level authorization — sensitive fields filtered based on role
- [ ] Authorization checked on every request (not cached from login)

## Rate Limiting & Throttling

- [ ] Rate limits configured on all endpoints
- [ ] Stricter rate limits on authentication endpoints
- [ ] Rate limits applied per-user, per-IP, and per-API key
- [ ] Rate limit headers returned (X-RateLimit-Limit, X-RateLimit-Remaining)
- [ ] Graceful responses for rate-limited requests (429 Too Many Requests)

## Input Validation

- [ ] Request body validated against schema (JSON Schema, OpenAPI)
- [ ] Request size limits enforced
- [ ] Query parameter limits enforced (pagination limits, max depth)
- [ ] Content-Type header validated
- [ ] GraphQL: query depth and complexity limits configured

## Mass Assignment Protection

- [ ] API does not blindly bind request bodies to data models
- [ ] Allowlisted fields for each endpoint (not blocklisted)
- [ ] Sensitive fields (role, permissions, isAdmin) cannot be set via API

## Data Exposure

- [ ] API responses return only required fields
- [ ] Sensitive data not included in responses unless necessary
- [ ] Error responses do not leak internal implementation details
- [ ] Debug endpoints disabled in production
- [ ] API documentation (Swagger/OpenAPI) not exposed in production (or access-controlled)

## CORS Configuration

- [ ] CORS allows only explicitly trusted origins
- [ ] wildcard (*) not used in Access-Control-Allow-Origin
- [ ] Access-Control-Allow-Credentials used only with specific origins
- [ ] Preflight responses are properly configured

## Versioning & Deprecation

- [ ] Deprecated API versions have security patches applied
- [ ] End-of-life APIs are decommissioned (not just undocumented)
- [ ] API versioning strategy prevents breaking security improvements
