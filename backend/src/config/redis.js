const Redis = require("ioredis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  retryStrategy: (times) => {
    // Stop retrying after 3 attempts
    if (times > 3) {
      console.warn("⚠️  Redis connection failed - running without Redis");
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: false,
  enableOfflineQueue: false,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.warn("⚠️  Redis not available:", err.message);
});

module.exports = redisClient;
