import { describe, expect, it, vi } from 'vitest';
import { asyncHandler } from '../../src/utils/asyncHandler';

describe('asyncHandler', () => {
  it('forwards rejection to next', async () => {
    const next = vi.fn();
    const fn = asyncHandler(async () => {
      throw new Error('boom');
    });

    fn({} as any, {} as any, next);

    await new Promise((resolve) => setImmediate(resolve));
    expect(next).toHaveBeenCalled();
  });
});
