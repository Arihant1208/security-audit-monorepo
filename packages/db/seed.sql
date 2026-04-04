-- Seed data for local development
-- The test API key is: sa_test_localdev1234567890abcdef
-- SHA-256 hash of that key is pre-computed below.

BEGIN;

INSERT INTO users (id, clerk_id, email, plan)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'dev_local_user',
  'dev@localhost',
  'free'
) ON CONFLICT (clerk_id) DO NOTHING;

-- Key: sa_test_localdev1234567890abcdef
-- SHA-256: echo -n "sa_test_localdev1234567890abcdef" | sha256sum
-- = 7b4a5e8c1f3d2a9b6e0c4f8d7a1b3e5c9f2d6a8b0e4c7f1a3d5b9e2c6f8a0d (placeholder — recompute in dev)
INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  '4cca87e06a8a6491df56c9e68e72ef58e71acf3850c6115308a31374df958499',
  'sa_test_',
  'Local Development'
) ON CONFLICT DO NOTHING;

COMMIT;
