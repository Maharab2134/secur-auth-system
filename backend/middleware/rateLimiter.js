/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

const rateLimit = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict limiter for authentication endpoints
 * 5 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs:
    parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) ||
    (isProduction ? 15 * 60 * 1000 : 60 * 1000),
  max:
    parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) ||
    (isProduction ? 5 : 100),
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: "Too many login attempts. Please try again after some time.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset limiter
 * 3 requests per hour
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message:
      "Too many password reset requests. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Registration limiter
 * 3 registrations per hour per IP
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message:
      "Too many accounts created from this IP. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
};
