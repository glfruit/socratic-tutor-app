import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';

export const notFoundMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError('Not found', 404));
};

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[errorMiddleware] Request failed', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ message: err.issues[0]?.message ?? 'Validation error' });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
};
