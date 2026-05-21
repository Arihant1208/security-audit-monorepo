/**
 * Zod-based request validation middleware.
 */

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Validates req.body against a Zod schema.
 * Returns 400 with details on failure; attaches parsed result to req.body.
 */
export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join("; ");
      res.status(400).json({ error: message });
      return;
    }
    req.body = result.data;
    next();
  };
}
