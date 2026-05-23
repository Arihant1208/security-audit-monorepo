-- Migration 005: Async Pipeline Jobs
-- PG-backed job queue for async pipeline execution

CREATE TYPE job_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');

CREATE TABLE pipeline_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),

  -- Job configuration
  project_name TEXT NOT NULL,
  target TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  phases INTEGER[] NOT NULL DEFAULT ARRAY[0,1,2,3,4,5,6,7,8],

  -- Status tracking
  status job_status NOT NULL DEFAULT 'queued',
  current_phase INTEGER,
  progress JSONB NOT NULL DEFAULT '[]',

  -- Results
  report_id UUID REFERENCES audit_reports(id),
  error TEXT,

  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Concurrency control
  locked_by TEXT,
  locked_at TIMESTAMPTZ
);

-- Index for job polling: find next queued job efficiently
CREATE INDEX idx_pipeline_jobs_status_created
  ON pipeline_jobs (status, created_at)
  WHERE status = 'queued';

-- Index for user's jobs (dashboard listing)
CREATE INDEX idx_pipeline_jobs_user_id ON pipeline_jobs (user_id, created_at DESC);

-- Index for stale lock detection
CREATE INDEX idx_pipeline_jobs_locked ON pipeline_jobs (locked_at)
  WHERE status = 'running';
