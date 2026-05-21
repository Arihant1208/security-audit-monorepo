/**
 * Rate limiting middleware.
 */

import rateLimit from "express-rate-limit";

/** General API rate limit: 100 requests per minute per IP. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

/** Stricter limit for auth endpoints: 10 requests per minute per IP. */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later" },
});
