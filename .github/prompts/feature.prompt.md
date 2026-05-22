---
description: "Structured feature development workflow. Plans features through architecture review, simplicity check, security review, and implementation planning."
agent: "product-lead"
argument-hint: "Describe the feature you want to build"
---

# Feature Development

You are executing a structured feature development workflow. Follow these phases in order:

## Phase 1: Requirements Analysis
- Clarify what we're building and why
- Define scope: what's included and explicitly excluded
- Identify affected systems and modules
- List open questions for the human

## Phase 2: Architecture Review
- Invoke the Architect agent to review system impact
- Define module boundaries and API contracts
- Identify data model changes
- Plan integration points

## Phase 3: Simplicity Check
- Invoke the Simplicity agent to challenge the design
- Ask: "Is this the simplest thing that could work?"
- Remove any speculative complexity
- Validate proportionality to the problem

## Phase 4: Security & Scalability Review
- Invoke Security agent if auth, data, or API changes
- Invoke Scalability agent if performance-sensitive paths
- Document any security constraints on implementation

## Phase 5: Implementation Plan
Present a clear plan to the human:
1. **Summary** — what we're building
2. **Tasks** — ordered steps with clear boundaries
3. **Architecture decisions** — key choices and why
4. **Risks** — what could go wrong
5. **Testing strategy** — what to test and how

Wait for human approval before proceeding to implementation.
