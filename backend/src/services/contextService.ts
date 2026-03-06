import { RedisLike } from '../config/redis';

interface ContextMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ContextService {
  constructor(private readonly redis: RedisLike) {}

  async appendMessage(sessionId: string, message: ContextMessage): Promise<void> {
    const key = this.key(sessionId);
    await this.redis.lpush(key, JSON.stringify(message));
    await this.redis.expire(key, 60 * 60);
  }

  async getContext(sessionId: string, rounds = 10): Promise<ContextMessage[]> {
    const key = this.key(sessionId);
    const rows = await this.redis.lrange(key, 0, rounds * 2 - 1);
    return rows
      .map((row) => JSON.parse(row) as ContextMessage)
      .reverse();
  }

  private key(sessionId: string): string {
    return `socratic:session:${sessionId}`;
  }
}
