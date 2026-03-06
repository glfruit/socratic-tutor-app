import { describe, expect, it } from 'vitest';
import { ContextService } from '../../src/services/contextService';
import { createRedisMock } from '../mocks/factories';

describe('ContextService', () => {
  it('appends messages and sets ttl', async () => {
    const redis = createRedisMock();
    const service = new ContextService(redis as any);

    await service.appendMessage('s1', { role: 'user', content: 'x' });

    expect(redis.lpush).toHaveBeenCalled();
    expect(redis.expire).toHaveBeenCalledWith('socratic:session:s1', 3600);
  });

  it('reads context in chronological order', async () => {
    const redis = createRedisMock();
    redis.lrange.mockResolvedValue([
      JSON.stringify({ role: 'assistant', content: 'b' }),
      JSON.stringify({ role: 'user', content: 'a' })
    ]);

    const service = new ContextService(redis as any);
    const rows = await service.getContext('s1');

    expect(rows[0].content).toBe('a');
  });
});
