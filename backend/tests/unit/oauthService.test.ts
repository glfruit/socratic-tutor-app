import { describe, expect, it, vi } from 'vitest';
import { OAuthService } from '../../src/services/oauthService';

describe('OAuthService', () => {
  it('uses mapped provider implementation', async () => {
    const service = new OAuthService({
      google: {
        getProfile: vi.fn().mockResolvedValue({ email: 'g@test.com', name: 'g' })
      }
    } as any);

    const profile = await service.getProfile('google', 'token');

    expect(profile.email).toBe('g@test.com');
  });

  it('throws on unsupported provider', async () => {
    const service = new OAuthService({} as any);

    await expect(service.getProfile('unknown', 'token')).rejects.toThrow('Unsupported OAuth provider');
  });
});
