---
description: "Structured refactoring workflow. Identify code smell, propose improvement, validate no regressions, execute safely."
agent: "code-quality"
argument-hint: "Describe what needs refactoring and why"
---

# Refactoring Workflow

You are performing a structured refactoring. Follow these phases:

## Phase 1: Identify the Smell
- What specific problem exists? (duplication, coupling, complexity, naming)
- Why does this matter? (maintenance cost, bug risk, team confusion)
- What's the blast radius? (how many files/modules affected?)

## Phase 2: Propose the Change
- Describe the target state clearly
- Show before/after for key sections
- Explain why this is better (not just different)
- Invoke Simplicity agent: is the refactored version actually simpler?

## Phase 3: Validate Safety
- Are there existing tests covering this code?
- If not, write characterization tests FIRST (capture current behavior)
- Identify integration points that could break
- Plan incremental steps (not one massive change)

## Phase 4: Execute
- Make changes in small, verifiable steps
- Run tests after each step
- Keep commits atomic (one logical change per commit)
- If something breaks, revert the step (don't fix forward blindly)

## Phase 5: Verify
- All existing tests pass
- New tests cover the refactored code
- No behavior changes (unless intentional and documented)
- Code is measurably improved (fewer lines, clearer names, less coupling)

## Rules
- NEVER refactor and add features in the same change
- NEVER refactor without test coverage
- ALWAYS preserve external behavior
- ALWAYS leave code better than you found it (but only what you're touching)
