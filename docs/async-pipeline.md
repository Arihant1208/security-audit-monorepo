# Async Pipeline & Job Queue

The orchestrator includes a PostgreSQL-backed asynchronous job queue for running the 9-phase audit pipeline in the background. This allows clients to submit long-running audits and poll for progress.

---

## Architecture

```
Client → POST /api/jobs → Enqueue in pipeline_jobs table
                               ↓
Worker (background loop) → Claims job (FOR UPDATE SKIP LOCKED)
                               ↓
                          Runs StevePipeline phases 0–8
                               ↓
                          Updates progress after each phase
                               ↓
                          Marks job completed with results
```

**Key design decisions:**
- PG advisory locks via `FOR UPDATE SKIP LOCKED` — no Redis needed
- Max 2 concurrent jobs per worker instance
- 5-second poll interval
- 15-minute stale lock timeout (auto-recovery for crashed workers)
- Job cancellation support (sets status to `cancelled`, worker skips on next phase)

---

## API Endpoints

All endpoints require authentication (API key or Clerk JWT).

### POST /api/jobs

Enqueue a new pipeline job.

```json
// Request
{
  "repoUrl": "https://github.com/example/project",
  "branch": "main",
  "options": {
    "skipPhases": [6],
    "targetDir": "./src"
  }
}

// Response (201)
{
  "id": "uuid",
  "status": "pending",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### GET /api/jobs

List jobs for the authenticated user.

```json
// Response
[
  {
    "id": "uuid",
    "status": "running",
    "progress": { "phase": 4, "totalPhases": 9, "currentPhase": "Layered Security Audit" },
    "createdAt": "2024-01-15T10:00:00Z",
    "claimedAt": "2024-01-15T10:00:05Z"
  }
]
```

### GET /api/jobs/:id

Get detailed status for a specific job.

```json
// Response
{
  "id": "uuid",
  "status": "completed",
  "progress": { "phase": 9, "totalPhases": 9, "currentPhase": "Report Generation" },
  "result": { /* full pipeline output */ },
  "createdAt": "2024-01-15T10:00:00Z",
  "completedAt": "2024-01-15T10:12:30Z"
}
```

### POST /api/jobs/:id/cancel

Cancel a pending or running job.

```json
// Response
{ "id": "uuid", "status": "cancelled" }
```

---

## Job States

| Status | Meaning |
|--------|---------|
| `pending` | Enqueued, waiting for worker to claim |
| `running` | Worker is executing pipeline phases |
| `completed` | All phases finished successfully |
| `failed` | Pipeline error (see `error` field) |
| `cancelled` | User cancelled before completion |

---

## Database Schema

```sql
CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

CREATE TABLE pipeline_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id),
  status job_status NOT NULL DEFAULT 'pending',
  input JSONB NOT NULL,
  progress JSONB DEFAULT '{}',
  result JSONB,
  error TEXT,
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Migration: `packages/db/migrations/005-pipeline-jobs.sql`

---

## Worker Configuration

The background worker starts automatically with the orchestrator. Configuration via environment:

| Variable | Default | Purpose |
|----------|---------|---------|
| `JOB_POLL_INTERVAL_MS` | `5000` | How often to check for pending jobs |
| `JOB_MAX_CONCURRENT` | `2` | Max simultaneous pipeline executions |
| `JOB_STALE_TIMEOUT_MIN` | `15` | Minutes before a stuck job is reclaimed |

---

## Monitoring

The health endpoint includes job queue status:

```json
GET /health
{
  "status": "ok",
  "queue": {
    "pending": 3,
    "running": 1,
    "completed_today": 12
  }
}
```

---

## Integration with Drizzle ORM

The `pipeline_jobs` table is also defined in the Drizzle schema at `packages/orchestrator/src/infra/schema.ts`. New code should prefer Drizzle for typed queries:

```typescript
import { db } from "../infra/drizzle.js";
import { pipelineJobs } from "../infra/schema.js";
import { eq } from "drizzle-orm";

const job = await db.select().from(pipelineJobs).where(eq(pipelineJobs.id, jobId));
```

The raw SQL queue operations in `src/pipeline/queue.ts` use the tagged-template SQL client for advisory lock patterns that Drizzle doesn't natively support.
