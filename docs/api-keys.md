# API Key Management

## Overview

Steve uses API keys to authenticate MCP tool calls over HTTP. Keys follow the format `sa_live_` + 32 random hex characters, are stored as SHA-256 hashes, and shown to the user only once at creation time.

## Getting a Key

### Via the Website (Recommended)

1. Go to the Steve website and sign up
2. Log in and navigate to the **Dashboard → API Keys** tab
3. Click **Generate New Key**
4. **Copy the key immediately** — it will not be shown again
5. Use the key in your `.vscode/mcp.json` or CLI config

### Via the Next.js Dashboard

1. Go to http://localhost:4000 and sign in with Clerk
2. Navigate to **API Keys** in the sidebar
3. Click **Create Key**, give it a name
4. Copy the key from the one-time reveal dialog
5. The key is stored hashed — you cannot see it again

### Via Environment Variable (Development)

For quick setups without a database:

```bash
SECURITY_AUDIT_API_KEYS="my-dev-key,another-key" node dist/index.js
```

Keys are comma-separated. No hashing, no tracking, no revocation — just plaintext match. Good for local development.

### Via SQL (Manual / Admin)

```bash
# Generate a key locally
export KEY="sa_live_$(openssl rand -hex 16)"
echo "Your key: $KEY"

# Hash it
export HASH=$(echo -n "$KEY" | sha256sum | cut -d' ' -f1)

# Insert (requires DATABASE_URL)
psql "$DATABASE_URL" -c "
  INSERT INTO api_keys (user_id, key_hash, key_prefix, name)
  VALUES (
    (SELECT id FROM users LIMIT 1),
    '$HASH',
    'sa_live_',
    'Manual key'
  );
"
```

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

## Website Session Auth

The website uses **session-based authentication** separate from API keys:

```
POST /api/auth/signup { email, password }
  → Create user with salted SHA-256 password hash
  → Generate session token
  → Return token + user info

POST /api/auth/login { email, password }
  → Verify password against stored hash
  → Generate session token (stored as SHA-256 hash in sessions table)
  → Return token + user info

GET /api/auth/me (X-Session-Token header)
  → Look up session → return user info

POST /api/auth/logout (X-Session-Token header)
  → Delete session from table
```

Sessions expire after **7 days**.

## Database Schema

```sql
users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id       TEXT UNIQUE,
  email          TEXT,
  password_hash  TEXT,
  plan           TEXT DEFAULT 'free',
  created_at     TIMESTAMPTZ DEFAULT now()
)

api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID → users(id),
  key_hash     TEXT NOT NULL,
  key_prefix   TEXT,
  name         TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at   TIMESTAMPTZ       -- NULL = active, set = revoked
)

sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID → users(id),
  token_hash  TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
)

usage_logs (
  id          BIGSERIAL PRIMARY KEY,
  api_key_id  UUID → api_keys(id),
  tool_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  latency_ms  INT
)
```

## Key Management API

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `POST /api/keys` | POST | Session | Create new API key (returns plaintext once) |
| `GET /api/keys` | GET | Session | List keys (shows prefix, name, last used, created) |
| `DELETE /api/keys/:id` | DELETE | Session | Revoke a key (sets `revoked_at`) |

## Revoking a Key

### Via Website

Dashboard → API Keys → click the **Revoke** button next to the key.

### Via SQL

```sql
UPDATE api_keys SET revoked_at = now() WHERE id = '<key-uuid>';
```

Revoked keys are rejected immediately — the index filters `WHERE revoked_at IS NULL`.

## Usage Analytics

View usage data via the Dashboard → Usage tab, or query directly:

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

## Security Notes

- API keys are stored as **SHA-256 hashes** — the server never stores plaintext
- Session tokens are stored as **SHA-256 hashes** with 7-day expiry
- Passwords use **salted SHA-256** hashing (for production, upgrade to bcrypt/argon2)
- `SKIP_AUTH` mode is for local development **only** — never enable in production
- All auth data is transmitted over HTTPS in production (enforced by all deployment platforms)
