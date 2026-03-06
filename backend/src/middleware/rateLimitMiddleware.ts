import { NextFunction, Request, Response } from 'express';
import { RedisLike } from '../config/redis';
import { AppError } from '../utils/appError';

export const rateLimitMiddleware = (
  redis: RedisLike,
  options: { limit: number; windowSeconds: number }
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = `socratic:rate:${req.user?.userId ?? req.ip}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, options.windowSeconds);
      }

      if (count > options.limit) {
        next(new AppError('Rate limit exceeded', 429));
        return;
      }

      next();
    } catch {
      next();
    }
  };
};
