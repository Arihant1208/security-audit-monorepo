-- Migration 004: Add phase_outputs to audit_reports
-- Stores the full markdown output of each pipeline phase
-- (architecture diagrams, threat models, license compliance, etc.)

BEGIN;

ALTER TABLE audit_reports ADD COLUMN IF NOT EXISTS phase_outputs JSONB;
-- Structure: { "00-business-context": "...", "02-architecture": "...", ... }

COMMIT;
