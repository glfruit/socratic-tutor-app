import { Role } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { TokenService } from '../../src/services/tokenService';

describe('TokenService', () => {
  it('generates and verifies tokens', () => {
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.REDIS_URL = 'redis://x';
    process.env.JWT_SECRET = '1234567890123456';
    process.env.JWT_REFRESH_SECRET = '1234567890123456';

    const service = new TokenService();
    const tokens = service.generateTokens({ userId: 'u1', email: 'a', role: Role.STUDENT });

    const payload = service.verifyAccessToken(tokens.accessToken);
    expect(payload.userId).toBe('u1');
  });
});
