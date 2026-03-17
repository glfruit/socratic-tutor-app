import { ZodError, z } from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { authMiddleware } from '../../src/middleware/authMiddleware';
import { rateLimitMiddleware } from '../../src/middleware/rateLimitMiddleware';
import { errorMiddleware, notFoundMiddleware } from '../../src/middleware/errorMiddleware';
import { AppError } from '../../src/utils/appError';

describe('middleware', () => {
  it('auth middleware attaches user', () => {
    const tokenService = { verifyAccessToken: vi.fn().mockReturnValue({ userId: 'u1' }) };
    const middleware = authMiddleware(tokenService as any);

    const req: any = { headers: { authorization: 'Bearer token' } };
    const next = vi.fn();

    middleware(req, {} as any, next);

    expect(req.user.userId).toBe('u1');
    expect(next).toHaveBeenCalledWith();
  });

  it('auth middleware rejects missing token', () => {
    const middleware = authMiddleware({ verifyAccessToken: vi.fn() } as any);
    const next = vi.fn();

    middleware({ headers: {} } as any, {} as any, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });

  it('auth middleware rejects invalid token', () => {
    const middleware = authMiddleware({ verifyAccessToken: vi.fn().mockImplementation(() => { throw new Error('x'); }) } as any);
    const next = vi.fn();

    middleware({ headers: { authorization: 'Bearer bad' } } as any, {} as any, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });

  it('rate limit middleware rejects after threshold', async () => {
    const redis: any = {
      multi: vi.fn().mockReturnValue({
        incr: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([[null, 3], [null, 1]])
      })
    };

    const middleware = rateLimitMiddleware(redis, { limit: 2, windowSeconds: 60 });
    const next = vi.fn();

    await middleware({ ip: '1.1.1.1' } as any, {} as any, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });

  it('rate limit middleware allows requests under threshold', async () => {
    const multi = {
      incr: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([[null, 1], [null, 1]])
    };
    const redis: any = {
      multi: vi.fn().mockReturnValue(multi)
    };
    const middleware = rateLimitMiddleware(redis, { limit: 10, windowSeconds: 60 });
    const next = vi.fn();

    await middleware({ ip: '1.1.1.1' } as any, {} as any, next);

    expect(redis.multi).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('rate limit middleware skips failure', async () => {
    const redis: any = {
      multi: vi.fn().mockReturnValue({
        incr: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockRejectedValue(new Error('down'))
      })
    };
    const middleware = rateLimitMiddleware(redis, { limit: 10, windowSeconds: 60 });
    const next = vi.fn();

    await middleware({ ip: '1.1.1.1' } as any, {} as any, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('not found middleware creates error', () => {
    const next = vi.fn();
    notFoundMiddleware({} as any, {} as any, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });

  it('error middleware handles app error', () => {
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    errorMiddleware(new AppError('oops', 401), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('error middleware handles zod error', () => {
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const parsed = z.object({ x: z.string() }).safeParse({});
    expect(parsed.success).toBe(false);
    errorMiddleware((parsed as any).error as ZodError, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('error middleware handles unknown error', () => {
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    errorMiddleware(new Error('x'), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
