import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../src/services/authService';
import { createPrismaMock, createRedisMock } from '../mocks/factories';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn()
  }
}));

describe('AuthService', () => {
  const prisma = createPrismaMock();
  const redis = createRedisMock();
  const tokenService = {
    generateTokens: vi.fn(),
    verifyRefreshToken: vi.fn()
  };

  const service = new AuthService(prisma as any, redis as any, tokenService as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    (bcrypt.hash as any).mockResolvedValue('hashed');
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'a@test.com',
      role: Role.STUDENT,
      name: 'A'
    });
    tokenService.generateTokens.mockReturnValue({ accessToken: 'a', refreshToken: 'r' });

    const result = await service.register({ email: 'a@test.com', password: 'password1', name: 'A' });

    expect(result.user.email).toBe('a@test.com');
    expect(redis.set).toHaveBeenCalled();
  });

  it('fails register when email exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

    await expect(
      service.register({ email: 'a@test.com', password: 'password1', name: 'A' })
    ).rejects.toThrow('Email already registered');
  });

  it('logs in with valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@test.com',
      passwordHash: 'hash',
      name: 'A',
      role: Role.STUDENT
    });
    (bcrypt.compare as any).mockResolvedValue(true);
    tokenService.generateTokens.mockReturnValue({ accessToken: 'a', refreshToken: 'r' });

    const result = await service.login({ email: 'a@test.com', password: 'password1' });

    expect(result.tokens.accessToken).toBe('a');
  });

  it('refreshes tokens when refresh token is valid', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({ userId: 'u1', email: 'e', role: Role.STUDENT });
    redis.get.mockResolvedValue('r0');
    tokenService.generateTokens.mockReturnValue({ accessToken: 'a1', refreshToken: 'r1' });

    const result = await service.refresh('r0');

    expect(result.refreshToken).toBe('r1');
    expect(redis.set).toHaveBeenCalled();
  });

  it('rejects refresh when token mismatch', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({ userId: 'u1', email: 'e', role: Role.STUDENT });
    redis.get.mockResolvedValue('other');

    await expect(service.refresh('r0')).rejects.toThrow('Invalid refresh token');
  });

  it('creates oauth user on first login', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'oauth@test.com',
      name: 'OAuth',
      role: Role.STUDENT
    });
    tokenService.generateTokens.mockReturnValue({ accessToken: 'a', refreshToken: 'r' });

    const result = await service.oauthLogin({ email: 'oauth@test.com', name: 'OAuth' });

    expect(result.user.email).toBe('oauth@test.com');
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
