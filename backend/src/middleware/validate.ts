import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/appError';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400));
      return;
    }
    req.body = parsed.data;
    next();
  };
};
