---
description: "Architecture review for proposed changes. Evaluates system impact, module boundaries, scalability, and long-term maintainability."
agent: "architect"
argument-hint: "Describe the proposed change or design to review"
---

# Architecture Review

You are performing an architecture review. Evaluate the proposed change against these dimensions:

## 1. System Impact
- Which modules are affected?
- Are module boundaries respected?
- Does this create new coupling between previously independent modules?
- What's the blast radius if this component fails?

## 2. Data Flow
- How does data flow through the system with this change?
- Are there new data paths or transformations?
- Is data ownership clear (one module owns each entity)?
- Are there circular dependencies?

## 3. API Contracts
- Are interfaces between modules well-defined?
- Are changes backward-compatible?
- Is the contract typed and validated?
- Will clients need to change?

## 4. Scalability
- Does this create bottlenecks at scale?
- Are expensive operations async where appropriate?
- Is data access efficient (N+1, missing indexes)?
- Can this scale horizontally if needed?

## 5. Simplicity Check
- Is this the simplest design that solves the problem?
- Could we achieve the same result with less code/infrastructure?
- Are we solving for today's needs or hypothetical future needs?
- Would a new team member understand this without a 30-minute explanation?

## 6. Operational Concerns
- How do we deploy this safely?
- How do we roll back if it fails?
- How do we monitor its health?
- What alerts should exist?

## Output

Provide:
- **Verdict**: APPROVE / APPROVE WITH CHANGES / NEEDS REDESIGN
- **Strengths**: What's well-designed
- **Concerns**: Specific issues with suggested fixes
- **Questions**: Things that need human decision
