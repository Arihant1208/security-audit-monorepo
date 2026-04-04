---
description: "Run a full security audit: scan, report, and fix"
mode: "agent"
---

Run a complete security audit of this codebase in three phases:

## Phase 1 — Scan
@security-scanner Perform a comprehensive security scan of this codebase. Discover the architecture, map the attack surface, run through all relevant security checklists, and calculate risk scores for every finding. Write results to `audit-results/scan-results.md`.

## Phase 2 — Report
@security-reporter Generate a full audit report, executive summary, and individual finding reports for Critical/High issues from the scan results.

## Phase 3 — Fix
@security-fixer Walk through each finding starting from the highest risk score. For each one, research the remediation, present the recommended fix, and apply it after approval.
