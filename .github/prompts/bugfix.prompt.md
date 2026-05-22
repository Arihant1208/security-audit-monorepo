---
description: "Structured bugfix workflow. Root cause analysis, fix implementation, regression test, and verification."
argument-hint: "Describe the bug: what's happening vs what should happen"
---

# Bug Fix Workflow

You are fixing a bug. Follow this structured approach:

## Phase 1: Understand the Bug
- What's the expected behavior?
- What's the actual behavior?
- What are the reproduction steps?
- When did this start happening? (recent changes?)

## Phase 2: Root Cause Analysis
- Trace the code path from input to incorrect output
- Identify WHERE the logic diverges from expected behavior
- Ask: "Why does this fail?" (not just "what line is wrong?")
- Check if this is a symptom of a deeper issue

## Phase 3: Fix Implementation
- Fix the root cause, not the symptom
- Keep the fix minimal — don't refactor unrelated code
- Ensure the fix doesn't introduce new edge cases
- Consider: does this same bug exist elsewhere? (similar code paths)

## Phase 4: Regression Test
- Write a test that FAILS without the fix and PASSES with it
- Test the specific condition that triggered the bug
- Add edge case tests for related scenarios
- Verify existing tests still pass

## Phase 5: Verification
- Confirm the bug is fixed (reproduction steps now succeed)
- Confirm no regressions (existing tests pass)
- Document: what was wrong, why, and how it was fixed
