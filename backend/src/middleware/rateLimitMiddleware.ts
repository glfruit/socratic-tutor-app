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
      const results = await redis
        .multi()
        .incr(key)
        .expire(key, options.windowSeconds)
        .exec();

      const count = (results?.[0]?.[1] as number) ?? 0;

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
