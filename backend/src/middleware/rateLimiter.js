const rateLimit = require("express-rate-limit");

// Note: Using memory store for rate limiting (switch to Redis in production)

// Global rate limiter (using memory store for now)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute (increased for development)
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development", // Skip rate limit in dev mode
});

// Auth rate limiter (stricter for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
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
