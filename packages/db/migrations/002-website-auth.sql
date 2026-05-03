-- Migration 002: Website auth, sessions, and audit reports
-- Adds password-based auth alongside Clerk, session tokens, and report storage.

BEGIN;

-- Add password_hash to users (nullable — Clerk users won't have one)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Allow clerk_id to be nullable for email/password signups
ALTER TABLE users ALTER COLUMN clerk_id DROP NOT NULL;

-- Unique constraint on email for direct signups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email) WHERE email IS NOT NULL;

-- Sessions (website login tokens)
CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

-- Audit reports (stored results from Steve audits)
CREATE TABLE IF NOT EXISTS audit_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'running',  -- running, completed, failed
  risk_score      NUMERIC(4,1),
  summary         JSONB,        -- { critical, high, medium, low, info }
  business_context JSONB,
  findings        JSONB,        -- array of findings
  pipeline_state  JSONB,        -- full pipeline state snapshot
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_user ON audit_reports (user_id, created_at DESC);

COMMIT;
