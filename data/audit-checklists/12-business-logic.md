# 12 — Business Logic Security Checklist

## Workflow Integrity

- [ ] Multi-step business processes enforce step ordering server-side
- [ ] Skipping steps in a workflow is prevented
- [ ] State transitions validated against allowed paths
- [ ] Workflow state stored server-side (not in client/URL parameters)

## Race Conditions

- [ ] Concurrent operations on shared resources handled safely
- [ ] Idempotency enforced on financial/critical operations
- [ ] Database transactions used with appropriate isolation levels
- [ ] Optimistic or pessimistic locking applied where needed
- [ ] Time-of-check to time-of-use (TOCTOU) vulnerabilities addressed

## Abuse Prevention

- [ ] Rate limits on business operations (orders, transfers, messages)
- [ ] Anti-automation measures on sensitive actions (CAPTCHA, velocity checks)
- [ ] Referral/reward systems protected against self-referral abuse
- [ ] Coupon/discount systems validated server-side (not client-side)
- [ ] Free trial abuse prevention implemented

## Financial Logic

- [ ] Price calculations performed server-side only
- [ ] Currency precision handled correctly (no floating point for money)
- [ ] Negative quantities/amounts rejected
- [ ] Transaction limits enforced
- [ ] Double-spending prevention implemented (idempotency keys)

## Data Integrity

- [ ] Business rules enforced at the data layer (database constraints)
- [ ] Critical calculations verified independently (not trusting client)
- [ ] Aggregate operations (totals, counts) computed server-side
- [ ] Checksums used for sensitive data transfers

## Authorization in Business Context

- [ ] Role checks at the business logic layer (not just API/UI)
- [ ] Object ownership verified in business operations
- [ ] Cross-tenant data access prevented
- [ ] Time-based access restrictions enforced (business hours, embargo periods)
- [ ] Delegation and impersonation properly scoped and logged

## Edge Cases

- [ ] Boundary values tested (zero, negative, maximum)
- [ ] Empty/null inputs handled securely
- [ ] Concurrent user scenarios tested
- [ ] Timezone handling correct for time-sensitive operations
- [ ] Character encoding handled consistently
