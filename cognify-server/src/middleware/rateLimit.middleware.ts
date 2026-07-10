import { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";

interface RateLimitOptions {
  windowMs: number;   // time window in milliseconds
  max: number;        // max requests per window
  keyPrefix?: string;
}

/**
 * Redis sliding-window rate limiter.
 * Uses a sorted set per key where score = timestamp.
 */
export const rateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max, keyPrefix = "rl" } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = (req as any).userId || req.ip || "anon";
    const key    = `${keyPrefix}:${userId}`;
    const now    = Date.now();
    const window = now - windowMs;

    try {
      // Remove old entries outside the window
      await redis.zremrangebyscore(key, 0, window);

      // Count current requests in the window
      const count = await redis.zcard(key);

      if (count >= max) {
        const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
        const resetAt = oldest[1]
          ? Math.ceil((Number(oldest[1]) + windowMs) / 1000)
          : Math.ceil((now + windowMs) / 1000);

        res.set("Retry-After", String(resetAt - Math.ceil(now / 1000)));
        res.set("X-RateLimit-Limit", String(max));
        res.set("X-RateLimit-Remaining", "0");

        return res.status(429).json({
          success: false,
          message: "Too many requests. Please slow down.",
        });
      }

      // Add current request
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      await redis.pexpire(key, windowMs);

      res.set("X-RateLimit-Limit", String(max));
      res.set("X-RateLimit-Remaining", String(max - count - 1));

      next();
    } catch (err) {
      // Fail open — if Redis is down, don't block requests
      next();
    }
  };
};

/** Preset: 1000 requests / minute per user */
export const standardRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  max: 1000,
  keyPrefix: "rl:standard",
});

/** Preset: 200 requests / minute for AI endpoints */
export const aiRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  max: 200,
  keyPrefix: "rl:ai",
});

/** Preset: 100 requests / 15 minutes for auth endpoints */
export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyPrefix: "rl:auth",
});
