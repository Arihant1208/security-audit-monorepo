# Server-Side Request Forgery (SSRF)

## Description

SSRF allows an attacker to induce the server application to make HTTP requests to an arbitrary domain of the attacker's choosing. This can be used to access internal services, scan internal networks, read cloud metadata, and bypass access controls.

## Affected Layer

Application Security, Infrastructure

## Attack Mechanism

1. Application fetches external resources based on user-supplied URLs
2. Attacker provides a URL pointing to an internal service (e.g., `http://169.254.169.254/` for cloud metadata)
3. Server makes the request using its network position (inside the firewall)
4. Attacker receives the internal resource via the server's response

**Variants:**
- **Basic SSRF** — Response returned to attacker
- **Blind SSRF** — No response returned, but side effects observable
- **SSRF via redirects** — Attacker URL redirects to internal target
- **SSRF via DNS rebinding** — DNS resolution changes between validation and request

## Detection Checks

- [ ] Does the application fetch URLs provided by users?
- [ ] Is there URL validation (allowlist of domains/protocols)?
- [ ] Are internal/private IP ranges blocked from user-supplied URLs?
- [ ] Is the cloud metadata endpoint (169.254.169.254) blocked?
- [ ] Are URL redirects followed without revalidation?
- [ ] Is DNS resolution validated against internal ranges?
- [ ] Does the application run with network segmentation limiting internal access?
- [ ] Are outbound network requests logged and monitored?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Cloud credential theft (metadata service) | Critical |
| Internal service access | High |
| Internal network scanning | High |
| Data exfiltration from internal systems | High |
| Firewall bypass | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Validate and sanitize all user-supplied URLs | Critical |
| Implement allowlist of permitted domains and protocols | Critical |
| Block requests to private/internal IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x) | Critical |
| Disable cloud metadata endpoint access or use IMDSv2 (token-required) | Critical |
| Do not follow redirects from user-supplied URLs (or revalidate after redirect) | High |
| Implement network segmentation for the application | High |
| Use a dedicated service for URL fetching with restricted network access | Medium |
| Log and monitor outbound requests | Medium |

## References

- OWASP: A10:2021 Server-Side Request Forgery
- CWE-918: Server-Side Request Forgery
