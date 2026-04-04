# Phase 7 — Remediation Planning

## Objective

Translate vulnerability findings and risk scores into actionable remediation plans with clear ownership, timelines, and verification criteria.

## Remediation Priority

Based on risk scores from Phase 6:

| Priority | Risk Level | Timeline | Approach |
|----------|-----------|----------|----------|
| P0 | Critical (9.0-10.0) | 24-48 hours | Emergency fix, hotfix deployment |
| P1 | High (7.0-8.9) | 1-2 weeks | Prioritized in current sprint |
| P2 | Medium (4.0-6.9) | 1-3 months | Scheduled in roadmap |
| P3 | Low (2.0-3.9) | Next cycle | Addressed opportunistically |
| P4 | Informational (0.0-1.9) | As capacity allows | Best practice improvements |

## Remediation Plan Structure

For each vulnerability, create a remediation entry:

```
Vulnerability ID:      V-001
Title:                 SQL Injection in User Search
Risk Score:            10.0 (Critical)
Priority:              P0

Fix Recommendation:
  Use parameterized queries/prepared statements for all
  database queries. Replace string concatenation with
  ORM query builder or parameterized SQL.

Implementation Steps:
  1. Identify all raw SQL queries in search module
  2. Replace with parameterized queries
  3. Add input validation layer
  4. Add SQL injection test cases
  5. Deploy to staging and verify
  6. Deploy to production

Owner:                 Backend Team Lead
Deadline:              48 hours
Verification:          Re-run SAST scan + manual SQL injection test
Rollback Plan:         Revert to previous version if fix causes issues

References:
  - /remediation-guides/injection-prevention.md
  - /knowledge-base/application-attacks/sql-injection.md
```

## Remediation Strategies

### Strategy 1: Direct Fix

Remove the vulnerability entirely.

**When to use:** Clear solution exists, low implementation risk.

### Strategy 2: Compensating Control

Add a security control that reduces the risk without fixing the root cause.

**When to use:** Direct fix is complex or risky, need immediate risk reduction.

**Examples:**
- WAF rules to block injection patterns while code is being fixed
- Rate limiting to reduce brute force risk while MFA is implemented
- Network segmentation to limit blast radius

### Strategy 3: Risk Acceptance

Document the decision to accept the risk.

**When to use:** Risk is low, fix cost exceeds risk, or component is being decommissioned.

**Requirements:**
- Formal documentation
- Approval from security and business stakeholders
- Review date set
- Compensating controls documented

### Strategy 4: Risk Transfer

Transfer risk to a third party (insurance, vendor SLA).

**When to use:** Risk cannot be fully mitigated internally.

## Remediation Tracking

### Status Workflow

```
Identified → Planned → In Progress → Implemented → Verified → Closed
                                          ↓
                                    Failed Verification → Re-planned
```

### Tracking Template

| ID | Vulnerability | Priority | Owner | Status | Deadline | Verified |
|----|--------------|----------|-------|--------|----------|----------|
| V-001 | SQL Injection | P0 | @backend-lead | Implemented | Mar 17 | Pending |
| V-002 | Missing rate limit | P1 | @api-team | In Progress | Mar 29 | — |
| V-003 | Verbose errors | P3 | @backend-lead | Planned | Q2 2026 | — |

## Verification Requirements

Each remediation must be verified before closing:

| Verification Method | Description |
|--------------------|-------------|
| Code review | Fix reviewed by security-aware developer |
| Automated scan | Re-run the tool that detected the issue |
| Manual testing | Attempt to reproduce the vulnerability |
| Regression test | Verify fix doesn't break functionality |
| Penetration test | For critical fixes, external verification |

## Remediation Guides

Detailed fix guidance is available in `/remediation-guides/`:

- [Injection Prevention](../remediation-guides/injection-prevention.md)
- [Authentication Hardening](../remediation-guides/authentication-hardening.md)
- [Access Control](../remediation-guides/access-control.md)
- [Cryptographic Best Practices](../remediation-guides/cryptographic-best-practices.md)
- [Infrastructure Hardening](../remediation-guides/infrastructure-hardening.md)
- [Supply Chain Security](../remediation-guides/supply-chain-security.md)
- [Logging and Monitoring](../remediation-guides/logging-and-monitoring.md)

## Final Audit Report

After remediation planning, compile the full audit report using:

- [Audit Report Template](../templates/audit-report-template.md)
- [Executive Summary Template](../templates/executive-summary-template.md)

## Outputs

1. **Remediation plan** — Action items with owners and deadlines
2. **Verification criteria** — How to confirm each fix
3. **Risk acceptance log** — Documented accepted risks
4. **Audit report** — Complete findings and recommendations
5. **Executive summary** — High-level summary for leadership
