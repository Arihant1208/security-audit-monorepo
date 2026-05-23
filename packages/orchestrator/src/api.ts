/**
 * Steve Website API — thin barrel mounting modular route files.
 *
 * Express router mounted at /api on the orchestrator.
 */

import { Router } from "express";
import { errorHandler } from "./middleware/index.js";
import { apiLimiter } from "./middleware/rate-limit.js";
import { authRouter } from "./routes/auth.routes.js";
import { keysRouter } from "./routes/keys.routes.js";
import { reportsRouter } from "./routes/reports.routes.js";
import { usageRouter } from "./routes/usage.routes.js";
import { teamsRouter } from "./routes/teams.routes.js";
import { jobsRouter } from "./routes/jobs.routes.js";

const router = Router();

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Mount route modules
router.use(authRouter);
router.use(keysRouter);
router.use(reportsRouter);
router.use(usageRouter);
router.use(teamsRouter);
router.use(jobsRouter);

// Centralized error handler (must be last)
router.use(errorHandler);

export { router as apiRouter };
