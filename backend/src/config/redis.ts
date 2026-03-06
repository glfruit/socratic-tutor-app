import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL);

export type RedisLike = Pick<
  Redis,
  'get' | 'set' | 'del' | 'incr' | 'expire' | 'lpush' | 'lrange' | 'quit'
>;
