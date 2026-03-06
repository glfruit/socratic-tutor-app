import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validateBody } from '../../src/middleware/validate';

describe('validateBody', () => {
  it('passes parsed body to next', () => {
    const middleware = validateBody(z.object({ name: z.string() }));
    const req: any = { body: { name: 'ok' } };
    const next = vi.fn();

    middleware(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.name).toBe('ok');
  });

  it('returns error on invalid body', () => {
    const middleware = validateBody(z.object({ name: z.string() }));
    const req: any = { body: { bad: true } };
    const next = vi.fn();

    middleware(req, {} as any, next);

    expect(next).toHaveBeenCalled();
  });
});
