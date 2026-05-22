---
description: "TypeScript coding standards. Strict typing, Zod validation, error handling, naming conventions, module patterns, import organization."
applyTo: "**/*.ts"
---

# TypeScript Standards

## Types
- No `any` — use `unknown` and narrow, or define proper types
- Prefer interfaces for object shapes, types for unions/intersections
- Export types from the module that owns them
- Use `as const` for literal objects, not type assertions
- Discriminated unions for state machines and variants

## Validation
- Zod schemas at system boundaries (API input, env vars, external data)
- Infer TypeScript types from Zod schemas: `z.infer<typeof schema>`
- Never trust runtime data without validation

## Naming
- `camelCase` for variables and functions
- `PascalCase` for types, interfaces, classes, enums
- `UPPER_SNAKE_CASE` for constants
- Prefix interfaces only when ambiguous (avoid `IUser` — just `User`)
- Suffix error classes with `Error`: `NotFoundError`, `ValidationError`

## Functions
- Pure functions where possible — same input → same output
- Early returns for guard clauses
- Max 3 parameters — use options object beyond that
- Async functions always return typed promises

## Error Handling
- Custom error classes extending `Error` with `code` property
- Throw at boundaries, handle at boundaries
- Never `catch` without action (log, transform, or rethrow)
- Use `Result<T, E>` pattern for expected failures in business logic

## Imports
- Group: external deps → internal absolute → relative
- No circular imports
- Prefer named exports (easier to refactor, better tree-shaking)
- Import types with `import type` when only used for types

## Module Pattern
```typescript
// 1. Types/interfaces at top
// 2. Constants
// 3. Main exported function/class
// 4. Helper functions (private)
```
