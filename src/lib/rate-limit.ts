// src/lib/rate-limit.ts
import { redis } from "./redis";

export async function rateLimit(
  identifier: string,
  limit: number,
  window: number
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const key = `rate-limit:${identifier}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, window); // start TTL only on first hit
    }

    const ttl = await redis.ttl(key); // remaining seconds
    const remaining = Math.max(0, limit - current);
    const resetTime = Date.now() + ttl * 1000;

    return {
      success: current <= limit,
      remaining,
      resetTime,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    return {
      success: true,
      remaining: limit - 1,
      resetTime: Date.now() + window * 1000,
    };
  }
}
