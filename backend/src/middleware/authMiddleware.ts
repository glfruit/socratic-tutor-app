import { NextFunction, Request, Response } from 'express';
import { TokenService } from '../services/tokenService';
import { AppError } from '../utils/appError';

export const authMiddleware = (tokenService: TokenService = new TokenService()) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new AppError('Missing token', 401));
      return;
    }

    const token = header.slice('Bearer '.length);

    try {
      req.user = tokenService.verifyAccessToken(token);
      next();
    } catch {
      next(new AppError('Invalid token', 401));
    }
  };
};
