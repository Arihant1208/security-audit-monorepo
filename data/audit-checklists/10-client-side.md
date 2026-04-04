# 10 — Client-Side Security Checklist

## XSS Prevention

- [ ] Content Security Policy (CSP) header blocks inline scripts and unsafe-eval
- [ ] Auto-escaping enabled in templating/rendering framework
- [ ] User content sanitized before DOM insertion
- [ ] `innerHTML`, `eval`, `document.write` not used with user data
- [ ] DOMPurify or equivalent used for rich text rendering

## Sensitive Data in Client

- [ ] No secrets, API keys, or credentials in client-side code
- [ ] Authentication tokens stored in HttpOnly cookies (not localStorage)
- [ ] Source maps disabled in production builds
- [ ] Sensitive data not cached by the browser (Cache-Control headers)
- [ ] Environment-specific configs not bundled in client

## Security Headers

- [ ] `Content-Security-Policy` configured
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN` set
- [ ] `X-Content-Type-Options: nosniff` set
- [ ] `Referrer-Policy` set to `strict-origin-when-cross-origin` or stricter
- [ ] `Permissions-Policy` restricts unnecessary browser features
- [ ] `Strict-Transport-Security` (HSTS) set with appropriate max-age

## Third-Party Scripts

- [ ] Third-party scripts loaded with `integrity` attribute (SRI)
- [ ] Third-party scripts audited for security
- [ ] Third-party scripts loaded from trusted CDNs only
- [ ] Number of third-party scripts minimized
- [ ] CSP restricts script sources to allowlisted domains

## Client-Side Dependencies

- [ ] Client-side libraries scanned for known vulnerabilities
- [ ] Client-side dependencies updated regularly
- [ ] Unused client-side libraries removed
- [ ] Build process includes client-side dependency audit

## Communication Security

- [ ] All API calls use HTTPS
- [ ] Certificate pinning implemented in mobile apps
- [ ] WebSocket connections use WSS (not WS)
- [ ] Postmessage origin validated
