# API Key Management

## How Keys Work

1. **Key format:** `sa_live_` prefix + 32 random hex chars (e.g., `sa_live_a1b2c3d4e5f67890...`)
2. **Storage:** The server stores only the **SHA-256 hash** of the key in the `api_keys` table. The plaintext key is shown once at creation time and never stored.
3. **Display:** The `key_prefix` column stores the first 8 characters (e.g., `sa_live_`) for identification in the dashboard.

## Auth Priority Chain

When a request arrives with an `X-API-Key` header:

```
1. SECURITY_AUDIT_SKIP_AUTH=true?  → Allow (no key needed)
2. DATABASE_URL set?               → SHA-256 hash key → query api_keys table
   - Found + not revoked?          → Allow (update last_used_at)
3. SECURITY_AUDIT_API_KEYS set?    → Plaintext match against env var list
   - Match?                        → Allow
4. Reject with 401
```

## Simple Mode (No Database)

For quick setups, use the `SECURITY_AUDIT_API_KEYS` env var:

```bash
SECURITY_AUDIT_API_KEYS="key1,key2,key3" node dist/index.js
```

Keys are comma-separated. No hashing, no tracking, no revocation — just plaintext match.

## Database Mode

When `DATABASE_URL` is set, the server uses PostgreSQL for key management:

### Tables

```sql
users (
  id          UUID PRIMARY KEY,
  clerk_id    TEXT UNIQUE,      -- from Clerk auth
  email       TEXT,
  plan        TEXT DEFAULT 'free',
  created_at  TIMESTAMPTZ
)

api_keys (
  id           UUID PRIMARY KEY,
  user_id      UUID → users(id),
  key_hash     TEXT,             -- SHA-256 of plaintext key
  key_prefix   TEXT,             -- first 8 chars for display
  name         TEXT,
  created_at   TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,     -- updated on each use
  revoked_at   TIMESTAMPTZ      -- NULL = active, set = revoked
)

usage_logs (
  id          BIGSERIAL,
  api_key_id  UUID → api_keys(id),
  tool_name   TEXT,
  created_at  TIMESTAMPTZ,
  latency_ms  INT
)
```

### Creating a Key (Manual / Dev)

```sql
-- 1. Create user
INSERT INTO users (clerk_id, email) VALUES ('dev_user', 'dev@example.com');

-- 2. Generate key locally (don't store the plaintext!)
-- Key: sa_live_abc123def456...
-- Hash: echo -n "sa_live_abc123def456..." | sha256sum

-- 3. Insert hashed key
INSERT INTO api_keys (user_id, key_hash, key_prefix, name)
VALUES (
  (SELECT id FROM users WHERE clerk_id = 'dev_user'),
  '<sha256-hash-here>',
  'sa_live_',
  'My API Key'
);
```

### Revoking a Key

```sql
UPDATE api_keys SET revoked_at = now() WHERE id = '<key-uuid>';
```

Revoked keys are immediately rejected — the index filters them: `WHERE revoked_at IS NULL`.

### Usage Analytics

```sql
-- Calls per tool (last 24 hours)
SELECT tool_name, COUNT(*) as calls, AVG(latency_ms)::int as avg_ms
FROM usage_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY tool_name
ORDER BY calls DESC;

-- Calls per key (last 7 days)
SELECT ak.key_prefix, ak.name, COUNT(*) as calls
FROM usage_logs ul
JOIN api_keys ak ON ak.id = ul.api_key_id
WHERE ul.created_at > now() - interval '7 days'
GROUP BY ak.key_prefix, ak.name
ORDER BY calls DESC;
```

## Future: Clerk Integration

The `@clerk/backend` package is installed for future use. When a dashboard is built:

1. Users sign in via Clerk
2. The dashboard creates API keys (generates random key, hashes, stores hash)
3. The plaintext key is shown once to the user
4. JWT verification on dashboard endpoints uses Clerk's `verifyToken()`

This is not wired up yet — currently keys are managed via SQL or the env var.
