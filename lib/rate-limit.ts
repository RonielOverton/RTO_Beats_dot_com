interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

type RequestLike = {
  headers: Headers;
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries(now: number) {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function getClientIp(req: RequestLike): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return req.headers.get("x-real-ip") ?? "unknown";
}

export function enforceRateLimit(req: RequestLike, options: RateLimitOptions) {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const clientIp = getClientIp(req);
  const entryKey = `${options.key}:${clientIp}`;
  const existing = rateLimitStore.get(entryKey);

  if (!existing || existing.resetAt <= now) {
    const nextEntry = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    rateLimitStore.set(entryKey, nextEntry);
    return {
      allowed: true,
      remaining: options.limit - 1,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  rateLimitStore.set(entryKey, existing);

  return {
    allowed: true,
    remaining: Math.max(0, options.limit - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}