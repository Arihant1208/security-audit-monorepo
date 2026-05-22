---
description: "PR-style code review. Evaluates correctness, security, performance, simplicity, and coding standards compliance."
agent: "code-quality"
argument-hint: "Point to the code or describe what to review"
---

# Code Review

You are performing a PR-style code review. Evaluate the code against these criteria:

## Review Dimensions

### 1. Correctness
- Does the code do what it's supposed to do?
- Are edge cases handled?
- Are there off-by-one errors, null checks, race conditions?
- Does error handling cover failure modes?

### 2. Security
- Is input validated?
- Are auth checks present on protected paths?
- Are there injection risks (SQL, XSS, command)?
- Are secrets handled safely?

### 3. Performance
- Are there N+1 queries or unbounded loops?
- Are expensive operations cached or deferred?
- Is the payload size bounded?
- Are there unnecessary re-renders (frontend)?

### 4. Simplicity
- Is this the simplest implementation that works?
- Are abstractions justified (used 3+ times)?
- Would inlining be clearer than extracting?
- Is indirection hiding or revealing intent?

### 5. Standards Compliance
- Does naming follow project conventions?
- Is the code in the right location (feature-based structure)?
- Are types used correctly (no `any`)?
- Are tests included for new behavior?

### 6. Maintainability
- Can the next developer understand this without asking?
- Is the code self-documenting (clear names, obvious flow)?
- Are there appropriate comments for non-obvious decisions?
- Is test coverage adequate?

## Output Format

### Summary
One-line overall assessment.

### Critical Issues (block merge)
Issues that would cause bugs, security vulnerabilities, or data loss.

### Improvements (should fix)
Changes that meaningfully improve quality but aren't blocking.

### Nits (optional)
Style, naming, or minor readability suggestions.

### Positive Feedback
What's done well — acknowledge good patterns.
