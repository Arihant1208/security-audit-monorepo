---
description: "Use when designing database schemas, writing migrations, optimizing queries, planning indexes, implementing repository patterns, or working with PostgreSQL."
---

# Database Standards

## Schema Design
- Tables are plural: `users`, `audit_reports`, `api_keys`
- Primary keys: `id` (UUID or serial, depending on use case)
- Timestamps: `created_at`, `updated_at` on every table (auto-managed)
- Soft deletes only when business requires audit trail: `deleted_at`
- Foreign keys always have an index
- Use enums for fixed sets; use lookup tables for dynamic sets

## Naming
- `snake_case` for all database identifiers
- Foreign keys: `{referenced_table_singular}_id` (e.g., `user_id`)
- Indexes: `idx_{table}_{columns}` (e.g., `idx_users_email`)
- Constraints: `chk_{table}_{rule}`, `uq_{table}_{columns}`

## Migrations
- One migration per logical change (not per table)
- Always reversible — provide `up` and `down`
- Never modify existing migrations after deployment
- Test rollback locally before merging
- Separate data migrations from schema migrations
- Never drop columns in the same deploy as code removal

## Query Patterns
- Parameterized queries always (never string interpolation)
- SELECT only needed columns (not `SELECT *` in production)
- Use EXPLAIN ANALYZE for queries touching >1000 rows
- Batch inserts for bulk operations
- Connection pooling (never per-request connections)

## Indexes
- Index all foreign keys
- Index columns used in WHERE, JOIN, ORDER BY
- Composite indexes: most selective column first
- Partial indexes for filtered queries: `WHERE active = true`
- Don't over-index: each index slows writes

## Repository Pattern
```typescript
// One repository per aggregate root
class UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserInput): Promise<User>
  update(id: string, data: UpdateUserInput): Promise<User>
  delete(id: string): Promise<void>
}
```

## Transactions
- Use for multi-table mutations that must be atomic
- Keep transactions short (no external API calls inside)
- Handle deadlocks with retry logic
- Use appropriate isolation level (READ COMMITTED default)

## Performance Rules
- Paginate all list queries (never unbounded SELECT)
- Use cursor-based pagination for real-time data
- Cache expensive aggregations with TTL
- Monitor slow query log
- Add indexes based on actual query patterns, not speculation
