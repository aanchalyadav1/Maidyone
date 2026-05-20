import rateLimit from 'express-rate-limit';

/**
 * Strict limiter for auth endpoints (login).
 * 10 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    data: null,
  },
  skipSuccessfulRequests: true, // only count failed attempts
});

/**
 * Upload limiter — 20 uploads per 10 minutes per IP.
 */
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many upload requests. Please slow down.',
    data: null,
  },
});

/**
 * General API limiter — 200 requests per minute per IP.
 * Applied globally to all /api/v1 routes.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    data: null,
  },
});

/**
 * Write operation limiter — 60 writes per minute per IP.
 * Applied to POST/PUT/PATCH/DELETE routes.
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many write requests. Please slow down.',
    data: null,
  },
});
