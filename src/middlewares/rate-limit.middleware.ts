import rateLimit from 'express-rate-limit';

export const createRateLimitMiddleware = (windowMs?: number, max?: number) => {
  return rateLimit({
    windowMs: windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: max || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP',
      retryAfter: Math.ceil(windowMs / 1000) || 900,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const apiLimitMiddleware = createRateLimitMiddleware();