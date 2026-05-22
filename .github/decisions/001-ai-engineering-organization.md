# ADR-001: AI Engineering Organization

## Status

**ACCEPTED**

## Context

Our development workflow relies heavily on AI coding assistants (GitHub Copilot, Claude, etc.) for code generation, reviews, and architectural guidance. Without shared standards and role boundaries, AI-generated code is inconsistent — varying in style, architecture adherence, security posture, and quality depending on how questions are phrased.

We need AI to behave like a coordinated senior engineering team rather than random code generators. The human (CTO) needs to remain the final authority while delegating specialized engineering concerns to purpose-built AI agents.

**Forces at play:**
- AI without constraints produces inconsistent code quality
- Different engineering concerns (security, scalability, simplicity) often conflict — need explicit tradeoff processes
- One-size-fits-all AI leads to overengineering or under-engineering depending on prompt
- Team standards exist in people's heads but aren't codified for AI consumption
- Architecture decisions get relitigated because they aren't documented

## Decision

Adopt a VS Code agent customization system (`.github/`) that creates a structured AI engineering organization:

1. **Engineering Constitution** (`copilot-instructions.md`) — global standards loaded on every interaction
2. **10 Specialized Agents** — Product Lead, Architect, Code Quality, Security, Frontend, Backend (user-invocable) + Simplicity, Scalability, Testing, DevOps (subagent-only)
3. **8 File-Specific Instructions** — auto-loaded coding standards by file type (TypeScript, Python, React, Docker) and on-demand domain standards (API, DB, Security, Testing)
4. **5 Workflow Prompts** — structured processes for feature development, bugfixes, refactoring, architecture reviews, and code reviews
5. **ADR System** — template for documenting architectural decisions

### Agent Hierarchy
- Human (CTO) → final authority
- Product Lead → orchestrates, delegates to specialists
- Specialist agents → execute within defined boundaries
- Subagents → invoked by parent agents for focused review (not directly accessible)

### Invocability Split
- **User-invocable (6):** Product Lead, Architect, Code Quality, Security, Frontend, Backend
- **Subagent-only (4):** Simplicity, Scalability, Testing, DevOps

## Consequences

### Positive
- Consistent code quality regardless of who prompts the AI
- Security, scalability, and simplicity concerns are systematically addressed
- Architecture decisions are documented and not relitigated
- New team members get the same quality guidance immediately
- Structured workflows prevent ad-hoc, incomplete implementations
- Standards are version-controlled and evolve with the codebase

### Negative
- 24 files to maintain — standards that drift from reality become harmful
- Context window consumption — constitution + instructions reduce available space for code
- Agent delegation adds latency to simple tasks (mitigated by allowing direct specialist access)
- Risk of over-process for trivial changes (mitigated by Simplicity agent)

### Neutral
- Requires VS Code with Copilot Chat (not portable to other editors without adaptation)
- Team must update standards when practices change (same as any documentation)

## Alternatives Considered

### Alternative 1: Single large system prompt
- **Pros:** Simple, one file to maintain
- **Cons:** Bloated context window, no specialization, no structured workflows
- **Why rejected:** Doesn't scale — trying to make one AI persona handle security, frontend, architecture, and DevOps produces mediocre results across all domains

### Alternative 2: Custom `.ai/` directory with proprietary format
- **Pros:** Could design ideal structure without constraints
- **Cons:** Not recognized by VS Code, requires custom tooling, not portable
- **Why rejected:** VS Code already provides `.github/` primitives (agents, instructions, prompts) that integrate natively — no reason to reinvent

### Alternative 3: No AI customization — rely on per-prompt instructions
- **Pros:** Zero maintenance overhead
- **Cons:** Inconsistent, tribal knowledge, repeated instructions, no institutional memory
- **Why rejected:** Defeats the purpose — we want AI as a coordinated team, not a blank-slate assistant

## Migration Impact

- No existing code changes required — purely additive
- Agents become available immediately in VS Code chat picker
- Instructions auto-load when editing matching file types
- Prompts available via `/` slash commands in chat
- Can be adopted incrementally — use what's useful, ignore what isn't

---

**Date:** 2025-05-22  
**Author:** Arihant (CTO)  
**Reviewers:** AI Engineering Team (Product Lead, Architect)
