const rateLimit = require("express-rate-limit");

// Note: Using memory store for rate limiting (switch to Redis in production)

// Global rate limiter (using memory store for now)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes (increased for testing)
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    success: false,
    message: "Too many upload requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
  uploadLimiter,
};
