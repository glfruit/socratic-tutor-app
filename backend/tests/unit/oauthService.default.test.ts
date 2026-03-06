import { describe, expect, it, vi } from 'vitest';
import { OAuthService } from '../../src/services/oauthService';

describe('OAuthService default providers', () => {
  it('loads google profile', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email: 'g@test.com', name: 'G' })
    });
    const service = OAuthService.createDefault(fetchImpl as any);

    const profile = await service.getProfile('google', 'token');
    expect(profile.name).toBe('G');
  });

  it('loads github profile with fallback email endpoint', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ email: null, login: 'gh', name: 'GH' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ email: 'gh@test.com', primary: true }]
      });

    const service = OAuthService.createDefault(fetchImpl as any);
    const profile = await service.getProfile('github', 'token');

    expect(profile.email).toBe('gh@test.com');
  });

  it('throws on google invalid token', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });
    const service = OAuthService.createDefault(fetchImpl as any);

    await expect(service.getProfile('google', 'bad')).rejects.toThrow('Invalid Google token');
  });
});
